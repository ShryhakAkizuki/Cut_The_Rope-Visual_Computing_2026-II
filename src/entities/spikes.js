// Pista C: púas (`spike1`–`spike4`, Spikes.cs de DX). Tocarlas destruye el dulce.
class Spikes {

  constructor (x, y, size, angle, path, moveSpeed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.angle = angle;
    this.path = path;
    this.moveSpeed = moveSpeed;
    this.body = null;
  }

  createBody () {}

  draw () {}
}
