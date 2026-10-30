class ProgressStore {

  constructor (levels) {
    this.levels = levels;
    this.bestStars = levels.map(() => 0);
    this.bestScores = levels.map(() => 0);
    this.completed = levels.map(() => false);
    this.unlocked = levels.map((_, i) => i === 0);

    const data = this.readStored();
    if (!data || !Array.isArray(data.bestStars) || !Array.isArray(data.completed)) return;

    this.bestStars = levels.map((level, i) => {
      const total = level.stars ? level.stars.length : 0;
      const stars = Math.floor(Number(data.bestStars[i]));
      return Number.isFinite(stars) ? Math.max(0, Math.min(total, stars)) : 0;
    });
    this.completed = levels.map((_, i) => Boolean(data.completed[i]));
    if (Array.isArray(data.bestScores)) {
      this.bestScores = levels.map((_, i) => {
        const score = Math.floor(Number(data.bestScores[i]));
        return Number.isFinite(score) ? Math.max(0, score) : 0;
      });
    }
    if (Array.isArray(data.unlocked)) {
      this.unlocked = levels.map((_, i) => i === 0 || Boolean(data.unlocked[i]));
    }
  }

  readStored () {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY));
    } catch {
      return null;
    }
  }

  save () {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({
        bestStars: this.bestStars,
        bestScores: this.bestScores,
        completed: this.completed,
        unlocked: this.unlocked,
      }));
    } catch {
    }
  }

  markCompleted (idx, stars, score = 0) {
    const previous = this.bestScores[idx];
    const improved = previous > 0 && score > previous;
    this.completed[idx] = true;
    this.bestStars[idx] = Math.max(this.bestStars[idx], stars);
    this.bestScores[idx] = Math.max(previous, score);
    this.unlock(idx + 1);
    this.save();
    return improved;
  }

  skip (idx) {
    this.unlock(idx + 1);
    this.save();
  }

  unlock (idx) {
    if (idx >= 0 && idx < this.unlocked.length) this.unlocked[idx] = true;
  }

  isUnlocked (idx) {
    return idx === 0 || this.unlocked[idx] || this.completed[idx - 1];
  }

  totalStars () {
    return this.bestStars.reduce((sum, s) => sum + s, 0);
  }

  maxStars () {
    return this.levels.reduce((sum, level) => sum + (level.stars ? level.stars.length : 0), 0);
  }
}
