import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('layer boundaries', () => {
  it('keeps the domain independent from outer layers', () => {
    const domainEntry = readFileSync(resolve('src/domains/index.ts'), 'utf8');

    expect(domainEntry).not.toMatch(/application|infrastructure|presentation|react|idb/iu);
  });

  it('restricts concrete adapter composition to the composition root', () => {
    const eslintConfiguration = readFileSync(resolve('eslint.config.js'), 'utf8');

    expect(eslintConfiguration).toContain("files: ['src/application/**/*.{ts,tsx}']");
    expect(eslintConfiguration).toContain("'@infrastructure/*'");
  });
});
