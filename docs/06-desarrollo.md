# 6. Desarrollo

Cómo correr el juego en local, qué herramientas hay, cómo se publica en GitHub Pages y guías para extender el juego.

Documentos relacionados: [arquitectura](01-arquitectura.md) · [niveles](03-niveles.md) · [assets](05-assets.md).

---

## 1. Correr en local

El juego no necesita nada que instalar; basta con servir la carpeta `src/` (el módulo ES y los `fetch` de audio requieren un origen, no sirven con `file://`):

```bash
python -m http.server 8000 -d src
```

y abrir http://localhost:8000.

## 2. Linter

Para desarrollar, instala las dependencias y corre el linter (la red de seguridad de los refactors):

```bash
npm install
npm run lint
```

La configuración está en [`eslint.config.js`](../eslint.config.js); el entorno es navegador con los globales de p5 (`window.p5`) y Matter.

## 3. Despliegue a GitHub Pages

Cada push a `main` (o disparación manual desde Actions) publica el contenido de `src/` en GitHub Pages mediante [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

1. Copia `src/` a un artefacto (`index.html` queda en la raíz del sitio).
2. `actions/deploy-pages` lo publica bajo la rama `main`.

- **Configuración previa (una vez, desde la UI de GitHub):** Settings → Pages → Build and deployment → Source: "Deploy from a branch", Branch: `main`, Folder: `/ (root)`.
- **Concurrencia:** solo hay un despliegue a la vez; un push nuevo cancela el en curso.
- **Rollback:** revierte el commit problemático y haz push de nuevo a `main`.
- **URL de producción:** https://shryhakakizuki.github.io/Cut_The_Rope-Visual_Computing_2026-II/

## 4. Agregar un nivel

Basta con añadir un objeto más a `LEVELS` ([`src/data/levels.js`](../src/data/levels.js)) con el formato documentado en [Niveles §2](03-niveles.md#2-formato-de-un-nivel):

1. Copia el objeto de un nivel parecido y cambia `name`, `map` y las posiciones.
2. Convierte las coordenadas del mapa original con la fórmula de [Niveles §1](03-niveles.md#1-sistema-de-coordenadas).
3. Si necesitas textos de tutorial nuevos, añádelos a `TEXTS` (`src/data/texts.js`).

El menú, el desbloqueo, el total de estrellas y el botón Siguiente se ajustan solos; no hay que tocar nada más.

## 5. Agregar una mecánica nueva

1. **Entidad:** crea el objeto en [`src/entities/`](../src/entities/). Cada entidad sabe dibujarse (`draw`) y actualizarse (`update`), pero no decide nada del juego. Si se mueve por un path, reutiliza `Mover`.
2. **Construcción:** constrúyelo en `Level.build` ([`src/core/level.js`](../src/core/level.js)) a partir del dato del nivel, y expónlo con un getter en `Game` (como `this.stars`, `this.spikes`).
3. **Reacción:** si el dulce lo debe tocar, crea un sensor de Matter (radio en `config.js`) y reacciona en [`collisions.js`](../src/core/collisions.js); si no (recolección por cercanía), compruébalo en `Game.update`.
4. **Datos:** añade el campo opcional al formato del nivel y documenta aquí.
5. **Dibujo:** la entidad se dibuja desde `Level.draw`; si necesita un asset, regístralo en `sprites.js`.

## 6. Agregar un asset

- **Hoja de sprite:** copia el PNG y su JSON a [`src/assets/images/`](../src/assets/images/) y añádelo a `SPRITE_SHEETS` (o `SPRITE_IMAGES` si no tiene atlas) en [`src/ui/sprites.js`](../src/ui/sprites.js). La barra de carga lo cuenta sola.
- **Sonido:** copia el archivo a [`src/assets/sounds/`](../src/assets/sounds/), regístralo en `AUDIO_T.sfx` o `AUDIO_T.music` (`src/data/config.js`) y reprodúcelo con `Sound.play(nombre)` / `Sound.playMusic(nombre)`. Ver [Sonido](04-sonido.md).
- **Fuente:** las fuentes bitmap se manejan en [`src/ui/fonts.js`](../src/ui/fonts.js).
