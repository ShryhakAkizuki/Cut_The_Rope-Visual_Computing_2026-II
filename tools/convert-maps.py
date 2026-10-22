#!/usr/bin/env python3
"""Conversor de los mapas de la Caja 1 de Cut the Rope DX a los datos del juego.

Lee content/maps/1_1.xml … 1_25.xml y content/locales/{es,en}.json del decomp DX y genera:

  - src/data/levels.js  → const LEVELS = [...]  (formato "Formato de LEVELS" de docs/plan-caja1.md)
  - src/data/texts.js   → const TEXTS = {...}   (solo las claves de tutorial que usan los niveles)

Uso (desde la raíz del repo o desde cualquier sitio):

    python3 tools/convert-maps.py [ruta/a/cuttherope-dx/content]

Sin argumento usa /home/camilo/Work/cuttherope-dx/content (o la variable CTRDX_CONTENT).
Solo biblioteca estándar. Si un mapa trae un atributo que no se sabe convertir, o uno de los
"neutros" con un valor que no es el neutro, el script se detiene en vez de perderlo en silencio.
"""

import json
import os
import sys
import xml.etree.ElementTree as ET

# --- Rutas -----------------------------------------------------------------------------------

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CONTENT = os.environ.get('CTRDX_CONTENT', '/home/camilo/Work/cuttherope-dx/content')
OUT_LEVELS = os.path.join(REPO_ROOT, 'src', 'data', 'levels.js')
OUT_TEXTS = os.path.join(REPO_ROOT, 'src', 'data', 'texts.js')

LEVEL_COUNT = 25
BOX = 1
LOCALE = 'es'          # tutoriales: solo los nodos con este locale (capa `Es`)

# --- Transformación de coordenadas (D1 del plan) ----------------------------------------------

VIEW_W = 1920
MAP_SCALE = 3          # GameScene.Show.cs: mapScale = 3; también MoverPathScale para los path

# --- Textos (D3: adaptados al ratón) ---------------------------------------------------------

# Reemplazos por clave sobre es.json. Los textos del DX hablan de "deslizar el dedo" y "tocar";
# aquí solo hay ratón. TUTORIAL_LVL_1_14_01 no existe en es.json (solo en en.json:
# "You can skip the level in the pause menu"; DX en español muestra ese texto en inglés), así que
# se traduce. TUTORIAL_LVL_1_8_01 también corrige la errata "reinciar" del DX, y usa "pulsando"
# porque su segunda línea tiene que medir lo mismo que "tocando el botón": el signo del botón
# (tutorial08) va justo después, y con "haciendo clic en el botón" la línea llegaba debajo del
# signo. Sin punto final en 1_5_01, 1_8_01 y 1_14_01, como en el original (el de 1_8_01 sigue
# con el signo del botón).
TEXT_OVERRIDES = {
    'TUTORIAL_LVL_1_1_01': 'Arrastra el ratón para cortar la cuerda.',
    'TUTORIAL_LVL_1_5_01': 'Haz clic en la burbuja para hacerla estallar',
    'TUTORIAL_LVL_1_8_01': 'Puedes reiniciar el nivel pulsando el botón',
    'TUTORIAL_LVL_1_14_01': 'Puedes saltar el nivel desde el menú de pausa',
}

# --- Ajustes de jugabilidad respecto al mapa de DX (§6 del plan) ------------------------------

# Largo de cuerdas fijas cambiado a mano: (nivel, x, y del grab en el mapa) → length en VIEW.
# Nivel 22, ancla central: 273 en vez de 300 (con 300 el nivel se ganaba sin las estrellas).
ANCHOR_LENGTH_OVERRIDES = {
    (22, 321, 241): 273,
}

# --- Atributos que se ignoran porque en la Caja 1 siempre tienen el valor neutro --------------

