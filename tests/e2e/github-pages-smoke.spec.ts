import { expect, test } from '@playwright/test';

test.skip(!process.env.GITHUB_PAGES_SMOKE, 'Runs only against the deployed GitHub Pages site.');

test('serves the application and catalog from the repository base path', async ({ page }) => {
  await expect(async () => {
    const response = await page.goto(`./?smoke=${String(Date.now())}`);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: 'Forje seu monstro' })).toBeVisible({
      timeout: 3_000
    });
  }).toPass({ timeout: 120_000, intervals: [1_000, 2_000, 5_000] });

  await expect(page.getByRole('radio', { name: 'Pyraxis' })).toBeVisible();
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute(
    'href',
    /\/react-clear-POC-SDD\/assets\//u
  );
  await expect(page.locator('script[type="module"]')).toHaveAttribute(
    'src',
    /\/react-clear-POC-SDD\/assets\//u
  );

  const catalogResponse = await page.request.get(
    new URL('monster-catalog/catalog.json', page.url()).toString()
  );
  expect(catalogResponse.ok()).toBe(true);
  await expect(page.locator('img[src*="/react-clear-POC-SDD/monster-catalog/"]')).toHaveCount(6);
});
