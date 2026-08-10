# Registration visual checkpoint

Date: 2026-08-07  
Status: approved

The responsive registration milestone was captured with Chromium in Docker using the deterministic
Pyraxis fixture. Screenshots use full-page capture at each required viewport so the form and persisted
collection can be reviewed together.

Evidence refreshed on 2026-08-10 after T108: successful registration now uses a compact
parchment-and-brass notice on its own row, and collection cards keep a fixed 17rem width from tablet
upward instead of stretching when the collection has few monsters.

## Automated checks

- 375x812 mobile viewport: no horizontal page overflow
- 768x1024 tablet viewport: no horizontal page overflow
- 1440x900 desktop viewport: no horizontal page overflow
- catalog selection and saved collection are visible in every capture
- registration feedback and the submit action keep a measured gap of at least 12 CSS pixels
- a saved card keeps the same measured width before and after another monster is added
- keyboard-accessible controls and visible focus rules are covered by the UI test suite

## Evidence

- [Mobile](./screenshots/registration-mobile.png)
- [Tablet](./screenshots/registration-tablet.png)
- [Desktop](./screenshots/registration-desktop.png)

## Decision

Approved by the product owner on 2026-08-07 without requested adjustments. The responsive registration
and collection visual direction is accepted as the baseline for the next interface milestone.