NEUTRAL_GRAB = {
    'wheel': {'false'},
    'gun': {'false'},
    'spider': {'false'},
    'moveLength': {'-1', '0'},
    'moveVertical': {'false'},
    'moveOffset': {'0'},
    'part': {'L'},
    'hidePath': {'false'},
}
NEUTRAL_STAR = {'timeout': {'-1', '0'}}
NEUTRAL_SPIKE = {'toggled': {'false'}}
NEUTRAL_SETTINGS = {
    'ropePhysicsSpeed': {'1', '1.0'},
    'twoParts': {'false'},
    'gridSize': None,   # cualquier valor: solo es la rejilla del editor
}

# Atributos de los signos de tutorial: los que se copian y los que se ignoran.
SIGN_IGNORED_WITHOUT_PATH = {'moveSpeed', 'rotateSpeed'}
SIGN_MOTION = ['path', 'moveSpeed', 'ease', 'moveDelay', 'repeat', 'fadeIn', 'fadeOut']


class ConvertError(Exception):
    pass


# --- Utilidades ------------------------------------------------------------------------------

def num(value, where):
    """Convierte una cadena numérica a int si es entera, o a float."""
    try:
        f = float(value)
    except (TypeError, ValueError):
        raise ConvertError(f'{where}: número inválido {value!r}')
    return int(f) if f.is_integer() else f


def scaled(value):
    v = value * MAP_SCALE
    return int(v) if float(v).is_integer() else v


def parse_list(value, where):
    """'66,100,' → [66, 100] (se quita la coma final del XML)."""
    parts = [p.strip() for p in value.split(',')]
    while parts and parts[-1] == '':
        parts.pop()
    return [num(p, where) for p in parts]


def check_neutral(node, neutral, where):
    for key, allowed in neutral.items():
        value = node.get(key)
        if value is None or allowed is None:
            continue
        if value not in allowed:
            raise ConvertError(f'{where}: <{node.tag} {key}="{value}"> no es neutro; hay que convertirlo')


def check_known(node, known, where):
    unknown = set(node.attrib) - set(known)
    if unknown:
        raise ConvertError(f'{where}: <{node.tag}> con atributos desconocidos {sorted(unknown)}')


class Transform:
    def __init__(self, map_w):
        self.offset_x = (VIEW_W - map_w * MAP_SCALE) / 2
        if self.offset_x != int(self.offset_x):
            raise ConvertError(f'offsetX no entero para un mapa de ancho {map_w}')
        self.offset_x = int(self.offset_x)

    def x(self, value):
        return scaled(value) + self.offset_x

    def y(self, value):
        return scaled(value)

    def point(self, node, where):
        return {'x': self.x(num(node.get('x'), where)), 'y': self.y(num(node.get('y'), where))}


# --- Conversión de un mapa -------------------------------------------------------------------

def layer(root, name):
    found = [l for l in root.findall('layer') if l.get('name') == name]
    return found[0] if found else None


