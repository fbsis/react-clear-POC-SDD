import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test('navigates, plays, restarts and reveals the battle result', async ({ page }) => {
  await page.goto('/');
  await registerMonster(page, 'Pyraxis', 'Pyraxis', 90, 40, 80, 100);
  await registerMonster(page, 'Aeralune', 'Aeralune', 60, 60, 65, 60);
  await page.getByRole('button', { name: 'Escolher lutadores' }).click();
  const portraits = page.getByRole('grid', { name: 'Selecionar lutadores' }).getByRole('button');
  await portraits.first().focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Iniciar batalha' }).press('Enter');

  await expect(page.getByRole('heading', { name: 'Arena de batalha' })).toBeVisible();
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.getByRole('status')).toContainText('causando');
  await expect(page.getByText(/-\d+ HP/u)).toBeVisible();
  await expect(page.getByText('Ação 1 de 2', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Log do round 1' })).toContainText('Próxima');
  await page.getByRole('button', { name: 'Reiniciar' }).click();
  await expect(page.getByRole('button', { name: 'Round 1 de 2' })).toHaveAttribute(
    'aria-current',
    'step'
  );

  await page.getByRole('slider', { name: 'Navegar pelos rounds' }).fill('2');
  await expect(page.getByText('Vencedor')).toBeVisible();
  await expect(page.getByRole('heading', { name: /vence!/u })).toBeVisible();
});

test('completes a lethal first attack without leaving playback stuck', async ({ page }) => {
  await page.goto('/');
  await registerMonster(page, 'Teste', 'Pyraxis', 1, 1, 1, 1);
  await registerMonster(page, 'Teste 2', 'Aeralune', 2, 2, 2, 1);
  await page.getByRole('button', { name: 'Escolher lutadores' }).click();
  await page.getByRole('button', { name: 'Selecionar Teste', exact: true }).click();
  await page.getByRole('button', { name: 'Selecionar Teste 2', exact: true }).click();
  await page.getByRole('button', { name: 'Iniciar batalha' }).click();
  await page.getByRole('button', { name: 'Play' }).click();

  await expect(page.getByRole('heading', { name: 'Teste 2 vence!' })).toBeVisible();
  await expect(page.getByText('Atacando')).toHaveCount(0);
  await expect(page.getByText('Impacto')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Pausar' })).toHaveCount(0);
});

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
