# UI Contracts

## Global visual system

- Semantic tokens define canvas, stone and parchment surfaces, text, fighter sides, success, warning,
  danger, magic and focus.
- Visual direction is an original medieval castle transformed into a monster tournament arena: carved
  stone, aged parchment, worn leather, antique brass, heraldic banners, torchlight and restrained magic.
- Initial palette: night stone `#090D18`, raised stone `#182131`, parchment `#E8D7B5`, antique brass
  `#B88A3B`, primary text `#F7F2E8`, secondary text `#C7BDA9`, ember side `#E45B32`, forest-magic side
  `#36BFA0`, focus `#FFD166`.
- Every text/background pair MUST pass WCAG AA before use. Color is always paired with text, icon or shape.
- Controls target 44x44 CSS px; visible focus uses a solid high-contrast outline, not glow alone.
- Motion tokens: 120 ms fast, 220 ms normal, 360 ms emphasis, 3.000 ms event interval.

## Monster registration

- Labeled fields: name, attack, defense, speed, HP.
- Image choice exposes two explicit paths: bundled catalog or local file.
- Catalog is a named selection group; upload accepts JPEG/PNG/WebP and displays preview, filename and size.
- Errors appear beside fields and in an accessible summary; valid entered data remains after failure.
- Saving has idle, submitting, success, quota, blocked and retryable failure states.

## Fighter selection

- Collection is an accessible grid named “Selecionar lutadores”. Each cell is one focusable button/card.
- Arrow keys navigate; Home/End go to boundaries; Enter/Space select. Roving tabindex keeps one grid cell
  in the Tab sequence.
- Slots “Lutador 1” and “Lutador 2” show name, image and attributes. Active side uses text and icon.
- Focused item gets enlarged preview but preview does not add a duplicate focus stop.
- Same-monster selection is rejected without losing focus.
- Visual direction is an original medieval tournament selection hall with banners, carved frames and
  magical side accents; it keeps arcade clarity without copying franchise assets and contains no blood,
  wounds, dismemberment or graphic violence.

## Battle cards

- Each fighter is a named `article`; image, name, attack, defense, speed and HP are real text.
- HP is shown as `current / maximum` plus a semantic progress element.
- Current effect always includes textual event summary.
- Effect mapping:
  - attack: attacker emphasis/short advance + attacker name;
  - impact: defender outline/energy wave + `-N HP` badge;
  - HP: bar and current/max text update;
  - defeat: “Derrotado” seal;
  - victory: “Vencedor” seal plus static glow.
- Reduced motion removes translate, scale, shake and particles while preserving all state changes.

## Timeline and playback

- Named region contains previous round, Play/Restart, next round, ordered round markers and active summary.
- Each marker is a native button named `Round N de M`; active marker uses `aria-current="step"`.
- Boundary controls stay visible and disabled with an explanatory accessible name.
- Play shows event 0 immediately, then advances once at 3.000 ms intervals.
- Play while active invalidates old timer and restarts; manual navigation cancels timer and pauses.
- Autoplay never moves keyboard focus.
- One `aria-live="polite"`, `aria-atomic="true"` region announces round, attacker, defender, damage and HP.
- Up to 200 rounds use a horizontal ordered list. Larger battles use paginated/windowed markers plus direct
  round selection and total position; every round remains reachable by native controls.

## Responsive layout contract

- Reference review viewports are mobile `375x812`, tablet `768x1024` and desktop `1440x900`.
- The document MUST have no horizontal page overflow at any reference viewport or intermediate width.
- Mobile uses a single-column flow: active fighter/event first, opponent next, timeline and controls last;
  both fighters and the current HP/event remain visible without relying on hover.
- Tablet may use a compact two-column fighter layout, but registration fields and primary actions preserve
  comfortable reading width and 44x44 CSS px targets.
- Desktop uses the full castle-arena composition with opposing fighter cards, central action area, event
  panel and bottom timeline without fixing content to the viewport height.
- Timeline markers may scroll inside their named region or use the defined windowing behavior; page-level
  horizontal scrolling is forbidden.
- Images use reserved aspect-ratio boxes and responsive sources/sizing so loading never covers controls or
  causes disruptive layout shifts.

## Human visual review gates

- Registration/collection, fighter selection and battle playback each have an independent review gate.
- Every gate captures populated, empty/error where applicable, focus-visible and reduced-motion states at
  all three reference viewports using deterministic fixtures.
- Screenshots and notes live under `specs/001-monster-battle/design-reviews/`; approval or requested
  adjustments are recorded before the gate is completed.
- A rejected gate returns to implementation, repeats automated checks and replaces its screenshots before
  the following visual phase proceeds.

## Required UI states

| Surface | States |
|---------|--------|
| Collection | loading, empty, populated, storage unavailable |
| Registration | pristine, invalid, saving, saved, quota failure, retryable failure |
| Selection | empty, one selected, two selected, duplicate rejected, ready |
| Battle | calculating, ready, playing, paused, complete, failure |
| Images | catalog ready, upload preview, decoding failure, missing persisted image |

## React state ownership

- `ApplicationContext` provides stable use-case interfaces and never exposes concrete adapters.
- `MonsterCollectionContext` owns the in-memory `readonly MonsterDto[]`, hydration status and named
  refresh/register outcomes; IndexedDB remains the durable source of truth.
- `GameSessionContext` owns only cross-screen current screen, fighter IDs and completed `BattleDto`.
- Providers expose intent methods rather than raw `setState` functions, and every context value type lives
  in its own file.
- Field values, validation display, image preview and other single-screen state use local `useState`.
- Fighter-selection and playback transitions use local `useReducer`; playback ticks MUST NOT update a
  global Context.
- Context consumers MUST throw a clear development error when rendered outside their provider.

## UI test contract

- Tests query by role/name, never implementation class names.
- Full registration, selection and playback work by keyboard.
- Fake timers prove no advance at 2.999 ms and exactly one advance at 3.000 ms.
- Manual navigation leaves no pending timer; unmount and restart cancel stale timers.
- Reduced-motion mode preserves text and sequence.
- Automated axe checks are a gate; manual keyboard and one screen-reader pass complement automation.
