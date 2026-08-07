import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { DESIGN_REVIEW_VIEWPORTS } from './support/designReview';

for (const viewport of DESIGN_REVIEW_VIEWPORTS) {
  test(`captures fighter selection review at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await registerMonster(page, 'Pyraxis', 'Pyraxis', 86, 68, 72, 180);
    await registerMonster(page, 'Aeralune', 'Aeralune', 70, 64, 95, 150);
    await registerMonster(page, 'Bramblehorn', 'Bramblehorn', 74, 90, 42, 210);
    await page.getByRole('button', { name: 'Escolher lutadores' }).click();

    const portraits = page.getByRole('grid', { name: 'Selecionar lutadores' }).getByRole('button');
    await portraits.first().focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');

    await expect(page.getByRole('region', { name: 'Lutador 1' })).not.toContainText(
      'Selecione um retrato'
    );
    await expect(page.getByRole('region', { name: 'Lutador 2' })).not.toContainText(
      'Selecione um retrato'
    );
    await expect(portraits.nth(2)).toBeFocused();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.screenshot({
      path: `specs/001-monster-battle/design-reviews/screenshots/selection-${viewport.name}.png`,
      fullPage: true,
      animations: 'disabled'
    });
  });
}

async function registerMonster(
  page: Page,
  name: string,
  imageName: string,
  attack: number,
  defense: number,
  speed: number,
  hp: number
) {
  await page.getByLabel('Nome').fill(name);
  await page.getByRole('spinbutton', { name: 'Ataque', exact: true }).fill(String(attack));
  await page.getByRole('spinbutton', { name: 'Defesa', exact: true }).fill(String(defense));
  await page.getByRole('spinbutton', { name: 'Velocidade', exact: true }).fill(String(speed));
  await page.getByRole('spinbutton', { name: 'Vida', exact: true }).fill(String(hp));
  await page.getByRole('radio', { name: imageName, exact: true }).check();
  await page.getByRole('button', { name: 'Guardar monstro' }).click();
  await expect(page.getByRole('article', { name })).toBeVisible();
}
