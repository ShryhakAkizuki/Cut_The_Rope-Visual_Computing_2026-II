class Star {

    constructor (x, y, path, moveSpeed) {
        this.x = x;
        this.y = y;
        this.radius = STAR_RADIUS;
        this.body = null;
        this.collected = false;
        this.mover = createMover(x, y, path, moveSpeed);   // [púas] estrella móvil del nivel 24
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, this.radius, {
            label: 'star',
            isStatic: true,
            isSensor: true
        });
    }

    // Avance por `path` (solo las estrellas móviles); se llama antes del paso de física.
    update (dt) {
        if (!this.mover || this.collected) return;
        this.mover.update(dt / 1000);
        this.x = this.mover.pos.x;
        this.y = this.mover.pos.y;
        if (this.body) Matter.Body.setPosition(this.body, { x: this.x, y: this.y });
    }

    draw () {
        if (this.collected) return;
        drawStarShape(this.x, this.y, this.radius, true);
    }
}
