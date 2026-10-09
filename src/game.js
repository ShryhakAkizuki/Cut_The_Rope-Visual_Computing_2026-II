const STATE = {
  PLAYING: 'PLAYING',
  WIN:     'WIN',
  LOSE:    'LOSE',
};

class Game {

  constructor (levels) {
    this.levels = levels;
    this.levelIndex = 0;
    this.state = STATE.PLAYING;
    this.engine = null;
    this.world = null;
    this.level = null;
    this.candy = null;
    this.rope = null;
    this.mouth = null;
  }

  startLevel (idx) {}

  update () {}

  draw () {}

  restart () {}

  onCutAttempt (p1, p2) {}

  onInput () {}

  onCandyEaten () {}

  isCandyOffscreen () {}
}
