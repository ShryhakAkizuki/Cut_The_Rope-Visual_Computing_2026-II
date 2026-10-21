# Plan de acción — Caja 1 (Cardboard Box)

Objetivo: replicar las funcionalidades básicas del primer mundo del juego original (sin copia 1 a 1), jugable en GitHub Pages.

**Convención:** `- [ ]` pendiente. Al terminar una tarea se marca y se tacha: `- [x] ~~tarea~~`. Si una tarea se descarta, se tacha sin marcar y se anota el motivo. Cuando el trabajo lo hacen agentes en paralelo, **las casillas las marca solo quien integra** (ver [Reglas para agentes](#reglas-para-agentes-en-paralelo)); los agentes no editan este archivo.

Catálogo de lo reutilizable del decomp (constantes, lógica, imágenes, sonido): [referencia-dx.md](referencia-dx.md).

Referencia: decomp en `/home/camilo/Work/cuttherope-dx` — mapas `content/maps/1_*.xml`, textos `content/locales/es.json`, atlas `content/images/*.json`, lógica `src/CutTheRopeDX.Core/GameMain/`, constantes `src/CutTheRopeDX.Core/Framework/PhysicsConstants.cs`.

---

## Estado actual

> Esta sección es lo primero que se lee al iniciar una sesión. Mantenerla al día cada vez que cambie la fase o se cierre una decisión.

- **Fase actual:** 0 — preparación (sin agentes en paralelo todavía).
- **Decisiones abiertas:** ninguna (D1, D2 y D3 cerradas el 2026-10-21).
- **Siguiente:** las tareas pendientes de la [Fase 0](#fase-0--preparación-secuencial) (esqueleto de integración ya hecho; toca el commit en `camilo`). Al terminar la fase 0 se pueden lanzar las 6 pistas de la [Fase 1](#fase-1--pistas-en-paralelo) en paralelo.
- **Bloqueos conocidos:** ninguno. Los assets del DX ya están extraídos en `/home/camilo/Work/cuttherope-dx/content/` (zip original en `/home/camilo/Work/ctrdx-assets-vk.zip`); las hojas de la Caja 1 ya están en `src/assets/images/` y se cargan con `Sprites` ([src/ui/sprites.js](../src/ui/sprites.js)). Sonidos y fuentes aún no se copian (pistas D y E).

---

## Decisiones abiertas

Hay que cerrarlas antes de la fase 0. Al cerrar una, anotar la opción elegida y la fecha, y actualizar las secciones que dependen de ella.

### D1. Mapas que no miden 320×480 — bloquea la §1 y el conversor

**Cerrada (2026-10-21): opción (a).** `VIEW = 1920×1440` (4:3) fijo, escalado a la ventana manteniendo la proporción. Los mapas de 320 se centran con `offsetX = 480` y los de 640 caben enteros (`offsetX = 0`). Solo el nivel 15 (960×2880) usa cámara: scroll vertical que sigue al dulce, con paneo inicial como el de DX (`StartCamera`). Se descarta el 2560×1440 de DX porque las franjas laterales de los niveles de 320 serían de 800 px en vez de 480 px.

Opciones evaluadas:

La decisión de la §1 (`VIEW = 960×1440`) supone que todos los mapas miden 320×480, pero no es así:

- **640×480** (×3 = 1920×1440): niveles **2, 3, 10, 13, 17, 22 y 24**.
- **320×960** (×3 = 960×2880): nivel **15**.

En el iPhone original esos niveles se recorrían con una cámara. En DX, como la pantalla mide 2560×1440, los de 640 caben enteros (`offsetX = (2560 − 1920) / 2 = 320`) y solo el 15 usa cámara vertical (`GameScene.LoadMetadata.cs:82-97`, `GameScene.Show.cs:189-196`).

Opciones:

- **(a)** `VIEW = 1920×1440` (4:3). Los mapas de 320 se centran con `offsetX = 480`; los de 640 caben enteros. El nivel 15 necesita cámara vertical o reducirse para caber.
- **(b)** Mantener `VIEW = 960×1440` y añadir una cámara horizontal que siga al dulce (como el original de iPhone), y vertical para el 15. Hoy la cámara está fuera de alcance ([referencia-dx.md §10](referencia-dx.md#10-lo-que-no-se-trae)).
- **(c)** Tamaño del canvas por nivel (`VIEW` = mapa × 3) escalado a la ventana. Los niveles de 640 se ven más pequeños, y el 15 queda muy estrecho.

### D2. Cuerda: un `Constraint` de Matter o cadena de puntos como en DX

**Cerrada (2026-10-21): se mantiene el `Constraint` de Matter.** La cuerda sigue simulándose en Matter, con el patrón actual de `rope.js`. La pista B (autocuerdas, cuerda roja, colores alternados) y el ajuste de la §5 se hacen sobre eso; no se porta la cadena de puntos de `Bungee.cs`.

### D3. Textos del tutorial: dedo o ratón

**Cerrada (2026-10-21): se adaptan los textos al ratón** ("arrastra el ratón", "haz clic"). No se recupera el soporte táctil; se revisarán los textos si más adelante se añade la versión táctil. El dedo animado (solo en el nivel 1 en la capa `Es`) se conserva como gesto de arrastre.

Contexto: los textos del DX hablan de "deslizar el dedo" y "tocar", y hoy solo hay ratón y teclado. Afecta a la pista A (genera `texts.js`), a la pista F y a la §7.

---

## Fases y ejecución en paralelo

### Fase 0 — preparación (secuencial)

Una sola sesión, sin agentes en paralelo: todo lo que sigue cambia archivos que luego tocarían todas las pistas.

- [x] ~~Cerrar D1, D2 y D3~~ (cerradas el 2026-10-21)
- [x] ~~Descargar `ctrdx-assets-vk.zip` fuera del repo~~ (hecho 2026-10-21: extraído sobre `/home/camilo/Work/cuttherope-dx/content/`, zip en `/home/camilo/Work/`) — [referencia-dx.md §1](referencia-dx.md#1-cómo-conseguir-el-contenido-del-dx)
- [x] ~~Sección 1 completa (coordenadas y escala, según D1)~~ (comprobada por el usuario el 2026-10-21)
- [x] ~~Confirmar el [formato de `LEVELS`](#formato-de-levels) (con los ajustes que dicte D1) y quitar la palabra "borrador"~~ (2026-10-21: se añaden `path`/`moveSpeed` de estrellas y púas, `showOn`/`inArea` de tutoriales y la lista de atributos ignorados)
- [x] ~~Copiar a `src/assets/` las hojas de la Caja 1 y sus atlas, y crear la utilidad de sprites con la carga en `preload()` (primeras tareas de la §8)~~ (2026-10-21)
- [x] ~~Esqueleto de integración, para que las pistas no choquen:~~ (2026-10-21)
  - [x] ~~Crear vacíos los archivos nuevos de cada pista (tabla de abajo) y agregarlos ya al bloque de `<script>` de `index.html` en su posición~~ (`AutoAnchor`, `Spikes` y `Tutorial` quedan como clases con métodos vacíos para que `Level` pueda construirlas; `mover.js` y `audio.js` solo llevan cabecera; `texts.js` declara `TEXTS = {}`)
  - [x] ~~En `config.js`, un bloque de constantes vacío y con nombre por pista (`AUTO_ROPE_T`, `SPIKES_T`, `AUDIO_T`, `TUTORIAL_T`)~~
  - [x] ~~En `Level.build`, un bucle por cada arreglo nuevo de `LEVELS` (`autoAnchors`, `spikes`, `tutorials`) que llame a un constructor de la pista correspondiente~~ (también se dibujan en `Level.draw`; `Star` ya recibe `path` y `moveSpeed`; los bodies `null` se filtran al añadirlos al mundo)
  - [x] ~~En `Game` (`collisionStart` y `update`), un bloque comentado por pista (`// [púas]`, `// [autocuerdas]`, …) donde cada pista escribe su reacción~~ (labels reservados: `autoAnchor` y `spikes`; getters `autoAnchors`, `spikes` y `tutorials`; `update` ya llama a `Tutorial.update(dt)`)
- [ ] Commit en la rama base de integración (hoy `camilo`); de ahí salen las ramas de las pistas
- [ ] Actualizar "Estado actual": fase 1

### Fase 1 — pistas en paralelo

Cada pista es un agente en su propio worktree y rama (`caja1/<letra>-<nombre>`, p. ej. `caja1/c-puas`). La columna "Archivos propios" es lo que cada pista puede cambiar libremente; fuera de eso, solo su bloque marcado del esqueleto.

| Pista | Qué hace | Secciones | Archivos propios |
|---|---|---|---|
| **A. Niveles** | Script de conversión y los 25 niveles en `LEVELS`; textos en español | §6 (tarea previa), textos de §7 | `tools/`, `src/data/levels.js`, `src/data/texts.js` (nuevo) |
| **B. Cuerdas** | Autocuerdas, cuerda roja, colores alternados de la cuerda; cadena de puntos si D2 lo decide | §2, §4, "Colores de la cuerda" de §11 | `src/entities/rope.js`, `src/entities/anchor.js`, `src/entities/auto-anchor.js` (nuevo) |
| **C. Púas** | Púas, dulce roto y objetos que se mueven por `path` (púas del nivel 22, estrella del 24) | §3 | `src/entities/spikes.js` (nuevo), `src/entities/mover.js` (nuevo), dibujo de dulce roto en `src/entities/candy.js`, movimiento en `src/entities/star.js` |
| **D. Sonido** | Módulo de audio con API `Sound.play(nombre)`, música, silencio y desbloqueo con el primer clic. **Sin conectar eventos** (eso es fase 2) | Sonido de §11 | `src/core/audio.js` (nuevo), `src/assets/sounds/` |
| **E. UI** | HUD, pausa, menú de niveles, resultados, pantalla de carga y puntaje como DX | §6 (puntaje y menú 5×5), sprites de UI de §8, §9, §10 | `src/ui/`, `src/core/rules.js`, `src/core/progress.js` |
| **F. Tutoriales** | Infraestructura de tutoriales (texto, signos, dedo animado, fades) | §7 (infraestructura) | `src/ui/tutorial.js` (nuevo) |

Orden de integración en la rama base: **A → C → B → F → E → D**. A va primero porque las demás se prueban con los niveles reales.

### Fase 2 — integración (secuencial o 2–3 agentes con archivos separados)

- [ ] Sprites de las entidades que no tienen pista: fondo, dulce, Om Nom y soporte, estrellas, burbujas (§8)
- [ ] Ajuste de física (§5), con los 25 niveles ya cargados
- [ ] Contenido de los tutoriales por nivel (§7)
- [ ] Conectar los eventos de sonido (§11)
- [ ] Estela del corte y pantalla de resultados animada (§11)
- [ ] Comprobar los 25 niveles con 3 estrellas (tabla de la §6)
- [ ] Documentación y entrega (§12)

### Reglas para agentes en paralelo

- Cada agente trabaja en su worktree y rama, y solo cambia sus archivos propios y su bloque marcado del esqueleto (`index.html`, `config.js`, `Level.build`, `Game`). Si necesita algo fuera de eso, lo pide en su informe final en lugar de hacerlo.
- No editar `docs/plan-caja1.md`. El informe final lista qué tareas del plan quedaron hechas; quien integra las marca al juntar la rama.
- Comprobación mínima antes de terminar:
  - `node --check` sobre cada `.js` cambiado (detecta errores de sintaxis sin navegador)
  - El sitio carga con `python3 -m http.server 8000 -d src`
  - Indicar qué nivel y qué acción sirven para probar el cambio a mano
- La comprobación visual (que se vea y se sienta bien) la hace el usuario al integrar.
- Respetar `CLAUDE.md`: comentarios y textos en español, identificadores en inglés, sin módulos.

---

## Formato de `LEVELS`

**Confirmado (2026-10-21)**, revisado contra las capas `Objects` y `Es` de los 25 mapas y los cargadores de DX (`LoadObjects/`, `Mover.cs`, `Tutorials/`). Coordenadas ya convertidas al espacio de `VIEW` (×3 y `offsetX = (1920 − anchoMapa × 3) / 2`, según D1: 480 para mapas de 320, 0 para los de 640; el nivel 15 mide 960×2880 y usa cámara vertical). El conversor de la pista A genera esto; las pistas B, C y F lo consumen.

```js
{
  name: 'Nivel 1',
  map: { w: 960, h: 1440 },          // tamaño del mapa ×3 (para el centrado, la cámara y el borde de derrota)
  candy:   { x, y },                  // radio en config.js, ya no por nivel
  omnom:   { x, y },                  // `target` en el XML
  anchors: [{ x, y, length }],        // `grab` con radius="-1"
  autoAnchors: [{ x, y, radius, length }], // `grab` con radius > 0 (pista B)
  stars:   [{ x, y, path, moveSpeed }],    // en la Caja 1 ninguna tiene tiempo (timeout -1 o 0); path solo en el nivel 24
  bubbles: [{ x, y }],
  spikes:  [{ x, y, size, angle, path, moveSpeed }], // `spike1`–`spike4`; size 1–4, angle en grados; path solo en el nivel 22 (pista C)
  tutorials: [                        // solo los nodos con locale="es" (pista F)
    { type: 'text', x, y, text: 'TUTORIAL_LVL_1_1_01', width, duration },
    { type: 'sign', sign: 1, x, y, angle, duration },             // tutorialNN → cuadro NN de tutorial_signs
    { type: 'sign', sign: 10, x, y, angle, path: [230, 0, 440, 0],
      moveSpeed, ease, moveDelay, repeat, fadeIn, fadeOut, duration }, // tutorial10 = dedo que desliza
    { type: 'sign', sign: 5, x, y, showOn: 'bubbled', inArea: { x, y, w, h } }, // disparador (nivel 5)
  ],
}
```

- Se elimina `time` (el límite es siempre 30 s, como en DX). Hasta que la pista E lo quite, `Game` usa `TUNING.defaultLevelTime` cuando falta.
- Los campos opcionales que falten en el XML se omiten; el código usa los valores por defecto de DX.
- `text` es la clave de `content/locales/es.json`; las cadenas van en `src/data/texts.js` (`TEXTS`).
- `width` del texto se multiplica por 3 igual que las coordenadas. `inArea` (`"x,y,w,h"` en el XML) se convierte como coordenadas: `x`/`y` ×3 + offset, `w`/`h` ×3.
- **`path` de objetos (estrellas y púas)**: offsets `[dx, dy, …]` respecto a `x, y`, ya ×3 (`MoverPathScale = 3`); se quita la coma final del XML. Como en `Mover.cs`, el objeto recorre en ciclo el punto inicial y los del `path` (con un solo offset va y vuelve). `moveSpeed` se guarda tal cual; la velocidad en px/s de `VIEW` es `moveSpeed × 3,3` (`DesktopMoverSpeedScale`, modelo de PC).
- **`path` del dedo (`tutorial10`)**: offsets que **no** se escalan (DX los usa ya en espacio ×3, `TutorialMotion.cs`), igual que su `moveSpeed`.
- `showOn` (por defecto `start`) e `inArea` solo aparecen en el nivel 5 (`showOn="bubbled"`: el tutorial sale cuando el dulce queda en una burbuja dentro del área).
- Se ignoran porque en la Caja 1 siempre tienen el valor neutro: `wheel`, `gun`, `spider`, `moveLength` (−1 o 0), `moveVertical`, `moveOffset`, `part`, `hidePath` de `grab`; `toggled="false"` de las púas; `moveSpeed`/`rotateSpeed` de los signos sin `path`; y la capa `settings` salvo el tamaño (`ropePhysicsSpeed` = 1, `twoParts` = false).

---

## 0. Base ya implementada (MVP)

- [x] ~~Game loop p5 + Matter con paso fijo 1000/60 y `deltaTime` acotado~~
- [x] ~~Máquina de estados `MENU` / `PLAYING` / `PAUSED` / `WIN` / `LOSE`~~
- [x] ~~Cuerda fija con `length` (holgura, Bézier, `stiffness` 0 cuando está floja)~~
- [x] ~~Corte por arrastre del ratón, incluyendo varias cuerdas en un mismo trazo~~
- [x] ~~Trozos de cuerda cortada que se desvanecen~~
- [x] ~~Estrellas (sensor, se procesan antes que OmNom)~~
- [x] ~~Burbuja: captura, flotación y reventado con clic~~
- [x] ~~Victoria al tocar OmNom; derrota al salir el dulce de la pantalla~~
- [x] ~~Puntaje (estrellas + bonus de tiempo) y panel de victoria con Replay / Menu / Next~~
- [x] ~~Menú de niveles con desbloqueo y progreso en `localStorage`~~
- [x] ~~Pausa con P, reinicio con R y botón Reiniciar; auto-pausa al ocultar la pestaña~~

---

## 1. Coordenadas y escala

**Fase 0.** **Decisión (2026-10-20): usar el espacio de la versión DX (mapa ×3).** Revisada con **D1** el 2026-10-21: `VIEW` fijo de 1920×1440, con franjas laterales en los mapas de 320 y cámara solo en el nivel 15.

Cómo lo hace DX:

- `GameScene.Show.cs:26` fija `mapScale = 3`: el mapa de 320×480 pasa a 960×1440.
- `GameScene.LoadMetadata.cs:82-97` lo centra en la pantalla de diseño de 2560×1440 (`ViewportLayout.cs:14-19`) con `offsetX = (2560 − anchoMapa × 3) / 2` (800 para 320, 320 para 640) y `offsetY = 0`.
- `LoadGrabs.cs:25-27` convierte cada objeto con `x * 3 + offsetX`, `y * 3` y `length * 3`. `LoadGrabs.cs:99-101` también multiplica por 3 el `radius` de las autocuerdas (cuando no es −1).
- La física y las colisiones trabajan en ese espacio ya escalado.

Lo que haremos nosotros (D1, opción a):

- `VIEW = 1920×1440` (4:3), fijo para todos los niveles. No usamos el lienzo de 2560 de DX.
- Conversión mapa → juego: `x * 3 + offsetX`, `y * 3`, `length * 3`, `radius * 3`, con `offsetX = (1920 − anchoMapa × 3) / 2` (480 para mapas de 320, 0 para los de 640). `angle` no cambia, y `size` de las púas es un índice de tipo (1–4), no una medida.
- Las franjas laterales de los mapas de 320 se rellenan con el fondo de la caja.
- El nivel 15 (960×2880) usa cámara vertical que sigue al dulce, con paneo inicial como `StartCamera` de DX. El resto de los niveles no tienen cámara.
- El canvas se escala para caber en la ventana manteniendo la proporción; la lógica siempre trabaja en coordenadas de `VIEW`.
- Los 4 niveles de prueba actuales no se migran: se reemplazan por los niveles portados (sección 6).

Tareas:

- [x] ~~Elegir la transformación mapa → `VIEW`~~ (decisión: ×3 con `VIEW` 960×1440)
- [x] ~~Revisar la decisión anterior según D1 (mapas de 640×480 y 320×960)~~ (D1 cerrada el 2026-10-21)
- [x] ~~`config.js`: cambiar `VIEW` a 1920×1440 y añadir `MAP_SCALE = 3`~~
- [x] ~~Cámara vertical para el nivel 15 (seguimiento del dulce, límites del mapa y paneo inicial); conversión del ratón a coordenadas del mundo solo en ese nivel~~ (`core/camera.js`: paneo con aceleración/frenado de `UpdateCameraTracking`, un clic lo acelera, el reloj no corre durante el paneo; con mapas de alto ≤ 1440 la cámara queda fija en 0)
- [x] ~~`main.js`: escalar el canvas para que quepa en la ventana (CSS o `resizeCanvas` + factor) y comprobar que `mouseX`/`mouseY` siguen llegando en coordenadas de `VIEW`~~ (`resizeCanvas` + `viewScale`; `toView()` convierte el ratón)
- [x] ~~Reescalar los tamaños fijos para 390×844: `BUBBLE_RADIUS`, radios del dulce y de OmNom, radios de estrella y ancla en `entities/`, grosor de la cuerda~~ (constantes en `config.js` tomadas de `GameScene.BoundingBoxes.cs`, `STAR_RADIUS` y `Bungee.lineWidth`)
- [x] ~~Reubicar la UI: botón Reiniciar (`game.js:13`), `Hud`/`WinPanel`/`Banner` (`ui/overlays.js`), cuadrícula del menú (`ui/level-menu.js`) y tamaños de texto~~ (escala ×2,5 y menú de 5 columnas; el diseño final es de la pista E)
- [x] ~~Gravedad: averiguar en qué espacio está `GravityEarthY = 784` (comentario "9.8 * 80") y calibrar `engine.gravity` para que la caída se sienta como el original~~ (en los mapas de la Caja 1 DX usa el modelo de PC, así que 784 px/s² ya están en el espacio ×3; en Matter equivale a `gravity.y = 0.784`)
- [x] ~~Borde de derrota: usar el tamaño del mapa (`LEVELS[i].map`), no el de `VIEW`, en `isOffscreen` (DX: `GameScene.cs:63-64`)~~ (`Candy.isOutOfMap`, márgenes de 400 arriba y abajo)
- [x] ~~Actualizar `CLAUDE.md` y `docs/arquitectura-mvp.md` cuando `VIEW` cambie en el código~~ (`CLAUDE.md` hecho; `arquitectura-mvp.md` no se actualiza, por decisión del usuario el 2026-10-21)

Mientras la pista A no genere los 25 niveles, `levels.js` trae los mapas 1, 2, 5 y 15 convertidos a mano.

## 2. Cuerdas automáticas (`grab` con `radius` de 45 a 80)

**Pista B.** Referencia: `AutoRadiusSource.cs`, `Grab.cs`. Niveles: 10, 11, 12, 14, 15, 19, 20, 25.

- [ ] Leer `autoAnchors` del [formato de `LEVELS`](#formato-de-levels) (radio de detección y `length` de la cuerda que creará)
- [ ] Entidad `AutoAnchor` (`entities/auto-anchor.js`): círculo de radio visible alrededor del ancla
- [ ] Detección de entrada del dulce al radio (sensor circular con `label` propio o chequeo de distancia en `Game.update()`)
- [ ] Al entrar: crear la cuerda ancla→dulce con la misma lógica de `Rope` (tensión, corte, trozos)
- [ ] Un solo uso: tras unirse, el círculo se desvanece (alpha decreciente por segundo) y el ancla ya no puede volver a unirse
- [ ] Que una cuerda automática se pueda cortar igual que una fija
- [ ] Verificar que `restart()` deja el ancla automática otra vez disponible

## 3. Púas (`spike1`–`spike4`)

**Pista C.** Referencia: `Spikes.cs` (sin botón de rotación ni electrodos), `Framework/Helpers/Mover.cs`. Niveles: 16, 17, 18, 19, 20, 22, 23, 25.

- [ ] Leer `spikes` del [formato de `LEVELS`](#formato-de-levels): `{ x, y, size: 1..4, angle, path?, moveSpeed? }` con `angle` en grados (los mapas usan 0, 90, 80 y 100)
- [ ] Largo de la barra según `size` (`SpikesQuadWidths` = 212 / 333 / 453 / 566; semialto 5)
- [ ] Entidad `Spikes` en `entities/spikes.js`: body sensor estático rectangular rotado, `label: 'spikes'`
- [ ] Dibujo de la barra de púas en p5 (sprite `obj_spikes`)
- [ ] En `collisionStart`: dulce + púas → destruir el dulce y pasar a `LOSE`
- [ ] Efecto mínimo de dulce roto (`CandyBreak.cs`: trozos que giran y caen con `CandyBreakGravityY`) antes del banner de derrota
- [ ] Las cuerdas y los trozos de cuerda no deben colisionar con las púas
- [ ] `Mover` (`entities/mover.js`): recorrido cíclico por el punto inicial y los offsets de `path` a `moveSpeed × 3,3` px/s, como `Mover.Update`; mueve el body con `Body.setPosition` en `Game.update()`
- [ ] Púas móviles del nivel 22 (`path="±66,100,"`, `moveSpeed="30"`)
- [ ] Estrella móvil del nivel 24 (`path="0,100"`, `moveSpeed="40"`) en `entities/star.js`

## 4. Cuerda roja bajo tensión

**Pista B.** Referencia: `Bungee.cs` (`BungeeStretchRedThreshold = 7`). Lo presenta el tutorial del nivel 12.

- [ ] Medir el estiramiento de cada cuerda (distancia actual − `length`)
- [ ] Interpolar el color de la cuerda hacia rojo cuando supera el umbral

## 5. Ajuste de física al original

**Fase 2** (necesita los 25 niveles cargados para comparar).

- [ ] Burbuja: pasar de fuerza constante + `frictionAir` a impulso hacia arriba con amortiguación (`BubbleImpulseY = -40`, `BubbleImpulseDamping = 14`)
- [ ] Revisar que la burbuja capture al dulce al tocarla (`BubbleCaptureRadius`) y no solo por colisión exacta
- [ ] Calibrar `stiffness`/`damping` de las cuerdas para que el balanceo se parezca al original

## 6. Los 25 niveles

**Pista A** (conversión) y **pista E** (puntaje y menú).

Tarea previa:

- [ ] Script de conversión fuera de `src/` (`tools/convert-maps.py`) que lea `content/maps/1_N.xml`:
  - Objetos de la capa `Objects`; tutoriales solo con `locale="es"` (están en la capa `Es`)
  - Tamaño del mapa de `<map width height>` en la capa `settings`
  - Aplica la transformación de la §1 (según D1) y genera `src/data/levels.js` con el [formato de `LEVELS`](#formato-de-levels)
  - Genera `src/data/texts.js` con las claves de `es.json` que usan los niveles
- [ ] Reemplazar los 4 niveles de prueba actuales por los niveles portados

Cada nivel se marca cuando está portado **y** se comprobó que se puede ganar con 3 estrellas.

| ✓ | Nivel | Mapa | Cuerdas fijas | Autocuerdas | Burbujas | Púas | Tutorial |
|---|---|---|---|---|---|---|---|
| [ ] | 1  | 320×480 | 1 | – | – | – | sí |
| [ ] | 2  | **640×480** | 3 | – | – | – | sí |
| [ ] | 3  | **640×480** | 3 | – | – | – | – |
| [ ] | 4  | 320×480 | 4 | – | – | – | – |
| [ ] | 5  | 320×480 | 2 | – | 1 | – | sí |
| [ ] | 6  | 320×480 | 1 | – | 1 | – | sí |
| [ ] | 7  | 320×480 | 6 | – | – | – | – |
| [ ] | 8  | 320×480 | 2 | – | 1 | – | sí |
| [ ] | 9  | 320×480 | 3 | – | 1 | – | – |
| [ ] | 10 | **640×480** | 1 | 3 | – | – | sí |
| [ ] | 11 | 320×480 | 3 | 4 | – | – | – |
| [ ] | 12 | 320×480 | 2 | 2 | – | – | sí |
| [ ] | 13 | **640×480** | 2 | – | 3 | – | – |
| [ ] | 14 | 320×480 | 1 | 1 | 2 | – | sí |
| [ ] | 15 | **320×960** | 1 | 5 | 1 | – | – |
| [ ] | 16 | 320×480 | 4 | – | – | 2 | sí |
| [ ] | 17 | **640×480** | 4 | – | – | 2 | – |
| [ ] | 18 | 320×480 | 5 | – | – | 2 | – |
| [ ] | 19 | 320×480 | – | 2 | 1 | 2 | – |
| [ ] | 20 | 320×480 | 2 | 2 | – | 2 (80°/100°) | sí |
| [ ] | 21 | 320×480 | 4 | – | 2 | – | – |
| [ ] | 22 | **640×480** | 3 | – | 2 | 2 (móviles) | – |
| [ ] | 23 | 320×480 | 6 | – | 1 | 2 | – |
| [ ] | 24 | **640×480** | 3 | – | – | – | – |

Objetos con `path`: las dos púas del nivel 22 y una estrella del nivel 24 (pista C).
| [ ] | 25 | 320×480 | 2 | 4 | 1 | 2 | – |

- [ ] Puntaje como en DX (`LevelResult.cs`): límite fijo de 30 s para todos los niveles (quitar `time` por nivel) y redondear el total hacia arriba en lugar del bonus de tiempo a múltiplos de 10 — **pista E**
- [ ] Verificar que el menú de niveles cabe y se ve bien con 25 niveles (cuadrícula 5×5) — **pista E**

## 7. Tutoriales

**Pista F** (infraestructura) y **fase 2** (contenido por nivel). Textos en `content/locales/es.json` (los pasa a `src/data/texts.js` la pista A); los signos (`tutorial01`…`tutorial10`) son cuadros de la hoja `tutorial_signs` del DX. Comportamiento (tiempos, recorrido del dedo, disparadores) en `GameMain/Tutorials/` del decomp.

Infraestructura (pista F):

- [ ] Leer `tutorials` del [formato de `LEVELS`](#formato-de-levels)
- [ ] Overlay `Tutorial` (`ui/tutorial.js`) que dibuja texto con ajuste de línea (`width`) y signos
- [ ] Aparición/desaparición con fade y `duration`
- [ ] Disparador `showOn: 'bubbled'` + `inArea` (nivel 5: el tutorial sale cuando el dulce queda en una burbuja dentro del área); sin `showOn`, al empezar el nivel
- [ ] Animación del dedo que desliza (`tutorial10`: `path`, `moveSpeed`, `moveDelay`, `repeat`, `fadeIn`/`fadeOut`)
- [ ] Ocultar tutoriales al ganar/perder y reiniciarlos con `restart()`

Contenido por nivel (fase 2):

- [ ] Nivel 1 — "Desliza el dedo para cortar la cuerda." / "Haz llegar el caramelo hasta Om Nom." + dedo deslizando + flechas
- [ ] Nivel 2 — "Consigue tantas estrellas como puedas."
- [ ] Nivel 5 — "Haz estallar la burbuja con el dedo" / "Las burbujas hacen que el caramelo se eleve."
- [ ] Nivel 6 — "No dejes que el caramelo se salga de la caja."
- [ ] Nivel 8 — "Puedes reiniciar el nivel tocando el botón" (señalando el botón Reiniciar)
- [ ] Nivel 10 — "Las autocuerdas aparecen cuando el caramelo se acerca a ellas."
- [ ] Nivel 12 — "Las cuerdas se ponen rojas cuando están muy tensas."
- [ ] Nivel 14 — "Puedes saltar el nivel desde el menú de pausa" (solo existe en `en.json`; depende del botón Saltar de la sección 10)
- [ ] Nivel 16 — "¡Mantén el caramelo alejado de los pinchos!"
- [ ] Nivel 20 — "Puedes cortar varias cuerdas a la vez." + fila de 5 flechas (`tutorial01`; en la capa `Es` no hay dedo animado, solo en el nivel 1)
- [ ] Adaptar los textos de "dedo"/"tocando" al ratón (D3: "arrastra el ratón", "haz clic"); la pista A los deja ya adaptados en `texts.js`

## 8. Gráficos con las hojas del DX

Sprites estáticos; las animaciones de personaje quedan fuera de alcance. Hojas, formato de los atlas y cómo dibujarlos en p5: [referencia-dx.md §7](referencia-dx.md#7-imágenes).

Fase 0:

- [x] ~~Decidir la fuente de los recortes~~ (decisión 2026-10-20: hojas del DX con sus atlas JSON)
- [x] ~~Descargar `ctrdx-assets-vk.zip` ([referencia-dx.md §1](referencia-dx.md#1-cómo-conseguir-el-contenido-del-dx)) fuera del repo~~
- [ ] ~~Quitar de `src/assets/` todos los PNG/JPEG `_hd` actuales~~ (descartada: `src/assets/` ya está vacío y esos archivos nunca se versionaron)
- [x] ~~Copiar a `src/assets/` solo las hojas de la Caja 1 (PNG del archivo) y sus atlas (`content/images/<nombre>.json`)~~ (2026-10-21: 27 hojas con atlas + los 2 fondos sin atlas en `src/assets/images/`, con las subcarpetas `backgrounds/` y `candies/` del DX; 22 MB. Sin `traces_ctr2`: `ClassicFingerTrace` no usa imágenes)
- [x] ~~Utilidad de dibujo de sprites desde atlas (`ui/sprites.js`) + carga en `preload()` de `main.js`; agregarla al bloque de `<script>` de `index.html`~~ (2026-10-21: `Sprites.draw(hoja, cuadro, x, y, { ax, ay })` con el cuadro por índice o `filename`, anclado por defecto en el centro de su `sourceSize`; también `Sprites.size()`/`count()`)

Pistas B, C y E (cada una dibuja lo suyo):

- [ ] Anclas fijas y automáticas (`obj_hook`, `obj_hook_chain`, `obj_hook_auto_chain`) — pista B
- [ ] Púas (`obj_spikes`) — pista C
- [ ] HUD y pausa (`hud_ui`, `menu_pause`, `obj_pause`) — pista E
- [ ] Menú de niveles y botones (`menu_level_ui`, `menu_buttons`, `menu_bgr`, `menu_popup`) — pista E
- [ ] Pantalla de resultados (`menu_results`) — pista E
- [ ] Fuentes: bitmap (`small_font`, `big_font`, `font_numbers_big`) y/o `gooddog_new-webfont.ttf` con `loadFont()`; revisar en el decomp cuál usa cada texto — pista E

Fase 2:

- [ ] Fondo del nivel (`backgrounds/bgr_01_p1`, `bgr_01_p2`, `bgr_01_cover`), recortado o centrado según D1
- [ ] Dulce (`candies/obj_candy_01_new`)
- [ ] Om Nom estático (`char_animations`, un cuadro) y su soporte (`char_supports`)
- [ ] Estrellas (`obj_star_idle`, primer cuadro)
- [ ] Burbujas (`obj_bubble`)

## 9. Pantalla de carga

**Pista E.**

- [ ] Pantalla de carga mientras `preload()` trae los assets
- [ ] Barra de progreso (`loaderbar_full`)

## 10. UI y flujo

**Pista E.**

- [ ] Botón de pausa en pantalla (además de la tecla P) con Reanudar / Reiniciar / Menú
- [ ] Botón Saltar nivel en el menú de pausa (desbloquea el siguiente sin marcar el actual como completado)
- [ ] Mostrar las estrellas obtenidas por nivel en el menú (ya se guardan en `ProgressStore`)
- [ ] Animación breve de estrella recogida
- [ ] Pantalla de título / selección de caja con una sola caja (opcional)

## 11. Más elementos del DX

Por la política de usar todo lo que se pueda del DX. Detalle y referencias en [referencia-dx.md](referencia-dx.md).

Sonido ([referencia-dx.md §8](referencia-dx.md#8-sonido)) — **pista D**, salvo la conexión de eventos (fase 2):

- [ ] Copiar a `src/assets/sounds/` los efectos de la Caja 1 y la música desde `sounds/` del archivo de descarga (convertir a OGG/MP3 solo si pesan demasiado)
- [ ] Módulo de audio con Web Audio (`core/audio.js`) y API `Sound.play(nombre)`
- [ ] Música de menú y de juego, con botón para silenciar
- [ ] Desbloquear el audio con el primer clic (los navegadores bloquean el sonido automático)
- [ ] Conectar los eventos: corte, autocuerda, estrellas, burbuja, dulce roto, Om Nom, victoria, botones y pausa — fase 2

Efectos y dibujo:

- [ ] Cuerda dibujada con los colores alternados de `RopeColorHelper.cs` — pista B
- [ ] Estela blanca del corte que sigue al ratón (`ClassicFingerTrace.cs`) — fase 2
- [ ] Pantalla de resultados con conteo animado de bonus (`BoxOpenClose.cs`) — fase 2

Decidido (**D2**):

- [ ] ~~Evaluar portar la cuerda como cadena de puntos (`ConstrainedPoint`/`Bungee.cs`)~~ (descartada, D2 2026-10-21: la cuerda se queda como `Constraint` de Matter)

## 12. Documentación y entrega

**Fase 2.**

- [ ] Actualizar `docs/arquitectura-mvp.md`: quitar soporte táctil, constantes sueltas y métodos movidos a `ProgressStore`/`Hud`/`WinPanel`/`Banner`
- [ ] Documentar en `docs/arquitectura-mvp.md` las entidades nuevas (autocuerda, púas, tutorial) y la transformación de coordenadas
- [ ] Probar los 25 niveles en el sitio publicado en GitHub Pages
