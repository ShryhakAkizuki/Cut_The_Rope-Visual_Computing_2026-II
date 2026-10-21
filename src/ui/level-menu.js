const LEVEL_MENU = {
  columns:  5,
  size:     140,
  gap:      36,
  top:      220,
  starsGap: 56,
};

class LevelMenu {

  cellRect (i, view) {
    const m = LEVEL_MENU;
    const rowWidth = m.columns * m.size + (m.columns - 1) * m.gap;
    const x0 = (view.w - rowWidth) / 2;
    const col = i % m.columns;
    const row = Math.floor(i / m.columns);
    return {
      x: x0 + col * (m.size + m.gap),
      y: m.top + row * (m.size + m.starsGap + m.gap),
      w: m.size,
      h: m.size,
    };
  }

  levelAt (px, py, count, view) {
    for (let i = 0; i < count; i++) {
      const r = this.cellRect(i, view);
      if (pointInRect(px, py, r.x, r.y, r.w, r.h)) return i;
    }
    return -1;
  }

  draw (levels, progress, isUnlocked, view, pointer) {
    textAlign(CENTER, CENTER);
    noStroke();
    fill(255);
    textSize(100);
    text('Niveles', view.w / 2, 110);

    for (let i = 0; i < levels.length; i++) {
      const r = this.cellRect(i, view);
      const unlocked = isUnlocked(i);
      const hover = unlocked && pointInRect(pointer.x, pointer.y, r.x, r.y, r.w, r.h);

      strokeWeight(6);
      stroke(unlocked ? 220 : 80);
      fill(!unlocked ? 25 : hover ? 80 : 45);
      rect(r.x, r.y, r.w, r.h, 24);

      noStroke();
      fill(unlocked ? 255 : 90);
      textSize(64);
      text(i + 1, r.x + r.w / 2, r.y + r.h / 2);

      const best = progress.bestStars[i];
      const starY = r.y + r.h + 32;
      for (let s = 0; s < 3; s++) {
        drawStarShape(r.x + r.w / 2 + (s - 1) * 44, starY, 18, s < best);
      }
    }

    textAlign(LEFT, BASELINE);
  }

}
