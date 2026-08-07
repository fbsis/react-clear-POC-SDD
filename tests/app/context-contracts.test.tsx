import { readFileSync } from 'node:fs';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useApplication } from '@app/hooks/useApplication';
import { useGameSession } from '@app/hooks/useGameSession';
import { useMonsterCollection } from '@app/hooks/useMonsterCollection';

describe('Context contracts', () => {
  it.each([
    ['Application', useApplication],
    ['MonsterCollection', useMonsterCollection],
    ['GameSession', useGameSession]
  ])('%s hook fails clearly outside its provider', (_name, useContextHook) => {
    expect(() => renderHook(() => useContextHook())).toThrow(/provider/iu);
  });

  it('exposes named intents instead of React state setters', () => {
    const contextContracts = [
      'src/app/contexts/MonsterCollectionContextValue.ts',
      'src/app/contexts/GameSessionContextValue.ts'
    ].map((file) => readFileSync(file, 'utf8'));

    expect(contextContracts.join('\n')).not.toMatch(/Dispatch|SetStateAction|\bset[A-Z]/u);
  });

  it('keeps mutable screen state inside its responsibility-specific providers', () => {
    const collectionProvider = readFileSync(
      'src/app/providers/MonsterCollectionProvider.tsx',
      'utf8'
    );
    const sessionProvider = readFileSync('src/app/providers/GameSessionProvider.tsx', 'utf8');
    const applicationProvider = readFileSync('src/app/providers/ApplicationProvider.tsx', 'utf8');
    const applicationShell = readFileSync('src/app/App.tsx', 'utf8');

    expect(collectionProvider).toContain('useState<');
    expect(sessionProvider).toContain('useState<');
    expect(applicationProvider).not.toContain('useState');
    expect(applicationShell).not.toContain('useState');
  });
});
