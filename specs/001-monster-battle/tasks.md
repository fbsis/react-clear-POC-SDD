# Tasks: Cadastro e Batalha de Monstros

**Input**: Design documents from `/specs/001-monster-battle/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by the project constitution. Story tests MUST be written first and observed failing
before the corresponding implementation.

**Organization**: Tasks are grouped by user story, followed by a dedicated CI/CD phase for GitHub Pages.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes independent files and has no incomplete dependency.
- **[Story]**: Maps work to a user story from spec.md.
- Every task names the exact target path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the container-only React/Vite/TypeScript toolchain and repository skeleton.

- [X] T001 Create the Vite 8 React TypeScript package manifest with pinned pnpm, React 19.2, TypeScript 5.9, `idb`, test, lint and formatting dependencies in package.json
- [X] T002 Generate and commit the reproducible dependency lockfile through the build container in pnpm-lock.yaml
- [X] T003 Create multi-stage development, quality, build, export and local-production targets using Node 24.18 Debian slim in Dockerfile
- [X] T004 Create `app`, `e2e` and `production` services with fixed development origin and container-only commands in compose.yml
- [X] T005 [P] Configure strict TypeScript project references and path aliases in tsconfig.json, tsconfig.app.json and tsconfig.node.json
- [X] T006 [P] Configure Vite React, environment-driven `VITE_BASE_PATH`, build budgets and asset handling in vite.config.ts
- [X] T007 [P] Configure ESLint flat typed rules, explicit type imports, naming conventions, React Hooks, JSX accessibility and layer import restrictions in eslint.config.js
- [X] T008 [P] Configure Prettier and ignore generated artifacts in .prettierrc.json and .prettierignore
- [X] T009 [P] Configure Vitest node/jsdom projects, V8 coverage and shared setup in vitest.config.ts and tests/setup.ts
- [X] T010 [P] Configure Playwright web server, browser projects, traces and screenshots in playwright.config.ts
- [X] T011 Create the planned `domains`, `application`, `infrastructure`, `presentation` and `app` module directories with public boundaries under src/
- [X] T012 Update repository ignores for dependencies, builds, test reports, editor metadata and `.DS_Store` in .gitignore

**Checkpoint**: The empty application builds, all tools execute through Compose and no Node tool is
required on the host.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contracts, storage, application shell and visual foundations required by every story.

**⚠️ CRITICAL**: No user story implementation begins until this phase passes its checks.

- [X] T013 [P] Define medieval castle-arena color, stone, parchment, brass, typography, spacing, focus and motion tokens in src/presentation/shared/styles/tokens.css
- [X] T014 [P] Define reset, responsive canvas, typography, focus-visible and reduced-motion defaults in src/presentation/shared/styles/globals.css
- [X] T015 [P] Define stable application errors as one declaration per file in src/application/shared/errors/ApplicationErrorCode.ts, src/application/shared/errors/ApplicationError.ts and src/application/shared/errors/mapApplicationError.ts
- [X] T016 [P] Define the IdGenerator and StorageStatus consumer-owned ports in src/application/shared/ports/IdGenerator.ts and src/application/shared/ports/StorageStatus.ts
- [X] T017 [P] Implement IdGenerator and StorageStatus interfaces with cryptographic UUID and browser quota/persistence adapters in src/infrastructure/identity/CryptoIdGenerator.ts and src/infrastructure/storage/BrowserStorageStatus.ts
- [X] T018 Define the IndexedDB schema types one per file plus database lifecycle and cumulative migrations in src/infrastructure/persistence/indexeddb/ReviDatabaseSchema.ts, src/infrastructure/persistence/indexeddb/MonsterRecord.ts, src/infrastructure/persistence/indexeddb/ImageAssetRecord.ts, src/infrastructure/persistence/indexeddb/ReviDatabase.ts and src/infrastructure/persistence/indexeddb/migrations.ts
- [X] T019 [P] Add migration and blocked-connection integration tests using fake IndexedDB in src/infrastructure/persistence/indexeddb/ReviDatabase.test.ts
- [X] T020 Define the immutable Application interface and expose the manual composition root through Context API in src/application/Application.ts, src/app/composition-root/createApplication.ts, src/app/contexts/ApplicationContext.ts, src/app/providers/ApplicationProvider.tsx and src/app/hooks/useApplication.ts
- [X] T021 Implement useState-backed collection and game-session contexts with separate value types, intent methods and the accessible application shell in src/app/contexts/MonsterCollectionContext.ts, src/app/contexts/MonsterCollectionContextValue.ts, src/app/contexts/GameSessionContext.ts, src/app/contexts/GameSessionContextValue.ts, src/app/providers/MonsterCollectionProvider.tsx, src/app/providers/GameSessionProvider.tsx, src/app/hooks/useMonsterCollection.ts, src/app/hooks/useGameSession.ts, src/app/AppScreen.ts and src/app/App.tsx
- [X] T022 Create reusable Button, FieldError, StatusMessage, ProgressBar and VisuallyHidden components in src/presentation/shared/components/
- [X] T023 [P] Define deterministic mobile, tablet and desktop screenshot fixtures plus visual review conventions in tests/e2e/support/designReview.ts and specs/001-monster-battle/design-reviews/README.md
- [X] T024 Add tests that enforce layer/type-file rules, reject concrete adapters outside the composition root and verify Context hooks fail clearly outside providers without leaking mutable setters in tests/architecture/layer-boundaries.test.ts, tests/architecture/type-file-conventions.test.ts and tests/app/context-contracts.test.tsx

**Checkpoint**: Foundation passes typecheck, lint and tests; dependencies point toward the domain and the
application starts with a composed in-memory shell.

---

## Phase 3: User Story 1 — Cadastrar um monstro (Priority: P1) 🎯 MVP

**Goal**: Register monsters from an AI-generated catalog or local upload and preserve data/images between
sessions on the same browser origin.

**Independent Test**: Register one catalog monster and one uploaded-image monster, reload the same
origin and confirm every field and image remains available.

### Tests for User Story 1

- [X] T025 [P] [US1] Write failing table-driven invariant tests for names, combat stats and image references in src/domains/monster/Monster.test.ts and src/domains/monster/CombatStats.test.ts
- [X] T026 [P] [US1] Write failing RegisterMonster, ListMonsters, ListMonsterImages and LoadMonsterImage constructor-injection tests against use-case interfaces with fakes in src/application/monster/*.test.ts
- [X] T027 [P] [US1] Write the shared atomic persistence and rehydration contract suite in tests/contracts/monsterRepositoryContract.ts
- [X] T028 [P] [US1] Write failing IndexedDB repository tests for catalog references, blobs, rollback, quota and reload in src/infrastructure/persistence/indexeddb/IndexedDbMonsterRepository.test.ts
- [X] T029 [P] [US1] Write failing browser image validation tests for type, size and corrupt content in src/infrastructure/images/BrowserImageValidator.test.ts
- [X] T030 [P] [US1] Write failing accessible registration, collection and Context hydration/refresh behavior tests in src/presentation/monster-registration/MonsterRegistrationPage.test.tsx, src/presentation/monster-registration/MonsterCollection.test.tsx and src/app/providers/MonsterCollectionProvider.test.tsx
- [X] T031 [P] [US1] Write the failing catalog/upload/reload end-to-end journey in tests/e2e/monster-registration.spec.ts

### Implementation for User Story 1

- [X] T032 [P] [US1] Implement validated immutable MonsterId and CombatStats value objects in separate files under src/domains/monster/value-objects/ with dedicated functions under src/domains/monster/validations/
- [X] T033 [P] [US1] Implement catalog/upload discriminated MonsterImageRef value object under src/domains/monster/value-objects/ with dedicated validation under src/domains/monster/validations/
- [X] T034 [US1] Implement Monster aggregate with each domain error in its own file and public re-exports in src/domains/monster/Monster.ts, src/domains/monster/errors/InvalidMonsterNameError.ts, src/domains/monster/errors/InvalidMonsterImageReferenceError.ts and src/domains/monster/index.ts
- [X] T035 [P] [US1] Define one interface or type per file for monster use-case contracts, DTOs and ports in src/application/monster/contracts/RegisterMonsterUseCase.ts, src/application/monster/contracts/ListMonstersUseCase.ts, src/application/monster/contracts/ListMonsterImagesUseCase.ts, src/application/monster/contracts/LoadMonsterImageUseCase.ts, src/application/monster/dtos/RegisterMonsterInput.ts, src/application/monster/dtos/MonsterDto.ts, src/application/monster/dtos/CatalogImageDto.ts, src/application/monster/dtos/MonsterImageReferenceDto.ts, src/application/monster/dtos/ImageContentDto.ts, src/application/monster/ports/CatalogImage.ts, src/application/monster/ports/UploadedImageContent.ts, src/application/monster/ports/ImageBinary.ts, src/application/monster/ports/ImageValidationResult.ts, src/application/monster/ports/MonsterRepository.ts, src/application/monster/ports/MonsterImageCatalog.ts, src/application/monster/ports/MonsterImageReader.ts and src/application/monster/ports/ImageValidator.ts
- [X] T036 [P] [US1] Generate at least six original, non-violent AI monster artworks for public/monster-catalog/*.webp and create stable IDs, alt text and dimensions in public/monster-catalog/catalog.json
- [X] T037 [US1] Implement the static catalog and uploaded-image decoder/validator adapters with the catalog record isolated in src/infrastructure/images/BundledCatalogRecord.ts, src/infrastructure/images/BundledMonsterImageCatalog.ts and src/infrastructure/images/BrowserImageValidator.ts
- [X] T038 [US1] Implement typed record mapping plus atomic monster/blob persistence in src/infrastructure/persistence/indexeddb/MonsterRecordMapper.ts and src/infrastructure/persistence/indexeddb/IndexedDbMonsterRepository.ts
- [X] T039 [US1] Implement persisted image reading without leaking Blob/object URLs through application ports in src/infrastructure/persistence/indexeddb/IndexedDbMonsterImageReader.ts
- [X] T040 [US1] Implement RegisterMonster, ListMonsters, ListMonsterImages and LoadMonsterImage against their use-case interfaces with explicit constructor injection in src/application/monster/RegisterMonster.ts, src/application/monster/ListMonsters.ts, src/application/monster/ListMonsterImages.ts and src/application/monster/LoadMonsterImage.ts
- [X] T041 [US1] Implement object URL creation/revocation lifecycle for uploaded images in src/presentation/shared/images/useMonsterImageUrl.ts
- [X] T042 [US1] Implement the responsive medieval catalog/upload form with local useState for fields, image choice, preview and submission feedback in src/presentation/monster-registration/MonsterRegistrationPage.tsx and src/presentation/monster-registration/MonsterRegistrationPage.module.css
- [X] T043 [US1] Implement responsive parchment-and-brass monster collection cards consuming MonsterCollectionContext plus empty/loading/error states in src/presentation/monster-registration/MonsterCollection.tsx and src/presentation/monster-registration/MonsterCollection.module.css
- [X] T044 [US1] Wire ApplicationProvider and MonsterCollectionProvider to registration use cases, IndexedDB hydration and first-upload persistence through src/app/composition-root/createApplication.ts and src/app/App.tsx
- [X] T045 [US1] Make all US1 tests pass and record the Docker validation commands in specs/001-monster-battle/quickstart.md
- [X] T046 [US1] Capture registration and collection at 375x812, 768x1024 and 1440x900, verify no page overflow, present the checkpoint and record approval or requested adjustments in specs/001-monster-battle/design-reviews/registration.md with screenshots in specs/001-monster-battle/design-reviews/screenshots/registration-mobile.png, registration-tablet.png and registration-desktop.png

**Checkpoint**: US1 is complete, independently demonstrable and survives a browser reload without a
network upload.

---

## Phase 4: User Story 2 — Batalhar com dois monstros (Priority: P2)

**Goal**: Calculate the complete deterministic battle between two stored monsters without changing their
saved HP.

**Independent Test**: Execute StartBattle with deterministic fixtures and verify attack order, every
damage/HP transition, missing counterattack after defeat and final winner.

### Tests for User Story 2

- [X] T047 [P] [US2] Write failing battle aggregate tests for snapshots, contiguous rounds, events and final result in src/domains/battle/Battle.test.ts
- [X] T048 [P] [US2] Write failing table-driven algorithm tests for all tie-breakers, minimum damage, zero clamp and no post-defeat counterattack in src/domains/battle/resolveBattle.test.ts
- [X] T049 [P] [US2] Write failing StartBattleUseCase constructor-injection tests for equal IDs, missing monsters, immutability and DTO mapping in src/application/battle/StartBattle.test.ts
- [X] T050 [P] [US2] Add a failing worst-case 9,999-round calculation benchmark assertion in src/domains/battle/resolveBattle.performance.test.ts

### Implementation for User Story 2

- [X] T051 [P] [US2] Implement immutable AttackEvent and Round values under src/domains/battle/value-objects/ with dedicated functions under src/domains/battle/validations/
- [X] T052 [P] [US2] Implement BattleResult under src/domains/battle/value-objects/, its dedicated validation under src/domains/battle/validations/ and each battle-specific domain error in its own file under src/domains/battle/errors/
- [X] T053 [US2] Implement Battle aggregate with fighter snapshots and invariant validation in src/domains/battle/Battle.ts
- [X] T054 [US2] Implement the pure complete battle resolver and fixed order rules in src/domains/battle/resolveBattle.ts and src/domains/battle/index.ts
- [X] T055 [US2] Define immutable battle contracts one per file and implement StartBattleUseCase with MonsterRepository constructor injection in src/application/battle/contracts/StartBattleUseCase.ts, src/application/battle/dtos/StartBattleInput.ts, src/application/battle/dtos/BattleDto.ts, src/application/battle/dtos/BattleRoundDto.ts, src/application/battle/dtos/BattleEventDto.ts and src/application/battle/StartBattle.ts
- [X] T056 [US2] Register StartBattle in the composition root and expose the completed BattleDto through GameSessionContext intent methods in src/app/composition-root/createApplication.ts and src/app/providers/GameSessionProvider.tsx
- [X] T057 [US2] Make all US2 domain/application/performance tests pass via the Docker test gate

**Checkpoint**: Battle rules are pure, deterministic, fast and testable without React or a real browser.

---

## Phase 5: User Story 3 — Selecionar lutadores em uma arena medieval (Priority: P3)

**Goal**: Select two distinct fighters through an original, animated, non-violent medieval tournament
interface with arcade clarity.

**Independent Test**: Seed monsters, navigate the complete grid by keyboard, populate both slots, reject
a duplicate and confirm the battle.

### Tests for User Story 3

- [X] T058 [P] [US3] Write failing reducer tests for focus, active side, selection, removal and duplicate rejection in src/presentation/fighter-selection/fighterSelectionReducer.test.ts
- [X] T059 [P] [US3] Write failing grid keyboard, roving tabindex, preview, slot and GameSessionContext handoff tests in src/presentation/fighter-selection/FighterSelectionPage.test.tsx and src/app/providers/GameSessionProvider.test.tsx
- [X] T060 [P] [US3] Write the failing keyboard-only selection and battle-confirmation journey in tests/e2e/fighter-selection.spec.ts

### Implementation for User Story 3

- [X] T061 [P] [US3] Implement exhaustive fighter selection transitions with named state and action types isolated in src/presentation/fighter-selection/FighterSelectionState.ts, src/presentation/fighter-selection/FighterSelectionAction.ts and src/presentation/fighter-selection/fighterSelectionReducer.ts
- [X] T062 [P] [US3] Implement reusable monster portrait and enlarged preview cards in src/presentation/fighter-selection/MonsterPortrait.tsx and FighterPreview.tsx
- [X] T063 [US3] Implement accessible grid navigation, roving tabindex and two fighter slots in src/presentation/fighter-selection/FighterGrid.tsx and FighterSlots.tsx
- [X] T064 [US3] Implement the complete selection screen with local simple useState, reducer-driven correlated selection state and GameSessionContext StartBattle handoff in src/presentation/fighter-selection/FighterSelectionPage.tsx
- [X] T065 [US3] Implement responsive medieval tournament-hall styling with carved frames, banners, magical side accents, focus, selection and reduced-motion states in src/presentation/fighter-selection/FighterSelectionPage.module.css
- [X] T066 [US3] Integrate collection-to-selection and selection-to-battle transitions through MonsterCollectionContext, GameSessionContext and local AppScreen useState in src/app/App.tsx and src/app/providers/GameSessionProvider.tsx
- [X] T067 [US3] Make all US3 component and E2E tests pass via the Docker test gate
- [X] T068 [US3] Capture fighter selection at 375x812, 768x1024 and 1440x900 with populated slots and visible focus, verify no page overflow, present the checkpoint and record approval or requested adjustments in specs/001-monster-battle/design-reviews/fighter-selection.md with screenshots in specs/001-monster-battle/design-reviews/screenshots/selection-mobile.png, selection-tablet.png and selection-desktop.png

**Checkpoint**: Selection is independently usable with keyboard, visually expressive and free of graphic
violence or copied franchise assets.

---

## Phase 6: User Story 4 — Reproduzir e explorar a batalha (Priority: P4)

**Goal**: Explore every round and autoplay every battle event at exact 3-second intervals with accessible
card effects and automatic result reveal.

**Independent Test**: Load a known BattleDto, step backward/forward, select arbitrary rounds, play from
event zero, verify 2,999/3,000 ms behavior, interrupt/restart and reach the winner.

### Tests for User Story 4

- [X] T069 [P] [US4] Write failing exhaustive playback reducer tests for load, play, stale ticks, restart, manual pause and completion in src/presentation/battle-playback/playbackReducer.test.ts
- [X] T070 [P] [US4] Write failing fake-timer hook tests for immediate event zero, 2,999/3,000 ms, cleanup and unmount in src/presentation/battle-playback/useBattlePlayback.test.ts
- [X] T071 [P] [US4] Write failing marker-window tests for limits, 9,999 rounds and direct selection in src/presentation/battle-playback/roundWindow.test.ts
- [X] T072 [P] [US4] Write failing semantic card, timeline, live-region and reduced-motion tests in src/presentation/battle-playback/BattlePlaybackPage.test.tsx
- [X] T073 [P] [US4] Write the failing navigation, autoplay, restart, effects and result E2E journey in tests/e2e/battle-playback.spec.ts

### Implementation for User Story 4

- [X] T074 [P] [US4] Implement generation-safe immutable playback transitions with named state and action types isolated in src/presentation/battle-playback/PlaybackState.ts, src/presentation/battle-playback/PlaybackAction.ts and src/presentation/battle-playback/playbackReducer.ts
- [X] T075 [P] [US4] Implement one-shot timeout scheduling and cleanup in src/presentation/battle-playback/useBattlePlayback.ts
- [X] T076 [P] [US4] Implement accessible round pagination/windowing with its model isolated from behavior in src/presentation/battle-playback/RoundWindowModel.ts, src/presentation/battle-playback/roundWindow.ts and src/presentation/battle-playback/RoundTimeline.tsx
- [X] T077 [P] [US4] Implement parchment-and-brass fighter cards, HP text/progress and active event summary in src/presentation/battle-playback/BattleCard.tsx and BattleEventSummary.tsx
- [X] T078 [US4] Implement the responsive castle-arena composition using the BattleDto from GameSessionContext while keeping Play/Restart, previous/next, marker selection, live announcements and high-frequency playback state local in src/presentation/battle-playback/BattlePlaybackPage.tsx
- [X] T079 [US4] Implement non-violent medieval magic attack, impact, damage, HP, defeat and victory effects with reduced-motion alternatives in src/presentation/battle-playback/BattlePlaybackPage.module.css
- [X] T080 [US4] Integrate GameSessionContext BattleDto playback and replay/new-battle intent methods without placing timer ticks in Context in src/app/App.tsx and src/app/providers/GameSessionProvider.tsx
- [X] T081 [US4] Make all US4 unit, component and E2E tests pass via the Docker test gate
- [ ] T082 [US4] Capture ready, attack and victory battle states at 375x812, 768x1024 and 1440x900, verify cards, event panel, controls and timeline without page overflow, present the checkpoint and record approval or requested adjustments in specs/001-monster-battle/design-reviews/battle-playback.md with screenshots in specs/001-monster-battle/design-reviews/screenshots/battle-mobile.png, battle-tablet.png and battle-desktop.png
- [X] T099 [US4] Clarify attack order with `Action X of Y` context and an ordered current-round battle log with completed, current and upcoming states in src/presentation/battle-playback/RoundBattleLog.tsx, src/presentation/battle-playback/BattleEventSummary.tsx, src/presentation/battle-playback/BattlePlaybackPage.tsx and their component/E2E tests
- [X] T100 [US4] Replace the lower round markers with a responsive YouTube-style progress scrubber whose segmented points and range input support direct mouse, touch and keyboard navigation in src/presentation/battle-playback/RoundTimeline.tsx and its component/E2E tests

**Checkpoint**: The full product journey is functional and every battle event can be inspected or played
without stale timers or inaccessible state.

---

## Phase 7: CI/CD and GitHub Pages Hosting

**Purpose**: Validate every change in Docker and deploy the static artifact to GitHub Pages after a
successful `main` build.

- [X] T083 Finalize a BuildKit export target that emits only the production `dist/` artifact in Dockerfile
- [X] T084 [P] Add base-path and catalog-asset assertions for `/react-clear-POC-SDD/` in tests/build/pages-base-path.test.ts
- [X] T085 [P] Add a GitHub Actions CI workflow for pull requests and main pushes that runs format, lint, typecheck, unit/integration coverage, production build and E2E through Docker in .github/workflows/ci.yml
- [X] T086 Create a least-privilege Pages CD workflow with main/workflow_dispatch triggers, Docker quality/build jobs, `VITE_BASE_PATH=/react-clear-POC-SDD/`, Pages artifact upload, protected `github-pages` environment and concurrency in .github/workflows/deploy-pages.yml
- [X] T087 Add a containerized post-deploy Playwright smoke test for root HTML, scripts, styles and catalog assets at the deployed base path in tests/e2e/github-pages-smoke.spec.ts and .github/workflows/deploy-pages.yml
- [X] T088 Add CI and deployment badges, expected Pages URL, one-time Settings → Pages configuration and rollback/re-run guidance in README.md
- [X] T089 Configure the repository Pages source as GitHub Actions and verify the first deployment at https://fbsis.github.io/react-clear-POC-SDD/ following specs/001-monster-battle/quickstart.md
- [X] T090 Verify with a same-origin browser session that a new Pages deployment preserves IndexedDB monsters/uploads and document the evidence in specs/001-monster-battle/quickstart.md

**Checkpoint**: Pull requests cannot bypass quality gates, a successful `main` publishes Pages, failed
builds do not deploy and the live site passes its smoke test.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Complete documentation, security, accessibility, browser coverage and final verification.

- [X] T091 [P] Add automated axe checks for registration, selection and playback in tests/e2e/accessibility.spec.ts
- [X] T092 [P] Add Chromium, Firefox and WebKit persistence/keyboard coverage and isolated browser contexts in playwright.config.ts and tests/e2e/
- [X] T093 [P] Add bundle-size, 100-monster, maximum-round and Context render-isolation performance assertions in tests/performance/budgets.test.ts and tests/performance/context-renders.test.tsx
- [X] T094 Review all exported names, one-declaration-per-file contracts, readonly DTOs, exhaustive unions, React state ownership and decision-focused documentation for Clean Code compliance across src/domains/, src/application/ and src/app/
- [X] T095 Validate contrast pairs, 44px targets, focus order, live announcements and reduced motion against specs/001-monster-battle/contracts/ui-contracts.md
- [X] T096 Document Docker prerequisites, canonical commands, DDD architecture, TypeScript interface injection, Context/useState ownership, one-declaration-per-file convention, IndexedDB behavior, local-data risks, tests, local production and GitHub Pages deployment in README.md
- [X] T097 Run every scenario and command in specs/001-monster-battle/quickstart.md and correct any documentation or implementation mismatch
- [X] T098 Run `pnpm check`, E2E and production export exclusively through Docker and record the final zero-warning result in specs/001-monster-battle/quickstart.md

---

## Phase 9: Local Data Management

**Purpose**: Give the player explicit, safe control over locally persisted monsters and the complete
browser database.

- [X] T100 Add separate injected use cases and infrastructure ports for atomically clearing monsters/uploads and deleting the complete IndexedDB database in src/application/ and src/infrastructure/
- [X] T101 Add responsive, confirmed collection-cleanup and database-reset controls with loading, success and recoverable error states in src/app/ and src/presentation/monster-registration/
- [X] T102 Cover both destructive intents, cancellation, store contents and reload behavior with unit, integration, component and Playwright tests

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: starts immediately.
- **Phase 2 — Foundational**: depends on Phase 1 and blocks every story.
- **Phase 3 — US1**: depends on Phase 2; provides Monster and local persistence.
- **Phase 4 — US2**: depends on the US1 domain/repository contracts, not the registration UI.
- **Phase 5 — US3**: depends on ListMonsters from US1 and StartBattle from US2; T068 remains incomplete
  until its responsive visual checkpoint is approved.
- **Phase 6 — US4**: depends on BattleDto from US2; can develop beside US3, then integrates with it; T082
  remains incomplete until its responsive visual checkpoint is approved.
- **Phase 7 — CI/CD**: workflow skeleton can start after Phase 1, but deployment verification depends on
  all selected product phases and their gates.
- **Phase 8 — Polish**: depends on the complete product and CI/CD.
- **Phase 9 — Local Data Management**: depends on US1 persistence and preserves the existing database
  boundary through injected application ports.

### User Story Dependencies

```text
Setup -> Foundation -> US1 -> US2 -> US3 -> Full flow
                              └----> US4 ----┘
