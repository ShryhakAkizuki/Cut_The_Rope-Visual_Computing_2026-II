class OmNom {

    constructor (x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.body = null;
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, this.radius, {
            label: 'omnom',
            isStatic: true,
            isSensor: true
        });
    }

    // LoadTarget de DX: soporte y Om Nom centrados en (x, y); Om Nom queda quieto en el primer
    // cuadro del idle (las animaciones de personaje están fuera de alcance).
    draw () {
        Sprites.draw('char_supports', GFX_T.supportQuad, this.x, this.y);
        Sprites.draw('char_animations', GFX_T.omnomQuad, this.x, this.y);
    }
}
