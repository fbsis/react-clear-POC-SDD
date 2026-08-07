import { expect, test } from '@playwright/test';
import { DESIGN_REVIEW_VIEWPORTS } from './support/designReview';

for (const viewport of DESIGN_REVIEW_VIEWPORTS) {
  test(`captures registration review at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Forje seu monstro' })).toBeVisible();

    await page.getByLabel('Nome').fill('Pyraxis');
    await page.getByRole('spinbutton', { name: 'Ataque', exact: true }).fill('86');
    await page.getByRole('spinbutton', { name: 'Defesa', exact: true }).fill('68');
    await page.getByRole('spinbutton', { name: 'Velocidade', exact: true }).fill('72');
    await page.getByRole('spinbutton', { name: 'Vida', exact: true }).fill('180');
    await page.getByRole('radio', { name: 'Pyraxis' }).check();
    await page.getByRole('button', { name: 'Guardar monstro' }).click();
    await expect(page.getByRole('article', { name: 'Pyraxis' })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.screenshot({
      path: `specs/001-monster-battle/design-reviews/screenshots/registration-${viewport.name}.png`,
      fullPage: true,
      animations: 'disabled'
    });
  });
}
