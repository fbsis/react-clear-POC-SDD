# Implementation Plan: Cadastro e Batalha de Monstros

**Branch**: `main` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-monster-battle/spec.md`

## Summary

Construir uma SPA React 19.2 com Vite 8 e TypeScript 5.9 estrito para cadastrar monstros, persistir
metadados e imagens somente no navegador, selecionar lutadores em uma interface arcade e calcular uma
batalha completa com timeline reproduzível. O desenho será um monólito frontend modular: domínio puro,
casos de uso com portas pequenas, adaptadores externos e composition root manual. IndexedDB com `idb`
substitui SQL e guarda registros e blobs em uma transação. Desenvolvimento, testes e build ocorrem via
Docker; o artefato estático é publicado pelo GitHub Actions no GitHub Pages.

## Technical Context

**Language/Version**: TypeScript 5.9.x em modo estrito; Node.js 24.18 LTS apenas dentro dos contêineres

**Primary Dependencies**: React 19.2 com Context API, `useState` e `useReducer`, Vite 8.1,
`@vitejs/plugin-react`, `idb` 8; CSS Modules e CSS custom properties para apresentação, sem biblioteca
externa de estado, animação ou container de DI

**Storage**: IndexedDB versionado (`monsters`, `imageAssets`) via `idb`; catálogo de imagens como assets
estáticos versionados; nenhuma API, upload remoto, SQLite ou backend

**Testing**: Vitest 4, React Testing Library, `user-event`, `jest-dom`, `fake-indexeddb`, Playwright 1.62
e verificações automatizadas com axe; fakes estruturais para portas

**Target Platform**: Navegadores modernos desktop e mobile que suportem IndexedDB; SPA estática hospedada
em `https://fbsis.github.io/react-clear-POC-SDD/`; desenvolvimento em Docker Compose

**Project Type**: Aplicação web frontend única, sem servidor de aplicação

**Performance Goals**: cálculo e timeline disponíveis em até 1 segundo em 95% das batalhas válidas;
interações respondem em até 100 ms; efeitos mantêm 60 fps em dispositivos de referência; JavaScript
inicial alvo de até 250 KB gzip, sem contar artes do catálogo

**Constraints**: WCAG 2.2 AA; layouts aprovados em 375x812, 768x1024 e 1440x900 sem overflow horizontal
de página; intervalo determinístico de 3.000 ms entre eventos; imagens enviadas de até 10 MB; persistência
limitada à mesma origem/perfil; nenhuma ferramenta Node no host; zero warnings nos quality gates; domínio
sem React, DOM, IndexedDB ou tipos de infraestrutura; GitHub Pages não oferece backend nem fallback nativo
de rotas SPA

**Scale/Scope**: até 100 monstros na coleção; até 9.999 rounds e 19.998 eventos no pior caso permitido;
4 jornadas principais, 3 telas e 6 ou mais artes iniciais geradas por IA

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Gate | Before research | After design | Evidence |
|------|-----------------|--------------|----------|
| Domain-Driven Design | PASS | PASS | `domains` contém regras puras; application depende de portas; infrastructure é adaptadora |
| Expressive, maintainable code | PASS | PASS | contratos específicos, unions discriminadas, sem bases genéricas ou service locator |
| Tests are required | PASS | PASS | unit, application, repository contract, component, accessibility e E2E definidos |
| Consistent and accessible UX | PASS | PASS | tokens semânticos, teclado, reduced motion, live region, WCAG AA e estados completos |
| Measured performance | PASS | PASS | budgets definidos; timeline grande usa janela paginada e cálculo imutável |
| React without Next.js | PASS | PASS | React + Vite SPA; nenhum framework servidor |
| Container-only execution | PASS | PASS WITH EXCEPTION | Dev, testes e build usam Docker; GitHub Pages apenas serve o `dist/` estático |

A exceção de hosting está registrada em Complexity Tracking. Ela não autoriza Node/pnpm no host ou no
runner fora do build container. A escolha de IndexedDB evita complexidade injustificada de SQL/WASM, e
a composição manual evita uma dependência de DI sem necessidade atual.

## Project Structure

### Documentation (this feature)

```text
specs/001-monster-battle/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── application-contracts.md
│   └── ui-contracts.md
└── tasks.md                    # criado por $speckit-tasks, não nesta fase
```

### Source Code (repository root)

