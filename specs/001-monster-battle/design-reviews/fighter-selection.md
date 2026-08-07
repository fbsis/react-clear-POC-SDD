# Fighter selection visual checkpoint

Date: 2026-08-07  
Status: awaiting product-owner review

The medieval tournament-hall selection milestone was captured with Chromium in Docker using three
deterministic catalog monsters. Two fighter slots are populated and keyboard focus remains visible on a
third portrait in every viewport.

## Automated checks

- 375x812 mobile viewport: no horizontal page overflow
- 768x1024 tablet viewport: no horizontal page overflow
- 1440x900 desktop viewport: no horizontal page overflow
- both fighter slots are populated in every capture
- the third portrait retains visible keyboard focus
- reduced-motion alternatives and 44px controls are implemented in the responsive stylesheet

## Evidence

- [Mobile](./screenshots/selection-mobile.png)
- [Tablet](./screenshots/selection-tablet.png)
- [Desktop](./screenshots/selection-desktop.png)

## Decision

Awaiting approval or requested adjustments. T068 remains open until that decision is recorded here.
