// Hojas del DX en assets/images/ (PNG + atlas JSON de TexturePacker con el mismo nombre).
// La clave de cada hoja es el nombre del archivo sin carpeta. En preload() solo se cargan las
// de BOOT_SHEETS (lo que dibuja la pantalla de carga); el resto se pide en setup() con
// Sprites.loadAll() y la pantalla de carga muestra el avance hasta que `Sprites.ready`.
const BOOT_SHEETS = [
  'loaderbar_full',
];

const SPRITE_SHEETS = [
  'bgr_01_cover',
  'candies/obj_candy_01_new',
  'candies/obj_candy_fx',
  'char_animations',
  'char_supports',
  'obj_hook',
  'obj_hook_chain',
  'obj_hook_auto_chain',
  'obj_star_idle',
  'obj_star_disappear',
  'obj_bubble',
  'obj_spikes',
  'tutorial_signs',
  'hud_ui',
  'menu_pause',
  'obj_pause',
  'menu_level_ui',
  'menu_buttons',
  'menu_bgr',
  'menu_popup',
  'menu_results',
  'confetti_particles',
  'small_font',
  'big_font',
  'font_numbers_big',
  'menu_processing_hd',
];

// Imágenes sin atlas: cuentan como una hoja de un solo cuadro (índice 0).
const SPRITE_IMAGES = [
  'backgrounds/bgr_01_p1',
  'backgrounds/bgr_01_p2',
];

