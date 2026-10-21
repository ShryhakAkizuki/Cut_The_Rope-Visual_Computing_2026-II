// Módulo de audio con Web Audio (sin p5.sound). Rutas, volúmenes y clave de localStorage en AUDIO_T (config.js).
//
// API:
//   Sound.play(name)        efecto de una vez; no lanza errores si no ha cargado, falla o el nombre no existe
//   Sound.playMusic(name)   música en bucle ('menu' o 'game'); si ya suena esa pista no la reinicia
//   Sound.stopMusic()       para la música con un fundido corto
//   Sound.setMuted(bool)    silencia todo y lo guarda en localStorage
//   Sound.toggleMute()      alterna el silencio y devuelve el nuevo valor
//   Sound.muted             true si está silenciado (solo lectura)
//   Sound.isLoaded(name)    true si ese efecto o pista ya está decodificado
//   Sound.ready             promesa que se resuelve cuando terminaron todas las cargas (bien o mal)
//
// Los archivos se cargan solos al incluir este script (fetch + decodeAudioData), sin bloquear preload().
// El navegador no deja sonar nada hasta el primer gesto: el primer clic o tecla en el documento
// reanuda el AudioContext. Antes de eso play() no hace nada y playMusic() deja la pista pendiente.
//
// Efectos (nombre → archivo → evento del juego, según el decomp DX):
//   cut1..cut4    rope_bleak_1..4.wav   cortar una cuerda; DX elige por lo floja que está (Bungee.relaxed 0..3)
//   ropeGet       rope_get.wav          se crea una cuerda automática
//   star1..star3  star_1..3.wav         se recoge la 1.ª, 2.ª o 3.ª estrella del nivel
//   bubble        bubble.wav            una burbuja atrapa el dulce
//   bubbleBreak   bubble_break.wav      la burbuja revienta (clic sobre ella)
//   candyBreak    candy_break.wav       el dulce se rompe con las púas
//   omnomOpen     monster_open.wav      Om Nom abre la boca (dulce cerca)
//   omnomClose    monster_close.wav     Om Nom cierra la boca (el dulce se alejó)
//   omnomChew     monster_chewing.wav   Om Nom se come el dulce
//   omnomSad      monster_sad.wav       se pierde el dulce (sale de pantalla o se rompe)
//   omnomGreet    monster_greeting.wav  saludo al empezar el nivel (DX: 50 % de las veces)
//   omnomExcited  monster_excited.wav   se recoge una estrella con Om Nom en reposo (DX: 50 %)
//   win           win.wav               pantalla de victoria
//   tap           tap.wav               clic en botones de menús y paneles
//   pauseDown     pause_down.wav        entrar en pausa
//   pauseUp       pause_up.wav          salir de la pausa
// Música:
//   menu          menu_music.mp3        menú y selección de nivel
//   game          game_music.mp3        dentro de un nivel (música de la Caja 1 en DX)

