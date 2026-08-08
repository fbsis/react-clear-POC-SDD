# Monster Arena

[![CI](https://github.com/fbsis/react-clear-POC-SDD/actions/workflows/ci.yml/badge.svg)](https://github.com/fbsis/react-clear-POC-SDD/actions/workflows/ci.yml)
[![Deploy GitHub Pages](https://github.com/fbsis/react-clear-POC-SDD/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/fbsis/react-clear-POC-SDD/actions/workflows/deploy-pages.yml)

Jogo de cartas de monstros construído com React, Vite e TypeScript. O projeto aplica DDD, Clean Code,
injeção de dependências por interfaces e persistência local de monstros e imagens no IndexedDB.

**Aplicação publicada:** <https://fbsis.github.io/react-clear-POC-SDD/>

## Executar localmente

Pré-requisitos: Docker Engine e Docker Compose 2.22 ou superior. Node.js e pnpm não devem ser instalados
nem executados diretamente no host.

```bash
docker compose up --build app
```

Abra <http://localhost:5173>. Para encerrar:

```bash
docker compose down
```

Mantenha a porta `5173`: o IndexedDB é separado por origem, portanto mudar protocolo, host ou porta cria
outro espaço de dados no navegador. O volume configurado no Compose já entrega as alterações ao Vite com
hot reload.

## Qualidade e testes

Gate completo de formatação, lint, tipos, testes com cobertura e build:

```bash
docker compose run --rm --build app pnpm check
```

Jornada real no navegador:

```bash
docker compose up -d --build app
docker compose run --rm --build e2e pnpm test:e2e
docker compose down --volumes
```

O gate E2E rápido usa Chromium. Para executar as jornadas críticas também em Firefox e WebKit:

```bash
docker compose up -d --build app
docker compose run --rm --env PLAYWRIGHT_FULL_MATRIX=true e2e pnpm test:e2e
docker compose down --volumes
```

Os testes cobrem regras de domínio, casos de uso, contratos de repositório, IndexedDB, componentes,
limites arquiteturais, acessibilidade, desempenho e jornadas Playwright. O orçamento bloqueia bundles
JavaScript iniciais acima de 250 KB gzip e batalhas de pior caso acima de um segundo.

## Imagem de produção local

Para validar os arquivos estáticos servidos pelo Nginx não-root usado na imagem final:

```bash
docker compose --profile production up --build production
```

Abra <http://localhost:4173>. Esse fluxo não usa `vite preview` e não substitui o deploy do Pages.

## Arquitetura

- `src/domains`: aggregates na raiz de cada módulo, `value-objects/`, `validations/`, erros e regras puras.
- `src/application`: casos de uso, DTOs e interfaces consumidoras.
- `src/infrastructure`: IndexedDB, catálogo, imagens, identidade e APIs do navegador.
- `src/presentation`: componentes, páginas, hooks visuais e estilos responsivos.
- `src/app`: composition root, providers e Context API.

As dependências concretas são criadas somente no composition root. Estado local simples usa `useState`;
estado compartilhado é exposto por Context API através de métodos de intenção, sem setters públicos.
Tipos e interfaces nomeados permanecem em arquivos separados.
Cada value object é imutável e delega suas invariantes a uma validação dedicada, mantendo criação,
comparação por valor e regras de entrada com responsabilidades explícitas.

`createApplication` é o único ponto que instancia implementações de infraestrutura e injeta cada uma nos
casos de uso por interfaces TypeScript. `ApplicationContext` carrega apenas esse grafo estável;
`MonsterCollectionContext` mantém a projeção compartilhada da coleção e `GameSessionContext` mantém a
sessão entre telas. Formulários usam `useState` local, enquanto seleção e reprodução usam `useReducer`
local; ticks de animação não atualizam Contexts globais.

## Persistência local

Monstros e imagens enviadas são armazenados no IndexedDB do navegador. Imagens do usuário não são
enviadas ao GitHub, ao CI ou a qualquer servidor. Os dados pertencem à combinação de origem, navegador e
perfil; podem ser removidos ao limpar dados do site, usar navegação privada ou mudar de domínio.

O banco possui as stores `monsters` e `imageAssets`. Uploads são validados e gravados como `ArrayBuffer`
na mesma transação do monstro; o leitor continua aceitando registros antigos em `Blob`. A interface cria
URLs `blob:` temporárias somente para exibição e as revoga no cleanup. Não há SQL, `localStorage`, backend
ou sincronização entre dispositivos. A solicitação de armazenamento persistente ao navegador é apenas
uma tentativa: políticas de quota ou limpeza automática ainda podem remover os dados.

Ao fim da coleção, **Limpar monstros convocados** remove atomicamente monstros e imagens enviadas,
mantendo o banco disponível. **Limpar todo o banco de dados** exclui o IndexedDB completo e o recria
vazio. As duas ações exigem confirmação e não podem ser desfeitas.

`http://localhost:5173` e a URL do GitHub Pages são origens diferentes, então suas coleções são
independentes. Novos deploys na mesma URL do Pages preservam o IndexedDB; trocar para domínio próprio
exige uma estratégia explícita de migração.

## CI/CD e GitHub Pages

O workflow `CI` roda em pull requests e pushes para `main`, sempre dentro do Docker. O workflow
`Deploy GitHub Pages` valida novamente o projeto, exporta apenas o build estático com o caminho base
`/react-clear-POC-SDD/`, publica o artifact e executa um smoke test na URL pública.

Configuração única do repositório:

1. Acesse **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Confirme que o environment `github-pages` permite deploy da branch `main`.

Para republicar, abra **Actions → Deploy GitHub Pages → Run workflow**. Para rollback, reverta o commit
indesejado em `main`; o push do revert executará os gates e publicará novamente a versão anterior.

## Solução de problemas

- **Porta 5173 ocupada:** encerre o processo que usa a porta; não troque a porta se quiser manter a mesma
  coleção local.
- **Dependências ou volumes inconsistentes:** execute `docker compose down --volumes` e reconstrua com
  `docker compose up --build app`.
- **Pages retorna 404 ou `configure-pages` retorna Not Found:** selecione **GitHub Actions** em
  **Settings → Pages → Build and deployment → Source** e execute novamente o workflow.
- **Monstros desapareceram:** confirme a mesma origem e perfil e verifique se os dados do site foram
  limpos. Navegação privada não é armazenamento durável.
- **Upload não é aceito:** use JPEG, PNG ou WebP válido com até 10 MB; arquivos ficam somente no navegador.

## Mais documentação

- [Especificação](specs/001-monster-battle/spec.md)
- [Plano técnico](specs/001-monster-battle/plan.md)
- [Tarefas](specs/001-monster-battle/tasks.md)
- [Guia completo de validação](specs/001-monster-battle/quickstart.md)
