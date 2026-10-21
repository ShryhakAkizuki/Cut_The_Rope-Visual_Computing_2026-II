class Level {

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

    for (const a of d.anchors) {
      const anchor = new Anchor(a.x, a.y);
      anchor.createBody();

      const rope = new Rope(anchor, this.candy, a.length);
      rope.create(game);

      this.anchors.push(anchor);
      this.ropes.push(rope);
    }

    // [autocuerdas] pista B
    for (const a of d.autoAnchors || []) {
      const autoAnchor = new AutoAnchor(a.x, a.y, a.radius, a.length);
      autoAnchor.createBody();
      this.autoAnchors.push(autoAnchor);
    }

    for (const s of d.stars || []) {
      const star = new Star(s.x, s.y, s.path, s.moveSpeed);
      star.createBody();
      this.stars.push(star);
    }

    for (const b of d.bubbles || []) {
      const bubble = new Bubble(b.x, b.y);
      bubble.createBody();
      this.bubbles.push(bubble);
    }

    // [púas] pista C
    for (const s of d.spikes || []) {
      const spikes = new Spikes(s.x, s.y, s.size, s.angle, s.path, s.moveSpeed);
      spikes.createBody();
      this.spikes.push(spikes);
    }

    // [tutoriales] pista F
    for (const t of d.tutorials || []) {
      this.tutorials.push(new Tutorial(t, game));
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

  // Rectángulo del mapa en VIEW: centrado en horizontal (offsetX = (VIEW.w − map.w) / 2), desde y = 0.
  bounds () {
    return { x: (VIEW.w - this.map.w) / 2, y: 0, w: this.map.w, h: this.map.h };
  }

  draw () {
    const b = this.bounds();
    noStroke();
    fill(COLORS.map);
    rect(b.x, b.y, b.w, b.h);

    for (const t of this.tutorials) t.draw();
    for (const a of this.autoAnchors) a.draw();
    for (const a of this.anchors) a.draw();
    for (const r of this.ropes) r.draw();
    for (const s of this.spikes) s.draw();
    for (const s of this.stars) s.draw();
    if (this.omnom) this.omnom.draw();
    if (this.candy) this.candy.draw();
    for (const b of this.bubbles) b.draw();
  }
}