def convert_map(path, index):
    where_map = os.path.basename(path)
    root = ET.parse(path).getroot()

    settings = layer(root, 'settings')
    if settings is None:
        raise ConvertError(f'{where_map}: sin capa settings')
    map_node = settings.find('map')
    map_w = num(map_node.get('width'), where_map)
    map_h = num(map_node.get('height'), where_map)
    check_known(map_node, ['width', 'height', 'gridSize'], where_map)
    check_neutral(map_node, NEUTRAL_SETTINGS, where_map)
    for design in settings.findall('gameDesign'):
        check_known(design, NEUTRAL_SETTINGS.keys(), where_map)
        check_neutral(design, NEUTRAL_SETTINGS, where_map)

    t = Transform(map_w)
    level = {
        'name': f'Nivel {index}',
        'map': {'w': scaled(map_w), 'h': scaled(map_h)},
    }
    candy = None
    omnom = None
    anchors, auto_anchors, stars, bubbles, spikes = [], [], [], [], []
    used_overrides = set()

    objects = layer(root, 'Objects')
    if objects is None:
        raise ConvertError(f'{where_map}: sin capa Objects')

    for node in objects:
        where = f'{where_map} <{node.tag}>'
        tag = node.tag
        if tag == 'candy':
            check_known(node, ['x', 'y'], where)
            if candy is not None:
                raise ConvertError(f'{where}: más de un dulce')
            candy = t.point(node, where)
        elif tag == 'target':
            check_known(node, ['x', 'y'], where)
            if omnom is not None:
                raise ConvertError(f'{where}: más de un Om Nom')
            omnom = t.point(node, where)
        elif tag == 'grab':
            check_known(node, ['x', 'y', 'length', 'radius', *NEUTRAL_GRAB], where)
            check_neutral(node, NEUTRAL_GRAB, where)
            entry = t.point(node, where)
            radius = num(node.get('radius', '-1'), where)
            length = scaled(num(node.get('length'), where))
            override = (index, num(node.get('x'), where), num(node.get('y'), where))
            if override in ANCHOR_LENGTH_OVERRIDES:
                length = ANCHOR_LENGTH_OVERRIDES[override]
                used_overrides.add(override)
            if radius == -1:
                entry['length'] = length
                anchors.append(entry)
            elif radius > 0:
                entry['radius'] = scaled(radius)
                entry['length'] = length
                auto_anchors.append(entry)
            else:
                raise ConvertError(f'{where}: radius={radius} no soportado')
        elif tag == 'star':
            check_known(node, ['x', 'y', 'timeout', 'path', 'moveSpeed'], where)
            check_neutral(node, NEUTRAL_STAR, where)
            entry = t.point(node, where)
            add_mover(entry, node, where)
            stars.append(entry)
        elif tag == 'bubble':
            check_known(node, ['x', 'y'], where)
            bubbles.append(t.point(node, where))
        elif tag in ('spike1', 'spike2', 'spike3', 'spike4'):
            check_known(node, ['x', 'y', 'size', 'angle', 'path', 'moveSpeed', *NEUTRAL_SPIKE], where)
            check_neutral(node, NEUTRAL_SPIKE, where)
            entry = t.point(node, where)
            size = num(node.get('size', tag[-1]), where)
            if size != int(tag[-1]):
                raise ConvertError(f'{where}: size={size} no coincide con la etiqueta')
            entry['size'] = size
            entry['angle'] = num(node.get('angle', '0'), where)
            add_mover(entry, node, where)
            spikes.append(entry)
        elif tag.startswith('tutorial'):
            # Copias en inglés de los tutoriales: se toman solo los de la capa `Es`.
            if node.get('locale') in (None, LOCALE):
                raise ConvertError(f'{where}: tutorial en Objects con locale {node.get("locale")!r}')
        else:
            raise ConvertError(f'{where}: objeto no soportado')

    if candy is None or omnom is None:
        raise ConvertError(f'{where_map}: falta el dulce o Om Nom')
    missing = {k for k in ANCHOR_LENGTH_OVERRIDES if k[0] == index} - used_overrides
    if missing:
        raise ConvertError(f'{where_map}: ANCHOR_LENGTH_OVERRIDES sin grab que coincida: {sorted(missing)}')

    tutorials, text_keys = convert_tutorials(root, t, where_map)

    level['candy'] = candy
    level['omnom'] = omnom
    level['anchors'] = anchors      # siempre presente (Level.build lo recorre sin `|| []`)
    if auto_anchors:
        level['autoAnchors'] = auto_anchors
    if stars:
        level['stars'] = stars
    if bubbles:
        level['bubbles'] = bubbles
    if spikes:
        level['spikes'] = spikes
    if tutorials:
        level['tutorials'] = tutorials
    return level, text_keys


