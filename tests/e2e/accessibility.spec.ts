import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test('registration has no detectable WCAG A or AA violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Forje seu monstro' })).toBeVisible();

  await expectNoAccessibilityViolations(page);
});

test('fighter selection has no detectable WCAG A or AA violations', async ({ page }) => {
  await page.goto('/');
  await registerMonster(page, 'Pyraxis', 'Pyraxis', 90, 40, 80, 100);
  await registerMonster(page, 'Aeralune', 'Aeralune', 60, 60, 65, 60);
  await page.getByRole('button', { name: 'Escolher lutadores' }).click();
  await expect(page.getByRole('heading', { name: 'Escolha seus lutadores' })).toBeVisible();

  await expectNoAccessibilityViolations(page);
});

test('battle playback has no detectable WCAG A or AA violations', async ({ page }) => {
  await page.goto('/');
  await registerMonster(page, 'Pyraxis', 'Pyraxis', 90, 40, 80, 100);
  await registerMonster(page, 'Aeralune', 'Aeralune', 60, 60, 65, 60);
  await page.getByRole('button', { name: 'Escolher lutadores' }).click();

  const portraits = page.getByRole('grid', { name: 'Selecionar lutadores' }).getByRole('button');
  await portraits.nth(0).click();
  await portraits.nth(1).click();
  await page.getByRole('button', { name: 'Iniciar batalha' }).click();
  await expect(page.getByRole('heading', { name: 'Arena de batalha' })).toBeVisible();

  await expectNoAccessibilityViolations(page);
});

async function expectNoAccessibilityViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

async function registerMonster(
  page: Page,
  name: string,
  imageName: string,
  attack: number,
  defense: number,
  speed: number,
  hp: number
): Promise<void> {
  await page.getByLabel('Nome').fill(name);
  await page.getByRole('spinbutton', { name: 'Ataque', exact: true }).fill(String(attack));
  await page.getByRole('spinbutton', { name: 'Defesa', exact: true }).fill(String(defense));
  await page.getByRole('spinbutton', { name: 'Velocidade', exact: true }).fill(String(speed));
  await page.getByRole('spinbutton', { name: 'Vida', exact: true }).fill(String(hp));
  await page.getByRole('radio', { name: imageName, exact: true }).check();
  await page.getByRole('button', { name: 'Guardar monstro' }).click();
  await expect(page.getByRole('article', { name })).toBeVisible();
}
