const LEVEL_MENU = {
  columns:  3,
  size:     90,
  gap:      24,
  top:      190,
  starsGap: 44,
};

class LevelMenu {

  cellRect (i) {
    const m = LEVEL_MENU;
    const rowWidth = m.columns * m.size + (m.columns - 1) * m.gap;
    const x0 = (width - rowWidth) / 2;
    const col = i % m.columns;
    const row = Math.floor(i / m.columns);
    return {
      x: x0 + col * (m.size + m.gap),
      y: m.top + row * (m.size + m.starsGap + m.gap),
      w: m.size,
      h: m.size,
    };
  }

  levelAt (px, py, count) {
    for (let i = 0; i < count; i++) {
      const r = this.cellRect(i);
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
    }
    return -1;
  }

  draw (levels, progress, isUnlocked) {
    textAlign(CENTER, CENTER);
    noStroke();
    fill(255);
    textSize(40);
    text('Niveles', width / 2, 110);

    for (let i = 0; i < levels.length; i++) {
      const r = this.cellRect(i);
      const unlocked = isUnlocked(i);
      const hover = unlocked && mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h;

      strokeWeight(3);
      stroke(unlocked ? 220 : 80);
      fill(!unlocked ? 25 : hover ? 80 : 45);
      rect(r.x, r.y, r.w, r.h, 12);

      noStroke();
      fill(unlocked ? 255 : 90);
      textSize(40);
      text(i + 1, r.x + r.w / 2, r.y + r.h / 2);

      const best = progress.bestStars[i];
      const starY = r.y + r.h + 22;
      for (let s = 0; s < 3; s++) {
        this.drawStar(r.x + r.w / 2 + (s - 1) * 28, starY, 11, s < best);
      }
    }

    textAlign(LEFT, BASELINE);
  }

  drawStar (x, y, outer, filled) {
    const inner = outer * 0.45;
    if (filled) {
      noStroke();
      fill(255, 220, 60);
    } else {
      noFill();
      stroke(255, 220, 60);
      strokeWeight(2);
    }
    beginShape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const angle = -HALF_PI + i * PI / 5;
      vertex(x + r * cos(angle), y + r * sin(angle));
    }
    endShape(CLOSE);
  }
}
