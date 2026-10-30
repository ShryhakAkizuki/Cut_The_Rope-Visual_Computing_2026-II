# 5. Assets

Los gráficos, la música y los efectos salen de [Cut the Rope DX](https://github.com/yell0wsuit/cuttherope-dx). En `src/assets/` solo está lo que usa la Caja 1.

Documentos relacionados: [sonido (cómo se reproduce)](04-sonido.md) · [desarrollo (agregar una hoja)](06-desarrollo.md).

---

## 1. Imágenes ([`src/assets/images/`](../src/assets/images/))

Cada hoja es un PNG con un JSON del mismo nombre que indica dónde está cada dibujo (atlas). [`src/ui/sprites.js`](../src/ui/sprites.js) las registra en dos listas:

- `SPRITE_SHEETS`: hojas con atlas JSON (lo más común).
- `SPRITE_IMAGES`: imágenes sueltas sin atlas (fondos, logo, animaciones de Om Nom).

| Uso | Hoja |
|---|---|
| Fondo del nivel | `backgrounds/bgr_01_p1`, `backgrounds/bgr_01_p2`, `bgr_01_cover` |
| Dulce | `candies/obj_candy_01_new` |
| Om Nom y su soporte | `char_animations_hd` (créditos y estados del nivel), `char_supports` |
| Anclas | `obj_hook`, `obj_hook_chain`, `obj_hook_auto_chain` |
| Estrellas, burbujas, púas | `obj_star_idle`, `obj_bubble`, `obj_spikes` |
| Tutoriales | `tutorial_signs` |
| HUD y pausa | `hud_ui`, `menu_pause` |
| Menú de niveles y botones | `menu_level_ui`, `menu_buttons`, `menu_options_packed` |
| Título y créditos | `menu_bgr`, `menu_bgr_shadow`, `menu_extra_buttons`, `menu_popup`, `cut_the_rope_logo` |
| Resultados | `menu_results` |
| Fuentes bitmap | `small_font`, `big_font`, `font_numbers_big` |
| Carga | `loaderbar_full` (se pre-carga antes que el resto para dibujar la barra) |

La pantalla de carga ([`src/ui/loading.js`](../src/ui/loading.js)) dibuja la barra con el progreso real de `Sprites.progress`.

## 2. Fuentes

- **Bitmap** ([`src/ui/fonts.js`](../src/ui/fonts.js)): `big` para títulos y botones, `small` para rótulos y `numbers` para el puntaje.
- **GoodDog** (`assets/fonts/gooddog_new-webfont.ttf`): la letra de la pantalla de carga y de los tutoriales.

## 3. Sonido ([`src/assets/sounds/`](../src/assets/sounds/))

Los efectos son los del DX; la música se pasó a MP3 para que pese menos. El código que los reproduce está documentado en [Sonido](04-sonido.md); la tabla de archivo por evento también está ahí.