const Sprites = {
  sheets: {},
  pending: 0,     // archivos pedidos por loadAll() que aún no llegan
  total: 0,       // archivos pedidos por loadAll()
  started: false,

  // Llamar desde preload(): p5 espera a estas hojas antes de setup().
  preloadBoot () {
    for (const path of BOOT_SHEETS) this.loadSheet(path);
  },

  // Llamar desde setup(): pide el resto de hojas sin bloquear; cada archivo que llega
  // (o falla) cuenta para `progress`.
  loadAll () {
    this.started = true;
    for (const path of SPRITE_SHEETS) this.loadSheet(path);
    for (const path of SPRITE_IMAGES) this.loadImageSheet(path);
  },

  // Fracción de archivos cargados (0 a 1).
  get progress () {
    if (!this.started) return 0;
    return this.total === 0 ? 1 : (this.total - this.pending) / this.total;
  },

  get ready () {
    return this.started && this.pending === 0;
  },

  track () {
    if (!this.started) return () => {};
    this.pending += 1;
    this.total += 1;
    let done = false;
    return () => {
      if (done) return;
      done = true;
      this.pending -= 1;
    };
  },

  loadSheet (path) {
    const sheet = this.addSheet(path);
    const imgDone = this.track();
    const jsonDone = this.track();
    sheet.img = loadImage(`assets/images/${path}.png`, imgDone, () => { this.loadError(path, 'png'); imgDone(); });
    loadJSON(`assets/images/${path}.json`, (atlas) => {
      sheet.frames = this.parseAtlas(atlas);
      jsonDone();
    }, () => { this.loadError(path, 'json'); jsonDone(); });
  },

  loadImageSheet (path) {
    const sheet = this.addSheet(path);
    const done = this.track();
    sheet.img = loadImage(`assets/images/${path}.png`, (img) => {
      sheet.frames = [{ x: 0, y: 0, w: img.width, h: img.height, ox: 0, oy: 0, sw: img.width, sh: img.height }];
      done();
    }, () => { this.loadError(path, 'png'); done(); });
  },

  addSheet (path) {
    const sheet = { img: null, frames: [], byName: {} };
    this.sheets[path.split('/').pop()] = sheet;
    return sheet;
  },

  loadError (path, kind) {
    console.error(`Sprites: no se pudo cargar assets/images/${path}.${kind}`);
  },

  // El atlas trae `frames` como arreglo (con `filename`) o como objeto cuya clave es el nombre.
  // Ningún cuadro de la Caja 1 viene rotado, así que `rotated` se ignora.
  parseAtlas (atlas) {
    const list = Array.isArray(atlas.frames)
      ? atlas.frames
      : Object.entries(atlas.frames).map(([filename, f]) => ({ filename, ...f }));
    return list.map((f) => ({
      name: f.filename,
      x: f.frame.x,
      y: f.frame.y,
      w: f.frame.w,
      h: f.frame.h,
      ox: f.spriteSourceSize.x,   // desplazamiento del recorte dentro del cuadro original
      oy: f.spriteSourceSize.y,
      sw: f.sourceSize.w,         // tamaño del cuadro original (el del elemento en DX)
      sh: f.sourceSize.h,
      char: f.char,               // solo en las fuentes bitmap (big_font, small_font, font_numbers_big)
    }));
  },

  // `frame` es el índice del cuadro (como los quads de Resources.Img en DX) o su `filename`.
  frame (name, frame) {
    const sheet = this.sheets[name];
    if (!sheet) throw new Error(`Sprites: hoja desconocida "${name}"`);
    if (typeof frame === 'number') return sheet.frames[frame];
    if (!sheet.byName[frame]) sheet.byName[frame] = sheet.frames.find((f) => f.name === frame);
    return sheet.byName[frame];
  },

  count (name) {
    return this.sheets[name].frames.length;
  },

  // Tamaño del cuadro original, sin recortar.
  size (name, frame = 0) {
    const f = this.frame(name, frame);
    return { w: f.sw, h: f.sh };
  },

  // Dibuja el cuadro con su caja original anclada en (x, y). `ax`/`ay` van de 0 a 1:
  // por defecto el centro; { ax: 0, ay: 0 } ancla la esquina superior izquierda.
  // Escala, rotación y transparencia se aplican antes con push/translate/rotate/tint.
  draw (name, frame, x, y, opts = {}) {
    const f = this.frame(name, frame);
    if (!f) return;
    const ax = opts.ax !== undefined ? opts.ax : 0.5;
    const ay = opts.ay !== undefined ? opts.ay : 0.5;
    image(this.sheets[name].img, x - ax * f.sw + f.ox, y - ay * f.sh + f.oy, f.w, f.h, f.x, f.y, f.w, f.h);
  },

  // Dibuja solo el recorte, con su esquina superior izquierda en (x, y) y ancho `w` opcional
  // (recorta por la derecha, como la barra de carga). Equivale a DrawImageQuad de DX.
  drawQuad (name, frame, x, y, w) {
    const f = this.frame(name, frame);
    if (!f) return;
    const cw = w === undefined ? f.w : Math.max(0, Math.min(f.w, w));
    if (cw <= 0) return;
    image(this.sheets[name].img, x, y, cw, f.h, f.x, f.y, cw, f.h);
  },

  // Dibuja solo el recorte centrado en (x, y), sin tener en cuenta su caja original (útil en
  // hojas cuyos cuadros traen como caja original la pantalla de diseño entera, p. ej. menu_results).
  drawCentered (name, frame, x, y) {
    const f = this.frame(name, frame);
    if (!f) return;
    image(this.sheets[name].img, x - f.w / 2, y - f.h / 2, f.w, f.h, f.x, f.y, f.w, f.h);
  },

  // Centro del recorte en la pantalla de diseño de DX (cuadros que guardan su posición en la
  // caja original, como los marcadores de menu_results). Image.SetElementPositionWithQuadOffset.
  quadCenter (name, frame) {
    const f = this.frame(name, frame);
    return { x: f.ox + f.w / 2, y: f.oy + f.h / 2 };
  },

  // Tamaño del recorte (sin el relleno transparente del cuadro original).
  quadSize (name, frame = 0) {
    const f = this.frame(name, frame);
    return { w: f.w, h: f.h };
  },
};
