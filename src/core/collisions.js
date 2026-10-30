function createCollisionHandler (game) {
  return (event) => {
    let eaten = false;
    for (const pair of event.pairs) {
      const labels = [pair.bodyA.label, pair.bodyB.label];
      if (!labels.includes('candy')) continue;
      if (labels.includes('bubble')) {
        game.onBubbleTouched(pair.bodyA.label === 'bubble' ? pair.bodyA : pair.bodyB);
      } else if (labels.includes('spikes')) {
        if (game.state === STATE.PLAYING && !game.candy.broken) {
          game.popBubble();
          for (const rope of game.ropes) rope.release();
          game.candy.shatter();
          Sound.play('candyBreak');
          game.scheduleSound(AUDIO_T.sadDelayAfterBreak, () => Sound.play('omnomSad'));
          Matter.Composite.remove(game.world, game.candy.body);
          game.state = STATE.LOSE;
        }
      } else if (labels.includes('omnom')) {
        eaten = true;
      }
    }
    if (eaten) game.onCandyEaten();
  };
}
