class Game {

  constructor (levels) {
    this.levels = levels;
    this.levelIndex = 0;
    this.state = STATE.MENU;
    this.autoPaused = false;
    this.view = { w: VIEW.w, h: VIEW.h };

    this.menu = new LevelMenu();
    this.progress = new ProgressStore(levels);

    this.restartButton = new Button(12, VIEW.h - 46, 98, 34, 'Reiniciar');
    this.hud = new Hud();
    this.winPanel = new WinPanel(VIEW.w);

    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.engine.gravity.y = 1;

    this.level = null;

    this.starsCollected = 0;
    this.time = 0;
    this.timeLimit = TUNING.defaultLevelTime;
    this.starBonus = 0;
    this.timeBonus = 0;
    this.score = 0;
    this.winRevealTimer = 0;
    this.mouthIsOpen = false;

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (!labels.includes('candy')) continue;
        if (labels.includes('star')) {
          this.onStarCollected(pair.bodyA.label === 'star' ? pair.bodyA : pair.bodyB);
        } else if (labels.includes('bubble')) {
          this.onBubbleTouched(pair.bodyA.label === 'bubble' ? pair.bodyA : pair.bodyB);
        }
      }
    });
  }

  setViewport (w, h) {
    this.view.w = w;
    this.view.h = h;
  }

  get candy () { return this.level ? this.level.candy : null; }
  get omnom () { return this.level ? this.level.omnom : null; }
  get ropes () { return this.level ? this.level.ropes : []; }
  get stars () { return this.level ? this.level.stars : []; }
  get bubbles () { return this.level ? this.level.bubbles : []; }

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

    this.starsCollected = 0;
    this.time = 0;
    this.timeLimit = this.level.data.time || TUNING.defaultLevelTime;
    this.starBonus = 0;
    this.timeBonus = 0;
    this.score = 0;
    this.winRevealTimer = 0;
    this.mouthIsOpen = false;

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
    if (this.state === STATE.PAUSED) return;
    if (this.omnom) this.omnom.update(dt);
    if (this.state === STATE.WIN) {
      this.winRevealTimer = Math.max(0, this.winRevealTimer - dt);
      for (const rope of this.ropes) rope.update(dt);
      return;
    }
    if (this.state === STATE.LOSE) return;

    this.time += dt / 1000;
    if (this.candyBubble()) {
      const b = this.candy.body;
      const g = this.engine.gravity;
      Matter.Body.applyForce(b, b.position, { x: 0, y: -b.mass * g.scale * g.y * TUNING.bubbleLift });
    }
    Matter.Engine.update(this.engine, 1000 / 60);
    for (const rope of this.ropes) rope.update(dt);

    if (this.state === STATE.PLAYING) {
      if (this.candyInMouth()) {
        this.onCandyEaten();
        return;
      }
      this.updateMouthProximity();
    }

    if (this.state === STATE.PLAYING && this.isCandyOffscreen()) {
      this.omnom.setAnimation('fail');
      this.state = STATE.LOSE;
    }
  }

  candyInMouth () {
    if (!this.candy || !this.omnom) return false;
    const dx = this.candy.body.position.x - this.omnom.body.position.x;
    const dy = this.candy.body.position.y - this.omnom.body.position.y;
    return Math.hypot(dx, dy) <= TUNING.eatRadius;
  }

  updateMouthProximity () {
    if (!this.candy || !this.omnom) return;
    const dx = this.candy.body.position.x - this.omnom.body.position.x;
    const dy = this.candy.body.position.y - this.omnom.body.position.y;
    const distance = Math.hypot(dx, dy);

    if (!this.mouthIsOpen && distance <= TUNING.mouthOpenRadius) {
      this.mouthIsOpen = true;
      this.omnom.setAnimation('mouthOpen');
    } else if (this.mouthIsOpen && distance >= TUNING.mouthCloseRadius) {
      this.mouthIsOpen = false;
      this.omnom.playSequence(['mouthClose', 'idle']);
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
      const candy = this.candy;
      if (candy) {
        candy.eaten = true;
        Matter.Composite.remove(this.world, candy.body);
      }
      const bubble = this.candyBubble();
      if (bubble) bubble.pop();
      for (const rope of this.ropes) rope.startEatenFade();
      this.mouthIsOpen = false;
      this.omnom.playSequence(['mouthClose', 'chew']);
      this.winRevealTimer = TUNING.winRevealDelay;
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
    if (this.state !== STATE.PLAYING) return;
    for (const rope of this.ropes) rope.tryCut(p1, p2);
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
      const bubble = this.candyBubble();
      if (bubble && bubble.contains(px, py)) this.popBubble();
    } else if (this.state === STATE.WIN) {
      if (this.winRevealTimer > 0) return;
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
    return this.candy ? this.candy.isOffscreen(this.view.w, this.view.h) : false;
  }

  draw (px, py) {
    background(0);

    if (this.state === STATE.MENU) {
      this.menu.draw(this.levels, this.progress, (i) => this.progress.isUnlocked(i), this.view, { x: px, y: py });
      return;
    }

    if (this.level) this.level.draw();

    const rb = this.restartButton;
    this.hud.draw({
      starsCollected: this.starsCollected,
      starsTotal: this.stars.length,
      time: this.time,
      hintText: 'arrastra para cortar · R reinicia · P pausa',
      hintTextPos: { x: rb.x + rb.w + 12, y: rb.y + rb.h / 2 + 4 },
    });

    const pointer = { x: px, y: py };
    if (this.state === STATE.WIN && this.winRevealTimer <= 0) {
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
