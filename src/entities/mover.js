// Movimiento en ciclo por `path` (Mover.cs de DX), para las púas del nivel 22 y la estrella del nivel 24.
// Recorre el punto inicial y los offsets de `path` (ya ×3 en LEVELS) y vuelve al primero;
// con un solo offset el objeto va y vuelve. La entidad copia `pos` a su body en cada frame.
class Mover {

  constructor (x, y, path, moveSpeed) {
    this.points = [{ x, y }];
    for (let i = 0; i + 1 < path.length; i += 2) {
      this.points.push({ x: x + path[i], y: y + path[i + 1] });
    }
    this.speed = (moveSpeed || 0) * SPIKES_T.moverSpeedScale;   // px/s de VIEW
    this.pos = { x, y };
    this.target = this.points.length > 1 ? 1 : 0;
    this.overrun = 0;
  }

  // Igual que Mover.Update: avanza `speed × delta` px hacia el punto objetivo y, si lo alcanza,
  // sigue hacia el siguiente con el tiempo que sobra. `delta` en segundos.
  update (delta) {
    const n = this.points.length;
    if (n < 2 || this.speed <= 0) return;
    let time = delta + this.overrun;
    this.overrun = 0;
    let stalled = 0;
    while (time > 0) {
      const t = this.points[this.target];
      const dx = t.x - this.pos.x;
      const dy = t.y - this.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 0) {
        this.target = (this.target + 1) % n;
        if (++stalled > n) break;
        continue;
      }
      stalled = 0;
      const timeToTarget = dist / this.speed;
      if (timeToTarget <= time) {
        this.pos = { x: t.x, y: t.y };
        time -= timeToTarget;
        this.target = (this.target + 1) % n;
        continue;
      }
      const step = this.speed * time / dist;
      this.pos = { x: this.pos.x + dx * step, y: this.pos.y + dy * step };
      time = 0;
    }
    if (time > 0) this.overrun = time;
  }
}

// Crea el Mover solo si el objeto trae `path` (en la Caja 1: púas del nivel 22 y una estrella del 24).
function createMover (x, y, path, moveSpeed) {
  return Array.isArray(path) && path.length >= 2 ? new Mover(x, y, path, moveSpeed) : null;
}
