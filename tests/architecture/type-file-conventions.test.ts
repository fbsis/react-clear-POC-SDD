import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, parse } from 'node:path';
import { describe, expect, it } from 'vitest';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe('type file conventions', () => {
  it('rejects generic type container names', () => {
    const forbidden = sourceFiles('src')
      .filter((file) => ['.ts', '.tsx'].includes(extname(file)))
      .map((file) => parse(file).base)
      .filter((fileName) => ['types.ts', 'dto.ts', 'errors.ts'].includes(fileName));

    expect(forbidden).toEqual([]);
  });

  it('allows at most one exported named type declaration per source file', () => {
    const violations = sourceFiles('src')
      .filter((file) => ['.ts', '.tsx'].includes(extname(file)))
      .filter((file) => !file.endsWith('vite-env.d.ts'))
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        const declarations = source.match(/export (?:class|interface|type|enum)\s+\w+/gu) ?? [];
        return declarations.length > 1;
      });

    expect(violations).toEqual([]);
  });

  it('matches each exported named type declaration to its file name', () => {
    const violations = sourceFiles('src')
      .filter((file) => ['.ts', '.tsx'].includes(extname(file)))
      .filter((file) => !file.endsWith('vite-env.d.ts'))
      .flatMap((file) => {
        const source = readFileSync(file, 'utf8');
        const declaration = /export (?:class|interface|type|enum)\s+(\w+)/u.exec(source)?.[1];
        return declaration && declaration !== parse(file).name ? [file] : [];
      });

    expect(violations).toEqual([]);
  });

  it('keeps every application DTO property readonly', () => {
    const violations = sourceFiles('src/application')
      .filter((file) => file.includes('/dtos/'))
      .filter((file) => extname(file) === '.ts')
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        const mutableInterfaceProperty =
          source.includes('export interface') && /^\s{2}(?!readonly\s)\w+[?]?:/mu.test(source);
        const mutableTypeAlias = source.includes('export type') && !source.includes('Readonly<');
        return mutableInterfaceProperty || mutableTypeAlias;
      });

    expect(violations).toEqual([]);
  });
});
