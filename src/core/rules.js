function calculateScore ({ starsCollected, time, timeLimit }) {
  const remaining = Math.max(0, timeLimit - time);
  const timeBonus = Math.floor(remaining * TUNING.timeBonusPerSecond / 10) * 10;
  const starBonus = TUNING.starPoints * starsCollected;
  return { starBonus, timeBonus, total: starBonus + timeBonus };
}
