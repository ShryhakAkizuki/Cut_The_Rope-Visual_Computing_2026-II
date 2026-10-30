import { TUNING } from '../data/config.js';

export function calculateScore ({ starsCollected, time }) {
  const timeBonus = Math.max(0, TUNING.defaultLevelTime - time) * TUNING.timeBonusPerSecond;
  const starBonus = TUNING.starPoints * starsCollected;
  return { starBonus, timeBonus, total: Math.ceil(timeBonus + starBonus) };
}
