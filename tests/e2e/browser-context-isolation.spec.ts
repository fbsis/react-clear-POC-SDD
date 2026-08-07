import { expect, test } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173';

test('keeps IndexedDB durable inside one browser context and isolated from another', async ({
  browser
}) => {
  const persistentContext = await browser.newContext({ baseURL: baseUrl });
  const isolatedContext = await browser.newContext({ baseURL: baseUrl });

  try {
    const persistentPage = await persistentContext.newPage();
    await persistentPage.goto('/');
    await registerMonster(persistentPage, 'Guardião persistente');
    await persistentPage.reload();
    await expect(
      persistentPage.getByRole('article', { name: 'Guardião persistente' })
    ).toBeVisible();

    const isolatedPage = await isolatedContext.newPage();
    await isolatedPage.goto('/');
    await expect(isolatedPage.getByRole('article', { name: 'Guardião persistente' })).toHaveCount(
      0
    );
    await expect(isolatedPage.getByRole('heading', { name: 'Forje seu monstro' })).toBeVisible();
  } finally {
    await closeContexts(persistentContext, isolatedContext);
  }
});

async function registerMonster(page: Page, name: string): Promise<void> {
  await page.getByLabel('Nome').fill(name);
  await page.getByRole('spinbutton', { name: 'Ataque', exact: true }).fill('80');
  await page.getByRole('spinbutton', { name: 'Defesa', exact: true }).fill('60');
  await page.getByRole('spinbutton', { name: 'Velocidade', exact: true }).fill('70');
  await page.getByRole('spinbutton', { name: 'Vida', exact: true }).fill('160');
  await page.getByRole('radio', { name: /Pyraxis/u }).check();
  await page.getByRole('button', { name: 'Guardar monstro' }).click();
  await expect(page.getByRole('article', { name })).toBeVisible();
}

async function closeContexts(...contexts: readonly BrowserContext[]): Promise<void> {
  await Promise.all(contexts.map(async (context) => context.close()));
}
