# Niveles

Los 25 niveles de la Caja 1 están en [`src/data/levels.js`](../src/data/levels.js) como la constante `LEVELS`. Los textos de los tutoriales están en [`texts.js`](../src/data/texts.js).

## Coordenadas

El mapa del original se multiplica por 3 y se centra en una pantalla fija de 1920×1440. Para pasar un valor del original al juego:

```
x_juego = x · 3 + margen        margen = (1920 − anchoMapa · 3) / 2
y_juego = y · 3
largos, radios y tamaños        → · 3
```

La mayoría de mapas son angostos (320 de ancho) y quedan centrados con franjas a los lados; los niveles 2, 3, 10, 13, 17, 22 y 24 son anchos (640) y ocupan toda la pantalla. El nivel 15 es el único alto y usa la cámara vertical.

## Formato de un nivel

```js
{
  name: 'Nivel 1',
  map: { w: 960, h: 1440 },                // tamaño del mapa
  candy:   { x, y },
  omnom:   { x, y },
  anchors: [{ x, y, length }],             // cuerdas fijas
  autoAnchors: [{ x, y, radius, length }], // cuerdas automáticas
  stars:   [{ x, y }],
  bubbles: [{ x, y }],
  spikes:  [{ x, y, size, angle }],        // size de 1 a 4, angle en grados
  tutorials: [
    { type: 'text', x, y, text: 'TUTORIAL_LVL_1_1_01', width, duration },
    { type: 'sign', sign: 1, x, y, angle, duration },
  ],
}
```

- Solo `candy`, `omnom` y `anchors` son obligatorios; el resto es opcional.
- Estrellas y púas pueden moverse con un `path` (lista de desplazamientos respecto a su posición) y un `moveSpeed`.
- Los tutoriales pueden ser texto (`text` es una clave de `TEXTS`) o un cartel (`sign` es el número del dibujo). El dedo que desliza también tiene `path` y `moveSpeed`.
- Un tutorial puede aparecer solo en cierto momento con `showOn` e `inArea`.
- No hay tiempo por nivel: el bonus de puntaje siempre cuenta 30 s.


## Agregar un nivel

Basta con añadir un objeto más a `LEVELS`. El menú, el desbloqueo, el total de estrellas y el botón Siguiente se ajustan solos.

## Mecánicas de la Caja 1

| Mecánica | Niveles |
|---|---|
| Cuerda fija | todos menos el 19 |
| Cuerda automática | 10, 11, 12, 14, 15, 19, 20, 25 |
| Burbuja | 5, 6, 8, 9, 13, 14, 15, 19, 21, 22, 23, 25 |
| Púas | 16 a 20, 22, 23, 25 (las del 22 se mueven) |
| Estrella móvil | 24 |
| Tutorial | 1, 2, 5, 6, 8, 10, 12, 14, 16, 20 |

La Caja 1 no tiene cojines de aire, arañas, ruedas, ganchos móviles ni pistolas.