```text
public/
└── monster-catalog/
    ├── catalog.json
    └── *.webp                  # pelo menos 6 artes geradas por IA

src/
├── domains/
│   ├── monster/
│   │   ├── Monster.ts
│   │   ├── MonsterId.ts
│   │   ├── CombatStats.ts
│   │   ├── MonsterImageRef.ts
│   │   ├── errors/
│   │   │   ├── InvalidMonsterNameError.ts
│   │   │   └── InvalidMonsterImageReferenceError.ts
│   │   └── index.ts
│   └── battle/
│       ├── Battle.ts
│       ├── Round.ts
│       ├── AttackEvent.ts
│       ├── BattleResult.ts
│       ├── resolveBattle.ts
│       ├── errors/
│       │   ├── InvalidBattleError.ts
│       │   └── InvalidBattleSequenceError.ts
│       └── index.ts
├── application/
│   ├── Application.ts
│   ├── monster/
│   │   ├── RegisterMonster.ts
│   │   ├── ListMonsters.ts
│   │   ├── ListMonsterImages.ts
│   │   ├── LoadMonsterImage.ts
│   │   ├── contracts/
│   │   │   ├── RegisterMonsterUseCase.ts
│   │   │   ├── ListMonstersUseCase.ts
│   │   │   ├── ListMonsterImagesUseCase.ts
│   │   │   └── LoadMonsterImageUseCase.ts
│   │   ├── dtos/
│   │   │   ├── RegisterMonsterInput.ts
│   │   │   ├── MonsterDto.ts
│   │   │   ├── CatalogImageDto.ts
│   │   │   ├── MonsterImageReferenceDto.ts
│   │   │   └── ImageContentDto.ts
│   │   └── ports/
│   │       ├── CatalogImage.ts
│   │       ├── UploadedImageContent.ts
│   │       ├── ImageBinary.ts
│   │       ├── ImageValidationResult.ts
│   │       ├── MonsterRepository.ts
│   │       ├── MonsterImageCatalog.ts
│   │       ├── MonsterImageReader.ts
│   │       └── ImageValidator.ts
│   ├── battle/
│   │   ├── StartBattle.ts
│   │   ├── contracts/StartBattleUseCase.ts
│   │   └── dtos/
│   │       ├── StartBattleInput.ts
│   │       ├── BattleDto.ts
│   │       ├── BattleRoundDto.ts
│   │       └── BattleEventDto.ts
│   └── shared/
│       ├── errors/
│       │   ├── ApplicationError.ts
│       │   └── ApplicationErrorCode.ts
│       └── ports/
│           ├── IdGenerator.ts
│           └── StorageStatus.ts
├── infrastructure/
│   ├── persistence/indexeddb/
│   │   ├── ReviDatabase.ts
│   │   ├── ReviDatabaseSchema.ts
│   │   ├── MonsterRecord.ts
│   │   ├── ImageAssetRecord.ts
│   │   ├── migrations.ts
│   │   ├── IndexedDbMonsterRepository.ts
│   │   ├── IndexedDbMonsterImageReader.ts
│   │   └── MonsterRecordMapper.ts
│   ├── images/
│   │   ├── BundledMonsterImageCatalog.ts
│   │   └── BrowserImageValidator.ts
│   ├── identity/CryptoIdGenerator.ts
│   └── storage/BrowserStorageStatus.ts
├── presentation/
│   ├── monster-registration/
│   ├── fighter-selection/
│   │   ├── FighterSelectionState.ts
│   │   └── FighterSelectionAction.ts
│   ├── battle-playback/
│   │   ├── PlaybackState.ts
│   │   ├── PlaybackAction.ts
│   │   ├── RoundWindowModel.ts
│   │   ├── playbackReducer.ts
│   │   ├── useBattlePlayback.ts
│   │   └── roundWindow.ts
│   └── shared/
│       ├── components/
│       ├── images/useMonsterImageUrl.ts
│       └── styles/
│           ├── tokens.css
│           └── globals.css
├── app/
│   ├── composition-root/createApplication.ts
│   ├── contexts/
│   │   ├── ApplicationContext.ts
│   │   ├── MonsterCollectionContext.ts
│   │   ├── MonsterCollectionContextValue.ts
│   │   ├── GameSessionContext.ts
│   │   └── GameSessionContextValue.ts
│   ├── providers/
│   │   ├── ApplicationProvider.tsx
│   │   ├── MonsterCollectionProvider.tsx
│   │   └── GameSessionProvider.tsx
│   ├── hooks/
│   │   ├── useApplication.ts
│   │   ├── useMonsterCollection.ts
│   │   └── useGameSession.ts
│   ├── AppScreen.ts
│   └── App.tsx
└── main.tsx

tests/
├── contracts/monsterRepositoryContract.ts
└── e2e/
    ├── monster-registration.spec.ts
    ├── battle-rules.spec.ts
    ├── battle-playback.spec.ts
    └── accessibility.spec.ts

Dockerfile
compose.yml
nginx.conf
.github/
└── workflows/
    └── deploy-pages.yml
eslint.config.js
vite.config.ts
vitest.config.ts
playwright.config.ts
tsconfig.json
package.json
pnpm-lock.yaml
README.md
```

