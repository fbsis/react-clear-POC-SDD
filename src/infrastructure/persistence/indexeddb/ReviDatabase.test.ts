import { afterEach, describe, expect, it } from 'vitest';
import { deleteDB, openDB } from 'idb';
import { ReviDatabase } from './ReviDatabase';

describe('ReviDatabase', () => {
  const database = new ReviDatabase();

  afterEach(async () => {
    await database.close();
    await deleteDB('monster-arena');
  });

  it('creates the cumulative version one schema', async () => {
    const connection = await database.open();

    expect(connection.version).toBe(1);
    expect([...connection.objectStoreNames]).toEqual(['imageAssets', 'monsters']);
    expect([...connection.transaction('monsters').store.indexNames]).toEqual([
      'by-created-at',
      'by-name'
    ]);
  });

  it('reuses one connection until it is closed', async () => {
    const first = await database.open();
    const second = await database.open();

    expect(first).toBe(second);
  });

  it('releases its connection when a newer database version is requested', async () => {
    await database.open();

    const upgradedConnection = await openDB('monster-arena', 2);

    expect(upgradedConnection.version).toBe(2);
    upgradedConnection.close();
  });
});
