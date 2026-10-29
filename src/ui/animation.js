// Reproducción de animaciones por recortes de un spritesheet, adaptada al dibujo del
// proyecto con p5: los frames se recortan a p5.Image con `img.get()` y se dibujan con
// `image()`, igual que Sprites.draw. Los recortes, fps y loops viven en los datos
// (data/omnom-animation.js).
class Animation {

  // Frames ya recortados por hoja y estado. Como el sheet no cambia, el recorte se hace
  // una sola vez aunque se cree una Animation nueva en cada nivel o reinicio.
  static _cache = new Map();

  constructor (data, options = {}) {
    if (!data || !data.states || typeof data.states !== 'object') {
      throw new Error('Animation: `data.states` es obligatorio.');
    }
    const names = Object.keys(data.states);
    if (names.length === 0) throw new Error('Animation: `data.states` está vacío.');

    this.data = data;
    this.image = options.image || null;
    this._stateName = null;
    this._currentFrame = 0;
    this._elapsed = 0;
    this._finished = false;
    this._playing = true;

    const initial = options.state || data.defaultState || names[0];
    if (!this.hasState(initial)) throw new Error(`Animation: estado desconocido "${initial}".`);
    this._stateName = initial;
  }

  hasState (name) {
    return !!(this.data.states && this.data.states[name]);
  }

  getStateConfig (name = this._stateName) {
    const config = this.data.states[name];
    if (!config) throw new Error(`Animation: estado desconocido "${name}".`);
    if (!Array.isArray(config.frames) || config.frames.length === 0) {
      throw new Error(`Animation: el estado "${name}" no tiene frames.`);
    }
    return config;
  }

  // Frames recortados del estado; se recortan on-demand y se guardan en la caché.
  frames (name = this._stateName) {
    const key = `${this.data.sheet ? this.data.sheet.src : ''}:${name}`;
    let frames = Animation._cache.get(key);
    if (!frames) {
      if (!this.image) throw new Error('Animation: asigna la imagen antes de recortar.');
      frames = this.getStateConfig(name).frames.map((f) => this.image.get(f.x, f.y, f.w, f.h));
      Animation._cache.set(key, frames);
    }
    return frames;
  }

  get frame () {
    return this.frames()[this._currentFrame] || null;
  }

  get stateName () {
    return this._stateName;
  }

  get currentFrame () {
    return this._currentFrame;
  }

  get frameCount () {
    return this.getStateConfig().frames.length;
  }

  get isFinished () {
    return this._finished;
  }

  get isReady () {
    return !!this.frame;
  }

  // Progreso 0..1 del estado actual.
  get progress () {
    const config = this.getStateConfig();
    const fps = config.fps > 0 ? config.fps : 12;
    const total = (config.frames.length * 1000) / fps;
    const elapsed = this._currentFrame * (1000 / fps) + this._elapsed;
    return total > 0 ? Math.min(1, elapsed / total) : 1;
  }

  // Cambia de estado y lo reproduce desde el frame 0. Con `restart: false`, repetir el
  // estado actual no lo reinicia (sirve para estados que se quedan en su último frame).
  play (name, options = {}) {
    if (!this.hasState(name)) throw new Error(`Animation: estado desconocido "${name}".`);
    const restart = options.restart !== false;
    if (this._stateName === name && !restart) {
      this._playing = true;
      return this;
    }
    this._stateName = name;
    this._currentFrame = 0;
    this._elapsed = 0;
    this._finished = false;
    this._playing = true;
    return this;
  }

  pause () {
    this._playing = false;
    return this;
  }

  resume () {
    if (!this._finished) this._playing = true;
    return this;
  }

  // Avanza la animación. `deltaMs` son milisegundos reales (deltaTime de p5).
  update (deltaMs) {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return this;
    if (!this._playing || this._finished) return this;

    const config = this.getStateConfig();
    const count = config.frames.length;
    if (count <= 1) return this;

    const fps = config.fps > 0 ? config.fps : 12;
    const frameDuration = 1000 / fps;

    this._elapsed += deltaMs;
    while (this._elapsed >= frameDuration) {
      this._elapsed -= frameDuration;
      this._currentFrame++;
      if (this._currentFrame >= count) {
        if (config.loop) {
          this._currentFrame = 0;
        } else {
          this._currentFrame = count - 1;
          this._finished = true;
          break;
        }
      }
    }
    return this;
  }

  // Dibuja el frame actual centrado en (x, y) y estirado a w×h, como los quads de DX.
  // `ax`/`ay` (0..1) cambian el anclaje; `opacity` va de 0 a 1.
  draw (x, y, w, h, options = {}) {
    const frame = this.frame;
    if (!frame) return false;

    const ax = options.ax !== undefined ? options.ax : 0.5;
    const ay = options.ay !== undefined ? options.ay : 0.5;
    const opacity = options.opacity !== undefined ? options.opacity : 1;

    push();
    if (opacity !== 1) tint(255, 255 * opacity);
    image(frame, x - ax * w, y - ay * h, w, h);
    pop();
    return true;
  }
}