**Structure Decision**: monólito frontend modular com nomes de diretórios e símbolos de código em inglês.
`monster` e `battle` são módulos coesos do mesmo domínio de jogo, não bounded contexts distribuídos.
Cada módulo exporta somente seu `index.ts`. Imports seguem
`domains <- application <- presentation`, com infrastructure implementando portas e `app` como único
ponto de composição. Testes unitários ficam ao lado do código; contratos e E2E ficam em `tests/`.

Cada interface, type alias, enum, DTO e classe de erro nomeada ocupa seu próprio arquivo, cujo nome
corresponde à declaração. Arquivos `index.ts` apenas reexportam símbolos e não declaram tipos. Interfaces
de portas pertencem à camada consumidora, implementações recebem dependências por construtor e somente o
composition root importa adaptadores concretos. Não se usa prefixo `I`, service locator, singleton global
ou arquivos genéricos como `types.ts`, `dto.ts` e `errors.ts`.

## Design Decisions

### Domain and use cases

- `Monster` é aggregate root imutável nesta versão; `CombatStats` e `MonsterImageRef` garantem invariantes.
- `Battle` é um resultado imutável composto por snapshots, rounds e ataques; não é persistido nesta fase.
- `resolveBattle` é função/serviço puro e síncrono. Timers e animações nunca participam do cálculo.
- Casos de uso recebem dependências por construtor: `RegisterMonster`, `ListMonsters`,
  `ListMonsterImages`, `LoadMonsterImage` e `StartBattle`.
- Cada caso de uso implementa uma interface TypeScript própria (`RegisterMonsterUseCase`,
  `ListMonstersUseCase`, `ListMonsterImagesUseCase`, `LoadMonsterImageUseCase` ou `StartBattleUseCase`),
  permitindo que React e os testes dependam do contrato, não da classe concreta.
- O composition root instancia adaptadores e casos de uso manualmente. Um provider React recebe o objeto
  `Application`, definido por interface própria, já composto; componentes não importam adaptadores
  concretos.

### React state ownership

- `ApplicationContext` expõe a instância imutável de `Application` para injeção de casos de uso; seu valor
  é estável e não contém estado mutável de tela.
- `MonsterCollectionContext` usa `useState<readonly MonsterDto[]>` como projeção em memória da coleção,
  hidrata pelo `ListMonstersUseCase` e atualiza após cadastro. IndexedDB continua sendo a fonte persistente.
- `GameSessionContext` usa estados pequenos e separados para tela atual, IDs selecionados e `BattleDto`;
  seus setters são encapsulados em operações com nomes de intenção, não expostos diretamente.
- Formulários, carregamento, erro, preview e controles simples usam `useState` no componente ou hook mais
  próximo que os consome. Estado local não sobe para Context sem dois consumidores reais.
- Seleção de lutadores e playback mantêm `useReducer` porque possuem transições correlacionadas e estados
  inválidos a impedir. O tick de playback permanece local para não renderizar providers e telas alheias a
  cada 3 segundos.
- Contextos são separados por responsabilidade e frequência de atualização. Valores e callbacks estáveis
  são memoizados somente quando medição ou identidade observável justificar; nenhuma memoização preventiva.
- Nenhum Context persiste dados por si só. Reload reidrata a coleção do IndexedDB, enquanto uma batalha em
  andamento e estados efêmeros de tela reiniciam intencionalmente.

### Persistence and images

- IndexedDB usa schema versionado e migrations cumulativas; migrations publicadas nunca são alteradas.
- Cadastro com imagem enviada grava `imageAssets` e `monsters` na mesma transação.
- O banco guarda o `Blob`, nunca Data URL nem `blob:` URL. A apresentação cria object URLs temporárias e
  as revoga no cleanup.
