import { AUDIO_T } from '../data/config.js';

export const Sound = {
  ctx: null,
  masterGain: null,
  sfxGain: null,
  musicGain: null,
  buffers: {},
  failed: {},
  warned: {},
  ready: Promise.resolve(),
  musicName: null,
  musicSource: null,
  musicTrackGain: null,
  mutedFlag: false,
  unlockHandler: null,
  suspendedByHide: false,

  get muted () {
    return this.mutedFlag;
  },

  init () {
    this.mutedFlag = this.readMuted();

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      this.ctx = new Ctx();
    } catch {
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
      if (!this.ctx || this.mutedFlag || this.ctx.state !== 'running') return;
      const buffer = this.buffers['sfx:' + name];
      if (!buffer) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.sfxGain);
      source.start(0);
    } catch {
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
    } catch {
    }
  },

  stopMusic () {
    try {
      this.musicName = null;
      this.fadeOutCurrent();
    } catch {
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
    } catch {
    }
    source.onended = () => trackGain.disconnect();
  },

  // ---------- silencio ----------

  setMuted (value) {
    this.mutedFlag = Boolean(value);
    if (this.masterGain) {
      this.masterGain.gain.value = this.mutedFlag ? 0 : 1;
    }
    try {
      localStorage.setItem(AUDIO_T.storageKey, this.mutedFlag ? '1' : '0');
    } catch {
    }
  },

  toggleMute () {
    this.setMuted(!this.mutedFlag);
    return this.mutedFlag;
  },

  readMuted () {
    try {
      return localStorage.getItem(AUDIO_T.storageKey) === '1';
    } catch {
      return false;
    }
  },

  // ---------- desbloqueo y visibilidad ----------

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