def add_mover(entry, node, where):
    """`path` de estrellas y púas: offsets ×3 (MoverPathScale); `moveSpeed` tal cual."""
    if node.get('path') is not None:
        offsets = parse_list(node.get('path'), where)
        if len(offsets) % 2 != 0 or not offsets:
            raise ConvertError(f'{where}: path con número impar de valores')
        entry['path'] = [scaled(v) for v in offsets]
        if node.get('moveSpeed') is None:
            raise ConvertError(f'{where}: path sin moveSpeed')
        entry['moveSpeed'] = num(node.get('moveSpeed'), where)
    elif node.get('moveSpeed') is not None:
        raise ConvertError(f'{where}: moveSpeed sin path')


def convert_area(value, t, where):
    x, y, w, h = parse_list(value, where)
    return {'x': t.x(x), 'y': t.y(y), 'w': scaled(w), 'h': scaled(h)}


def convert_tutorials(root, t, where_map):
    tutorials = []
    text_keys = []
    for lay in root.findall('layer'):
        if lay.get('name') in ('settings', 'Objects'):
            continue
        for node in lay:
            if node.get('locale') != LOCALE:
                continue
            where = f'{where_map} capa {lay.get("name")} <{node.tag}>'
            tag = node.tag
            common = ['x', 'y', 'locale', 'duration', 'showOn', 'inArea']
            if tag == 'tutorialText':
                check_known(node, [*common, 'text', 'width'], where)
                entry = {'type': 'text', **t.point(node, where), 'text': node.get('text')}
                if node.get('width') is not None:
                    entry['width'] = scaled(num(node.get('width'), where))
                text_keys.append(node.get('text'))
            elif len(tag) == 10 and tag.startswith('tutorial') and tag[8:].isdigit():
                check_known(node, [*common, 'angle', 'rotateSpeed', *SIGN_MOTION], where)
                entry = {'type': 'sign', 'sign': int(tag[8:]), **t.point(node, where)}
                if node.get('angle') is not None:
                    entry['angle'] = num(node.get('angle'), where)
                if node.get('path') is not None:
                    # Dedo (tutorial10): path y moveSpeed sin escalar (TutorialMotion.cs).
                    entry['path'] = parse_list(node.get('path'), where)
                    for key in SIGN_MOTION[1:]:
                        value = node.get(key)
                        if value is None:
                            continue
                        entry[key] = value if key == 'ease' else num(value, where)
                else:
                    for key in SIGN_MOTION:
                        if key not in SIGN_IGNORED_WITHOUT_PATH and node.get(key) is not None:
                            raise ConvertError(f'{where}: {key} sin path no soportado')
            else:
                raise ConvertError(f'{where}: tutorial no soportado')

            if node.get('duration') is not None:
                entry['duration'] = num(node.get('duration'), where)
            if node.get('showOn') is not None:
                entry['showOn'] = node.get('showOn')
            if node.get('inArea') is not None:
                entry['inArea'] = convert_area(node.get('inArea'), t, where)
            tutorials.append(entry)
    # Orden de dibujo de DX (GameScene.Draw: DrawTexts y luego DrawImages): primero todos los
    # textos y después todos los signos, cada grupo en el orden del XML. Level.draw los recorre así.
    tutorials.sort(key=lambda e: e['type'] != 'text')
    return tutorials, text_keys


# --- Textos ----------------------------------------------------------------------------------

def find_key(data, key):
    """Busca una clave en el JSON de locales (las de tutorial están anidadas en TUTORIAL_TEXTS)."""
    if isinstance(data, dict):
        if key in data and isinstance(data[key], str):
            return data[key]
        for value in data.values():
            found = find_key(value, key)
            if found is not None:
                return found
    return None


def build_texts(keys, content):
    with open(os.path.join(content, 'locales', 'es.json'), encoding='utf-8') as f:
        es = json.load(f)
    texts = {}
    for key in keys:
        if key in texts:
            continue
        if key in TEXT_OVERRIDES:
            texts[key] = TEXT_OVERRIDES[key]
        else:
            value = find_key(es, key)
            if value is None:
                raise ConvertError(f'{key} no está en es.json; añádelo a TEXT_OVERRIDES')
            texts[key] = value
    unused = set(TEXT_OVERRIDES) - set(texts)
    if unused:
        raise ConvertError(f'TEXT_OVERRIDES con claves que ningún nivel usa: {sorted(unused)}')
    # Orden natural de clave (TUTORIAL_LVL_1_5_01 antes que _1_5_02 y que _1_10_01).
    natural = lambda k: [int(p) if p.isdigit() else p for p in k.split('_')]
    return {k: texts[k] for k in sorted(texts, key=natural)}


