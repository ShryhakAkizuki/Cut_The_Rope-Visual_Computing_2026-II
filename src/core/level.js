import { Sprites } from '../ui/sprites.js';
import { Candy } from '../entities/candy.js';
import { OmNom } from '../entities/omnom.js';
import { Anchor } from '../entities/anchor.js';
import { Rope } from '../entities/rope.js';
import { AutoAnchor } from '../entities/auto-anchor.js';
import { Star } from '../entities/star.js';
import { Bubble } from '../entities/bubble.js';
import { Spikes } from '../entities/spikes.js';
import { Tutorial } from '../ui/tutorial.js';
import { CANDY_RADIUS, OMNOM_RADIUS, VIEW, GFX_T } from '../data/config.js';

export class Level {

  constructor (data) {
    this.data = data;
    this.map = data.map;
    this.anchors = [];
    this.ropes = [];
    this.autoAnchors = [];
    this.stars = [];
    this.bubbles = [];
    this.spikes = [];
    this.tutorials = [];
    this.candy = null;
    this.omnom = null;
  }

  build (game) {
    const d = this.data;

    this.candy = new Candy(d.candy.x, d.candy.y, CANDY_RADIUS);
    this.candy.createBody();

    this.omnom = new OmNom(d.omnom.x, d.omnom.y, OMNOM_RADIUS);
    this.omnom.createBody();

    const BUILDERS = {
      anchors:     (e) => {
        const anchor = new Anchor(e.x, e.y);
        anchor.createBody();

        const rope = new Rope(anchor, this.candy, e.length);
        rope.create(game);
        this.ropes.push(rope);
        return anchor;
      },
      autoAnchors: (e) => {
        const autoAnchor = new AutoAnchor(e.x, e.y, e.radius, e.length, e.chain);
        autoAnchor.createBody();
        return autoAnchor;
      },
      stars:       (e) => {
        const star = new Star(e.x, e.y, e.path, e.moveSpeed);
        star.createBody();
        return star;
      },
      bubbles:     (e) => {
        const bubble = new Bubble(e.x, e.y);
        bubble.createBody();
        return bubble;
      },
      spikes:      (e) => {
        const spikes = new Spikes(e.x, e.y, e.size, e.angle, e.path, e.moveSpeed);
        spikes.createBody();
        return spikes;
      },
      tutorials:   (e) => new Tutorial(e, game),
    };
    for (const [tipo, crear] of Object.entries(BUILDERS)) {
      for (const e of this.data[tipo] || []) this[tipo].push(crear(e));
    }

    Matter.Composite.add(game.world, [
      this.candy.body,
      this.omnom.body,
      ...this.anchors.map((a) => a.body),
      ...this.autoAnchors.map((a) => a.body),
      ...this.stars.map((s) => s.body),
      ...this.bubbles.map((b) => b.body),
      ...this.spikes.map((s) => s.body),
    ].filter(Boolean));
  }

  clear (game) {
    Matter.Composite.clear(game.world, false, true);
    this.anchors = [];
    this.ropes = [];
    this.autoAnchors = [];
    this.stars = [];
    this.bubbles = [];
    this.spikes = [];
    this.tutorials = [];
    this.candy = null;
    this.omnom = null;
  }

  bounds () {
    return { x: (VIEW.w - this.map.w) / 2, y: 0, w: this.map.w, h: this.map.h };
  }

  draw () {
    this.drawBackground();
    if (this.omnom) this.omnom.draw();
    for (const t of this.tutorials) t.draw();
    for (const b of this.bubbles) b.draw();
    for (const s of this.spikes) s.draw();
    for (const a of this.autoAnchors) a.draw();
    for (const a of this.anchors) a.draw();
    for (const r of this.ropes) r.draw();
    for (const s of this.stars) s.draw();
    if (this.candy) this.candy.draw();
    for (const b of this.bubbles) b.drawOnCandy();
  }

  drawBackground () {
    const h = Sprites.size('bgr_01_p1').h;
    const rows = Math.max(1, Math.ceil(this.map.h / h - 0.001));
    for (let i = 0; i < rows; i++) Sprites.draw('bgr_01_p1', 0, VIEW.w / 2, i * h, { ay: 0 });
    for (let i = 0; i < rows - 1; i++) Sprites.draw('bgr_01_p2', 0, VIEW.w / 2, GFX_T.bgP2Y + i * h, { ay: 0 });
  }
}
