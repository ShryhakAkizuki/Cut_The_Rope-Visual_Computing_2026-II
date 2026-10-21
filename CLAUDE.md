# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Recreación de *Cut the Rope* en el navegador para el curso Visual Computing 2026-II. JavaScript plano + **p5.js** (render, input, game loop) + **Matter.js** (física). Sitio 100% estático: no hay `package.json`, bundler, linter ni tests. El código, comentarios, textos de UI y commits están en español; los identificadores en inglés.

## Comandos

```bash
# Correr en local (src/ es la raíz del sitio)
python3 -m http.server 8000 -d src    # luego abrir http://localhost:8000
```

Deploy: cada push a `main` dispara [.github/workflows/deploy.yml](.github/workflows/deploy.yml), que copia `src/` tal cual y lo publica en GitHub Pages. Rollback = revertir el commit y hacer push.

## Arquitectura

### Carga por `<script>` globales, sin módulos

No hay `import`/`export`: cada archivo declara clases/constantes globales y [src/index.html](src/index.html) los carga en orden de dependencia (`data/` → `entities/` → `ui/` → `core/level.js` → `camera.js` → `progress.js` → `rules.js` → `game.js` → `main.js`). **Un archivo nuevo debe agregarse a ese bloque de `<script>` en la posición correcta**, o sus globales no existirán cuando se usen.

### Capas

- [src/core/main.js](src/core/main.js) — adaptador p5 sin lógica: `setup`/`draw`/`mouseDragged`/`mousePressed`/`keyPressed` delegan a `Game` (`update(dt)`, `draw(mx, my)`, `onCutAttempt(p1, p2)`, `onInput(x, y)`, `onKeyDown(key)`). También acota `deltaTime` a `TUNING.maxFrameDeltaMs` y conecta `visibilitychange` → `autoPause`/`autoResume`.
- [src/core/game.js](src/core/game.js) — `Game`: máquina de estados (`STATE`: `MENU`, `PLAYING`, `PAUSED`, `WIN`, `LOSE`), dueño del `Matter.Engine`, listener único de `collisionStart`, reloj, puntaje, burbujas y reparto de clics según estado. Delega UI a `Hud`/`WinPanel`/`Banner` ([src/ui/overlays.js](src/ui/overlays.js)), progreso a `ProgressStore` ([src/core/progress.js](src/core/progress.js), `localStorage` key `ctr_progress_v1`) y puntaje a `calculateScore()` ([src/core/rules.js](src/core/rules.js)).
- [src/core/level.js](src/core/level.js) — `Level` traduce un objeto de `LEVELS` en entidades, las añade al mundo y las dibuja. `clear()` vacía el mundo entero (`Composite.clear`); todo reinicio pasa por `restart()` → `startLevel(idx)`, que reconstruye el nivel desde cero.
- [src/entities/](src/entities/) — cada entidad envuelve un `Body` de Matter y sabe dibujarse; no toma decisiones de juego (las decide `Game`).
- [src/data/](src/data/) — `config.js` centraliza constantes (`VIEW` 1920×1440, `MAP_SCALE`, `COLORS`, `STATE`, `TUNING`, `ROPE_T`, `CAMERA_T`, radios de colisión `*_RADIUS`, `PROGRESS_KEY`); `levels.js` contiene `LEVELS`, solo datos.

### Convenciones clave

- **Matter solo simula; p5 dibuja todo.** No se usa `Matter.Render`. Paso de física fijo: `Engine.update(engine, 1000/60)`.
- **Las colisiones se identifican por `label`** del body (`candy`, `star`, `bubble`, `omnom`). Estrellas, burbujas, anclas y OmNom son sensores estáticos. En `collisionStart` las estrellas se procesan antes que OmNom para que una estrella tocada en el mismo frame de la victoria cuente.
- **Estados terminales/pausa congelan todo**: `update()` hace return temprano fuera de `PLAYING` (no avanza física ni reloj).
- **Agregar un nivel = solo datos** en `LEVELS`: `candy`, `anchors` (cada una con `length` opcional para holgura), `omnom`, y opcionales `stars`, `bubbles`, `time` (por defecto `TUNING.defaultLevelTime`). Menú, desbloqueo y botón Next ya escalan.
- **Nueva mecánica** sigue el patrón: entidad con body sensor + `label` en `entities/`, construida en `Level.build`, reacción en el `collisionStart` de `Game`, fuerzas en `Game.update()` (como la burbuja).

### Cuerdas ([src/entities/rope.js](src/entities/rope.js))

Lo más delicado del código. Cada ancla tiene su propio `Constraint` ancla→dulce. Con holgura (`length` > distancia), `updateTension()` pone `stiffness` en 0 mientras está floja (un constraint de Matter también empuja como varilla) y la cuerda se dibuja/corta como Bézier cuadrática de `ROPE_T.curveSegments` tramos. `tryCut()` interseca el segmento del arrastre con esos tramos; al cortar elimina el constraint y crea dos trozos físicos (bodies sensor + constraints) que se desvanecen y se eliminan según `ROPE_T.pieceFadeStart`/`pieceLifetime`.

## Al iniciar una sesión

En la primera respuesta de cada sesión, antes de cualquier otra cosa, lee la sección **"Estado actual"** de [docs/plan-caja1.md](docs/plan-caja1.md) y dile al usuario en pocas líneas:

1. En qué fase está el proyecto.
2. Qué decisiones abiertas (D1, D2, …) le corresponden al usuario y siguen sin cerrar.
3. Cuáles son las próximas tareas y cuáles se pueden lanzar en paralelo con agentes.

Después sigue con lo que haya pedido el usuario. Cuando cambie la fase o se cierre una decisión, actualiza "Estado actual" en el mismo cambio.

## Objetivo actual: Caja 1 (Cardboard Box)

**Plan de acción: [docs/plan-caja1.md](docs/plan-caja1.md)** (estado, decisiones abiertas, fases, pistas para agentes en paralelo y formato de `LEVELS`). Qué se puede reutilizar del decomp (constantes, lógica, imágenes, sonido) y dónde está: [docs/referencia-dx.md](docs/referencia-dx.md).

**Política: usar todo lo que se pueda del DX**: coordenadas, constantes, reglas, textos, imágenes con sus atlas JSON, sonido y comportamiento de las mecánicas. Las imágenes salen de las hojas del DX; los PNG y sonidos se descargan aparte, fuera del repo (sección 1 de `referencia-dx.md`), y a `src/assets/` (hoy vacío) solo se copia lo de la Caja 1.

**Casillas del plan:** al completar una tarea, márcala y táchala en el mismo cambio (`- [ ] tarea` → `- [x] ~~tarea~~`). Las tareas descartadas se tachan sin marcar, con el motivo. **Excepción con agentes en paralelo:** los agentes no editan el plan; listan en su informe las tareas hechas y quien integra la rama las marca. Las reglas completas están en la sección "Reglas para agentes en paralelo" del plan.

Replicar las funcionalidades básicas del primer mundo del juego original, sin copia 1 a 1, jugable en línea vía GitHub Pages. Fuera de alcance: las demás cajas y las animaciones que no sean de tutorial o de carga.

Referencia de comportamiento: el decomp en `/home/camilo/Work/cuttherope-dx` (C#). Mapas de la caja en `content/maps/1_1.xml` … `1_25.xml` (tamaño declarado en `<map width height>` de la capa `settings`: casi todos miden 320×480, pero los niveles 2, 3, 10, 13, 17, 22 y 24 miden 640×480 y el 15 mide 320×960); constantes en `src/CutTheRopeDX.Core/Framework/PhysicsConstants.cs`; lógica en `src/CutTheRopeDX.Core/GameMain/` (`Bungee.cs`, `Bubble.cs`, `Grab.cs`, `AutoRadiusSource.cs`, `Spikes.cs`).

**Coordenadas (D1, implementado):** se adopta el espacio de la versión DX, con el mapa ×3 (`MAP_SCALE = 3`). `VIEW` es fijo de 1920×1440 (4:3); `main.js` escala el canvas a la ventana con `viewScale` y convierte el ratón con `toView()`, así que `Game` siempre trabaja en coordenadas de `VIEW`. Conversión: `x * 3 + offsetX`, `y * 3`, `length * 3`, `radius * 3`, con `offsetX = (1920 − anchoMapa × 3) / 2` (480 para mapas de 320, 0 para los de 640). Solo el nivel 15 (960×2880) usa la cámara vertical de [src/core/camera.js](src/core/camera.js); `Game` pasa la entrada por `camera.toWorld()` y dibuja el nivel con `translate(0, -camera.y)`. La cuerda se queda como `Constraint` de Matter (D2).

Mecánicas de la Caja 1 según los mapas:
- `grab` con `radius="-1"`: cuerda fija con `length` (ya implementada).
- `grab` con `radius` de 45 a 80: **cuerda automática**; crea la cuerda cuando el dulce entra al radio. Es de un solo uso y luego el círculo se desvanece (pendiente).
- `bubble` (ya implementada; en el original es un impulso hacia arriba con amortiguación).
- `spike1`–`spike4` con `size` y `angle` (casi siempre 0/90; el nivel 20 usa 80/100): **púas** a partir del nivel 16; tocarlas destruye el dulce (pendiente).
- `star` sin `timeout` (ya implementada).
- Tutoriales en los niveles 1, 2, 5, 6, 8, 10, 12, 14, 16 y 20 (pendiente).
- En la Caja 1 no hay cojines de aire, arañas, ruedas, anclas móviles ni pistolas.


## Documentación existente y desfases

[docs/arquitectura-mvp.md](docs/arquitectura-mvp.md) tiene diagramas (estados, clases, game loop, corte) y la hoja de ruta post-MVP (sonido con Web Audio, viento, más niveles, HUD, partículas, canvas responsivo). Está parcialmente desactualizada respecto a la refactorización reciente:

- Describe soporte táctil (`touchStarted`/`touchMoved`, `TOUCH_MOUSE_GUARD_MS`), pero se **eliminó** en el commit "Remove Touch (Doesn't Work)"; hoy solo hay ratón y teclado.
- Menciona constantes sueltas (`STAR_POINTS`, `BUBBLE_LIFT`, `MAX_FRAME_DELTA_MS`, …) que ahora viven en `TUNING`/`ROPE_T` de `config.js`, y métodos de `Game` (`loadProgress`, `drawHud`, `drawWinPanel`, …) que se movieron a `ProgressStore`, `Hud`, `WinPanel` y `Banner`.

Si cambias la arquitectura, actualiza también ese documento.
