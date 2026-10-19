const WIN_BUTTON = { w: 100, h: 40, gap: 12 };

class Game {

  constructor (levels) {
    this.levels = levels;
    this.levelIndex = 0;
    this.state = STATE.MENU;
    this.autoPaused = false;

    this.menu = new LevelMenu();
    this.progress = this.loadProgress();

    this.restartButton = new Button(12, VIEW.h - 46, 98, 34, 'Reiniciar');
    const rowWidth = 3 * WIN_BUTTON.w + 2 * WIN_BUTTON.gap;
    const x0 = (VIEW.w - rowWidth) / 2;
    const step = WIN_BUTTON.w + WIN_BUTTON.gap;
    this.winButtons = {
      replay: new Button(x0, 0, WIN_BUTTON.w, WIN_BUTTON.h, 'Replay'),
      menu:   new Button(x0 + step, 0, WIN_BUTTON.w, WIN_BUTTON.h, 'Menu'),
      next:   new Button(x0 + 2 * step, 0, WIN_BUTTON.w, WIN_BUTTON.h, 'Next'),
    };

    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.engine.gravity.y = 1;

    this.level = null;
    this.candy = null;
    this.ropes = [];
    this.omnom = null;
    this.stars = [];
    this.bubbles = [];

    this.starsCollected = 0;
    this.time = 0;
    this.timeLimit = TUNING.defaultLevelTime;
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
        } else if (labels.includes('bubble')) {
          this.onBubbleTouched(pair.bodyA.label === 'bubble' ? pair.bodyA : pair.bodyB);
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
    this.bubbles = this.level.bubbles;

    this.starsCollected = 0;
    this.time = 0;
    this.timeLimit = this.level.data.time || TUNING.defaultLevelTime;
    this.starBonus = 0;
    this.timeBonus = 0;
    this.score = 0;

    this.winButtons.next.enabled = idx < this.levels.length - 1;
    this.state = STATE.PLAYING;
  }

  showMenu () {
    if (this.level) {
      this.level.clear(this);
      this.level = null;
    }
    this.candy = null;
    this.ropes = [];
    this.omnom = null;
    this.stars = [];
    this.bubbles = [];
    this.state = STATE.MENU;
  }

  nextLevel () {
    if (this.levelIndex < this.levels.length - 1) {
      this.startLevel(this.levelIndex + 1);
    }
  }

  isUnlocked (idx) {
    return idx === 0 || this.progress.completed[idx - 1];
  }

  loadProgress () {
    let data = null;
    try {
      data = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    } catch (err) {
      data = null;
    }
    if (!data || !Array.isArray(data.bestStars) || !Array.isArray(data.completed)) {
      return {
        bestStars: this.levels.map(() => 0),
        completed: this.levels.map(() => false),
      };
    }
    return {
      bestStars: this.levels.map((level, i) => {
        const total = level.stars ? level.stars.length : 0;
        const stars = Math.floor(Number(data.bestStars[i]));
        return Number.isFinite(stars) ? Math.max(0, Math.min(total, stars)) : 0;
      }),
      completed: this.levels.map((_, i) => Boolean(data.completed[i])),
    };
  }

