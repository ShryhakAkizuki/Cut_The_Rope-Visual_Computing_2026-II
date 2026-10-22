class Game {

  constructor (levels) {
    this.levels = levels;
    this.levelIndex = 0;
    this.state = STATE.TITLE;
    this.autoPaused = false;
    this.view = { w: VIEW.w, h: VIEW.h };

    // Flujo de menús: TITLE → (Jugar) MENU → nivel; TITLE → (Créditos) CREDITS; Atrás o Escape vuelven a TITLE.
    this.title = new TitleScreen();
    this.credits = new CreditsScreen();
    this.screenShownAt = 0;      // millis() del último cambio de pantalla de menú (fundido)
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

    // Estado de los sonidos que decide Game (las entidades no suenan solas).
    this.menuSoundToggle = new SoundToggle();
    this.menuSoundToggle.x = SOUND_BUTTON_T.menuMargin;
    this.menuSoundToggle.y = SOUND_BUTTON_T.menuMargin;
    this.showGreeting = false;   // RootController.showGreeting: solo saluda el primer nivel tras el menú
    this.pendingSounds = [];     // sonidos con retraso (DelayedDispatcher de DX)
    this.mouthOpen = false;      // TargetFeedingPhase.MouthOpen, solo para el sonido
    this.mouthCloseTime = 0;

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      let eaten = false;
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (!labels.includes('candy')) continue;
        if (labels.includes('bubble')) {
          this.onBubbleTouched(pair.bodyA.label === 'bubble' ? pair.bodyA : pair.bodyB);
        } else if (labels.includes('spikes')) {
          // Como BreakCandyBody de DX, revienta la burbuja, suelta las cuerdas,
          // quita el dulce del mundo y pasa a LOSE; el dulce roto se anima en Candy.draw.
          if (this.state === STATE.PLAYING && !this.candy.broken) {
            this.popBubble();
            for (const rope of this.ropes) rope.release();
            this.candy.shatter();
            // SpawnCandyBreakParticles y, tras ScheduleGameLost(0,3), el Om Nom triste de GameLost.
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
    const k = String(key).toLowerCase();
    if (this.state === STATE.TITLE) {
      if (k === 'enter') this.tapThen(() => this.showMenu());
      return;
    }
    if (this.state === STATE.MENU || this.state === STATE.CREDITS) {
      if (k === 'escape') this.tapThen(() => this.showTitle());
      return;
    }
    if (k === 'r') this.restart();
    if (k === 'p' || k === 'escape') this.togglePause();
  }

  startLevel (idx) {
    this.levelIndex = idx;
    this.pendingSounds = [];
    this.mouthOpen = false;
    this.mouthCloseTime = 0;
    // GameController.Activate: música de la caja; si ya suena (reinicio, siguiente) no se reinicia.
    Sound.playMusic('game');
    // LoadTarget: el saludo, 1,3 s después de cargar y solo al entrar desde el menú.
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
    // Los sonidos con retraso corren jugando o en la derrota (el triste tras las púas).
    if (this.state === STATE.PLAYING || this.state === STATE.LOSE) this.updatePendingSounds(dt);
    // Menús, pausa, victoria y derrota congelan la física y el reloj.
    if (this.state !== STATE.PLAYING) return;

    // Como en DX, el reloj no corre durante el paneo inicial de la cámara.
    if (!this.camera.panning) this.time += dt / 1000;
    // Avance por path de púas y estrellas, antes del paso de física
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
    // Desvanecimiento del círculo y unión por distancia (la cuerda va a this.ropes)
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

  // Boca de Om Nom como TargetFeedingState de DX, solo para el sonido (Om Nom se dibuja quieto):
  // se abre con el dulce a menos de mouthOpenDistance y se cierra cuando lleva mouthCloseDelay
  // abierta sin el dulce cerca; si sigue cerca, la espera se renueva.
  updateMouth (delta) {
    const p = this.candy.point.pos;
    const near = Math.hypot(p.x - this.omnom.x, p.y - this.omnom.y) < AUDIO_T.mouthOpenDistance;
    if (!this.mouthOpen) {
      if (near) {
        this.mouthOpen = true;
        this.mouthCloseTime = AUDIO_T.mouthCloseDelay;
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
    Sound.play('omnomClose');
  }

  // CallObjectSelectorParamafterDelay: `play` se llama tras `seconds` de juego; startLevel y
  // showMenu descartan los pendientes.
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

  // PlayOmNomSound: el saludo y la emoción solo suenan la mitad de las veces.
  playOmNomVoice (name) {
    if (Math.random() < AUDIO_T.omnomVoiceChance) Sound.play(name);
  }

  onStarCollected (star) {
    if (this.state !== STATE.PLAYING || star.collected) return;
    star.collected = true;
    this.starsCollected += 1;
    Sound.play('star' + Math.min(3, this.starsCollected));
    // Om Nom se emociona si está en reposo (aquí: con la boca cerrada).
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
    Sound.play('bubbleBreak');   // PopBubbleAtXY
  }

  onCandyEaten () {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.WIN;
      // DX: masticar al comer y win al mostrar los resultados (aquí aparecen enseguida).
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
    // El sonido según lo estirada que estaba (Bungee.relaxed 0..3 → rope_bleak_1..4).
    for (const rope of this.ropes) {
      if (rope.tryCut(w1, w2)) {
        Sound.play('cut' + (rope.relaxed + 1));
        break;
      }
    }
  }

  onInput (px, py) {
    if (this.state === STATE.TITLE) {
      const b = this.title.buttons;
      if (this.title.soundToggle.contains(px, py)) this.toggleMute();
      else if (b.play.contains(px, py)) this.tapThen(() => this.showMenu());
      else if (b.credits.contains(px, py)) this.tapThen(() => this.showCredits());
      return;
    }

    if (this.state === STATE.CREDITS) {
      if (this.credits.backButton.contains(px, py)) this.tapThen(() => this.showTitle());
      return;
    }

    if (this.state === STATE.MENU) {
      if (this.menuSoundToggle.contains(px, py)) {
        this.toggleMute();
        return;
      }
      if (this.menu.backButton.contains(px, py)) {
        this.tapThen(() => this.showTitle());
        return;
      }
      const idx = this.menu.levelAt(px, py, this.levels.length);
      if (idx !== -1 && this.progress.isUnlocked(idx)) {
        Sound.play('tap');
        this.startLevel(idx);
      }
      return;
    }

    if (this.state === STATE.PLAYING || this.state === STATE.LOSE) {
      if (this.pauseButton.contains(px, py)) {
        if (this.state === STATE.PLAYING) this.togglePause();
        return;
      }
      if (this.restartButton.contains(px, py)) {
        Sound.play('tap');
        this.restart();
        return;
      }
    }

    if (this.state === STATE.PAUSED) {
      const b = this.pauseMenu.buttons;
      if (b.resume.contains(px, py)) this.togglePause();
      else if (this.pauseMenu.soundToggle.contains(px, py)) this.toggleMute();
      else if (b.restart.contains(px, py)) this.tapThen(() => this.restart());
      else if (b.skip.contains(px, py)) this.tapThen(() => this.skipLevel());
      else if (b.menu.contains(px, py)) this.tapThen(() => this.showMenu());
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
      if (b.replay.contains(px, py)) this.tapThen(() => this.restart());
      else if (b.menu.contains(px, py)) this.tapThen(() => this.showMenu());
      else if (b.next.contains(px, py)) this.tapThen(() => this.nextLevel());
    } else if (this.state === STATE.LOSE) {
      this.restart();
    }
  }

  restart () {
    this.startLevel(this.levelIndex);
  }

  // Botones de menús y paneles: tap y luego la acción (GameController/MenuController.OnButtonPressed).
  tapThen (action) {
    Sound.play('tap');
    action();
  }

  // Botón de silencio: como en DX, el tap suena antes de cambiar el estado.
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
