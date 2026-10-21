class Rope {

    constructor (anchor, candy, length) {
        this.anchor = anchor;
        this.candy = candy;
        this.requestedLength = length;
        this.length = 0;
        this.constraint = null;
        this.game = null;
        this.isCut = false;
        this.pieces = [];
    }

    create (game) {
        this.game = game;

        // Largo de reposo de DX: si el dulce empieza más lejos, la cuerda queda estirada y tira de él.
        this.length = Math.max(1, this.requestedLength ?? this.distance());

        this.constraint = Matter.Constraint.create({
            ...this.anchorEnd(),
            bodyB: this.candy.body,
            length: this.length,
            stiffness: 1
        });

        Matter.Composite.add(game.world, [this.constraint]);
        this.updateTension();
    }

    // El ancla fija tiene body; la automática no, y se une como punto fijo del mundo.
    anchorPos () {
        return this.anchor.body ? this.anchor.body.position : { x: this.anchor.x, y: this.anchor.y };
    }

    anchorEnd () {
        return this.anchor.body
            ? { bodyA: this.anchor.body }
            : { pointA: { x: this.anchor.x, y: this.anchor.y } };
    }

    distance () {
        const a = this.anchorPos();
        const b = this.candy.body.position;
        return Math.hypot(b.x - a.x, b.y - a.y);
    }

    isTaut () {
        return this.distance() >= this.length - ROPE_T.tautEpsilon;
    }

    // Estiramiento en px: distancia actual − largo de reposo (negativo mientras está floja).
    stretch () {
        return this.distance() - this.length;
    }

    // Largo de un tramo de DX (BungeeRestLength) con el estiramiento repartido por toda la cuerda;
    // DX decide el color rojo con el largo del primer tramo.
    segmentLength () {
        return ROPE_T.restSegmentLength * this.distance() / this.length;
    }

    // A Matter constraint also pushes like a rod; with stiffness 0 it applies no force while slack.
    updateTension () {
        if (!this.constraint) return;
        this.constraint.stiffness = this.isTaut() ? 1 : 0;
    }

    // `n` tramos a lo largo de la cuerda: Bézier cuadrática con la flecha de la holgura (recta si está tensa).
    points (n = ROPE_T.curveSegments) {
        const a = this.anchorPos();
        const b = this.candy.body.position;
        const d = this.distance();
        const sag = this.isTaut() ? 0 : Math.sqrt(3 * d * (this.length - d) / 8);
        const cx = (a.x + b.x) / 2;
        const cy = (a.y + b.y) / 2 + 2 * sag;

        const pts = [];
        for (let i = 0; i <= n; i++) {
            const t = i / n;
            const u = 1 - t;
            pts.push({
                x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
                y: u * u * a.y + 2 * u * t * cy + t * t * b.y
            });
        }
        return pts;
    }

    tryCut (p1, p2) {
        // Una cadena (breakable="false") en DX solo la corta el hacha; en la Caja 1 no hay.
        if (this.isCut || !this.constraint || this.anchor.chain) return false;

        const pts = this.points();
        let point = null;
        for (let i = 0; i < pts.length - 1 && !point; i++) {
            point = segmentIntersection(p1, p2, pts[i], pts[i + 1]);
        }
        if (!point) return false;

        Matter.Composite.remove(this.game.world, this.constraint);
        this.constraint = null;
        this.isCut = true;

        this.pieces.push(this.createPiece(point));

        return true;
    }

    createPiece (point) {
        const world = this.game.world;
        const a = this.anchorPos();

        const upperBody = Matter.Bodies.circle(point.x, point.y, ROPE_T.pieceRadius, {
            label: 'rope-piece',
            isSensor: true,
            frictionAir: 0.02
        });
        const lowerBody = Matter.Bodies.circle(point.x, point.y, ROPE_T.pieceRadius, {
            label: 'rope-piece',
            isSensor: true,
            frictionAir: 0.02
        });

        const upper = Matter.Constraint.create({
            ...this.anchorEnd(),
            bodyB: upperBody,
            length: Math.hypot(point.x - a.x, point.y - a.y),
            stiffness: 1
        });

        const lower = Matter.Constraint.create({
            bodyA: lowerBody,
            bodyB: this.candy.body,
            length: Math.hypot(point.x - this.candy.body.position.x,
                                point.y - this.candy.body.position.y),
            stiffness: 1
        });

        Matter.Composite.add(world, [upperBody, lowerBody, upper, lower]);

        return { upperBody, lowerBody, upper, lower, age: 0 };
    }

    update (delta_Time) {
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            const piece = this.pieces[i];
            piece.age += delta_Time;
            if (piece.age >= ROPE_T.pieceLifetime) {
                Matter.Composite.remove(this.game.world,
                    [piece.upperBody, piece.lowerBody, piece.upper, piece.lower]);
                this.pieces.splice(i, 1);
            }
        }
        this.updateTension();
    }

    pieceAlpha (age) {
        if (age < ROPE_T.pieceFadeStart) return 255;
        const t = (age - ROPE_T.pieceFadeStart) / (ROPE_T.pieceLifetime - ROPE_T.pieceFadeStart);
        return Math.max(0, Math.round(255 * (1 - t)));
    }

    draw () {
        if (!this.isCut && this.constraint) {
            // Como Bungee.DrawBungee: BungeeDrawSamplePoints muestras por cada tramo de BungeeRestLength.
            const n = ropeSampleCount(this.length);
            drawRopeStripes(this.points(n), ropeDrawColors(255, this.segmentLength()));
        } else {
            const a = this.anchorPos();
            const c = this.candy.body.position;
            for (const piece of this.pieces) {
                const colors = ropeDrawColors(this.pieceAlpha(piece.age), 0);
                const u = piece.upperBody.position;
                const l = piece.lowerBody.position;
                drawRopeStripes(linePoints(a, u), colors);
                drawRopeStripes(linePoints(l, c), colors);
            }
        }

        if (this.anchor.drawFront) this.anchor.drawFront();
    }
}

