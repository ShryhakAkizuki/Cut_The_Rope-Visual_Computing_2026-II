class Bubble {

    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.radius = BUBBLE_RADIUS;
        this.body = null;
        this.candy = null;
        this.popped = false;
        const T = GFX_T;
        this.stainQuad = T.bubbleStainFirst + Math.floor(Math.random() * (T.bubbleStainLast - T.bubbleStainFirst + 1));
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, this.radius, {
            label: 'bubble',
            isStatic: true,
            isSensor: true
        });
    }

    get captured () {
        return this.candy !== null && !this.popped;
    }

    capture (candy) {
        this.candy = candy;
    }

    pop () {
        this.popped = true;
    }

    center () {
        return this.captured ? this.candy.body.position : { x: this.x, y: this.y };
    }

    contains (px, py) {
        if (!this.captured) return false;
        const c = this.center();
        return Math.hypot(px - c.x, py - c.y) <= this.radius;
    }

    // Como LoadBubble de DX: la mancha se queda en la pared aunque la burbuja atrape al dulce o
    // reviente; la burbuja libre va encima de la mancha.
    draw () {
        Sprites.draw('obj_bubble', this.stainQuad, this.x, this.y);
        if (!this.candy) Sprites.draw('obj_bubble', GFX_T.bubbleQuad, this.x, this.y);
    }

    // Burbuja que lleva al dulce (BubbleAnimation de CandyBody); se dibuja después del dulce.
    drawOnCandy () {
        if (!this.captured) return;
        const c = this.center();
        Sprites.draw('obj_bubble', GFX_T.bubbleOnCandyQuad, c.x, c.y);
    }
}
