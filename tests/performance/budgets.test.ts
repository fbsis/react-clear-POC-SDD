// @vitest-environment node

import { gzipSync } from 'node:zlib';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { build } from 'vite';
import { ListMonsters } from '@application/monster/ListMonsters';
import type { MonsterRepository } from '@application/monster/ports/MonsterRepository';
import { Monster, MonsterId, MonsterImageRef } from '@domains/monster';
import { resolveBattle } from '@domains/battle/resolveBattle';

const maximumInitialJavaScriptGzipBytes = 250 * 1024;
const maximumInteractionMilliseconds = 100;
const maximumBattleResolutionMilliseconds = 1_000;
const temporaryBuildDirectories: string[] = [];

afterEach(() => {
  temporaryBuildDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { recursive: true, force: true });
  });
});

describe('performance budgets', () => {
  it('keeps the production JavaScript below 250 KB gzip', async () => {
    const outputDirectory = mkdtempSync(join(tmpdir(), 'monster-arena-budget-'));
    temporaryBuildDirectories.push(outputDirectory);

    await build({
      configFile: 'vite.config.ts',
      logLevel: 'silent',
      build: { outDir: outputDirectory, emptyOutDir: true }
    });

    const assetsDirectory = join(outputDirectory, 'assets');
    const javascriptGzipBytes = readdirSync(assetsDirectory)
      .filter((fileName) => fileName.endsWith('.js'))
      .reduce(
        (total, fileName) =>
          total + gzipSync(readFileSync(join(assetsDirectory, fileName))).byteLength,
        0
      );

    expect(javascriptGzipBytes).toBeLessThanOrEqual(maximumInitialJavaScriptGzipBytes);
  });

  it('maps a 100-monster collection within the interaction budget', async () => {
    const monsters = Array.from({ length: 100 }, (_, index) =>
      monster(`monster-${String(index)}`, 100)
    );
    const listMonsters = new ListMonsters(repositoryWith(monsters));
    const startedAt = performance.now();

    const result = await listMonsters.execute();
    const elapsedMilliseconds = performance.now() - startedAt;

    expect(result).toHaveLength(100);
    expect(elapsedMilliseconds).toBeLessThan(maximumInteractionMilliseconds);
  });

  it('resolves the 9,999-round battle within one second', () => {
    const startedAt = performance.now();

    const battle = resolveBattle(monster('first', 9_999), monster('second', 9_999));
    const elapsedMilliseconds = performance.now() - startedAt;

    expect(battle.rounds).toHaveLength(9_999);
    expect(battle.rounds.flatMap((round) => round.events)).toHaveLength(19_997);
    expect(elapsedMilliseconds).toBeLessThan(maximumBattleResolutionMilliseconds);
  });
});

function monster(id: string, hp: number): Monster {
  return Monster.create({
    id: MonsterId.create(id),
    name: id,
    attack: 0,
    defense: 9_999,
    speed: 0,
    hp,
    image: MonsterImageRef.catalog('pyraxis'),
    createdAt: new Date('2026-08-07T00:00:00.000Z')
  });
}

function repositoryWith(monsters: readonly Monster[]): MonsterRepository {
  return {
    add: () => Promise.resolve(),
    findById: () => Promise.resolve(null),
    list: () => Promise.resolve(monsters)
  };
}
