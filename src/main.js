let game = null;

function setup () {
    createCanvas(390, 844);
    game = new Game(LEVELS);
    game.showMenu();
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
    if ((key === 'r' || key === 'R') && game.state !== STATE.MENU) {
        game.restart();
    }
}