  saveProgress () {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
    } catch (err) {
      // El juego sigue sin persistencia.
    }
  }

  update () {
    if (this.state === STATE.MENU) return;
    if (this.state === STATE.WIN) return;
    if (this.state === STATE.LOSE) return;
    if (this.state === STATE.PAUSED) return;

    const dt = Math.min(deltaTime, TUNING.maxFrameDeltaMs);
    this.time += dt / 1000;
    if (this.candyBubble()) {
      const b = this.candy.body;
      const g = this.engine.gravity;
      Matter.Body.applyForce(b, b.position, { x: 0, y: -b.mass * g.scale * g.y * TUNING.bubbleLift });
    }
    Matter.Engine.update(this.engine, 1000 / 60);
    for (const rope of this.ropes) rope.update(dt);

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

  onBubbleTouched (body) {
    if (this.state !== STATE.PLAYING || this.candyBubble()) return;
    const bubble = this.bubbles.find((b) => b.body === body);
    if (!bubble || bubble.captured || bubble.popped) return;
    bubble.capture(this.candy);
    Matter.Composite.remove(this.world, bubble.body);
    this.candy.body.frictionAir = TUNING.bubbleFrictionAir;
  }

  candyBubble () {
    return this.bubbles.find((b) => b.captured) || null;
  }

  popBubble () {
    const bubble = this.candyBubble();
    if (!bubble) return;
    bubble.pop();
    this.candy.body.frictionAir = TUNING.candyFrictionAir;
  }

  onCandyEaten () {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.WIN;
      this.calculateScore();
      const idx = this.levelIndex;
      this.progress.completed[idx] = true;
      this.progress.bestStars[idx] = Math.max(this.progress.bestStars[idx], this.starsCollected);
      this.saveProgress();
    }
  }

  // Igual que el juego original: 1000 por estrella y 100 por cada segundo
  // que sobra del tiempo del nivel, redondeado a decenas.
  calculateScore () {
    const remaining = Math.max(0, this.timeLimit - this.time);
    this.timeBonus = Math.floor(remaining * TUNING.timeBonusPerSecond / 10) * 10;
    this.starBonus = TUNING.starPoints * this.starsCollected;
    this.score = this.starBonus + this.timeBonus;
  }

  onCutAttempt (p1, p2) {
    if (this.state !== STATE.PLAYING) return;
    for (const rope of this.ropes) rope.tryCut(p1, p2);
  }

  onInput (px, py) {
    if (this.state === STATE.MENU) {
      const idx = this.menu.levelAt(px, py, this.levels.length);
      if (idx !== -1 && this.isUnlocked(idx)) this.startLevel(idx);
      return;
    }

    if (this.restartButton.contains(px, py)) {
      this.restart();
      return;
    }

    if (this.state === STATE.PLAYING) {
      const bubble = this.candyBubble();
      if (bubble && bubble.contains(px, py)) this.popBubble();
    } else if (this.state === STATE.WIN) {
      const b = this.winButtons;
      if (b.replay.contains(px, py)) this.restart();
      else if (b.menu.contains(px, py)) this.showMenu();
      else if (b.next.contains(px, py)) this.nextLevel();
    } else if (this.state === STATE.LOSE) {
      this.restart();
    }
  }

  restart () {
    this.startLevel(this.levelIndex);
  }

  togglePause () {
    this.autoPaused = false;
    if (this.state === STATE.PLAYING) {
      this.state = STATE.PAUSED;
    } else if (this.state === STATE.PAUSED) {
      this.state = STATE.PLAYING;
    }
  }

  autoPause () {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.PAUSED;
      this.autoPaused = true;
    }
  }

  autoResume () {
    if (this.state === STATE.PAUSED && this.autoPaused) {
      this.state = STATE.PLAYING;
      this.autoPaused = false;
    }
  }

  isCandyOffscreen () {
    return this.candy ? this.candy.isOffscreen(width, height) : false;
  }

  draw () {
    background(0);

    if (this.state === STATE.MENU) {
      this.menu.draw(this.levels, this.progress, (i) => this.isUnlocked(i));
      return;
    }

    if (this.level) this.level.draw();

    const rb = this.restartButton;
    noStroke();
    fill(150);
    textSize(12);
    text('arrastra para cortar · R reinicia · P pausa', rb.x + rb.w + 12, rb.y + rb.h / 2 + 4);

    this.drawHud();

    if (this.state === STATE.WIN) {
      this.drawWinPanel();
    } else if (this.state === STATE.LOSE) {
      this.drawBanner('Perdiste', 'clic o tecla R para reiniciar');
    } else if (this.state === STATE.PAUSED) {
      this.drawBanner('Pausa', 'tecla P para continuar');
    }

    this.restartButton.draw();
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
      stroke(COLORS.star);
      for (let i = 0; i < total; i++) {
        if (i < this.starsCollected) fill(COLORS.star);
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
    fill(COLORS.star);
    textSize(26);
    text(`Puntaje: ${this.score}`, cx, y);
    y += 36;
    textAlign(LEFT, BASELINE);

    for (const button of Object.values(this.winButtons)) {
      button.y = y;
      button.draw();
    }
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
