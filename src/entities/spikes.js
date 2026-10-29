// Púas (`spike1`–`spike4`, Spikes.cs de DX). Tocarlas destruye el dulce.
// La colisión es una banda rotada de largo SpikesQuadWidths[size − 1] y semialto 5 (UpdateRotation).
class Spikes {

  constructor (x, y, size, angle, path, moveSpeed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.angle = angle || 0;   // grados, como en el XML
    this.path = path;
    this.moveSpeed = moveSpeed;
    this.mover = createMover(x, y, path, moveSpeed);
    this.body = null;
  }

  get length () {
    return SPIKES_T.quadWidths[this.size - 1];
  }

  // Sensor estático: no empuja a nada y las cuerdas (constraints) y sus trozos (sensores) lo atraviesan.
  createBody () {
    this.body = Matter.Bodies.rectangle(this.x, this.y, this.length, SPIKES_T.bandHalfHeight * 2, {
      label: 'spikes',
      isStatic: true,
      isSensor: true,
      angle: this.angle * Math.PI / 180
    });
  }

  // Avance por `path` (solo las púas móviles); se llama antes del paso de física.
  update (dt) {
    if (!this.mover) return;
    this.mover.update(dt / 1000);
    this.x = this.mover.pos.x;
    this.y = this.mover.pos.y;
    if (this.body) Matter.Body.setPosition(this.body, { x: this.x, y: this.y });
  }

  // obj_spikes: cuadros 8–11 = obj_spikes_01–04 (StaticSpikeFirstQuad); la caja original va centrada en (x, y).
  draw () {
    push();
    translate(this.x, this.y);
    rotate(this.angle * Math.PI / 180);
    Sprites.draw('obj_spikes', SPIKES_T.firstQuad + this.size - 1, 0, 0);
    pop();
  }
}
