import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('GitHub Pages build contract', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('supplies the repository base path from the Pages workflow to Vite', () => {
    const viteConfiguration = readFileSync('vite.config.ts', 'utf8');
    const pagesWorkflow = readFileSync('.github/workflows/deploy-pages.yml', 'utf8');

    expect(viteConfiguration).toContain("process.env.VITE_BASE_PATH ?? '/'");
    expect(pagesWorkflow).toContain('VITE_BASE_PATH=/react-clear-POC-SDD/');
  });

  it('resolves catalog assets below the repository base path', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              id: 'pyraxis',
              name: 'Pyraxis',
              file: 'pyraxis.webp',
              alt: 'Wyvern vermelho',
              width: 1024,
              height: 1280
            }
          ])
        )
      )
    );
    const { BundledMonsterImageCatalog } = await import(
      '../../src/infrastructure/images/BundledMonsterImageCatalog'
    );

    await expect(new BundledMonsterImageCatalog('/react-clear-POC-SDD/').list()).resolves.toEqual([
      expect.objectContaining({
        src: '/react-clear-POC-SDD/monster-catalog/pyraxis.webp'
      })
    ]);
  });
});
