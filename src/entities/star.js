class Star {

    constructor (x, y, path, moveSpeed) {
        this.x = x;
        this.y = y;
        this.radius = STAR_RADIUS;
        this.body = null;
        this.collected = false;
        this.mover = createMover(x, y, path, moveSpeed);   // estrella móvil del nivel 24
    }

    // Sin body: Game prueba el contacto con touches() en cada paso (Level.build filtra los null).
    createBody () {}

    // GameObject.ObjectsIntersect de DX: la caja del dulce contra la de la estrella, bordes incluidos.
    touches (pos) {
        return Math.abs(pos.x + CANDY_STAR_BOX.dx - (this.x + STAR_BOX.dx)) <= CANDY_STAR_BOX.hw + STAR_BOX.hw
            && Math.abs(pos.y + CANDY_STAR_BOX.dy - (this.y + STAR_BOX.dy)) <= CANDY_STAR_BOX.hh + STAR_BOX.hh;
    }

    // Avance por `path` (solo las estrellas móviles); se llama antes del paso de física.
    update (dt) {
        if (!this.mover || this.collected) return;
        this.mover.update(dt / 1000);
        this.x = this.mover.pos.x;
        this.y = this.mover.pos.y;
    }

    draw () {
        if (this.collected) return;
        // Star.CreateAnimations de DX: brillo debajo y la estrella encima, centrados en (x, y).
        Sprites.draw('obj_star_idle', GFX_T.starGlowQuad, this.x, this.y);
        Sprites.draw('obj_star_idle', GFX_T.starQuad, this.x, this.y);
    }
}