Full flow -> CI/CD -> Polish
```

- **US1** is independently demonstrable through registration and reload.
- **US2** is independently testable with repository fixtures and no UI.
- **US3** is independently testable with seeded monsters and a StartBattle fake.
- **US4** is independently testable with a fixed BattleDto and fake timers.

### Within Each User Story

1. Write tests and observe the intended failure.
2. Implement domain/value objects before use cases.
3. Implement ports before adapters and adapters before composition.
4. Implement presentation after application contracts.
5. Pass the story gate before integration.

## Parallel Opportunities

- Setup config tasks T005–T010 can proceed together after T001–T004 establish package/container choices.
- Foundational CSS, errors, ports, adapters and migration tests have independent files.
- In US1, domain/use-case/repository/UI/E2E tests can be authored in parallel before implementation.
- US2 domain models T051–T052 can proceed together; algorithm waits for them.
- After US2, US3 and US4 can proceed in parallel with fakes and fixed DTOs.
- Responsive screenshot generation is automated, but T046, T068 and T082 are sequential human approval
  gates for their respective visual surfaces.
- CI workflow T085, base-path tests T084 and documentation T088 can proceed in parallel; CD T086 waits for
  the final Docker export contract.
- Final accessibility, cross-browser and performance suites T091–T093 can proceed together.

## Parallel Examples

### User Story 1

```text
Task T025: Domain invariants tests
Task T026: Application use-case tests
Task T027: Repository contract suite
Task T030: Registration component tests
Task T031: Registration E2E
```

### User Stories 3 and 4 after US2

```text
Track A: T058–T067 — fighter selection, followed by approval gate T068
Track B: T069–T081 — battle timeline/playback, followed by approval gate T082
```

### CI/CD

```text
Task T084: GitHub Pages base-path tests
Task T085: Docker CI workflow
Task T088: Pages documentation and badges
Then T086–T087: deploy workflow and live smoke test
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundation.
2. Complete US1 and validate persistence independently.
3. Complete US2 for the smallest meaningful battle product.
4. Deploy this vertical slice through Phase 7 if desired.

### Incremental Delivery

1. US1: persistent monster collection, then responsive visual approval T046.
2. US2: correct battle engine.
3. US3: medieval fighter selection, then responsive visual approval T068.
4. US4: castle-arena card presentation and timeline, then responsive visual approval T082.
5. CI/CD: publish only after every selected story passes its gates.
6. Polish: cross-browser, accessibility, performance and documentation.

## Notes

- `[P]` means different files and no dependency on an incomplete task.
- Story labels map directly to spec priorities.
- No application runtime, build, test or package-manager command runs on the host.
- T046, T068 and T082 MUST pause for product-owner review and cannot be marked complete from automated
  screenshots alone; requested adjustments require a new screenshot set and recorded approval.
- GitHub Pages receives only static `dist/`; uploaded monster images remain in browser IndexedDB.
- Repository Pages configuration in T089 is an external one-time action and may require owner approval.
