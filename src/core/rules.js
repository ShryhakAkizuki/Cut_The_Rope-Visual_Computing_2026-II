// Puntaje como LevelResultCalculator de DX (LevelResult.cs): el límite es siempre de 30 s
// (TUNING.defaultLevelTime), el bonus de tiempo no se redondea y el total se redondea hacia arriba.
function calculateScore ({ starsCollected, time }) {
  const timeBonus = Math.max(0, TUNING.defaultLevelTime - time) * TUNING.timeBonusPerSecond;
  const starBonus = TUNING.starPoints * starsCollected;
  return { starBonus, timeBonus, total: Math.ceil(timeBonus + starBonus) };
}
