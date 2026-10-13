const STATE = {
  PLAYING: 'PLAYING',
  WIN:     'WIN',
  LOSE:    'LOSE',
};

const RESTART_BUTTON = { x: 12, y: 844 - 46, w: 98, h: 34, label: 'Reiniciar' };

const STAR_POINTS = 1000;
const TIME_BONUS_PER_SECOND = 100;
const DEFAULT_LEVEL_TIME = 30;

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
    this.stars = [];

    this.starsCollected = 0;
    this.time = 0;
    this.timeLimit = DEFAULT_LEVEL_TIME;
    this.starBonus = 0;
    this.timeBonus = 0;
    this.score = 0;

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      let eaten = false;
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (!labels.includes('candy')) continue;
        if (labels.includes('star')) {
          this.onStarCollected(pair.bodyA.label === 'star' ? pair.bodyA : pair.bodyB);
        } else if (labels.includes('omnom')) {
          eaten = true;
        }
      }
      if (eaten) this.onCandyEaten();
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
    this.stars = this.level.stars;

    this.starsCollected = 0;
    this.time = 0;
    this.timeLimit = this.level.data.time || DEFAULT_LEVEL_TIME;
    this.starBonus = 0;
    this.timeBonus = 0;
    this.score = 0;

    this.state = STATE.PLAYING;
  }

  update () {
    if (this.state === STATE.WIN) return;
    if (this.state === STATE.LOSE) return;

    this.time += deltaTime / 1000;
    Matter.Engine.update(this.engine, 1000 / 60);
    for (const rope of this.ropes) rope.update(deltaTime);

    if (this.state === STATE.PLAYING && this.isCandyOffscreen()) {
      this.state = STATE.LOSE;
    }
  }

  onStarCollected (body) {
    if (this.state !== STATE.PLAYING) return;
    const star = this.stars.find((s) => s.body === body);
    if (!star || star.collected) return;
    star.collected = true;
    Matter.Composite.remove(this.world, star.body);
    this.starsCollected += 1;
  }

  onCandyEaten () {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.WIN;
      this.calculateScore();
    }
  }

  // Igual que el juego original: 1000 por estrella y 100 por cada segundo
  // que sobra del tiempo del nivel, redondeado a decenas.
  calculateScore () {
    const remaining = Math.max(0, this.timeLimit - this.time);
    this.timeBonus = Math.floor(remaining * TIME_BONUS_PER_SECOND / 10) * 10;
    this.starBonus = STAR_POINTS * this.starsCollected;
    this.score = this.starBonus + this.timeBonus;
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

    this.drawHud();

    if (this.state === STATE.WIN) {
      this.drawWinPanel();
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

  drawHud () {
    noStroke();
    fill(220);
    textSize(14);
    textAlign(LEFT, TOP);
    const stars = this.stars.length ? `Estrellas ${this.starsCollected}/${this.stars.length} · ` : '';
    text(`${stars}${this.time.toFixed(1)} s`, 12, 12);
    textAlign(LEFT, BASELINE);
  }

  drawWinPanel () {
    noStroke();
    fill(0, 0, 0, 170);
    rect(0, 0, width, height);

    const cx = width / 2;
    let y = height / 2 - 130;

    textAlign(CENTER, CENTER);
    fill(255);
    textSize(48);
    text('¡Ganaste!', cx, y);
    y += 70;

    const total = this.stars.length;
    if (total > 0) {
      const size = 40;
      const gap = 14;
      const rowWidth = total * size + (total - 1) * gap;
      const x0 = cx - rowWidth / 2;
      strokeWeight(3);
      stroke(255, 220, 60);
      for (let i = 0; i < total; i++) {
        if (i < this.starsCollected) fill(255, 220, 60);
        else noFill();
        rect(x0 + i * (size + gap), y - size / 2, size, size, 6);
      }
      noStroke();
      y += 56;
    }

    fill(230);
    textSize(18);
    text(`Tiempo: ${this.time.toFixed(1)} s`, cx, y);
    y += 30;
    fill(200);
    textSize(15);
    text(`Estrellas: ${this.starBonus} · Bonus tiempo: ${this.timeBonus}`, cx, y);
    y += 36;
    fill(255, 220, 60);
    textSize(26);
    text(`Puntaje: ${this.score}`, cx, y);
    y += 44;
    fill(200);
    textSize(16);
    text('clic o tecla R para reiniciar', cx, y);
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
