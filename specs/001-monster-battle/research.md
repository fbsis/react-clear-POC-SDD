# Research: Cadastro e Batalha de Monstros

## 1. Persistência local de metadados e imagens

**Decision**: IndexedDB com o wrapper tipado `idb`; não usar SQL.

**Rationale**: IndexedDB armazena dados estruturados e binários de forma assíncrona e transacional. O
`idb` mantém a semântica nativa, adiciona Promises, `DBSchema` tipado, migrations e cerca de 1,19 KB
compactado. Duas stores (`monsters`, `imageAssets`) atendem o produto sem backend ou WASM. A gravação de
um monstro e sua imagem enviada será atômica. Os bytes são gravados como `ArrayBuffer`, pois a automação
em WebKit demonstrou que registros com `Blob` abortam a transação nesse navegador; o leitor mantém suporte
ao formato legado com `Blob`.

**Alternatives considered**:

- IndexedDB nativo: adequado, porém a API de eventos acrescenta ruído sem valor.
- Dexie: excelente para consultas reativas e schema mais rico, mas maior abstração que a necessidade.
- `localStorage`: síncrono, somente strings e inadequado para blobs de até 10 MB.
- SQLite/WASM com OPFS: SQL, worker, WASM, VFS e concorrência sem consulta relacional que os justifique.

**Operational notes**: persistir bytes, criar `Blob` e `URL.createObjectURL` apenas para exibição e sempre revogar;
capturar quota; manter host/porta fixos; versionar migrations e tratar abas que bloqueiam upgrades.

