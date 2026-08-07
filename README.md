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

## Persistência local

Monstros e imagens enviadas são armazenados no IndexedDB do navegador. Imagens do usuário não são
enviadas ao GitHub, ao CI ou a qualquer servidor. Os dados pertencem à combinação de origem, navegador e
perfil; podem ser removidos ao limpar dados do site, usar navegação privada ou mudar de domínio.

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

## Mais documentação

- [Especificação](specs/001-monster-battle/spec.md)
- [Plano técnico](specs/001-monster-battle/plan.md)
- [Tarefas](specs/001-monster-battle/tasks.md)
- [Guia completo de validação](specs/001-monster-battle/quickstart.md)
