import { describe, expect, it } from 'vitest';

describe('test environment', () => {
  it('runs with deterministic browser primitives', () => {
    expect(indexedDB).toBeDefined();
  });
});