# --- Salida JS -------------------------------------------------------------------------------

def js_str(value):
    return "'" + value.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"


def js_value(value):
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, (int, float)):
        return repr(value)
    if isinstance(value, str):
        return js_str(value)
    if isinstance(value, list):
        return '[' + ', '.join(js_value(v) for v in value) + ']'
    if isinstance(value, dict):
        return '{ ' + ', '.join(f'{k}: {js_value(v)}' for k, v in value.items()) + ' }'
    raise TypeError(value)


HEADER = '// Generado por tools/convert-maps.py; no editar a mano.\n'


def render_levels(levels):
    out = [HEADER,
           '// Los 25 niveles de la Caja 1 (content/maps/1_N.xml del DX) en coordenadas de VIEW:\n',
           '// x·3 + offsetX, y·3, con offsetX = (1920 − anchoMapa·3) / 2. Formato en docs/plan-caja1.md.\n',
           'const LEVELS = [\n']
    for level in levels:
        out.append('  {\n')
        width = max(len(k) for k in level) + 1
        for key, value in level.items():
            pad = ' ' * (width - len(key))
            if isinstance(value, list) and not value:
                out.append(f'    {key}:{pad}[],\n')
            elif isinstance(value, list):
                out.append(f'    {key}:{pad}[\n')
                for item in value:
                    out.append(f'      {js_value(item)},\n')
                out.append('    ],\n')
            else:
                out.append(f'    {key}:{pad}{js_value(value)},\n')
        out.append('  },\n')
    out.append('];\n')
    return ''.join(out)


def render_texts(texts):
    out = [HEADER,
           '// Textos de los tutoriales de la Caja 1 (content/locales/es.json del DX), adaptados al ratón.\n',
           'const TEXTS = {\n']
    for key, value in texts.items():
        out.append(f'  {key}: {js_str(value)},\n')
    out.append('};\n')
    return ''.join(out)


# --- Principal -------------------------------------------------------------------------------

def main(argv):
    content = argv[1] if len(argv) > 1 else DEFAULT_CONTENT
    levels = []
    keys = []
    for n in range(1, LEVEL_COUNT + 1):
        path = os.path.join(content, 'maps', f'{BOX}_{n}.xml')
        level, text_keys = convert_map(path, n)
        levels.append(level)
        keys.extend(text_keys)
    texts = build_texts(keys, content)

    with open(OUT_LEVELS, 'w', encoding='utf-8', newline='\n') as f:
        f.write(render_levels(levels))
    with open(OUT_TEXTS, 'w', encoding='utf-8', newline='\n') as f:
        f.write(render_texts(texts))

    print(f'{len(levels)} niveles → {os.path.relpath(OUT_LEVELS, REPO_ROOT)}')
    print(f'{len(texts)} textos → {os.path.relpath(OUT_TEXTS, REPO_ROOT)}')
    for i, level in enumerate(levels, 1):
        print(f'  {i:2} {level["map"]["w"]}×{level["map"]["h"]}'
              f'  cuerdas {len(level["anchors"])}'
              f'  auto {len(level.get("autoAnchors", []))}'
              f'  estrellas {len(level.get("stars", []))}'
              f'  burbujas {len(level.get("bubbles", []))}'
              f'  púas {len(level.get("spikes", []))}'
              f'  tutoriales {len(level.get("tutorials", []))}')


if __name__ == '__main__':
    try:
        main(sys.argv)
    except ConvertError as e:
        sys.exit(f'Error: {e}')
