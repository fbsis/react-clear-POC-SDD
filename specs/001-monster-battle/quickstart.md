# Quickstart and Validation Guide

This guide defines the canonical commands and end-to-end evidence for the implemented application.

## Prerequisites

- Docker Engine with Docker Compose 2.22 or newer
- Git
- A modern browser

Do not install Node.js, pnpm or project dependencies on the host.

## Build and run

```bash
docker compose build
docker compose up --build app
```

Expected: the development app is available at `http://localhost:5173` and source changes reload through
the configured volume. The port MUST remain stable because IndexedDB is scoped by origin.

## Quality gates

If `app` is running:

```bash
docker compose exec app pnpm format:check
docker compose exec app pnpm lint
docker compose exec app pnpm typecheck
docker compose exec app pnpm test:coverage
docker compose exec app pnpm build
```

Single aggregate gate:

```bash
docker compose run --rm --build app pnpm check
```

Expected: all commands exit 0, ESLint reports zero warnings and the production bundle respects budgets.

Final local validation on 2026-08-07:

```bash
docker compose run --rm app pnpm check
docker compose up -d app
docker compose run --rm e2e pnpm test:e2e
```

Result: 39 unit/integration test files and 113 tests passed with zero formatting, lint, type or build
warnings. The production JavaScript measured 74.62 KB gzip against the 250 KB budget. The Chromium E2E
suite passed 19 local journeys; the one URL-dependent GitHub Pages smoke test was correctly skipped
outside the deployment workflow. All uploaded bytes remained in IndexedDB on the tested browser origin.

The GitHub Pages delivery contract was also validated locally in Docker: the BuildKit export emitted
only the static site, `index.html` referenced scripts and styles below `/react-clear-POC-SDD/`, all six
catalog images were present and the complete Playwright suite passed before publication.

The cross-browser critical-path matrix was also validated:

```bash
docker compose run --rm --env PLAYWRIGHT_FULL_MATRIX=true e2e pnpm test:e2e \
  tests/e2e/monster-registration.spec.ts \
  tests/e2e/fighter-selection.spec.ts \
  tests/e2e/browser-context-isolation.spec.ts
```

Result: all 9 persistence, keyboard and isolated-context journeys passed in Chromium, Firefox and WebKit.
The deterministic worst-case battle produced 9,999 rounds and 19,997 events within the one-second budget.

## Browser tests

```bash
docker compose run --rm e2e pnpm test:e2e
```

Expected: Playwright uses the pinned browser image/version and validates Chromium in the fast gate;
the full CI matrix additionally validates Firefox and WebKit.

## Local production image

```bash
docker compose --profile production up --build
```

Expected: static production assets are served by a non-root container. `vite preview` is not production.

Final release evidence recorded on 2026-08-07:

```bash
docker compose run --rm app pnpm check
docker compose run --rm e2e pnpm test:e2e
docker build --target export --output type=local,dest=<temporary-directory> .
```

Result: the aggregate gate completed with zero warnings, 39 test files and 113 tests passed, 19 local E2E
journeys passed with only the deployment-only smoke test skipped, and the BuildKit export contained only
`index.html`, hashed scripts/styles and the six-image catalog. The temporary export was inspected and
removed after validation.

## GitHub Pages deployment

The canonical hosted URL is expected to be:

```text
https://fbsis.github.io/react-clear-POC-SDD/
```

One-time repository configuration:

1. Open GitHub repository **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Keep the repository or `github-pages` environment accessible to the workflow.

Automatic deployment occurs after a successful push to `main`. Manual deployment is available through
the `workflow_dispatch` action. The workflow MUST:

1. Run the aggregate quality gate inside Docker.
2. Build with `VITE_BASE_PATH=/react-clear-POC-SDD/` inside Docker.
3. Export only `dist/` as the Pages artifact.
4. Use the official configure, upload and deploy Pages actions.
5. Deploy only after the build job succeeds.

Validation after deployment:

