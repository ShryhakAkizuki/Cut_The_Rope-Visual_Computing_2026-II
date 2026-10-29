// Gancho de una cuerda fija (`grab` con radius="-1"). Como Grab.CreateAxisVisuals de DX: base y
// frente de obj_hook (gancho 01 o 02 al azar), u obj_hook_chain si la cuerda es una cadena
// (`chain`, breakable="false" en el XML; no aparece en la Caja 1).
class Anchor {

    constructor (x, y, chain = false) {
        this.x = x;
        this.y = y;
        this.chain = chain;
        this.body = null;
        this.sheet = chain ? 'obj_hook_chain' : 'obj_hook';
        this.backFrame = chain ? 0 : (Math.random() < 0.5 ? 0 : 2);   // RandomHookBaseQuad
    }

    createBody () {
        this.body = Matter.Bodies.circle(this.x, this.y, ANCHOR_RADIUS, {
            label: 'anchor',
            isStatic: true,
            isSensor: true
        });
    }

    // La base va detrás de la cuerda; el frente lo dibuja la cuerda encima de su extremo (drawFront).
    draw () {
        if (!this.body) return;
        const pos = this.body.position;
        Sprites.draw(this.sheet, this.backFrame, pos.x, pos.y);
    }

    drawFront () {
        if (!this.body) return;
        const pos = this.body.position;
        Sprites.draw(this.sheet, this.backFrame + 1, pos.x, pos.y);
    }
}
