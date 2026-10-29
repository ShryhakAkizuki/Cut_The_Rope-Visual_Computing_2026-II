class OmNom {

    constructor (x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.body = null;
        this.eaten = false;

        // Animación por sprites de char_animations_hd (idle → openMouth → eating).
        // La imagen ya está cargada cuando se construye un nivel (Sprites.ready).
        const sheet = Sprites.sheets[OMNOM_T.sheet];
        this.anim = sheet && sheet.img ? new Animation(OMNOM_ANIMATION, { image: sheet.img }) : null;
        if (this.anim) this.anim.play('idle');
    }

    createBody () {
        // El sensor va en la boca, no en el centro del cuerpo: el dulce se come cuando su
        // centro llega a ella (radio del dulce + mouthSensorRadius), como pedía el gesto.
        this.body = Matter.Bodies.circle(this.x, this.y + OMNOM_T.mouthOffsetY, OMNOM_T.mouthSensorRadius, {
            label: 'omnom',
            isStatic: true,
            isSensor: true
        });
    }

    // El dulce entró en el rango cercano: abre la boca y se queda en el último frame.
    openMouth () {
        if (!this.anim || this.eaten) return;
        this.anim.play('openMouth', { restart: false });
    }

    // El dulce se alejó sin comer: vuelve al reposo.
    closeMouth () {
        if (!this.anim || this.eaten) return;
        if (this.anim.stateName !== 'idle') this.anim.play('idle');
    }

    // El dulce llegó a la boca: cierra y mastica.
    eat () {
        this.eaten = true;
        if (this.anim) this.anim.play('eating');
    }

    update (dt) {
        if (this.anim) this.anim.update(dt);
    }

    draw () {
        Sprites.draw('char_supports', GFX_T.supportQuad, this.x, this.y);
        if (this.anim && this.anim.frame) {
            // Como el DX: cada frame se estira a un cuadrado centrado en Om Nom.
            this.anim.draw(this.x, this.y + OMNOM_T.spriteOffsetY, OMNOM_T.spriteSize, OMNOM_T.spriteSize);
        }
    }
}
