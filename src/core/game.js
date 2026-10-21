class Game {

  constructor (levels) {
    this.levels = levels;
    this.levelIndex = 0;
    this.state = STATE.MENU;
    this.autoPaused = false;
    this.view = { w: VIEW.w, h: VIEW.h };

    this.menu = new LevelMenu();
    this.progress = new ProgressStore(levels);

    this.restartButton = new Button(30, VIEW.h - 114, 240, 84, 'Reiniciar');
    this.hud = new Hud();
    this.winPanel = new WinPanel(VIEW.w);

    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    // Con gravity.scale = 0.001, Matter aplica gravity.y × 1000 px/s².
    this.engine.gravity.y = TUNING.gravityY / 1000;

    this.level = null;
    this.camera = new Camera();

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
        } else if (labels.includes('autoAnchor')) {
          // [autocuerdas] pista B
        } else if (labels.includes('spikes')) {
          // [púas] pista C
        } else if (labels.includes('omnom')) {
          eaten = true;
        }
      }
      if (eaten) this.onCandyEaten();
    });
  }

  get candy () { return this.level ? this.level.candy : null; }
  get omnom () { return this.level ? this.level.omnom : null; }
  get ropes () { return this.level ? this.level.ropes : []; }
  get stars () { return this.level ? this.level.stars : []; }
  get bubbles () { return this.level ? this.level.bubbles : []; }
  get autoAnchors () { return this.level ? this.level.autoAnchors : []; }
  get spikes () { return this.level ? this.level.spikes : []; }
  get tutorials () { return this.level ? this.level.tutorials : []; }

  onKeyDown (key) {
    if (this.state === STATE.MENU) return;
    const k = String(key).toLowerCase();
    if (k === 'r') this.restart();
    if (k === 'p') this.togglePause();
  }

  startLevel (idx) {
    this.levelIndex = idx;
    if (this.level) this.level.clear(this);
    this.level = new Level(this.levels[idx]);
    this.level.build(this);
    this.camera.start(this.level.map, this.candy.body.position);

    this.starsCollected = 0;
    this.time = 0;
    this.timeLimit = this.level.data.time || TUNING.defaultLevelTime;
    this.starBonus = 0;
    this.timeBonus = 0;
    this.score = 0;

    this.winPanel.buttons.next.enabled = idx < this.levels.length - 1;
    this.state = STATE.PLAYING;
  }

  showMenu () {
    if (this.level) {
      this.level.clear(this);
      this.level = null;
    }
    this.state = STATE.MENU;
  }

  nextLevel () {
    if (this.levelIndex < this.levels.length - 1) {
      this.startLevel(this.levelIndex + 1);
    }
  }

  update (dt) {
    if (this.state === STATE.MENU) return;
    if (this.state === STATE.WIN) return;
    if (this.state === STATE.LOSE) return;
    if (this.state === STATE.PAUSED) return;

    // Como en DX, el reloj no corre durante el paneo inicial de la cámara.
    if (!this.camera.panning) this.time += dt / 1000;
    if (this.candyBubble()) {
      const b = this.candy.body;
      const g = this.engine.gravity;
      Matter.Body.applyForce(b, b.position, { x: 0, y: -b.mass * g.scale * g.y * TUNING.bubbleLift });
    }
    // [púas] pista C: avance por path de púas y estrellas, antes del paso de física
    Matter.Engine.update(this.engine, 1000 / 60);
    for (const rope of this.ropes) rope.update(dt);
    // [autocuerdas] pista B
    // [tutoriales] pista F
    for (const t of this.tutorials) t.update(dt);
    this.camera.update(dt / 1000, this.candy.body.position);

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
      const result = calculateScore({
        starsCollected: this.starsCollected,
        time: this.time,
        timeLimit: this.timeLimit,
      });
      this.starBonus = result.starBonus;
      this.timeBonus = result.timeBonus;
      this.score = result.total;
      this.progress.markCompleted(this.levelIndex, this.starsCollected);
      this.layoutWinButtons();
    }
  }

  layoutWinButtons () {
    this.winPanel.layout(this.view, this.stars.length);
  }

  onCutAttempt (p1, p2) {
    if (this.state !== STATE.PLAYING || this.camera.blocksInput) return;
    const w1 = this.camera.toWorld(p1);
    const w2 = this.camera.toWorld(p2);
    for (const rope of this.ropes) rope.tryCut(w1, w2);
  }

  onInput (px, py) {
    if (this.state === STATE.MENU) {
      const idx = this.menu.levelAt(px, py, this.levels.length, this.view);
      if (idx !== -1 && this.progress.isUnlocked(idx)) this.startLevel(idx);
      return;
    }

    if (this.restartButton.contains(px, py)) {
      this.restart();
      return;
    }

    if (this.state === STATE.PLAYING) {
      if (this.camera.blocksInput) {
        this.camera.hurry();
        return;
      }
      const w = this.camera.toWorld({ x: px, y: py });
      const bubble = this.candyBubble();
      if (bubble && bubble.contains(w.x, w.y)) this.popBubble();
    } else if (this.state === STATE.WIN) {
      const b = this.winPanel.buttons;
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
    return this.candy ? this.candy.isOutOfMap(this.level.bounds()) : false;
  }

  draw (px, py) {
    background(0);

    if (this.state === STATE.MENU) {
      this.menu.draw(this.levels, this.progress, (i) => this.progress.isUnlocked(i), this.view, { x: px, y: py });
      return;
    }

    if (this.level) {
      push();
      translate(0, -this.camera.y);
      this.level.draw();
      pop();
    }

    const rb = this.restartButton;
    this.hud.draw({
      starsCollected: this.starsCollected,
      starsTotal: this.stars.length,
      time: this.time,
      hintText: 'arrastra para cortar · R reinicia · P pausa',
      hintTextPos: { x: rb.x + rb.w + 30, y: rb.y + rb.h / 2 + 10 },
    });

    const pointer = { x: px, y: py };
    if (this.state === STATE.WIN) {
      this.winPanel.draw({
        view: this.view,
        starsTotal: this.stars.length,
        starsCollected: this.starsCollected,
        time: this.time,
        starBonus: this.starBonus,
        timeBonus: this.timeBonus,
        score: this.score,
      }, pointer);
    } else if (this.state === STATE.LOSE) {
      Banner.draw('Perdiste', 'clic o tecla R para reiniciar', this.view);
    } else if (this.state === STATE.PAUSED) {
      Banner.draw('Pausa', 'tecla P para continuar', this.view);
    }

    this.restartButton.draw(px, py);
  }
}
