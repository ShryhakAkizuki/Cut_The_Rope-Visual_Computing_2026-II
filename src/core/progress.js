class ProgressStore {

  constructor (levels) {
    this.bestStars = levels.map(() => 0);
    this.completed = levels.map(() => false);

    const data = this.readStored();
    if (!data || !Array.isArray(data.bestStars) || !Array.isArray(data.completed)) return;

    this.bestStars = levels.map((level, i) => {
      const total = level.stars ? level.stars.length : 0;
      const stars = Math.floor(Number(data.bestStars[i]));
      return Number.isFinite(stars) ? Math.max(0, Math.min(total, stars)) : 0;
    });
    this.completed = levels.map((_, i) => Boolean(data.completed[i]));
  }

  readStored () {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY));
    } catch (err) {
      return null;
    }
  }

  save () {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({
        bestStars: this.bestStars,
        completed: this.completed,
      }));
    } catch (err) {
      // El juego sigue sin persistencia.
    }
  }

  markCompleted (idx, stars) {
    this.completed[idx] = true;
    this.bestStars[idx] = Math.max(this.bestStars[idx], stars);
    this.save();
  }

  isUnlocked (idx) {
    return idx === 0 || this.completed[idx - 1];
  }
}
