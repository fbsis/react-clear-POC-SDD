# Quickstart and Validation Guide

This guide defines the commands and end-to-end evidence the implementation MUST provide. Until the
implementation tasks are executed, commands describe the intended project interface.

## Prerequisites

- Docker Engine with Docker Compose 2.22 or newer
- Git
- A modern browser

Do not install Node.js, pnpm or project dependencies on the host.

## Build and run

```bash
docker compose build
docker compose up --build --watch
```

Expected: the development app is available on the fixed documented port and changes reload. The port
MUST remain stable because IndexedDB is scoped by origin.

For a one-off run without Compose Watch:

```bash
docker compose up --build app
```

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
occurs. Browser devtools show `monsters` and `imageAssets` in IndexedDB, not localStorage.

### 3. Validation and storage failures

- Attempt blank name, fractional/negative/out-of-range stats, unsupported/corrupt/oversized image.
- Simulate quota failure and a blocked schema upgrade.

Expected: no partial monster or orphan blob is saved; entered data remains and messages are actionable.

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