function ropeSampleCount (length) {
    return Math.max(1, Math.ceil(length / ROPE_T.restSegmentLength)) * ROPE_T.samplesPerSegment;
}

function linePoints (a, b) {
    const n = ropeSampleCount(Math.hypot(b.x - a.x, b.y - a.y));
    const pts = [];
    for (let i = 0; i <= n; i++) {
        const t = i / n;
        pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
    return pts;
}

// RopeColorHelper.GetDrawColors con la piel por defecto (índice 0): cada color tiene su extremo
// claro (base) y su extremo oscuro (sombra). Si el tramo supera BungeeRestLength + BungeeStretchRedThreshold,
// el rojo de la sombra se multiplica por segmentLength / BungeeRestLength × 2.
function ropeDrawColors (alpha, segmentLength) {
    const t = ROPE_T;
    const isRed = segmentLength > t.restSegmentLength + t.stretchRedThreshold;
    const redScale = isRed ? segmentLength / t.restSegmentLength * 2 : 1;
    const shade = (c, k) => [Math.min(255, c[0] * k * redScale), c[1] * k, c[2] * k];
    return {
        base1: t.color1,
        base2: t.color2,
        shade1: shade(t.color1, t.shadeFactor1),
        shade2: shade(t.color2, t.shadeFactor2),
        alpha,
    };
}

// Franjas de `stripeSamples` muestras que alternan los dos colores (empieza el segundo), con
// degradado de la sombra en el ancla a la base en el dulce, como Bungee.DrawBungee.
function drawRopeStripes (pts, colors) {
    const n = pts.length - 1;
    const steps = Math.max(1, n - 1);
    const size = ROPE_T.stripeSamples;
    noFill();
    strokeWeight(ROPE_T.lineWidth);
    let alternate = false;
    for (let i = 0; i < n; i += size) {
        const k = Math.min(1, i / steps);
        const base = alternate ? colors.base1 : colors.base2;
        const shade = alternate ? colors.shade1 : colors.shade2;
        stroke(
            shade[0] + (base[0] - shade[0]) * k,
            shade[1] + (base[1] - shade[1]) * k,
            shade[2] + (base[2] - shade[2]) * k,
            colors.alpha
        );
        beginShape();
        for (let j = i; j <= Math.min(n, i + size); j++) vertex(pts[j].x, pts[j].y);
        endShape();
        alternate = !alternate;
    }
}

function crossVec (ax, ay, bx, by) {
    return ax * by - ay * bx;
}

function segmentIntersection (a, b, c, d) {
    const r1x = b.x - a.x, r1y = b.y - a.y;
    const r2x = d.x - c.x, r2y = d.y - c.y;
    const denom = crossVec(r1x, r1y, r2x, r2y);

    if (Math.abs(denom) < 1e-9) return null;

    const qx = c.x - a.x, qy = c.y - a.y;
    const t = crossVec(qx, qy, r2x, r2y) / denom;
    const u = crossVec(qx, qy, r1x, r1y) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return { x: a.x + t * r1x, y: a.y + t * r1y };
    }
    return null;
}
