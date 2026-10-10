let engine = null;
let world = null;
let candy = null;
let omnom = null;
let anchor = null;
let rope = null;

function setup () {
    createCanvas(390, 844);

    engine = Matter.Engine.create();
    world = engine.world;
    engine.gravity.y = 1;

    anchor = new Anchor(195, 80);
    anchor.createBody();

    candy = new Candy(195, 200, 18);
    candy.createBody();

    omnom = new OmNom(195, 640, 40);
    omnom.createBody();

    rope = new Rope(anchor, candy);
    rope.create({ world: world });

    Matter.Composite.add(world, [anchor.body, candy.body, omnom.body]);

    Matter.Events.on(engine, 'collisionStart', (event) => {
        for (const pair of event.pairs) {
            const labels = [pair.bodyA.label, pair.bodyB.label];
            if (labels.includes('candy') && labels.includes('omnom')) {
                console.log('COLISION candy -> omnom (sensor OK)');
                break;
            }
        }
    });
}

function draw () {
    background(0);

    Matter.Engine.update(engine, 1000 / 60);
    rope.update(deltaTime);

    anchor.draw();
    rope.draw();
    omnom.draw();
    candy.draw();

    noStroke();
    fill(150);
    textSize(12);
    text('candy: ' + Math.round(candy.body.position.x) + ',' + Math.round(candy.body.position.y), 10, 20);
    text('offscreen: ' + candy.isOffscreen(width, height), 10, 36);
    text('corte: ' + rope.isCut, 10, 52);
    text('arrastra el raton para cortar', 10, height - 12);
}

function mouseDragged () {
    if (rope.tryCut({ x: pmouseX, y: pmouseY }, { x: mouseX, y: mouseY })) {
        console.log('CUERDA CORTADA');
    }
}

function mousePressed () {}

function keyPressed () {}
