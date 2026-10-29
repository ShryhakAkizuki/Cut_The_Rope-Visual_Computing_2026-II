// Los 25 niveles de la Caja 1 (content/maps/1_N.xml del DX) en coordenadas de VIEW:
// x·3 + offsetX, y·3, con offsetX = (1920 − anchoMapa·3) / 2. Formato en docs/niveles.md.
const LEVELS = [
  {
    name:      'Nivel 1',
    map:       { w: 960, h: 1440 },
    candy:     { x: 954, y: 441 },
    omnom:     { x: 963, y: 1281 },
    anchors:   [
      { x: 957, y: 135, length: 270 },
    ],
    stars:     [
      { x: 966, y: 690 },
      { x: 963, y: 885 },
      { x: 963, y: 1083 },
    ],
    tutorials: [
      { type: 'text', x: 1011, y: 75, text: 'TUTORIAL_LVL_1_1_01', width: 390, duration: 10 },
      { type: 'text', x: 1089, y: 888, text: 'TUTORIAL_LVL_1_1_02', width: 300, duration: 10 },
      { type: 'sign', sign: 10, x: 663, y: 561, angle: 10, path: [230, 0, 440, 0], moveSpeed: 440, ease: 'in,out', moveDelay: 1.5, repeat: 2, fadeIn: 0.5, fadeOut: 0.5, duration: 2.1 },
      { type: 'sign', sign: 1, x: 807, y: 378, duration: 10 },
      { type: 'sign', sign: 1, x: 651, y: 378, duration: 10 },
      { type: 'sign', sign: 1, x: 963, y: 378, duration: 10 },
      { type: 'sign', sign: 1, x: 1119, y: 378, duration: 10 },
      { type: 'sign', sign: 1, x: 1275, y: 378, duration: 10 },
      { type: 'sign', sign: 4, x: 1173, y: 1245, duration: 10 },
    ],
  },
  {
    name:      'Nivel 2',
    map:       { w: 1920, h: 1440 },
    candy:     { x: 864, y: 609 },
    omnom:     { x: 1449, y: 1257 },
    anchors:   [
      { x: 813, y: 210, length: 270 },
      { x: 1143, y: 207, length: 510 },
      { x: 1482, y: 207, length: 960 },
    ],
    stars:     [
      { x: 819, y: 750 },
      { x: 816, y: 1107 },
      { x: 1497, y: 750 },
    ],
    tutorials: [
      { type: 'text', x: 309, y: 834, text: 'TUTORIAL_LVL_1_2_01', width: 630 },
      { type: 'sign', sign: 9, x: 255, y: 945 },
    ],
  },
  {
    name:    'Nivel 3',
    map:     { w: 1920, h: 1440 },
    candy:   { x: 1080, y: 663 },
    omnom:   { x: 1161, y: 1161 },
    anchors: [
      { x: 837, y: 843, length: 285 },
      { x: 831, y: 360, length: 285 },
      { x: 1596, y: 507, length: 420 },
    ],
    stars:   [
      { x: 477, y: 954 },
      { x: 831, y: 1209 },
      { x: 675, y: 669 },
    ],
  },
  {
    name:    'Nivel 4',
    map:     { w: 960, h: 1440 },
    candy:   { x: 954, y: 561 },
    omnom:   { x: 1266, y: 1086 },
    anchors: [
      { x: 963, y: 945, length: 279 },
      { x: 1347, y: 558, length: 315 },
      { x: 966, y: 171, length: 279 },
      { x: 579, y: 558, length: 315 },
    ],
    stars:   [
      { x: 957, y: 678 },
      { x: 576, y: 936 },
      { x: 963, y: 1302 },
    ],
  },
  {
    name:      'Nivel 5',
    map:       { w: 960, h: 1440 },
    candy:     { x: 783, y: 714 },
    omnom:     { x: 1137, y: 1293 },
    anchors:   [
      { x: 768, y: 417, length: 270 },
      { x: 1137, y: 756, length: 420 },
    ],
    stars:     [
      { x: 786, y: 978 },
      { x: 1131, y: 627 },
      { x: 1131, y: 222 },
    ],
    bubbles:   [
      { x: 777, y: 1173 },
    ],
    tutorials: [
      { type: 'text', x: 894, y: 900, text: 'TUTORIAL_LVL_1_5_02', width: 480 },
      { type: 'text', x: 516, y: 132, text: 'TUTORIAL_LVL_1_5_01', width: 480, showOn: 'bubbled', inArea: { x: 879, y: 0, w: 558, h: 399 } },
      { type: 'sign', sign: 4, x: 981, y: 1173, angle: 20 },
      { type: 'sign', sign: 5, x: 1134, y: 234, showOn: 'bubbled', inArea: { x: 879, y: 0, w: 558, h: 399 } },
    ],
  },
  {
    name:      'Nivel 6',
    map:       { w: 960, h: 1440 },
    candy:     { x: 960, y: 651 },
    omnom:     { x: 960, y: 1296 },
    anchors:   [
      { x: 969, y: 456, length: 150 },
    ],
    stars:     [
      { x: 963, y: 1113 },
      { x: 969, y: 879 },
      { x: 963, y: 273 },
    ],
    bubbles:   [
      { x: 963, y: 879 },
    ],
    tutorials: [
      { type: 'text', x: 540, y: 240, text: 'TUTORIAL_LVL_1_6_01', width: 360 },
      { type: 'sign', sign: 9, x: 717, y: 195 },
    ],
  },
  {
    name:    'Nivel 7',
    map:     { w: 960, h: 1440 },
    candy:   { x: 960, y: 447 },
    omnom:   { x: 1257, y: 1296 },
    anchors: [
      { x: 972, y: 126, length: 300 },
      { x: 1278, y: 252, length: 300 },
      { x: 684, y: 255, length: 300 },
      { x: 684, y: 696, length: 300 },
      { x: 972, y: 861, length: 300 },
      { x: 1287, y: 687, length: 300 },
    ],
    stars:   [
      { x: 1254, y: 1068 },
      { x: 678, y: 1074 },
      { x: 1281, y: 588 },
    ],
  },
  {
    name:      'Nivel 8',
    map:       { w: 960, h: 1440 },
    candy:     { x: 1278, y: 483 },
    omnom:     { x: 945, y: 1290 },
    anchors:   [
      { x: 945, y: 750, length: 285 },
      { x: 939, y: 267, length: 300 },
    ],
    stars:     [
      { x: 591, y: 762 },
      { x: 936, y: 123 },
      { x: 1308, y: 762 },
    ],
    bubbles:   [
      { x: 1236, y: 1101 },
    ],
    tutorials: [
      { type: 'text', x: 531, y: 912, text: 'TUTORIAL_LVL_1_8_01', width: 600 },
      { type: 'sign', sign: 8, x: 1089, y: 1056 },
    ],
  },
  {
    name:    'Nivel 9',
    map:     { w: 960, h: 1440 },
    candy:   { x: 963, y: 1050 },
    omnom:   { x: 969, y: 201 },
    anchors: [
      { x: 1209, y: 870, length: 360 },
      { x: 729, y: 1203, length: 270 },
      { x: 975, y: 369, length: 600 },
    ],
    stars:   [
      { x: 771, y: 882 },
      { x: 978, y: 1266 },
      { x: 771, y: 684 },
    ],
    bubbles: [
      { x: 975, y: 1263 },
    ],
  },
  {
    name:        'Nivel 10',
    map:         { w: 1920, h: 1440 },
    candy:       { x: 534, y: 309 },
    omnom:       { x: 1542, y: 1254 },
    anchors:     [
      { x: 540, y: 93, length: 150 },
    ],
    autoAnchors: [
      { x: 672, y: 531, radius: 135, length: 300 },
      { x: 1344, y: 1011, radius: 135, length: 300 },
      { x: 1005, y: 768, radius: 135, length: 300 },
    ],
    stars:       [
      { x: 666, y: 807 },
      { x: 1344, y: 1290 },
      { x: 984, y: 1035 },
    ],
    tutorials:   [
      { type: 'text', x: 819, y: 159, text: 'TUTORIAL_LVL_1_10_01', width: 660 },
      { type: 'sign', sign: 4, x: 948, y: 513 },
    ],
  },
  {
    name:        'Nivel 11',
    map:         { w: 960, h: 1440 },
    candy:       { x: 957, y: 477 },
    omnom:       { x: 966, y: 1290 },
    anchors:     [
      { x: 774, y: 237, length: 270 },
      { x: 1158, y: 240, length: 270 },
      { x: 966, y: 102, length: 300 },
    ],
    autoAnchors: [
      { x: 783, y: 813, radius: 135, length: 300 },
      { x: 588, y: 444, radius: 135, length: 300 },
      { x: 1353, y: 447, radius: 135, length: 300 },
      { x: 1161, y: 819, radius: 135, length: 300 },
    ],
    stars:       [
      { x: 768, y: 1137 },
      { x: 567, y: 738 },
      { x: 1155, y: 1131 },
    ],
  },
  {
    name:        'Nivel 12',
    map:         { w: 960, h: 1440 },
    candy:       { x: 711, y: 939 },
    omnom:       { x: 849, y: 1296 },
    anchors:     [
      { x: 852, y: 573, length: 210 },
      { x: 627, y: 1143, length: 75 },
    ],
    autoAnchors: [
      { x: 1221, y: 276, radius: 165, length: 450 },
      { x: 1044, y: 867, radius: 195, length: 300 },
    ],
    stars:       [
      { x: 924, y: 417 },
      { x: 1251, y: 1053 },
      { x: 846, y: 1038 },
    ],
    tutorials:   [
      { type: 'text', x: 510, y: 231, text: 'TUTORIAL_LVL_1_12_01', width: 300 },
      { type: 'sign', sign: 9, x: 651, y: 192 },
    ],
  },
  {
    name:    'Nivel 13',
    map:     { w: 1920, h: 1440 },
    candy:   { x: 1206, y: 1053 },
    omnom:   { x: 702, y: 183 },
    anchors: [
      { x: 990, y: 384, length: 630 },
      { x: 672, y: 378, length: 825 },
    ],
    stars:   [
      { x: 1212, y: 861 },
      { x: 705, y: 579 },
      { x: 978, y: 1254 },
    ],
    bubbles: [
      { x: 741, y: 1230 },
      { x: 975, y: 1254 },
      { x: 1209, y: 1236 },
    ],
  },
  {
    name:        'Nivel 14',
    map:         { w: 960, h: 1440 },
    candy:       { x: 672, y: 930 },
    omnom:       { x: 1212, y: 231 },
    anchors:     [
      { x: 678, y: 744, length: 180 },
    ],
    autoAnchors: [
      { x: 909, y: 477, radius: 225, length: 300 },
    ],
    stars:       [
      { x: 675, y: 1275 },
      { x: 669, y: 615 },
      { x: 1197, y: 633 },
    ],
    bubbles:     [
      { x: 675, y: 1272 },
      { x: 1194, y: 633 },
    ],
    tutorials:   [
      { type: 'text', x: 891, y: 936, text: 'TUTORIAL_LVL_1_14_01', width: 420 },
      { type: 'sign', sign: 9, x: 1086, y: 891 },
    ],
  },
  {
    name:        'Nivel 15',
    map:         { w: 960, h: 2880 },
    candy:       { x: 963, y: 2526 },
    omnom:       { x: 966, y: 198 },
    anchors:     [
      { x: 966, y: 2253, length: 150 },
    ],
    autoAnchors: [
      { x: 732, y: 2112, radius: 225, length: 300 },
      { x: 1191, y: 1725, radius: 225, length: 300 },
      { x: 1191, y: 963, radius: 225, length: 300 },
      { x: 759, y: 1344, radius: 225, length: 300 },
      { x: 774, y: 585, radius: 225, length: 210 },
    ],
    stars:       [
      { x: 963, y: 393 },
      { x: 960, y: 909 },
      { x: 960, y: 1686 },
    ],
    bubbles:     [
      { x: 963, y: 2718 },
    ],
  },
  {
    name:      'Nivel 16',
    map:       { w: 960, h: 1440 },
    candy:     { x: 672, y: 417 },
    omnom:     { x: 969, y: 1281 },
    anchors:   [
      { x: 966, y: 204, length: 300 },
      { x: 678, y: 204, length: 150 },
      { x: 969, y: 489, length: 270 },
      { x: 966, y: 777, length: 390 },
    ],
    stars:     [
      { x: 1230, y: 495 },
      { x: 672, y: 828 },
      { x: 1224, y: 825 },
    ],
    spikes:    [
      { x: 963, y: 987, size: 2, angle: 0 },
      { x: 957, y: 687, size: 2, angle: 0 },
    ],
    tutorials: [
      { type: 'text', x: 660, y: 987, text: 'TUTORIAL_LVL_1_16_01', width: 600 },
      { type: 'sign', sign: 6, x: 594, y: 1098 },
    ],
  },
  {
    name:    'Nivel 17',
    map:     { w: 1920, h: 1440 },
    candy:   { x: 738, y: 549 },
    omnom:   { x: 1350, y: 1185 },
    anchors: [
      { x: 549, y: 201, length: 300 },
      { x: 561, y: 732, length: 540 },
      { x: 1377, y: 204, length: 960 },
      { x: 969, y: 210, length: 330 },
    ],
    stars:   [
      { x: 1086, y: 1014 },
      { x: 1245, y: 663 },
      { x: 921, y: 654 },
    ],
    spikes:  [
      { x: 915, y: 1122, size: 3, angle: 90 },
      { x: 1356, y: 585, size: 2, angle: 90 },
    ],
  },
  {
    name:    'Nivel 18',
    map:     { w: 960, h: 1440 },
    candy:   { x: 972, y: 438 },
    omnom:   { x: 1293, y: 1284 },
    anchors: [
      { x: 681, y: 138, length: 315 },
      { x: 1260, y: 135, length: 315 },
      { x: 1254, y: 447, length: 435 },
      { x: 681, y: 687, length: 495 },
      { x: 1257, y: 690, length: 495 },
    ],
    stars:   [
      { x: 1251, y: 549 },
      { x: 1248, y: 1005 },
      { x: 963, y: 1257 },
    ],
    spikes:  [
      { x: 1284, y: 1152, size: 1, angle: 0 },
      { x: 957, y: 723, size: 1, angle: 90 },
    ],
  },
  {
    name:        'Nivel 19',
    map:         { w: 960, h: 1440 },
    candy:       { x: 1353, y: -27 },
    omnom:       { x: 666, y: 888 },
    anchors:     [],
    autoAnchors: [
      { x: 1161, y: 945, radius: 180, length: 300 },
      { x: 669, y: 483, radius: 180, length: 300 },
    ],
    stars:       [
      { x: 864, y: 258 },
      { x: 1347, y: 591 },
      { x: 669, y: 729 },
    ],
    bubbles:     [
      { x: 1014, y: 1254 },
    ],
    spikes:      [
      { x: 1167, y: 603, size: 4, angle: 90 },
      { x: 657, y: 258, size: 2, angle: 90 },
    ],
  },
  {
    name:        'Nivel 20',
    map:         { w: 960, h: 1440 },
    candy:       { x: 966, y: 303 },
    omnom:       { x: 966, y: 1278 },
    anchors:     [
      { x: 735, y: 141, length: 285 },
      { x: 1215, y: 141, length: 285 },
    ],
    autoAnchors: [
      { x: 1188, y: 750, radius: 240, length: 300 },
      { x: 744, y: 744, radius: 240, length: 300 },
    ],
    stars:       [
      { x: 963, y: 648 },
      { x: 966, y: 1035 },
      { x: 963, y: 852 },
    ],
    spikes:      [
      { x: 1143, y: 930, size: 4, angle: 80 },
      { x: 792, y: 930, size: 4, angle: 100 },
    ],
    tutorials:   [
      { type: 'text', x: 609, y: 138, text: 'TUTORIAL_LVL_1_20_01', width: 720 },
      { type: 'sign', sign: 1, x: 642, y: 330 },
      { type: 'sign', sign: 1, x: 801, y: 330 },
      { type: 'sign', sign: 1, x: 960, y: 330 },
      { type: 'sign', sign: 1, x: 1110, y: 327 },
      { type: 'sign', sign: 1, x: 1272, y: 327 },
    ],
  },
  {
    name:    'Nivel 21',
    map:     { w: 960, h: 1440 },
    candy:   { x: 960, y: 789 },
    omnom:   { x: 957, y: 120 },
    anchors: [
      { x: 585, y: 1065, length: 450 },
      { x: 1344, y: 1068, length: 450 },
      { x: 1344, y: 774, length: 420 },
      { x: 585, y: 780, length: 420 },
    ],
    stars:   [
      { x: 960, y: 327 },
      { x: 963, y: 1299 },
      { x: 1107, y: 546 },
    ],
    bubbles: [
      { x: 963, y: 786 },
      { x: 960, y: 1056 },
    ],
  },
  {
    name:    'Nivel 22',
    map:     { w: 1920, h: 1440 },
    candy:   { x: 972, y: 390 },
    omnom:   { x: 960, y: 1239 },
    anchors: [
      { x: 1350, y: 309, length: 300 },
      { x: 579, y: 309, length: 300 },
      { x: 963, y: 723, length: 273 },
    ],
    stars:   [
      { x: 1302, y: 810 },
      { x: 963, y: 195 },
      { x: 627, y: 807 },
    ],
    bubbles: [
      { x: 1293, y: 804 },
      { x: 624, y: 804 },
    ],
    spikes:  [
      { x: 1044, y: 1035, size: 1, angle: 0, path: [198, 300], moveSpeed: 30 },
      { x: 864, y: 1035, size: 1, angle: 0, path: [-198, 300], moveSpeed: 30 },
    ],
  },
  {
    name:    'Nivel 23',
    map:     { w: 960, h: 1440 },
    candy:   { x: 966, y: 453 },
    omnom:   { x: 975, y: 138 },
    anchors: [
      { x: 1365, y: 324, length: 345 },
      { x: 573, y: 324, length: 345 },
      { x: 564, y: 567, length: 450 },
      { x: 1365, y: 567, length: 450 },
      { x: 1356, y: 804, length: 570 },
      { x: 567, y: 801, length: 570 },
    ],
    stars:   [
      { x: 972, y: 1257 },
      { x: 672, y: 1074 },
      { x: 966, y: 768 },
    ],
    bubbles: [
      { x: 966, y: 1260 },
    ],
    spikes:  [
      { x: 1164, y: 579, size: 4, angle: 90 },
      { x: 753, y: 582, size: 4, angle: 90 },
    ],
  },
  {
    name:    'Nivel 24',
    map:     { w: 1920, h: 1440 },
    candy:   { x: 1056, y: 954 },
    omnom:   { x: 210, y: 666 },
    anchors: [
      { x: 1404, y: 657, length: 300 },
      { x: 672, y: 699, length: 300 },
      { x: 1290, y: 1257, length: 195 },
    ],
    stars:   [
      { x: 630, y: 132, path: [0, 300], moveSpeed: 40 },
      { x: 819, y: 426 },
      { x: 441, y: 426 },
    ],
  },
  {
    name:        'Nivel 25',
    map:         { w: 960, h: 1440 },
    candy:       { x: 960, y: 345 },
    omnom:       { x: 960, y: 1299 },
    anchors:     [
      { x: 687, y: 135, length: 255 },
      { x: 1251, y: 135, length: 255 },
    ],
    autoAnchors: [
      { x: 705, y: 600, radius: 240, length: 120 },
      { x: 1221, y: 591, radius: 240, length: 120 },
      { x: 807, y: 888, radius: 150, length: 120 },
      { x: 1134, y: 891, radius: 150, length: 120 },
    ],
    stars:       [
      { x: 963, y: 174 },
      { x: 963, y: 891 },
      { x: 969, y: 579 },
    ],
    bubbles:     [
      { x: 963, y: 588 },
    ],
    spikes:      [
      { x: 1344, y: 1065, size: 1, angle: 0 },
      { x: 573, y: 1068, size: 1, angle: 0 },
    ],
  },
];
