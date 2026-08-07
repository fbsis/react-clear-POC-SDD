# Battle playback visual checkpoint

Date: 2026-08-07  
Status: awaiting product-owner review

The castle-arena playback milestone was captured with Chromium in Docker using the same deterministic
two-round battle. The three references intentionally cover complementary states: mobile is ready,
tablet shows the first magical attack and desktop shows the final victory.

The evidence was refreshed after T099 to include the explicit action position and the ordered
current-round battle log. Completed, current and upcoming attacks remain distinguishable through text,
not color alone, and each entry exposes attacker, defender, damage and HP transition.

## Automated checks

- 375x812 mobile ready state: no horizontal page overflow
- 768x1024 tablet attack state: no horizontal page overflow
- 1440x900 desktop victory state: no horizontal page overflow
- both named fighter cards, semantic HP progress and timeline controls remain visible
- attack, damage, defeat and victory always include text in addition to color or motion
- each round shows `Ação X de Y` and its complete attack order without rendering the full battle history
- the lower timeline uses a progress scrubber with clickable round points, filled progress and native keyboard navigation
- reduced-motion CSS removes translation and impact animation while preserving every status change

## Evidence

- [Mobile · ready](./screenshots/battle-mobile.png)
- [Tablet · attack](./screenshots/battle-tablet.png)
- [Desktop · victory](./screenshots/battle-desktop.png)

## Decision

Awaiting approval or requested adjustments. T082 remains open until that decision is recorded here.
