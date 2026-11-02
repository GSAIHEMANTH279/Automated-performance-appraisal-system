// APAS-12 · FR-009 / NFR-004 — scoring policy v1 (SRS §4.5.1)
const POLICY_VERSION = 'v1';
const SELF_SHARE = 3; // goal score = (3 × self + 7 × manager) / 10
const MANAGER_SHARE = 7;
const BANDS = [
  [4.5, 'Outstanding'],
  [3.5, 'Exceeds expectations'],
  [2.5, 'Meets expectations'],
  [1.5, 'Needs improvement'],
  [0, 'Unsatisfactory']
];

class ScoringError extends Error {}

const isRating = value => Number.isInteger(value) && value >= 1 && value <= 5;

function ratingBand(score) {
  return BANDS.find(([min]) => score >= min)[1];
}

// goals: [{ weight, selfRating, managerRating }] for one employee in one cycle.
// Works in integers (weight × tenths) so the same inputs always round the same way.
function calculateScore(goals) {
  if (!Array.isArray(goals) || goals.length === 0) throw new ScoringError('No approved goals to score.');
  let weightTotal = 0;
  let weightedTenths = 0;
  let weightedManager = 0;
  for (const goal of goals) {
    if (!Number.isInteger(goal.weight) || goal.weight < 1 || goal.weight > 100) throw new ScoringError('Every goal needs a whole-number weight from 1 to 100.');
    if (goal.managerRating === undefined || goal.managerRating === null) throw new ScoringError('Every goal needs a manager rating before scoring.');
    if (goal.selfRating === undefined || goal.selfRating === null) throw new ScoringError('Every goal needs a self rating before scoring.');
    if (!isRating(goal.selfRating) || !isRating(goal.managerRating)) throw new ScoringError('Ratings must be whole numbers from 1 to 5.');
    weightTotal += goal.weight;
    weightedTenths += goal.weight * (SELF_SHARE * goal.selfRating + MANAGER_SHARE * goal.managerRating);
    weightedManager += goal.weight * goal.managerRating;
  }
  if (weightTotal !== 100) throw new ScoringError(`Goal weights must add up to 100 (currently ${weightTotal}).`);
  const finalScore = Math.round(weightedTenths / 10) / 100;
  return { finalScore, managerScore: weightedManager / 100, band: ratingBand(finalScore), policyVersion: POLICY_VERSION };
}

module.exports = { calculateScore, ratingBand, ScoringError, POLICY_VERSION };
