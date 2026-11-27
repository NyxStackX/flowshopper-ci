import { expect, it } from 'vitest';

// Deliberately failing test: proves that the CI blocks the merge (see docs/TESTING.md).
// This branch is never merged.
it('fails on purpose to show that a red CI blocks the merge', () => {
  expect(1 + 1).toBe(3);
});
