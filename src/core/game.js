class Game {

  constructor (levels) {
    this.levels = levels;
    this.levelIndex = 0;
    this.state = STATE.TITLE;
    this.autoPaused = false;
    this.view = { w: VIEW.w, h: VIEW.h };

    // Flujo de menús
    this.title = new TitleScreen();
    this.credits = new CreditsScreen();
    this.screenShownAt = 0;
    this.menu = new LevelMenu();
    this.progress = new ProgressStore(levels);

    this.hud = new Hud();
    this.restartButton = this.hud.restartButton;
    this.pauseButton = this.hud.pauseButton;
    this.pauseMenu = new PauseMenu();
    this.winPanel = new WinPanel();

    // Matter solo detecta sensores
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

    // Estado de los sonidos que decide Game
    this.menuSoundToggle = new SoundToggle();
    this.menuSoundToggle.x = SOUND_BUTTON_T.menuMargin;
    this.menuSoundToggle.y = SOUND_BUTTON_T.menuMargin;
    this.showGreeting = false;
    this.pendingSounds = [];
    this.mouthOpen = false;
    this.mouthCloseTime = 0;

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      let eaten = false;
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (!labels.includes('candy')) continue;
        if (labels.includes('bubble')) {
          this.onBubbleTouched(pair.bodyA.label === 'bubble' ? pair.bodyA : pair.bodyB);
        } else if (labels.includes('spikes')) {
          if (this.state === STATE.PLAYING && !this.candy.broken) {
            this.popBubble();
            for (const rope of this.ropes) rope.release();
            this.candy.shatter();
            Sound.play('candyBreak');
            this.scheduleSound(AUDIO_T.sadDelayAfterBreak, () => Sound.play('omnomSad'));
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
    dispatchKey(this, String(key).toLowerCase());
  }

  startLevel (idx) {
    this.levelIndex = idx;
    this.pendingSounds = [];
    this.mouthOpen = false;
    this.mouthCloseTime = 0;
    Sound.playMusic('game');
    if (this.showGreeting) {
      this.showGreeting = false;
      this.scheduleSound(AUDIO_T.greetDelay, () => this.playOmNomVoice('omnomGreet'));
    }
    if (this.level) this.level.clear(this);
    this.level = new Level(this.levels[idx]);
    this.level.build(this);
    this.camera.start(this.level.map, this.candy.body.position);

    this.starsCollected = 0;
    this.time = 0;
    this.timeLimit = TUNING.defaultLevelTime;
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
    this.pendingSounds = [];
    this.showGreeting = true;
    this.screenShownAt = millis();
    Sound.playMusic('menu');
  }

  showTitle () {
    this.state = STATE.TITLE;
    this.screenShownAt = millis();
    Sound.playMusic('menu');
  }

  showCredits () {
    this.state = STATE.CREDITS;
    this.screenShownAt = millis();
  }

  nextLevel () {
    if (this.levelIndex < this.levels.length - 1) {
      this.startLevel(this.levelIndex + 1);
    }
  }

  update (dt) {
    if (this.state === STATE.PLAYING || this.state === STATE.LOSE) this.updatePendingSounds(dt);
    if (this.level && this.state !== STATE.PAUSED) this.omnom.update(dt);
    if (this.state !== STATE.PLAYING) return;

    if (!this.camera.panning) this.time += dt / 1000;
    for (const s of this.spikes) s.update(dt);
    for (const s of this.stars) s.update(dt);

    const delta = TUNING.stepSeconds;
    const ropeDelta = delta * TUNING.ropePhysicsSpeed;
    for (const rope of this.ropes) rope.update(ropeDelta);
    const point = this.candy.point;
    point.update(ropeDelta);
    if (this.candyBubble()) {
      const damping = TUNING.bubbleImpulseDamping;
      point.applyImpulse(-point.v.x / damping, -point.v.y / damping + TUNING.bubbleImpulseY, delta);
    }
    this.candy.syncBody();
    for (const star of this.stars) {
      if (!star.collected && star.touches(point.pos)) this.onStarCollected(star);
    }
    Matter.Engine.update(this.engine, delta * 1000);
    for (const a of this.autoAnchors) {
      if (a.update(dt, this)) Sound.play('ropeGet');   // TryAutoAttachGrabToBody
    }
    for (const t of this.tutorials) t.update(dt);
    this.camera.update(dt / 1000, this.candy.body.position);
    if (this.state === STATE.PLAYING) this.updateMouth(delta);

    if (this.state === STATE.PLAYING && this.isCandyOffscreen()) {
      this.state = STATE.LOSE;
      Sound.play('omnomSad');   // GameLost
    }
  }

  updateMouth (delta) {
    const p = this.candy.point.pos;
    const near = Math.hypot(p.x - this.omnom.x, p.y - this.omnom.y) < AUDIO_T.mouthOpenDistance;
    if (!this.mouthOpen) {
      if (near) {
        this.mouthOpen = true;
        this.mouthCloseTime = AUDIO_T.mouthCloseDelay;
        this.omnom.openMouth();
        Sound.play('omnomOpen');
      }
      return;
    }
    this.mouthCloseTime = Math.max(0, this.mouthCloseTime - delta);
    if (this.mouthCloseTime > 0) return;
    if (near) {
      this.mouthCloseTime = AUDIO_T.mouthCloseDelay;
      return;
    }
    this.mouthOpen = false;
    this.omnom.closeMouth();
    Sound.play('omnomClose');
  }

  scheduleSound (seconds, play) {
    this.pendingSounds.push({ t: seconds, play });
  }

  updatePendingSounds (dt) {
    if (this.pendingSounds.length === 0) return;
    for (const s of this.pendingSounds) s.t -= dt / 1000;
    const due = this.pendingSounds.filter((s) => s.t <= 0);
    this.pendingSounds = this.pendingSounds.filter((s) => s.t > 0);
    for (const s of due) s.play();
  }

  playOmNomVoice (name) {
    if (Math.random() < AUDIO_T.omnomVoiceChance) Sound.play(name);
  }

  onStarCollected (star) {
    if (this.state !== STATE.PLAYING || star.collected) return;
    star.collected = true;
    this.starsCollected += 1;
    Sound.play('star' + Math.min(3, this.starsCollected));
    if (!this.mouthOpen) this.playOmNomVoice('omnomExcited');
  }

  onBubbleTouched (body) {
    if (this.state !== STATE.PLAYING || this.candyBubble()) return;
    const bubble = this.bubbles.find((b) => b.body === body);
    if (!bubble || bubble.captured || bubble.popped) return;
    bubble.capture(this.candy);
    Matter.Composite.remove(this.world, bubble.body);
    Sound.play('bubble');
  }

  candyBubble () {
    return this.bubbles.find((b) => b.captured) || null;
  }

  popBubble () {
    const bubble = this.candyBubble();
    if (!bubble) return;
    bubble.pop();
    Sound.play('bubbleBreak');
  }

  onCandyEaten () {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.WIN;
      this.candy.hide();
      this.omnom.eat();
      Sound.play('omnomChew');
      Sound.play('win');
      const result = calculateScore({
        starsCollected: this.starsCollected,
        time: this.time,
      });
      this.starBonus = result.starBonus;
      this.timeBonus = result.timeBonus;
      this.score = result.total;
      const improved = this.progress.markCompleted(this.levelIndex, this.starsCollected, this.score);
      this.winPanel.show(improved, OMNOM_T.winShowDelay * 1000);
    }
  }

  onCutAttempt (p1, p2) {
    if (this.state !== STATE.PLAYING || this.camera.blocksInput) return;
    const w1 = this.camera.toWorld(p1);
    const w2 = this.camera.toWorld(p2);
    for (const rope of this.ropes) {
      if (rope.tryCut(w1, w2)) {
        Sound.play('cut' + (rope.relaxed + 1));
        break;
      }
    }
  }

  onInput (px, py) {
    dispatchClick(this, px, py);
  }

  restart () {
    this.startLevel(this.levelIndex);
  }

  tapThen (action) {
    Sound.play('tap');
    action();
  }

  toggleMute () {
    Sound.play('tap');
    Sound.toggleMute();
  }

  togglePause () {
    this.autoPaused = false;
    if (this.state === STATE.PLAYING) {
      this.state = STATE.PAUSED;
      Sound.play('pauseDown');
    } else if (this.state === STATE.PAUSED) {
      this.state = STATE.PLAYING;
      Sound.play('pauseUp');
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

    if (this.state === STATE.TITLE || this.state === STATE.CREDITS || this.state === STATE.MENU) {
      const pointer = { x: px, y: py };
      if (this.state === STATE.TITLE) {
        this.title.draw(pointer);
      } else if (this.state === STATE.CREDITS) {
        this.credits.draw(pointer);
      } else {
        this.menu.draw(this.levels, this.progress, (i) => this.progress.isUnlocked(i), this.view, pointer);
        this.menuSoundToggle.draw(px, py);
      }
      drawScreenFade(this.screenShownAt);
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
      // El aviso espera a que termine el dulce roto
      if (!this.candy.isBreaking()) Banner.draw('¡Oh, no!', 'Haz clic o pulsa R para reintentar', this.view);
      this.hud.draw(hudState, pointer);
    } else if (this.state === STATE.PAUSED) {
      this.pauseMenu.draw({
        levelNumber: this.levelIndex + 1,
        bestScore: this.progress.bestScores[this.levelIndex],
      }, pointer);
    }
  }

  skipLevel () {
    if (this.levelIndex >= this.levels.length - 1) {
      this.showMenu();
      return;
    }
    this.progress.skip(this.levelIndex);
    this.startLevel(this.levelIndex + 1);
  }
}
