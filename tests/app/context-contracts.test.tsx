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
});
