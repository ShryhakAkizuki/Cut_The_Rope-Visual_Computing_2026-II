// Recortes (atlas) de la hoja char_animations_hd.png para Om Nom.
// Origen: OMNOM_SPRITES de Cut the Rope DX.
// Cada frame es un rectángulo { x, y, w, h } en píxeles absolutos del PNG; los frames
// están tal cual los usaba el juego, incluidos el ping-pong manual del idle y las
// repeticiones del frame final de eating.
const OMNOM_ANIMATION = {
  sheet: {
    src: 'assets/images/char_animations_hd.png',
    width: 2048,
    height: 2048,
  },

  // Estado que se muestra al crear la animación sin especificar uno.
  defaultState: 'idle',

  states: {
    // Reposo / respiración. El ping-pong está escrito a mano (el frame 0 y el
    // último son el mismo recorte).
    idle: {
      label: 'Idle (reposo / respiración)',
      fps: 12,
      loop: true,
      frames: [
        { x: 0, y: 133, w: 129, h: 133 },
        { x: 0, y: 266, w: 129, h: 133 },
        { x: 0, y: 399, w: 129, h: 133 },
        { x: 0, y: 532, w: 129, h: 133 },
        { x: 0, y: 665, w: 129, h: 135 },
        { x: 0, y: 800, w: 129, h: 137 },
        { x: 0, y: 937, w: 129, h: 139 },
        { x: 0, y: 1076, w: 129, h: 141 },
        { x: 0, y: 1217, w: 129, h: 143 },
        { x: 0, y: 1360, w: 129, h: 143 },
        { x: 0, y: 1503, w: 129, h: 143 },
        { x: 0, y: 1646, w: 129, h: 144 },
        { x: 0, y: 1790, w: 129, h: 144 },
        // --- vuelta (misma secuencia en orden inverso) ---
        { x: 0, y: 1646, w: 129, h: 144 },
        { x: 0, y: 1503, w: 129, h: 143 },
        { x: 0, y: 1360, w: 129, h: 143 },
        { x: 0, y: 1217, w: 129, h: 143 },
        { x: 0, y: 1076, w: 129, h: 141 },
        { x: 0, y: 937, w: 129, h: 139 },
        { x: 0, y: 800, w: 129, h: 137 },
        { x: 0, y: 665, w: 129, h: 135 },
        { x: 0, y: 532, w: 129, h: 133 },
        { x: 0, y: 399, w: 129, h: 133 },
        { x: 0, y: 266, w: 129, h: 133 },
        { x: 0, y: 133, w: 129, h: 133 },
      ],
    },

    // Abre la boca cuando el dulce entra en el radio de detección. No es cíclica:
    // al terminar se queda en el último frame (boca abierta).
    openMouth: {
      label: 'Open mouth (detecta el dulce)',
      fps: 16,
      loop: false,
      frames: [
        { x: 129, y: 272, w: 132, h: 145 },
        { x: 129, y: 417, w: 130, h: 137 },
        { x: 129, y: 554, w: 129, h: 135 },
        { x: 129, y: 689, w: 129, h: 133 },
        { x: 129, y: 822, w: 129, h: 130 },
        { x: 129, y: 952, w: 129, h: 128 },
        { x: 129, y: 1080, w: 129, h: 128 },
        { x: 129, y: 1208, w: 129, h: 128 },
        { x: 129, y: 1336, w: 129, h: 128 },
        { x: 129, y: 1464, w: 129, h: 133 },
      ],
    },

    // Cierra la boca y mastica. No es cíclica: los últimos frames están repetidos
    // a propósito para dejar fijo el gesto final.
    eating: {
      label: 'Eating (mastica el dulce)',
      fps: 8,
      loop: false,
      frames: [
        { x: 129, y: 1597, w: 129, h: 139 },
        { x: 129, y: 1736, w: 131, h: 124 },
        { x: 129, y: 1860, w: 131, h: 131 },
        { x: 262, y: 406, w: 129, h: 137 },
        { x: 262, y: 543, w: 129, h: 142 },
        { x: 262, y: 685, w: 129, h: 143 },
        { x: 262, y: 828, w: 131, h: 142 },
        { x: 129, y: 1860, w: 131, h: 131 },
        { x: 262, y: 406, w: 129, h: 137 },
        { x: 262, y: 543, w: 129, h: 142 },
        { x: 262, y: 685, w: 129, h: 143 },
        { x: 262, y: 828, w: 131, h: 142 },
        { x: 129, y: 1860, w: 131, h: 131 },
        { x: 262, y: 406, w: 129, h: 137 },
        { x: 262, y: 543, w: 129, h: 142 },
        { x: 262, y: 685, w: 129, h: 143 },
        { x: 262, y: 828, w: 131, h: 142 },
        { x: 262, y: 970, w: 133, h: 134 },
        // --- frame final repetido ---
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
        { x: 262, y: 1104, w: 127, h: 149 },
      ],
    },
  },
};