- `image_url` do requisito vira referência estável `catalog:<id>` ou `uploaded:<id>`.
- O app consulta quota e captura `QuotaExceededError`; solicita persistência do navegador após o primeiro
  upload, sem prometer que o browser nunca removerá dados.
- Catálogo é manifesto estático com ID, caminho, texto alternativo e dimensões. As artes são geradas e
  otimizadas na implementação, não em runtime.

### Playback and presentation

- O player usa reducer puro com estados `ready | playing | paused | complete`; a lista de eventos é
  imutável e a vida exibida é derivada dela.
- `setTimeout` one-shot agenda o próximo evento em 3.000 ms; cleanup invalida timers antigos. Play sempre
  reinicia no evento zero; navegação manual pausa no round escolhido.
- CSS Modules, tokens e keyframes cobrem avanço, impacto, dano, HP e vitória. Não há biblioteca de motion.
- `prefers-reduced-motion` remove deslocamento, shake e partículas, mantendo texto, ícone, contorno e HP.
- Até 200 rounds, todos os marcadores podem ser mostrados; acima disso, uma janela paginada preserva um
  marcador selecionável por round, posição total, salto direto e controles anterior/próximo sem milhares
  de nós simultâneos.

### Quality strategy

- TypeScript: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `useUnknownInCatchVariables`, `noImplicitOverride`, `noFallthroughCasesInSwitch`,
  `verbatimModuleSyntax`, `noEmit`; `any` proibido.
- ESLint flat config com typed linting, React Hooks, JSX a11y e regras de imports entre camadas;
  Prettier fixado e zero warnings.
- Domínio: testes tabelados de ordem, desempates, dano mínimo, HP, não mutação e milhares de rounds.
- Aplicação: fakes de portas; infraestrutura: suíte de contrato compartilhada e `fake-indexeddb`.
- Apresentação: Testing Library por role/nome e timers falsos em 2.999/3.000 ms.
- E2E: Playwright valida persistência após reload, teclado, batalha, timeline, ausência de overflow e
  screenshots determinísticos nos viewports mobile, tablet e desktop.
- Revisões humanas: cadastro/coleção, seleção e batalha têm gates separados; screenshots e decisão do
  responsável pelo produto ficam versionados em `specs/001-monster-battle/design-reviews/`.

## Delivery and Documentation

- Dockerfile multi-stage com Node 24.18 Debian slim para dev/build e servidor estático não-root para
  produção; Playwright usa imagem oficial compatível e fixada.
- `compose.yml` oferece serviços `app`, `e2e` e `production`; porta de desenvolvimento permanece fixa para
  preservar a origem e os dados do IndexedDB.
- `vite.config.ts` usa `VITE_BASE_PATH`; o workflow fornece `/react-clear-POC-SDD/` no build Pages e o
  desenvolvimento usa `/`. Assets do catálogo são resolvidos com o base path, nunca por `/` hardcoded.
- `.github/workflows/deploy-pages.yml` roda em push para `main` e `workflow_dispatch`: checkout, quality
  gate/build dentro do Docker, exportação de `dist/`, `configure-pages`, `upload-pages-artifact` e
  `deploy-pages`. Jobs de build e deploy são separados, com permissões mínimas e concorrência `pages`.
- O deploy não envia monstros nem imagens do usuário. IndexedDB permanece no browser sob a origem Pages;
  novos deploys preservam dados, mas troca de domínio/origem, limpeza do browser ou modo privado não.
- README MUST documentar pré-requisitos somente Docker/Git, comandos Compose, arquitetura, persistência
  local e limitações, testes, build, GitHub Pages, solução de problemas e aviso de que limpar dados do
  navegador ou mudar a origem remove o acesso aos monstros enviados.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because | Owner | Expiry / Review |
|-----------|------------|---------------------------------------|-------|-----------------|
| Production static files are served by GitHub Pages rather than a project Docker runtime | User explicitly requested GitHub-native hosting; the app is fully static and has no server runtime | Publishing a container requires an external container host, extra account and operations with no product benefit | Project owner | Review by 2027-08-07 or immediately if backend/server features, private data, routing requirements or Pages limitations appear |

The exception is restricted to managed static serving. Docker remains mandatory for dependency
installation, development, formatting, linting, type checking, tests, asset build and production build.
Abstrações genéricas, container DI, Redux, SQLite/WASM, backend, event bus, biblioteca de animação e
persistência de batalhas continuam rejeitados por não resolverem uma necessidade atual.
