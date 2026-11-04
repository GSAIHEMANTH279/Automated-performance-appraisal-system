// APAS-13 · TC-SCORE-04 — ranking order and tie rule
const test = require('node:test');
const assert = require('node:assert/strict');
const { rank } = require('../lib/scoring');

test('TC-SCORE-04: highest score first; ties use the manager score, then share a rank (1, 2, 2, 4)', () => {
  const ranked = rank([
    { name: 'A', finalScore: 3.9, managerScore: 4 },
    { name: 'B', finalScore: 4.3, managerScore: 4 },
    { name: 'C', finalScore: 3.9, managerScore: 4.4 },
    { name: 'D', finalScore: 3.9, managerScore: 4.4 },
    { name: 'E', finalScore: 2.8, managerScore: 3 }
  ]);
  assert.deepEqual(ranked.map(row => [row.rank, row.name]), [[1, 'B'], [2, 'C'], [2, 'D'], [4, 'A'], [5, 'E']]);
});

test('ranking does not change the input list', () => {
  const input = [{ finalScore: 2, managerScore: 2 }, { finalScore: 3, managerScore: 3 }];
  rank(input);
  assert.deepEqual(input.map(row => row.finalScore), [2, 3]);
});