const Sound = {
  ctx: null,
  masterGain: null,
  sfxGain: null,
  musicGain: null,
  buffers: {},          // clave 'sfx:nombre' o 'music:nombre' → AudioBuffer
  failed: {},           // claves que no se pudieron cargar
  warned: {},           // nombres desconocidos ya avisados en consola
  ready: Promise.resolve(),
  musicName: null,      // pista pedida (suena o espera a cargar)
  musicSource: null,
  musicTrackGain: null,
  mutedFlag: false,
  unlockHandler: null,  // listener de desbloqueo mientras el contexto siga suspendido
  suspendedByHide: false,

  get muted () {
    return this.mutedFlag;
  },

  init () {
    this.mutedFlag = this.readMuted();

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return; // sin Web Audio el juego sigue en silencio
    try {
      this.ctx = new Ctx();
    } catch (err) {
      this.ctx = null;
      return;
    }

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.mutedFlag ? 0 : 1;
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = AUDIO_T.sfxVolume;
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = AUDIO_T.musicVolume;
    this.musicGain.connect(this.masterGain);

    this.armUnlock();
    this.watchVisibility();
    this.ready = this.loadAll();
  },

  // ---------- carga ----------

  loadAll () {
    const jobs = [];
    for (const name in AUDIO_T.sfx) jobs.push(this.load('sfx:' + name, AUDIO_T.sfx[name]));
    for (const name in AUDIO_T.music) {
      jobs.push(this.load('music:' + name, AUDIO_T.music[name]).then(() => {
        // Si se pidió esta pista antes de que terminara de cargar, empieza ahora.
        if (this.musicName === name && !this.musicSource) this.startMusic(name);
      }));
    }
    return Promise.all(jobs).then(() => undefined);
  },

  load (key, file) {
    return fetch(AUDIO_T.basePath + file)
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' en ' + file);
        return res.arrayBuffer();
      })
      .then((bytes) => this.decode(bytes))
      .then((buffer) => { this.buffers[key] = buffer; })
      .catch((err) => {
        this.failed[key] = true;
        console.warn('Sound: no se pudo cargar ' + file, err);
      });
  },

  // decodeAudioData con promesa y con callbacks (Safari antiguo solo tiene la segunda forma).
  decode (bytes) {
    return new Promise((resolve, reject) => {
      const p = this.ctx.decodeAudioData(bytes, resolve, reject);
      if (p && typeof p.then === 'function') p.then(resolve, reject);
    });
  },

  isLoaded (name) {
    return Boolean(this.buffers['sfx:' + name] || this.buffers['music:' + name]);
  },

  // ---------- efectos ----------

  play (name) {
    try {
      if (!Object.prototype.hasOwnProperty.call(AUDIO_T.sfx, name)) {
        this.warnUnknown(name);
        return;
      }
      // Sin contexto, silenciado o aún bloqueado por el navegador: no se acumulan efectos viejos.
      if (!this.ctx || this.mutedFlag || this.ctx.state !== 'running') return;
      const buffer = this.buffers['sfx:' + name];
      if (!buffer) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.sfxGain);
      source.start(0);
    } catch (err) {
      // Un sonido nunca debe romper el juego.
    }
  },

  // ---------- música ----------

  playMusic (name) {
    try {
      if (!Object.prototype.hasOwnProperty.call(AUDIO_T.music, name)) {
        this.warnUnknown(name);
        return;
      }
      if (this.musicName === name && this.musicSource) return;
      this.fadeOutCurrent();
      this.musicName = name;
      if (this.ctx && this.buffers['music:' + name]) this.startMusic(name);
      // Si no ha cargado, loadAll() la arranca al terminar.
    } catch (err) {
      // Igual que play(): silencio antes que error.
    }
  },

  stopMusic () {
    try {
      this.musicName = null;
      this.fadeOutCurrent();
    } catch (err) {
      // Nada que hacer.
    }
  },

  startMusic (name) {
    const buffer = this.buffers['music:' + name];
    if (!this.ctx || !buffer) return;

    const trackGain = this.ctx.createGain();
    trackGain.connect(this.musicGain);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(trackGain);
    // Con el contexto suspendido el tiempo no avanza: la pista empieza desde 0 al desbloquear.
    source.start(0);

    this.musicSource = source;
    this.musicTrackGain = trackGain;
  },

  fadeOutCurrent () {
    const source = this.musicSource;
    const trackGain = this.musicTrackGain;
    this.musicSource = null;
    this.musicTrackGain = null;
    if (!source) return;

    const fade = AUDIO_T.musicFadeMs / 1000;
    try {
      if (this.ctx.state === 'running' && fade > 0) {
        const now = this.ctx.currentTime;
        trackGain.gain.setValueAtTime(trackGain.gain.value, now);
        trackGain.gain.linearRampToValueAtTime(0, now + fade);
        source.stop(now + fade);
      } else {
        source.stop();
      }
    } catch (err) {
      // Ya estaba parada.
    }
    source.onended = () => trackGain.disconnect();
  },

  // ---------- silencio ----------

  setMuted (value) {
    this.mutedFlag = Boolean(value);
    if (this.masterGain) {
      // La música sigue avanzando en silencio, así al reactivar continúa donde iba.
      this.masterGain.gain.value = this.mutedFlag ? 0 : 1;
    }
    try {
      localStorage.setItem(AUDIO_T.storageKey, this.mutedFlag ? '1' : '0');
    } catch (err) {
      // Sin persistencia; el silencio dura hasta recargar.
    }
  },

  toggleMute () {
    this.setMuted(!this.mutedFlag);
    return this.mutedFlag;
  },

  readMuted () {
    try {
      return localStorage.getItem(AUDIO_T.storageKey) === '1';
    } catch (err) {
      return false;
    }
  },

  // ---------- desbloqueo y visibilidad ----------

  // Los navegadores crean el AudioContext suspendido hasta un gesto del usuario.
  armUnlock () {
    if (this.unlockHandler) return;
    this.unlockHandler = () => {
      if (!this.ctx) return;
      if (this.ctx.state === 'running') {
        this.disarmUnlock();
        return;
      }
      this.ctx.resume().then(() => {
        if (this.ctx.state === 'running') this.disarmUnlock();
      }).catch(() => {
        // El gesto no contó como activación; se reintenta con el siguiente.
      });
    };
    for (const type of ['pointerdown', 'mousedown', 'touchend', 'keydown']) {
      document.addEventListener(type, this.unlockHandler, true);
    }
  },

  disarmUnlock () {
    if (!this.unlockHandler) return;
    for (const type of ['pointerdown', 'mousedown', 'touchend', 'keydown']) {
      document.removeEventListener(type, this.unlockHandler, true);
    }
    this.unlockHandler = null;
  },

  // Con la pestaña oculta se suspende el audio (el juego también se pausa en main.js);
  // al volver se reanuda o, si el navegador no deja, se espera al siguiente gesto.
  watchVisibility () {
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) {
        if (this.ctx.state === 'running') {
          this.suspendedByHide = true;
          this.ctx.suspend().catch(() => {});
        }
        return;
      }
      if (!this.suspendedByHide) return;
      this.suspendedByHide = false;
      this.ctx.resume().catch(() => {}).then(() => {
        if (this.ctx.state !== 'running') this.armUnlock();
      });
    });
  },

  warnUnknown (name) {
    if (this.warned[name]) return;
    this.warned[name] = true;
    console.warn('Sound: nombre desconocido "' + name + '"');
  },
};

Sound.init();
