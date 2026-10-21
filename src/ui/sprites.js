// Hojas del DX en assets/images/ (PNG + atlas JSON de TexturePacker con el mismo nombre).
// Se cargan todas en preload(); la clave de cada hoja es el nombre del archivo sin carpeta.
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
  'loaderbar_full',
  'menu_processing_hd',
];

// Imágenes sin atlas: cuentan como una hoja de un solo cuadro (índice 0).
const SPRITE_IMAGES = [
  'backgrounds/bgr_01_p1',
  'backgrounds/bgr_01_p2',
];

const Sprites = {
  sheets: {},

  preload () {
    for (const path of SPRITE_SHEETS) {
      const sheet = this.addSheet(path);
      sheet.img = loadImage(`assets/images/${path}.png`, null, () => this.loadError(path, 'png'));
      loadJSON(`assets/images/${path}.json`, (atlas) => { sheet.frames = this.parseAtlas(atlas); },
        () => this.loadError(path, 'json'));
    }
    for (const path of SPRITE_IMAGES) {
      const sheet = this.addSheet(path);
      sheet.img = loadImage(`assets/images/${path}.png`, (img) => {
        sheet.frames = [{ x: 0, y: 0, w: img.width, h: img.height, ox: 0, oy: 0, sw: img.width, sh: img.height }];
      }, () => this.loadError(path, 'png'));
    }
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
};
