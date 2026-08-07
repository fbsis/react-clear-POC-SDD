import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('domain value object structure', () => {
  it.each([
    ['monster', 'MonsterId', 'validateMonsterId'],
    ['monster', 'MonsterName', 'validateMonsterName'],
    ['monster', 'CombatStats', 'validateCombatStats'],
    ['monster', 'MonsterImageRef', 'validateMonsterImageReference'],
    ['battle', 'AttackEvent', 'validateAttackEvent'],
    ['battle', 'Round', 'validateRound'],
    ['battle', 'BattleResult', 'validateBattleResult']
  ])(
    'keeps %s/%s under value-objects with dedicated validation',
    (domain, valueObject, validation) => {
      const valueObjectPath = `src/domains/${domain}/value-objects/${valueObject}.ts`;
      const validationPath = `src/domains/${domain}/validations/${validation}.ts`;

      expect(existsSync(valueObjectPath)).toBe(true);
      expect(existsSync(validationPath)).toBe(true);
      expect(readFileSync(valueObjectPath, 'utf8')).toContain(`../validations/${validation}`);
      expect(existsSync(`src/domains/${domain}/${valueObject}.ts`)).toBe(false);
    }
  );
});
