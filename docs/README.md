# Documentación

Documentación de la versión final de *Cut the Rope — Visual Computing 2026-II*, la recreación del juego en el navegador con p5.js y JavaScript plano. El juego se publica como sitio estático en GitHub Pages; esta documentación solo vive en el repositorio.

## Índice

| # | Documento | Qué contiene |
|---|---|---|
| 1 | [Arquitectura](01-arquitectura.md) | Visión general: librerías, estados del juego, piezas de código, game loop, cámara, entrada, progreso y puntaje |
| 2 | [Física y mecánicas](02-fisica.md) | Modelo Verlet, cuerdas y corte, cuerdas automáticas, burbujas, estrellas, púas y movimiento |
| 3 | [Niveles](03-niveles.md) | Formato de datos de `LEVELS`, sistema de coordenadas, mecánicas de la Caja 1 y cómo agregar un nivel |
| 4 | [Sonido](04-sonido.md) | Arquitectura Web Audio: carga, canales, música, desbloqueo, visibilidad y silencio |
| 5 | [Assets](05-assets.md) | Hojas de sprite y atlas, fuentes, sonidos y su origen |
| 6 | [Desarrollo](06-desarrollo.md) | Correr en local, linter, despliegue a GitHub Pages y guías para extender el juego |

## Convenciones de los documentos

- Los enlaces a archivos usan rutas relativas desde `docs/` (p. ej. [`../src/core/game.js`](../src/core/game.js)).
- Los valores numéricos de física, audio y UI citan la constante correspondiente en [`src/data/config.js`](../src/data/config.js) para que la documentación no se desincronice del código.
- Los diagramas usan Mermaid; se ven renderizados en GitHub y en VS Code.
