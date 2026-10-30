const BOOT_SHEETS = [
  'loaderbar_full',
];

const SPRITE_SHEETS = [
  'bgr_01_cover',
  'candies/obj_candy_01_new',
  'char_supports',
  'obj_hook',
  'obj_hook_chain',
  'obj_hook_auto_chain',
  'obj_star_idle',
  'obj_bubble',
  'obj_spikes',
  'tutorial_signs',
  'hud_ui',
  'menu_pause',
  'menu_level_ui',
  'menu_buttons',
  'menu_bgr',
  'menu_bgr_shadow',
  'menu_extra_buttons',
  'menu_popup',
  'menu_options_packed',
  'menu_results',
  'small_font',
  'big_font',
  'font_numbers_big',
];

const SPRITE_IMAGES = [
  'backgrounds/bgr_01_p1',
  'backgrounds/bgr_01_p2',
  'cut_the_rope_logo',
  'char_animations_hd',
];

export const Sprites = {
  sheets: {},
  pending: 0,
  total: 0,
  started: false,

  preloadBoot () {
    for (const path of BOOT_SHEETS) this.loadSheet(path);
  },

  loadAll () {
    this.started = true;
    for (const path of SPRITE_SHEETS) this.loadSheet(path);
    for (const path of SPRITE_IMAGES) this.loadImageSheet(path);
  },

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
      ox: f.spriteSourceSize.x,
      oy: f.spriteSourceSize.y,
      sw: f.sourceSize.w,
      sh: f.sourceSize.h,
      char: f.char,
    }));
  },

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

  size (name, frame = 0) {
    const f = this.frame(name, frame);
    return { w: f.sw, h: f.sh };
  },

  draw (name, frame, x, y, opts = {}) {
    const f = this.frame(name, frame);
    if (!f) return;
    const ax = opts.ax !== undefined ? opts.ax : 0.5;
    const ay = opts.ay !== undefined ? opts.ay : 0.5;
    image(this.sheets[name].img, x - ax * f.sw + f.ox, y - ay * f.sh + f.oy, f.w, f.h, f.x, f.y, f.w, f.h);
  },

  drawQuad (name, frame, x, y, w) {
    const f = this.frame(name, frame);
    if (!f) return;
    const cw = w === undefined ? f.w : Math.max(0, Math.min(f.w, w));
    if (cw <= 0) return;
    image(this.sheets[name].img, x, y, cw, f.h, f.x, f.y, cw, f.h);
  },

  drawCentered (name, frame, x, y) {
    const f = this.frame(name, frame);
    if (!f) return;
    image(this.sheets[name].img, x - f.w / 2, y - f.h / 2, f.w, f.h, f.x, f.y, f.w, f.h);
  },

  quadCenter (name, frame) {
    const f = this.frame(name, frame);
    return { x: f.ox + f.w / 2, y: f.oy + f.h / 2 };
  },

  quadSize (name, frame = 0) {
    const f = this.frame(name, frame);
    return { w: f.w, h: f.h };
  },
};
