# Assets

Los gráficos, la música y los efectos salen de [Cut the Rope DX](https://github.com/yell0wsuit/cuttherope-dx). En `src/assets/` solo está lo que usa la Caja 1.

## Imágenes ([`src/assets/images/`](../src/assets/images/))

Cada hoja es un PNG con un JSON del mismo nombre que indica dónde está cada dibujo.

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
| Fuentes | `small_font`, `big_font`, `font_numbers_big` |
| Carga | `loaderbar_full` |

Para añadir una hoja nueva, copia el PNG y el JSON a esa carpeta y regístrala en [`sprites.js`](../src/ui/sprites.js).

## Fuentes

- **Bitmap** ([`fonts.js`](../src/ui/fonts.js)): `big` para títulos y botones, `small` para rótulos y `numbers` para el puntaje.
- **GoodDog** (`assets/fonts/gooddog_new-webfont.ttf`): la letra de la pantalla de carga y de los tutoriales.

## Sonido ([`src/assets/sounds/`](../src/assets/sounds/))

Los efectos son los del DX; la música se pasó a MP3 para que pese menos. El código está en [`audio.js`](../src/core/audio.js). El botón de silencio recuerda tu elección.

| Evento | Archivo |
|---|---|
| Cortar cuerda | `rope_bleak_1` … `rope_bleak_4` |
| Aparece una autocuerda | `rope_get` |
| Estrellas | `star_1`, `star_2`, `star_3` |
| Burbuja atrapa / revienta | `bubble`, `bubble_break` |
| Dulce destruido por púas | `candy_break` |
| Om Nom | `monster_open`, `monster_close`, `monster_chewing`, `monster_sad`, `monster_greeting`, `monster_excited` |
| Ganar | `win` |
| Botones y pausa | `tap`, `pause_down`, `pause_up` |
| Música de menús y de juego | `menu_music.mp3`, `game_music.mp3` |
