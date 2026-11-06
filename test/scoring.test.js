// APAS-12 · TC-SCORE-01, TC-SCORE-02, TC-SCORE-06 and the rating bands
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateScore, ratingBand, rank, ScoringError } = require('../lib/scoring');

const fixture = () => [
  { weight: 60, selfRating: 4, managerRating: 5 },
  { weight: 40, selfRating: 3, managerRating: 3 }
];

test('TC-SCORE-01: the SRS fixture scores 4.02, Exceeds expectations', () => {
  const result = calculateScore(fixture());
  assert.equal(result.finalScore, 4.02);
  assert.equal(result.band, 'Exceeds expectations');
  assert.equal(result.managerScore, 4.2);
  assert.equal(result.policyVersion, 'v1');
});

test('TC-SCORE-02: a missing manager rating blocks the calculation', () => {
  const goals = fixture();
  delete goals[1].managerRating;
  assert.throws(() => calculateScore(goals), ScoringError);
  goals[1].managerRating = null;
  assert.throws(() => calculateScore(goals), /manager rating/);
});

test('TC-SCORE-06: recalculating the same inputs gives identical results', () => {
  assert.deepEqual(calculateScore(fixture()), calculateScore(fixture()));
  const results = [{ finalScore: 3.5, managerScore: 3.5 }, { finalScore: 4.02, managerScore: 4.2 }];
  assert.deepEqual(rank(results), rank(results));
});

test('final score rounds to two decimals without float drift', () => {
  const goals = [
    { weight: 33, selfRating: 5, managerRating: 4 },
    { weight: 33, selfRating: 2, managerRating: 3 },
    { weight: 34, selfRating: 1, managerRating: 5 }
  ];
  // (33×43 + 33×27 + 34×38) / 1000 = 3.602 → 3.60
  assert.equal(calculateScore(goals).finalScore, 3.6);
});

test('ratings, weights and goal lists are validated', () => {
  assert.throws(() => calculateScore([]), /No approved goals/);
  assert.throws(() => calculateScore([{ weight: 100, selfRating: 6, managerRating: 3 }]), /1 to 5/);
  assert.throws(() => calculateScore([{ weight: 100, selfRating: 3.5, managerRating: 3 }]), /1 to 5/);
  assert.throws(() => calculateScore([{ weight: 100, managerRating: 3 }]), /self rating/);
  assert.throws(() => calculateScore([{ weight: 90, selfRating: 3, managerRating: 3 }]), /add up to 100 \(currently 90\)/);
});

test('rating bands follow the policy boundaries', () => {
  assert.equal(ratingBand(4.5), 'Outstanding');
  assert.equal(ratingBand(4.49), 'Exceeds expectations');
  assert.equal(ratingBand(3.5), 'Exceeds expectations');
  assert.equal(ratingBand(3.49), 'Meets expectations');
  assert.equal(ratingBand(2.5), 'Meets expectations');
  assert.equal(ratingBand(2.49), 'Needs improvement');
  assert.equal(ratingBand(1.5), 'Needs improvement');
  assert.equal(ratingBand(1.49), 'Unsatisfactory');
});
