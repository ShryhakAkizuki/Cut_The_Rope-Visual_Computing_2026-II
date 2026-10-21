// Menú de niveles de la caja como en DX (MenuController.CreateLevelSelect y
// CreateButtonForLevelPack): tapa de la caja de fondo, cuadrícula de 5 columnas con el cuadro 0
// de menu_level_ui (o el 1 con candado), el número con BigFont y la insignia de estrellas
// (cuadros 2 a 5 según las estrellas obtenidas). Arriba a la derecha, el total de estrellas.
class LevelMenu {

  // Centro de la casilla `i` y su área de clic, con las filas centradas como el HBox/VBox de DX.
  cellRect (i, count) {
    const m = UI_T;
    const cols = m.levelColumns;
    const rows = Math.ceil(count / cols);
    const stepX = m.levelTile + m.levelGapX;
    const stepY = m.levelRowHeight + m.levelGapY;
    const gridH = rows * m.levelRowHeight + (rows - 1) * m.levelGapY;
    const top = (VIEW.h - gridH) / 2;

    const row = Math.floor(i / cols);
    const col = i % cols;
    const inRow = Math.min(cols, count - row * cols);
    const rowW = inRow * m.levelTile + (inRow - 1) * m.levelGapX;
    const cx = (VIEW.w - rowW) / 2 + col * stepX + m.levelTile / 2;
    const cy = top + row * stepY + m.levelRowHeight / 2;

    // Área táctil de DX: el cuadro de 218 recortado 5 px por cada lado en horizontal.
    const w = m.levelTile - 10;
    const h = m.levelRowHeight;
    return { cx, cy, x: cx - w / 2, y: cy - h / 2, w, h };
  }

  levelAt (px, py, count) {
    for (let i = 0; i < count; i++) {
      const r = this.cellRect(i, count);
      if (pointInRect(px, py, r.x, r.y, r.w, r.h)) return i;
    }
    return -1;
  }

  draw (levels, progress, isUnlocked, view, pointer) {
    drawBoxCover(UI_T.coverDim);

    const count = levels.length;
    for (let i = 0; i < count; i++) {
      const r = this.cellRect(i, count);
      const unlocked = isUnlocked(i);
      const hover = unlocked && pointInRect(pointer.x, pointer.y, r.x, r.y, r.w, r.h);

      push();
      translate(r.cx, r.cy);
      if (hover) scale(UI_T.levelHoverScale);
      if (unlocked) {
        Sprites.draw('menu_level_ui', 0, 0, 0);
        Fonts.draw('big', String(i + 1), 0, -5);
        const stars = Math.max(0, Math.min(3, progress.bestStars[i] || 0));
        Sprites.draw('menu_level_ui', 2 + stars, 0, 0);
      } else {
        Sprites.draw('menu_level_ui', 1, 0, 0);
      }
      pop();
    }

    this.drawStarCounter(progress.totalStars(), progress.maxStars());
  }

  // "obtenidas/posibles" con una estrella al lado (CreateTextWithStar: BigFont a 0.7).
  drawStarCounter (got, max) {
    const textScale = 0.7;
    const starScale = 0.4;
    const star = Sprites.quadSize('menu_results', 13);
    const right = VIEW.w - 30;
    const cy = 100;
    const starW = star.w * starScale;

    push();
    translate(right - starW / 2, cy);
    scale(starScale);
    Sprites.drawCentered('menu_results', 13, 0, 0);
    pop();
    Fonts.draw('big', `${got}/${max}`, right - starW - 10, cy, { align: 'right', scale: textScale });
  }
}
