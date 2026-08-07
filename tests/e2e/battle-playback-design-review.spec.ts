import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { DESIGN_REVIEW_VIEWPORTS } from './support/designReview';

for (const viewport of DESIGN_REVIEW_VIEWPORTS) {
  test(`captures battle playback review at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await registerMonster(page, 'Pyraxis', 'Pyraxis', 90, 40, 80, 100);
    await registerMonster(page, 'Aeralune', 'Aeralune', 60, 60, 65, 60);
    await openBattle(page);

    if (viewport.name === 'tablet') {
      await page.getByRole('button', { name: 'Play' }).click();
      await expect(page.getByText(/-\d+ HP/u)).toBeVisible();
    }
    if (viewport.name === 'desktop') {
      await page.getByRole('button', { name: 'Round 2 de 2' }).click();
      await expect(page.getByText('Vencedor')).toBeVisible();
    }

    await expect(page.getByRole('article', { name: 'Pyraxis' }).locator('img')).toBeVisible();
    await expect(page.getByRole('article', { name: 'Aeralune' }).locator('img')).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.screenshot({
      path: `specs/001-monster-battle/design-reviews/screenshots/battle-${viewport.name}.png`,
      fullPage: true,
      animations: 'disabled'
    });
  });
}

async function openBattle(page: Page) {
  await page.getByRole('button', { name: 'Escolher lutadores' }).click();
  const portraits = page.getByRole('grid', { name: 'Selecionar lutadores' }).getByRole('button');
  await portraits.first().focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Iniciar batalha' }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Arena de batalha' })).toBeVisible();
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