- open the Pages URL directly and after a reload;
- confirm CSS, scripts and catalog images load under the repository base path;
- register/upload a monster, reload and confirm IndexedDB persistence;
- deploy a new version and confirm the same-origin local data remains;
- verify browser network requests never send an uploaded image to GitHub or another service.

First deployment evidence recorded on 2026-08-07: the public URL returned HTTP 200 and the containerized
Playwright smoke test loaded the application heading, hashed CSS/JavaScript below
`/react-clear-POC-SDD/`, the catalog manifest and all six catalog images. A first request during CDN
propagation returned the new HTML before the page became interactive; the required retry passed after the
artifact reached the edge cache.

Same-origin continuity evidence recorded on 2026-08-07: a persistent Chromium profile registered
`Upload Persistente T090` with a local WebP and confirmed that its rendered image used a valid `blob:` URL
while the deployed document reported `Last-Modified: 00:00:50 GMT`. Commit `f66c84e` triggered a new Pages
deployment; the same profile observed `Last-Modified: 00:02:49 GMT`, retried until the new assets reached
the CDN, reloaded the page and found both the saved monster and uploaded image intact. No export/import or
storage-state restoration was used; continuity came from the existing `monsters` and `imageAssets`
IndexedDB stores on the unchanged Pages origin.

GitHub Pages serves only static assets. The application MUST NOT rely on server APIs, secrets or
server-side routing. A future custom domain changes the origin and requires explicit data-migration
planning.

## End-to-end validation scenarios

### 1. Bundled catalog registration

1. Open registration.
2. Verify at least six distinct AI-generated catalog images with useful alternatives.
3. Enter valid name/stats and choose a catalog image.
4. Save and reload the page.

Expected: monster and selected image remain in the collection.

### 2. Uploaded image persistence

1. Register another monster with a JPEG/PNG/WebP under 10 MB.
2. Verify preview and save.
3. Reload and start a new browser page in the same context/origin.

Expected: the uploaded image remains visible in collection, selection and battle cards; no network upload
occurs. Browser devtools show `monsters` and `imageAssets` in IndexedDB, with image bytes stored as an
`ArrayBuffer`, not in localStorage.

### 3. Validation and storage failures

- Attempt blank name, fractional/negative/out-of-range stats, unsupported/corrupt/oversized image.
- Simulate quota failure and a blocked schema upgrade.

Expected: no partial monster or orphan image asset is saved; entered data remains and messages are
actionable.

### 4. Battle algorithm

Use deterministic fixtures covering:

- faster monster starts;
- speed tie resolved by attack;
- full tie resolved by first selection;
- damage is attack minus defense with minimum 1;
- HP never appears negative;
- defeated defender does not counterattack;
- original monster HP remains unchanged.

Expected: all rounds/events and winner match [data-model.md](./data-model.md).

### 5. Arcade selection

1. Navigate the grid using keyboard only.
2. Select distinct monsters for both sides.
3. Attempt a duplicate, correct it, and confirm.

Expected: focus is visible, slots and previews update, duplicate is rejected and battle opens.

### 6. Timeline playback

1. Verify one marker per round and manually move backward/forward.
2. Press Play: event 0 appears immediately.
3. At 2.999 seconds verify no advance; at 3.000 seconds verify exactly one event advances.
4. Navigate manually during play; verify playback pauses.
5. Press Play again; verify restart at event 0 and final winner reveal.

Expected: event text, HP and effects stay aligned; no stale or duplicate timer fires.

### 7. Accessibility and reduced motion

1. Complete core journey using keyboard.
2. Enable reduced-motion preference.
3. Run automated axe checks and inspect the live battle announcement.

Expected: no essential information depends on color or motion, focus does not move during playback, and
all status changes have text equivalents.

## README acceptance

The final README MUST repeat these canonical Docker commands, architecture summary, local-storage model,
browser/port limitation, testing matrix, local production image, GitHub Pages setup/deploy and
troubleshooting. It MUST warn that browser data is local to the origin/profile and may be removed by the
user or browser.
