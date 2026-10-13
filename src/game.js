const STATE = {
  PLAYING: 'PLAYING',
  WIN:     'WIN',
  LOSE:    'LOSE',
};

const RESTART_BUTTON = { x: 12, y: 844 - 46, w: 98, h: 34, label: 'Reiniciar' };

class Game {

  constructor (levels) {
    this.levels = levels;
    this.levelIndex = 0;
    this.state = STATE.PLAYING;

    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.engine.gravity.y = 1;

    this.level = null;
    this.candy = null;
    this.ropes = [];
    this.omnom = null;

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (labels.includes('candy') && labels.includes('omnom')) {
          this.onCandyEaten();
          break;
        }
      }
    });
  }

  startLevel (idx) {
    this.levelIndex = idx;
    if (this.level) this.level.clear(this);
    this.level = new Level(this.levels[idx]);
    this.level.build(this);
    this.candy = this.level.candy;
    this.ropes = this.level.ropes;
    this.omnom = this.level.omnom;
    this.state = STATE.PLAYING;
  }

  update () {
    if (this.state === STATE.WIN) return;
    if (this.state === STATE.LOSE) return;

    Matter.Engine.update(this.engine, 1000 / 60);
    for (const rope of this.ropes) rope.update(deltaTime);

    if (this.state === STATE.PLAYING && this.isCandyOffscreen()) {
      this.state = STATE.LOSE;
    }
  }

  onCandyEaten () {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.WIN;
    }
  }

  onCutAttempt (p1, p2) {
    if (this.state !== STATE.PLAYING) return;
    for (const rope of this.ropes) rope.tryCut(p1, p2);
  }

  onInput (px, py) {
    if (this.isOnRestartButton(px, py)) {
      this.restart();
      return;
    }
    if (this.state === STATE.WIN || this.state === STATE.LOSE) {
      this.restart();
    }
  }

  restart () {
    this.startLevel(this.levelIndex);
  }

  isOnRestartButton (px, py) {
    const b = RESTART_BUTTON;
    return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
  }

  isCandyOffscreen () {
    return this.candy ? this.candy.isOffscreen(width, height) : false;
  }

  draw () {
    background(0);
    if (this.level) this.level.draw();

    noStroke();
    fill(150);
    textSize(12);
    text('arrastra el raton para cortar · R reinicia',
      RESTART_BUTTON.x + RESTART_BUTTON.w + 12, RESTART_BUTTON.y + RESTART_BUTTON.h / 2 + 4);

    if (this.state === STATE.WIN) {
      this.drawBanner('¡Ganaste!', 'clic o tecla R para reiniciar');
    } else if (this.state === STATE.LOSE) {
      this.drawBanner('Perdiste', 'clic o tecla R para reiniciar');
    }

    this.drawRestartButton();
  }

  drawRestartButton () {
    const b = RESTART_BUTTON;
    const hover = this.isOnRestartButton(mouseX, mouseY);

    stroke(220);
    strokeWeight(2);
    fill(hover ? 90 : 50);
    rect(b.x, b.y, b.w, b.h, 8);

    noStroke();
    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(b.label, b.x + b.w / 2, b.y + b.h / 2);
    textAlign(LEFT, BASELINE);
  }

  drawBanner (title, subtitle) {
    noStroke();
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    noStroke();
    fill(255);
    textSize(48);
    text(title, width / 2, height / 2 - 24);
    fill(200);
    textSize(16);
    text(subtitle, width / 2, height / 2 + 32);
    textAlign(LEFT, TOP);
  }
}
