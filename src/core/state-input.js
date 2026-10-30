import { Sound } from './audio.js';
import { STATE } from '../data/config.js';

function playClick (game, px, py) {
  if (game.state === STATE.PLAYING || game.state === STATE.LOSE) {
    if (game.pauseButton.contains(px, py)) {
      if (game.state === STATE.PLAYING) game.togglePause();
      return;
    }
    if (game.restartButton.contains(px, py)) {
      Sound.play('tap');
      game.restart();
      return;
    }
  }
  if (game.state === STATE.PAUSED) {
    const b = game.pauseMenu.buttons;
    if (b.resume.contains(px, py)) game.togglePause();
    else if (game.pauseMenu.soundToggle.contains(px, py)) game.toggleMute();
    else if (b.restart.contains(px, py)) game.tapThen(() => game.restart());
    else if (b.skip.contains(px, py)) game.tapThen(() => game.skipLevel());
    else if (b.menu.contains(px, py)) game.tapThen(() => game.showMenu());
  } else if (game.state === STATE.PLAYING) {
    if (game.camera.blocksInput) {
      game.camera.hurry();
      return;
    }
    const w = game.camera.toWorld({ x: px, y: py });
    const bubble = game.candyBubble();
    if (bubble && bubble.contains(w.x, w.y)) game.popBubble();
  } else if (game.state === STATE.WIN) {
    if (!game.winPanel.visible) return;
    const b = game.winPanel.buttons;
    if (b.replay.contains(px, py)) game.tapThen(() => game.restart());
    else if (b.menu.contains(px, py)) game.tapThen(() => game.showMenu());
    else if (b.next.contains(px, py)) game.tapThen(() => game.nextLevel());
  } else if (game.state === STATE.LOSE) {
    game.restart();
  }
}

function gameKey (game, k) {
  if (k === 'r') game.restart();
  if (k === 'p' || k === 'escape') game.togglePause();
}

const STATE_INPUT = {
  [STATE.TITLE]: {
    click (game, px, py) {
      const b = game.title.buttons;
      if (game.title.soundToggle.contains(px, py)) game.toggleMute();
      else if (b.play.contains(px, py)) game.tapThen(() => game.showMenu());
      else if (b.credits.contains(px, py)) game.tapThen(() => game.showCredits());
      return;
    },
    key (game, k) {
      if (k === 'enter') game.tapThen(() => game.showMenu());
      return;
    },
  },
  [STATE.CREDITS]: {
    click (game, px, py) {
      if (game.credits.backButton.contains(px, py)) game.tapThen(() => game.showTitle());
      return;
    },
    key (game, k) {
      if (k === 'escape') game.tapThen(() => game.showTitle());
      return;
    },
  },
  [STATE.MENU]: {
    click (game, px, py) {
      if (game.menuSoundToggle.contains(px, py)) {
        game.toggleMute();
        return;
      }
      if (game.menu.backButton.contains(px, py)) {
        game.tapThen(() => game.showTitle());
        return;
      }
      const idx = game.menu.levelAt(px, py, game.levels.length);
      if (idx !== -1 && game.progress.isUnlocked(idx)) {
        Sound.play('tap');
        game.startLevel(idx);
      }
      return;
    },
    key (game, k) {
      if (k === 'escape') game.tapThen(() => game.showTitle());
      return;
    },
  },
  [STATE.PLAYING]: { click: playClick, key: gameKey },
  [STATE.PAUSED]:  { click: playClick, key: gameKey },
  [STATE.WIN]:     { click: playClick, key: gameKey },
  [STATE.LOSE]:    { click: playClick, key: gameKey },
};

export function dispatchClick (game, px, py) {
  const h = STATE_INPUT[game.state];
  if (h && h.click) h.click(game, px, py);
}
export function dispatchKey (game, k) {
  const h = STATE_INPUT[game.state];
  if (h && h.key) h.key(game, k);
}
