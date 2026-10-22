class Game {

  constructor (levels) {
    this.levels = levels;
    this.levelIndex = 0;
    this.state = STATE.MENU;
    this.autoPaused = false;
    this.view = { w: VIEW.w, h: VIEW.h };

    this.menu = new LevelMenu();
    this.progress = new ProgressStore(levels);

    this.hud = new Hud();
    this.restartButton = this.hud.restartButton;
    this.pauseButton = this.hud.pauseButton;
    this.pauseMenu = new PauseMenu();
    this.winPanel = new WinPanel();

    // Matter solo detecta sensores: el dulce y las cuerdas son puntos de Verlet (core/verlet.js).
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.engine.gravity.y = 0;

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
        if (labels.includes('bubble')) {
          this.onBubbleTouched(pair.bodyA.label === 'bubble' ? pair.bodyA : pair.bodyB);
        } else if (labels.includes('autoAnchor')) {
          // [autocuerdas] pista B: sin uso; AutoAnchor detecta por distancia en update() y no tiene body
        } else if (labels.includes('spikes')) {
          // [púas] pista C: como BreakCandyBody de DX, revienta la burbuja, suelta las cuerdas,
          // quita el dulce del mundo y pasa a LOSE; el dulce roto se anima en Candy.draw.
          if (this.state === STATE.PLAYING && !this.candy.broken) {
            this.popBubble();
            for (const rope of this.ropes) rope.release();
            this.candy.shatter();
            Matter.Composite.remove(this.world, this.candy.body);
            this.state = STATE.LOSE;
          }
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
    if (k === 'p' || k === 'escape') this.togglePause();
  }

  startLevel (idx) {
    this.levelIndex = idx;
    if (this.level) this.level.clear(this);
    this.level = new Level(this.levels[idx]);
    this.level.build(this);
    this.camera.start(this.level.map, this.candy.body.position);

    this.starsCollected = 0;
    this.time = 0;
    this.timeLimit = TUNING.defaultLevelTime;   // como en DX, 30 s en todos los niveles
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
    // [púas] pista C: avance por path de púas y estrellas, antes del paso de física
    for (const s of this.spikes) s.update(dt);
    for (const s of this.stars) s.update(dt);

    // Orden de GameScene.Update de DX: cuerdas, punto del dulce y burbuja. Cuerdas y dulce avanzan
    // con delta × ropePhysicsSpeed; los Mover y la burbuja, con delta.
    const delta = TUNING.stepSeconds;
    const ropeDelta = delta * TUNING.ropePhysicsSpeed;
    for (const rope of this.ropes) rope.update(ropeDelta);
    const point = this.candy.point;
    point.update(ropeDelta);
    if (this.candyBubble()) {
      // ApplyImpulseDelta(−v / BubbleImpulseDamping + (0, BubbleImpulseY), delta)
      const damping = TUNING.bubbleImpulseDamping;
      point.applyImpulse(-point.v.x / damping, -point.v.y / damping + TUNING.bubbleImpulseY, delta);
    }
    this.candy.syncBody();
    // Estrellas con las cajas de DX (Star.touches), antes del Engine.update para que una estrella
    // tocada en el mismo frame de la victoria cuente.
    for (const star of this.stars) {
      if (!star.collected && star.touches(point.pos)) this.onStarCollected(star);
    }
    Matter.Engine.update(this.engine, delta * 1000);
    // [autocuerdas] pista B: desvanecimiento del círculo y unión por distancia (la cuerda va a this.ropes)
    for (const a of this.autoAnchors) a.update(dt, this);
    // [tutoriales] pista F
    for (const t of this.tutorials) t.update(dt);
    this.camera.update(dt / 1000, this.candy.body.position);

    if (this.state === STATE.PLAYING && this.isCandyOffscreen()) {
      this.state = STATE.LOSE;
    }
  }

  onStarCollected (star) {
    if (this.state !== STATE.PLAYING || star.collected) return;
    star.collected = true;
    this.starsCollected += 1;
  }

  onBubbleTouched (body) {
    if (this.state !== STATE.PLAYING || this.candyBubble()) return;
    const bubble = this.bubbles.find((b) => b.body === body);
    if (!bubble || bubble.captured || bubble.popped) return;
    bubble.capture(this.candy);
    Matter.Composite.remove(this.world, bubble.body);
  }

  candyBubble () {
    return this.bubbles.find((b) => b.captured) || null;
  }

  popBubble () {
    const bubble = this.candyBubble();
    if (!bubble) return;
    bubble.pop();
  }

  onCandyEaten () {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.WIN;
      const result = calculateScore({
        starsCollected: this.starsCollected,
        time: this.time,
      });
      this.starBonus = result.starBonus;
      this.timeBonus = result.timeBonus;
      this.score = result.total;
      const improved = this.progress.markCompleted(this.levelIndex, this.starsCollected, this.score);
      this.winPanel.show(improved);
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
    // Como CutWithRazorOrLine1Line2Immediate, cada arrastre corta como mucho una cuerda.
    for (const rope of this.ropes) {
      if (rope.tryCut(w1, w2)) break;
    }
  }

  onInput (px, py) {
    if (this.state === STATE.MENU) {
      const idx = this.menu.levelAt(px, py, this.levels.length);
      if (idx !== -1 && this.progress.isUnlocked(idx)) this.startLevel(idx);
      return;
    }

    if (this.state === STATE.PLAYING || this.state === STATE.LOSE) {
      if (this.pauseButton.contains(px, py)) {
        if (this.state === STATE.PLAYING) this.togglePause();
        return;
      }
      if (this.restartButton.contains(px, py)) {
        this.restart();
        return;
      }
    }

    if (this.state === STATE.PAUSED) {
      const b = this.pauseMenu.buttons;
      if (b.resume.contains(px, py)) this.togglePause();
      else if (b.restart.contains(px, py)) this.restart();
      else if (b.skip.contains(px, py)) this.skipLevel();
      else if (b.menu.contains(px, py)) this.showMenu();
    } else if (this.state === STATE.PLAYING) {
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

    const pointer = { x: px, y: py };
    const hudState = { starsCollected: this.starsCollected, starsTotal: this.stars.length };
    this.hud.setInteractive(this.state === STATE.PLAYING || this.state === STATE.LOSE);
    // En la derrota el HUD va encima del aviso para que Reiniciar se vea activo.
    if (this.state !== STATE.LOSE) this.hud.draw(hudState, pointer);

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
      // [púas] el aviso espera a que termine el dulce roto
      if (!this.candy.isBreaking()) Banner.draw('¡Oh, no!', 'Haz clic o pulsa R para reintentar', this.view);
      this.hud.draw(hudState, pointer);
    } else if (this.state === STATE.PAUSED) {
      this.pauseMenu.draw({
        levelNumber: this.levelIndex + 1,
        bestScore: this.progress.bestScores[this.levelIndex],
      }, pointer);
    }
  }

  // Botón Saltar nivel del menú de pausa: desbloquea el siguiente sin marcar este como
  // completado y lo empieza. En el último nivel vuelve al menú (LevelQuit en DX).
  skipLevel () {
    if (this.levelIndex >= this.levels.length - 1) {
      this.showMenu();
      return;
    }
    this.progress.skip(this.levelIndex);
    this.startLevel(this.levelIndex + 1);
  }
}
