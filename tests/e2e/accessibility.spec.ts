import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test('registration has no detectable WCAG A or AA violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Forje seu monstro' })).toBeVisible();

  await expectNoAccessibilityViolations(page);
});

test('local data modal has no detectable WCAG A or AA violations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Gerenciar dados locais' }).click();
  await expect(page.getByRole('dialog', { name: 'Gerenciar coleção' })).toBeVisible();

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
  await openBattle(page);

  await expectNoAccessibilityViolations(page);
});

test('keeps visible interactive targets at least 44 by 44 CSS pixels', async ({ page }) => {
  await page.goto('/');
  await expectMinimumTargetSize(page);

  await registerMonster(page, 'Pyraxis', 'Pyraxis', 90, 40, 80, 100);
  await registerMonster(page, 'Aeralune', 'Aeralune', 60, 60, 65, 60);
  await page.getByRole('button', { name: 'Escolher lutadores' }).click();
  await expectMinimumTargetSize(page);

  const portraits = page.getByRole('grid', { name: 'Selecionar lutadores' }).getByRole('button');
  await portraits.nth(0).click();
  await portraits.nth(1).click();
  await page.getByRole('button', { name: 'Iniciar batalha' }).click();
  await expectMinimumTargetSize(page);
});

test('follows logical focus order through the registration fields', async ({ page }) => {
  await page.goto('/');
  const fields = [
    page.getByLabel('Nome'),
    page.getByRole('spinbutton', { name: 'Ataque', exact: true }),
    page.getByRole('spinbutton', { name: 'Defesa', exact: true }),
    page.getByRole('spinbutton', { name: 'Velocidade', exact: true }),
    page.getByRole('spinbutton', { name: 'Vida', exact: true })
  ];

  await fields[0]?.focus();
  for (const field of fields.slice(1)) {
    await page.keyboard.press('Tab');
    await expect(field).toBeFocused();
  }
});

test('preserves announcements and state changes with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openBattle(page);
  await page.getByRole('button', { name: 'Play' }).click();

  await expect(page.getByRole('status')).toContainText(/Round 1: .+ causando \d+ de dano/u);
  await expect(page.getByText(/-\d+ HP/u)).toBeVisible();
  const cardMotion = await page.getByRole('article').evaluateAll((articles) =>
    articles.map((article) => ({
      animationName: getComputedStyle(article).animationName,
      transform: getComputedStyle(article).transform
    }))
  );
  expect(cardMotion).toEqual([
    { animationName: 'none', transform: 'none' },
    { animationName: 'none', transform: 'none' }
  ]);
});

async function expectNoAccessibilityViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

async function openBattle(page: Page): Promise<void> {
  await page.goto('/');
  await registerMonster(page, 'Pyraxis', 'Pyraxis', 90, 40, 80, 100);
  await registerMonster(page, 'Aeralune', 'Aeralune', 60, 60, 65, 60);
  await page.getByRole('button', { name: 'Escolher lutadores' }).click();

  const portraits = page.getByRole('grid', { name: 'Selecionar lutadores' }).getByRole('button');
  await portraits.nth(0).click();
  await portraits.nth(1).click();
  await page.getByRole('button', { name: 'Iniciar batalha' }).click();
  await expect(page.getByRole('heading', { name: 'Arena de batalha' })).toBeVisible();
}

async function expectMinimumTargetSize(page: Page): Promise<void> {
  const undersizedTargets = await page
    .locator('button, input, select, a[href]')
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return [];
        }
        const input = element instanceof HTMLInputElement ? element : null;
        const target =
          input && ['checkbox', 'radio'].includes(input.type) && input.labels?.[0]
            ? input.labels[0]
            : element;
        if (target.getClientRects().length === 0) {
          return [];
        }
        const bounds = target.getBoundingClientRect();
        return bounds.width < 44 || bounds.height < 44
          ? [
              `${element.tagName.toLowerCase()}[${input?.type ?? element.getAttribute('role') ?? ''}] ${bounds.width.toFixed(1)}x${bounds.height.toFixed(1)}`
            ]
          : [];
      })
    );

  expect(undersizedTargets).toEqual([]);
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
