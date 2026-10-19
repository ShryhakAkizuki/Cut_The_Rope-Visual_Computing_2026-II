function drawStarShape (x, y, outer, filled) {
  const inner = outer * 0.45;
  if (filled) {
    noStroke();
    fill(COLORS.star);
  } else {
    noFill();
    stroke(COLORS.star);
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

function pointInRect (px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}
