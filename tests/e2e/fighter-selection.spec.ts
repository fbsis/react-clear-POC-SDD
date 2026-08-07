import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test('selects two fighters and confirms battle using the keyboard', async ({ page }) => {
  await page.goto('/');
  await registerMonster(page, 'Pyraxis', /Pyraxis/u);
  await registerMonster(page, 'Aeralune', /Aeralune/u);
  await page.getByRole('button', { name: 'Escolher lutadores' }).click();

  const firstPortrait = page
    .getByRole('grid', { name: 'Selecionar lutadores' })
    .getByRole('button')
    .first();
  await firstPortrait.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Iniciar batalha' }).press('Enter');

  await expect(page.getByRole('heading', { name: 'Arena de batalha' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Batalha pronta');
});

async function registerMonster(page: Page, name: string, imageName: RegExp) {
  await page.getByLabel('Nome').fill(name);
  await page.getByRole('spinbutton', { name: 'Ataque', exact: true }).fill('80');
  await page.getByRole('spinbutton', { name: 'Defesa', exact: true }).fill('60');
  await page.getByRole('spinbutton', { name: 'Velocidade', exact: true }).fill('70');
  await page.getByRole('spinbutton', { name: 'Vida', exact: true }).fill('160');
  await page.getByRole('radio', { name: imageName }).check();
  await page.getByRole('button', { name: 'Guardar monstro' }).click();
  await expect(page.getByRole('article', { name })).toBeVisible();
}
