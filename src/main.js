let game = null;
let touchPrev = null;

let lastTouchAt = -1e9;
const TOUCH_MOUSE_GUARD_MS = 500;

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
    if (millis() - lastTouchAt < TOUCH_MOUSE_GUARD_MS) return;
    game.onCutAttempt({ x: pmouseX, y: pmouseY }, { x: mouseX, y: mouseY });
}

function mousePressed () {
    if (millis() - lastTouchAt < TOUCH_MOUSE_GUARD_MS) return;
    game.onInput(mouseX, mouseY);
}

function touchStarted () {
    lastTouchAt = millis();
    touchPrev = { x: mouseX, y: mouseY };
    game.onInput(mouseX, mouseY);
    return false; 
}

function touchMoved () {
    lastTouchAt = millis();
    if (touchPrev) game.onCutAttempt(touchPrev, { x: mouseX, y: mouseY });
    touchPrev = { x: mouseX, y: mouseY };
    return false;
}

function touchEnded () {
    lastTouchAt = millis();
    touchPrev = null;
    return false;
}

function keyPressed () {
    if ((key === 'r' || key === 'R') && game.state !== STATE.MENU) {
        game.restart();
    }
    if ((key === 'p' || key === 'P') && game.state !== STATE.MENU) {
        game.togglePause();
    }
}
