// Pista B: cuerda automática (`grab` con radius > 0), como AutoRadiusSource.cs y
// GameScene.TryAutoAttachGrabToBody de DX. Crea la cuerda cuando el dulce entra al radio; es de un
// solo uso y luego el círculo se desvanece. La detección es por distancia en Game.update(), así que
// no tiene body (Level.build filtra los null).
class AutoAnchor {

  constructor (x, y, radius, length, chain = false) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    // `length` del XML: DX lo ignora en las autocuerdas (el largo es radius + CandyGrabPadding).
    this.length = length;
    this.chain = chain;
    this.body = null;
    this.sheet = chain ? 'obj_hook_auto_chain' : 'obj_hook';
    this.backFrame = chain ? 0 : 4;   // HookAutoChainBackQuad / HookAutoBackQuad
    this.used = false;                // DX: Radius = -1 (ya no puede unirse)
    this.fading = false;
    this.radiusAlpha = 1;
    this.rope = null;
    this.dashes = AutoAnchor.circleDashes(this.x, this.y, this.radius);
  }

  createBody () {}

  canAttach () {
    return !this.used;
  }

  // Criterio de DX (AutoRadiusSource.InRange): distancia al centro del dulce ≤ radio + margen.
  inRange (pos) {
    return Math.hypot(pos.x - this.x, pos.y - this.y) <= this.radius + AUTO_ROPE_T.grabPadding;
  }

  // Avanza el desvanecimiento y, si el dulce entró al radio, crea la cuerda y la entrega a `ropes`.
  update (dt, game) {
    if (this.fading) {
      this.radiusAlpha -= AUTO_ROPE_T.fadeRatePerSecond * dt / 1000;
      if (this.radiusAlpha <= 0) {
        this.radiusAlpha = 0;
        this.fading = false;
      }
    }

    const candy = game.candy;
    if (!this.canAttach() || !candy || !candy.body || !this.inRange(candy.body.position)) return null;

    // Como DX, el largo es radius + CandyGrabPadding: la cuerda nace floja o justa.
    const rope = new Rope(this, candy, this.radius + AUTO_ROPE_T.grabPadding);
    rope.create(game);
    this.rope = rope;
    this.used = true;
    this.fading = true;
    game.ropes.push(rope);
    return rope;
  }

  // Círculo punteado de DX (DrawGrabCircle): max(16, radio) / 2 vértices (par) y un trazo entre
  // cada par de vértices consecutivos.
  static circleDashes (x, y, radius) {
    let count = Math.floor(Math.max(16, radius) / 2);
    if (count % 2 !== 0) count++;
    const step = Math.PI * 2 / count;
    const dashes = [];
    for (let i = 0; i < count; i += 2) {
      dashes.push([
        x + radius * Math.cos(i * step), y + radius * Math.sin(i * step),
        x + radius * Math.cos((i + 1) * step), y + radius * Math.sin((i + 1) * step),
      ]);
    }
    return dashes;
  }

  draw () {
    Sprites.draw(this.sheet, this.backFrame, this.x, this.y);

    if (!this.used || this.fading) {
      const c = AUTO_ROPE_T.circleColor;
      stroke(c[0], c[1], c[2], 255 * this.radiusAlpha);
      strokeWeight(AUTO_ROPE_T.circleLineWidth);
      for (const d of this.dashes) line(d[0], d[1], d[2], d[3]);
    }

    // Con cuerda, el frente lo dibuja la cuerda encima de su extremo.
    if (!this.rope) this.drawFront();
  }

  drawFront () {
    Sprites.draw(this.sheet, this.backFrame + 1, this.x, this.y);
  }
}
