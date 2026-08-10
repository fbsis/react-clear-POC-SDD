import { expect, test } from '@playwright/test';

test('registers catalog and uploaded-image monsters across reloads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Forje seu monstro' })).toBeVisible();

  await page.getByLabel('Nome').fill('Pyraxis');
  await page.getByRole('spinbutton', { name: 'Ataque', exact: true }).fill('86');
  await page.getByRole('spinbutton', { name: 'Defesa', exact: true }).fill('68');
  await page.getByRole('spinbutton', { name: 'Velocidade', exact: true }).fill('72');
  await page.getByRole('spinbutton', { name: 'Vida', exact: true }).fill('180');
  await page.getByRole('radio', { name: /Pyraxis/u }).check();
  await page.getByRole('button', { name: 'Guardar monstro' }).click();

  const pyraxisCard = page.getByRole('article', { name: 'Pyraxis' });
  await expect(pyraxisCard).toBeVisible();
  const feedbackGap = await page
    .getByRole('button', { name: 'Guardar monstro' })
    .evaluate((button) => {
      const feedback = document.querySelector<HTMLElement>('[role="status"]');
      if (!feedback) throw new Error('Registration feedback must be visible.');
      return button.getBoundingClientRect().top - feedback.getBoundingClientRect().bottom;
    });
  expect(feedbackGap).toBeGreaterThanOrEqual(12);
  const singleCardWidth = await pyraxisCard.evaluate(
    (element) => element.getBoundingClientRect().width
  );

  await page.getByLabel('Nome').fill('Aeralune enviada');
  await page.getByRole('spinbutton', { name: 'Ataque', exact: true }).fill('70');
  await page.getByRole('spinbutton', { name: 'Defesa', exact: true }).fill('64');
  await page.getByRole('spinbutton', { name: 'Velocidade', exact: true }).fill('95');
  await page.getByRole('spinbutton', { name: 'Vida', exact: true }).fill('150');
  await page.getByRole('radio', { name: 'Minha imagem' }).check();
  await page
    .getByLabel(/Escolher imagem JPEG/u)
    .setInputFiles('public/monster-catalog/aeralune.webp');
  await page.getByRole('button', { name: 'Guardar monstro' }).click();

  await expect(page.getByRole('article', { name: 'Aeralune enviada' })).toBeVisible();
  const populatedCardWidth = await pyraxisCard.evaluate(
    (element) => element.getBoundingClientRect().width
  );
  expect(populatedCardWidth).toBeCloseTo(singleCardWidth, 1);
  await page.reload();
  await expect(page.getByRole('article', { name: 'Pyraxis' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Aeralune enviada' })).toBeVisible();
});
