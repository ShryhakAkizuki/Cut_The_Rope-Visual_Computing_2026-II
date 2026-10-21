class Hud {

  draw (state) {
    noStroke();
    fill(220);
    textSize(36);
    textAlign(LEFT, TOP);
    const stars = state.starsTotal ? `Estrellas ${state.starsCollected}/${state.starsTotal} · ` : '';
    text(`${stars}${state.time.toFixed(1)} s`, 30, 30);
    textAlign(LEFT, BASELINE);

    noStroke();
    fill(150);
    textSize(30);
    text(state.hintText, state.hintTextPos.x, state.hintTextPos.y);
  }
}

const WIN_BUTTON = { w: 260, h: 100, gap: 30 };

class WinPanel {

  constructor (viewWidth) {
    const rowWidth = 3 * WIN_BUTTON.w + 2 * WIN_BUTTON.gap;
    const x0 = (viewWidth - rowWidth) / 2;
    const step = WIN_BUTTON.w + WIN_BUTTON.gap;
    this.buttons = {
      replay: new Button(x0, 0, WIN_BUTTON.w, WIN_BUTTON.h, 'Replay'),
      menu:   new Button(x0 + step, 0, WIN_BUTTON.w, WIN_BUTTON.h, 'Menu'),
      next:   new Button(x0 + 2 * step, 0, WIN_BUTTON.w, WIN_BUTTON.h, 'Next'),
    };
  }

  layout (view, starsTotal) {
    let y = view.h / 2 - 325;
    y += 175;
    if (starsTotal > 0) y += 140;
    y += 75;
    y += 90;
    y += 90;
    for (const button of Object.values(this.buttons)) {
      button.y = y;
    }
  }

  draw (state, pointer) {
    const { view } = state;
    noStroke();
    fill(0, 0, 0, 170);
    rect(0, 0, view.w, view.h);

    const cx = view.w / 2;
    let y = view.h / 2 - 325;

    textAlign(CENTER, CENTER);
    fill(255);
    textSize(120);
    text('¡Ganaste!', cx, y);
    y += 175;

    const total = state.starsTotal;
    if (total > 0) {
      const size = 100;
      const gap = 35;
      const rowWidth = total * size + (total - 1) * gap;
      const x0 = cx - rowWidth / 2;
      strokeWeight(7);
      stroke(COLORS.star);
      for (let i = 0; i < total; i++) {
        if (i < state.starsCollected) fill(COLORS.star);
        else noFill();
        rect(x0 + i * (size + gap), y - size / 2, size, size, 15);
      }
      noStroke();
      y += 140;
    }

    fill(230);
    textSize(45);
    text(`Tiempo: ${state.time.toFixed(1)} s`, cx, y);
    y += 75;
    fill(200);
    textSize(38);
    text(`Estrellas: ${state.starBonus} · Bonus tiempo: ${state.timeBonus}`, cx, y);
    y += 90;
    fill(COLORS.star);
    textSize(65);
    text(`Puntaje: ${state.score}`, cx, y);
    textAlign(LEFT, BASELINE);

    for (const button of Object.values(this.buttons)) {
      button.draw(pointer.x, pointer.y);
    }
  }
}

class Banner {

  static draw (title, subtitle, view) {
    noStroke();
    fill(0, 0, 0, 160);
    rect(0, 0, view.w, view.h);

    textAlign(CENTER, CENTER);
    noStroke();
    fill(255);
    textSize(120);
    text(title, view.w / 2, view.h / 2 - 60);
    fill(200);
    textSize(40);
    text(subtitle, view.w / 2, view.h / 2 + 80);
    textAlign(LEFT, TOP);
  }
}