Sources: [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API),
[Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB),
[`idb`](https://github.com/jakearchibald/idb),
[storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria),
[SQLite/OPFS](https://sqlite.org/wasm/doc/trunk/persistence.md).

## 2. DDD e direção de dependências

**Decision**: monólito frontend modular com `domains`, `application`, `infrastructure`, `presentation` e
`app` como composition root. `monster` e `battle` são módulos do mesmo domínio nesta versão.

**Rationale**: as regras são pequenas, locais e coesas. Entidades e cálculo ficam em TypeScript puro;
casos de uso coordenam portas; adaptadores conhecem browser; React conhece DTOs/casos de uso. Isso permite
trocar UI ou persistência sem tocar no algoritmo.

**Alternatives considered**:

- Pastas somente por tipo: dispersam cada capacidade.
- Bounded contexts, eventos e microfrontends: cerimônia sem fronteira organizacional ou integração real.
- Heranças `BaseEntity`/`BaseRepository`: apagam a linguagem do domínio.
- Event sourcing: não há histórico persistido nem consumidor de eventos.

## 3. Injeção de dependência

**Decision**: interfaces TypeScript pertencentes à camada consumidora, injeção por construtor e
composition root manual. Cada interface, DTO, type alias, enum ou erro nomeado fica em arquivo próprio;
o nome do arquivo corresponde à declaração e barrels apenas reexportam.

**Rationale**: o grafo possui poucos objetos. Composição explícita é pesquisável, tipada e fácil de
substituir por fakes. Casos de uso também implementam contratos próprios, então presentation e testes não
dependem de classes concretas. Interfaces TypeScript não existem em runtime; o composition root conecta
explicitamente contrato e implementação, enquanto um container exigiria tokens, decorators ou metadata
sem benefício atual. Arquivos separados evitam módulos genéricos de tipos, reduzem conflitos de mudança e
tornam cada contrato diretamente pesquisável.

**Alternatives considered**: Inversify/TSyringe foram adiados até existir grafo grande, plugins ou
múltiplas configurações. Singletons e service locator foram rejeitados por esconder dependências.

## 4. Estado React e Context API

**Decision**: usar Context API nativa em três limites pequenos: `ApplicationContext` para dependências
imutáveis, `MonsterCollectionContext` para a projeção compartilhada da coleção e `GameSessionContext`
para seleção/batalha entre telas. Providers usam `useState` para estados simples. `useReducer` fica
restrito às máquinas de estado de seleção e playback.

**Rationale**: cadastro, coleção e seleção precisam compartilhar monstros; seleção e batalha precisam
compartilhar a sessão atual. Context elimina prop drilling sem adicionar biblioteca, enquanto providers
separados limitam renderizações. IndexedDB continua sendo persistência e os contexts apenas reidratam ou
mantêm estado efêmero. Playback muda a cada evento e permanece local para não invalidar a árvore inteira.

**Alternatives considered**: um Context global único foi rejeitado por acoplamento e renderizações amplas;
Redux/Zustand foram rejeitados por não haver complexidade que justifique dependência; usar apenas props
criaria encadeamento entre telas; persistir batalha no Context não sobreviveria a reload e confundiria
memória com armazenamento durável.

## 5. Stack Vite, React e TypeScript

**Decision**: React 19.2, Vite 8.2, TypeScript 5.9, pnpm 11 e Node 24.18 LTS no contêiner.

**Rationale**: a consulta ao registry durante T001 confirmou que `typescript@6.0.0` não foi publicado.
TypeScript 7.0.2 existe, mas o `typescript-eslint` selecionado rejeita sua API; o gate executado registrou
essa incompatibilidade. TypeScript 5.9.3 é a última linha estável aceita pelo typed linting. Vite fornece
build estático sem Next.js e as versões exatas permanecem fixadas no manifest e lockfile.

**Alternatives considered**: Node 26 é Current em agosto de 2026; npm é válido, mas pnpm fixado oferece
store/cache reprodutível; Babel separado é desnecessário.

Sources: [Node releases](https://nodejs.org/en/about/previous-releases),
[React versions](https://react.dev/versions), [Vite guide](https://vite.dev/guide/),
[Vite 8](https://vite.dev/blog/announcing-vite8),
[TypeScript strict](https://www.typescriptlang.org/tsconfig/strict.html),
[typescript-eslint compatibility](https://typescript-eslint.io/users/dependency-versions/).

## 6. Timeline e efeitos

**Decision**: reducer puro + `setTimeout` one-shot + CSS Modules/keyframes. Nenhuma biblioteca de motion.

**Rationale**: os efeitos solicitados usam `transform`, `opacity`, `filter`, borda, sombra e texto.
Regras e eventos são calculados antes; a apresentação apenas move um cursor imutável. Reducer e timers
falsos tornam reinício, pausa e 3.000 ms determinísticos. CSS oferece fallback direto com
`prefers-reduced-motion`.

**Alternatives considered**:

- Motion for React: reavaliar apenas se surgirem coreografias interrompíveis complexas.
- Web Animations API global: controle imperativo e cleanup desnecessários para o MVP.
- XState: quatro estados e poucas transições cabem em union discriminada e reducer exaustivo.

Sources: [React useEffect](https://react.dev/reference/react/useEffect),
[prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion),
[WCAG animation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions),
[Vitest timers](https://vitest.dev/guide/mocking/timers).

## 7. UI/UX e acessibilidade

**Decision**: tokens semânticos, seleção em grid acessível, cartas como `article`, HP textual e semântico,
timeline como lista ordenada de botões e uma única live region `polite`.

**Rationale**: visual arcade permanece original, não violento e compreensível sem cor ou movimento.
Contraste mínimo será 4,5:1 para texto normal e 3:1 para texto grande; controles terão alvo recomendado de
44x44 px. Foco não se move durante autoplay.

**Alternatives considered**: slider customizado foi rejeitado para rounds por limitações assistivas; uma
lista horizontal com janela/paginação e salto direto mantém botões nativos e escala.

Sources: [WAI-ARIA Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/),
[Carousel controls](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/),
[WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## 8. Testes e quality gates

**Decision**: Vitest para domínio/aplicação/integração/componentes, Testing Library orientada ao usuário,
`fake-indexeddb` para contratos e Playwright em browser real; ESLint typed flat config e Prettier.

**Rationale**: Vite e Vitest compartilham transformação. Fakes de portas preservam isolamento sem mocks de
módulos. Uma suíte de contrato impede que o fake divirja do IndexedDB. Playwright comprova persistência,
teclado e browser real. Todos os comandos rodam no Docker.

**Alternatives considered**: Jest duplicaria transformação; snapshots extensos acoplariam testes à árvore;
Cypress criaria um segundo stack E2E.

Sources: [Vitest](https://vitest.dev/guide/),
[Testing Library](https://testing-library.com/docs/react-testing-library/intro/),
[Playwright Docker](https://playwright.dev/docs/docker),
[ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files).

## 9. Docker e documentação

**Decision**: Dockerfile multi-stage, pnpm fixado, Node Debian slim em dev/build, Playwright oficial em
E2E e servidor estático não-root em produção. Compose é a única interface de execução.

**Rationale**: satisfaz a constituição e aproxima dev, CI e produção. Imagens e dependências fixadas
reduzem drift; README documenta os mesmos comandos usados nos gates.

**Alternatives considered**: Alpine foi rejeitado para E2E porque Firefox/WebKit oficiais requerem glibc;
`vite preview` foi rejeitado como servidor de produção.

Sources: [pnpm Docker](https://pnpm.io/docker),
[Docker cache](https://docs.docker.com/build/cache/optimize/),
[Vite static deploy](https://vite.dev/guide/static-deploy.html),
[Playwright Docker](https://playwright.dev/docs/docker).

## 10. Hospedagem no GitHub Pages

**Decision**: publicar `dist/` em GitHub Pages com um workflow oficial do GitHub Actions. Quality gates
e build continuam dentro do Docker; Pages apenas recebe e serve o artefato estático.

**Rationale**: a aplicação não possui backend, processamento servidor ou secrets em runtime. GitHub
Pages suporta artefatos estáticos de workflows customizados e o repositório já está no GitHub. O deploy
usa o environment `github-pages`, permissões mínimas `contents: read`, `pages: write`, `id-token: write`
e concorrência para impedir deploys simultâneos.

**Base path**: como o site do projeto será `https://fbsis.github.io/react-clear-POC-SDD/`, o build Vite
recebe `base: '/react-clear-POC-SDD/'`. Desenvolvimento e custom domain usam `/`. Todos os assets,
inclusive o catálogo, devem respeitar `import.meta.env.BASE_URL`. A primeira versão não usa history
routing; se rotas por URL surgirem, será preciso adotar hash routing ou uma estratégia 404 compatível.

**Local data**: nenhum upload vai para GitHub. Deploys sob a mesma origem preservam IndexedDB; renomear o
repositório, trocar domínio, perfil/browser ou limpar storage altera/remove o acesso aos dados locais.

**Alternatives considered**:

- Branch `gh-pages`: rejeitada; commitar build gera ruído e o workflow de artifact é o fluxo oficial.
- GitHub Container Registry: armazena imagens, mas não hospeda uma aplicação web por si só.
- Servidor Docker externo: flexível, porém adiciona provedor e operação sem necessidade de backend.

Sources: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
[publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site),
[Vite GitHub Pages deployment](https://vite.dev/guide/static-deploy.html#github-pages).
