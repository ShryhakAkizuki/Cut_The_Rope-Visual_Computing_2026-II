function pointInRect (px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

// Tapa de la caja cerrada, fondo del menú de niveles y de los resultados (MenuController.
// CreateLevelSelect y LoadingView de DX): la mitad izquierda de bgr_01_cover termina en el
// centro y la derecha es la misma mitad girada 180°; encima, las dos tiras de cinta (cuadros
// 6 y 7 de menu_level_ui, a y = 80). `dim` oscurece la tapa (1 = sin cambio).
function drawBoxCover (dim = 1) {
  const half = Sprites.quadSize('bgr_01_cover', 0);
  const mid = VIEW.w / 2;

  push();
  tint(255 * dim);
  Sprites.drawQuad('bgr_01_cover', 0, mid - half.w, 0);
  translate(mid + half.w / 2, VIEW.h / 2);
  rotate(PI);
  translate(-(mid + half.w / 2), -VIEW.h / 2);
  Sprites.drawQuad('bgr_01_cover', 0, mid, 0.5);
  pop();

  for (const quad of [6, 7]) {
    const f = Sprites.frame('menu_level_ui', quad);
    Sprites.drawQuad('menu_level_ui', quad, f.ox + UI_T.designOffsetX, 80);
  }
}

// Velo oscuro sobre toda la vista.
function drawVeil (alpha) {
  noStroke();
  fill(0, 0, 0, alpha);
  rect(0, 0, VIEW.w, VIEW.h);
}
