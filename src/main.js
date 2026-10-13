let game = null;

const LEVEL_INDEX = 2;

function setup () {
    createCanvas(390, 844);
    game = new Game(LEVELS);
    game.startLevel(LEVEL_INDEX);
}

function draw () {
    game.update();
    game.draw();
}

function mouseDragged () {
    game.onCutAttempt({ x: pmouseX, y: pmouseY }, { x: mouseX, y: mouseY });
}

function mousePressed () {
    game.onInput(mouseX, mouseY);
}

function keyPressed () {
    if (key === 'r' || key === 'R') {
        game.restart();
    }
}
