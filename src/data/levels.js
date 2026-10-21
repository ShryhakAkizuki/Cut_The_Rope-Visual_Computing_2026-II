// Provisional: cuatro mapas del DX convertidos a mano (×3 y offsetX) mientras la pista A
// genera los 25 con tools/convert-maps.py. Las autoAnchors del 15 aún no se construyen (pista B).
const LEVELS = [
  {
    name:    'Nivel 1',
    map:     { w: 960, h: 1440 },
    candy:   { x: 954, y: 441 },
    omnom:   { x: 963, y: 1281 },
    anchors: [
      { x: 957, y: 135, length: 270 },
    ],
    stars:   [
      { x: 966, y: 690 },
      { x: 963, y: 885 },
      { x: 963, y: 1083 },
    ],
  },
  {
    name:    'Nivel 2',
    map:     { w: 1920, h: 1440 },
    candy:   { x: 864, y: 609 },
    omnom:   { x: 1449, y: 1257 },
    anchors: [
      { x: 813, y: 210, length: 270 },
      { x: 1143, y: 207, length: 510 },
      { x: 1482, y: 207, length: 960 },
    ],
    stars:   [
      { x: 819, y: 750 },
      { x: 816, y: 1107 },
      { x: 1497, y: 750 },
    ],
  },
  {
    name:    'Nivel 5',
    map:     { w: 960, h: 1440 },
    candy:   { x: 783, y: 714 },
    omnom:   { x: 1137, y: 1293 },
    anchors: [
      { x: 768, y: 417, length: 270 },
      { x: 1137, y: 756, length: 420 },
    ],
    stars:   [
      { x: 786, y: 978 },
      { x: 1131, y: 627 },
      { x: 1131, y: 222 },
    ],
    bubbles: [
      { x: 777, y: 1173 },
    ],
  },
  {
    name:    'Nivel 15',
    map:     { w: 960, h: 2880 },
    candy:   { x: 963, y: 2526 },
    omnom:   { x: 966, y: 198 },
    anchors: [
      { x: 966, y: 2253, length: 150 },
    ],
    autoAnchors: [
      { x: 732, y: 2112, radius: 225, length: 300 },
      { x: 1191, y: 1725, radius: 225, length: 300 },
      { x: 1191, y: 963, radius: 225, length: 300 },
      { x: 759, y: 1344, radius: 225, length: 300 },
      { x: 774, y: 585, radius: 225, length: 210 },
    ],
    stars:   [
      { x: 963, y: 393 },
      { x: 960, y: 909 },
      { x: 960, y: 1686 },
    ],
    bubbles: [
      { x: 963, y: 2718 },
    ],
  },
];
