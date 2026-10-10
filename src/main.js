let engine = null;
let world = null;
let candy = null;
let omnom = null;

function setup () {
    createCanvas(390, 844);

    engine = Matter.Engine.create();
    world = engine.world;
    engine.gravity.y = 1;

    candy = new Candy(195, 200, 18);
    candy.createBody();

    omnom = new OmNom(195, 640, 40);
    omnom.createBody();

    Matter.Composite.add(world, [candy.body, omnom.body]);

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

    omnom.draw();
    candy.draw();

    noStroke();
    fill(150);
    textSize(12);
    text('candy: ' + Math.round(candy.body.position.x) + ',' + Math.round(candy.body.position.y), 10, 20);
    text('offscreen: ' + candy.isOffscreen(width, height), 10, 36);
}

function mouseDragged () {}

function mousePressed () {}

function keyPressed () {}
