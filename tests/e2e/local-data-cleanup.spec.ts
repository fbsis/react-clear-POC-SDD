import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test('clears the collection or resets the complete local database after confirmation', async ({
  page
}) => {
  await page.goto('/');
  await registerUploadedMonster(page, 'Monstro temporário');

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('monstros convocados');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Limpar monstros convocados' }).click();
  await expect(page.getByText(/ainda não há monstros/iu)).toBeVisible();
  await expect(databaseCounts(page)).resolves.toEqual({ monsters: 0, imageAssets: 0 });

  await registerCatalogMonster(page, 'Monstro antes do reset');
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('todo o banco de dados local');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Limpar todo o banco de dados' }).click();
  await expect(page.getByText(/banco de dados local foi limpo/iu)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/ainda não há monstros/iu)).toBeVisible();
  await expect(databaseCounts(page)).resolves.toEqual({ monsters: 0, imageAssets: 0 });
});

async function registerUploadedMonster(page: Page, name: string): Promise<void> {
  await fillMonsterStats(page, name);
  await page.getByRole('radio', { name: 'Minha imagem' }).check();
  await page
    .getByLabel(/Escolher imagem JPEG/u)
    .setInputFiles('public/monster-catalog/aeralune.webp');
  await page.getByRole('button', { name: 'Guardar monstro' }).click();
  await expect(page.getByRole('article', { name })).toBeVisible();
}

async function registerCatalogMonster(page: Page, name: string): Promise<void> {
  await fillMonsterStats(page, name);
  await page.getByRole('radio', { name: 'Bestiário' }).check();
  await page.getByRole('radio', { name: 'Pyraxis', exact: true }).check();
  await page.getByRole('button', { name: 'Guardar monstro' }).click();
  await expect(page.getByRole('article', { name })).toBeVisible();
}

async function fillMonsterStats(page: Page, name: string): Promise<void> {
  await page.getByLabel('Nome').fill(name);
  await page.getByRole('spinbutton', { name: 'Ataque', exact: true }).fill('70');
  await page.getByRole('spinbutton', { name: 'Defesa', exact: true }).fill('60');
  await page.getByRole('spinbutton', { name: 'Velocidade', exact: true }).fill('80');
  await page.getByRole('spinbutton', { name: 'Vida', exact: true }).fill('140');
}

async function databaseCounts(page: Page): Promise<{ monsters: number; imageAssets: number }> {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('monster-arena');
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? new Error('Could not open the local database.'));
      };
    });
    const transaction = database.transaction(['monsters', 'imageAssets'], 'readonly');
    const count = (storeName: 'monsters' | 'imageAssets') =>
      new Promise<number>((resolve, reject) => {
        const request = transaction.objectStore(storeName).count();
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = () => {
          reject(request.error ?? new Error(`Could not count ${storeName}.`));
        };
      });
    const [monsters, imageAssets] = await Promise.all([count('monsters'), count('imageAssets')]);
    database.close();
    return { monsters, imageAssets };
  });
}
