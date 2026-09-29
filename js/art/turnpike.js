// Exhibit drawings for the Turnpike pitch (1792). One SVG per art key in content/exhibits.json.
// Built from small shared helpers (wagon, horse, person...) so the figures match across cards.

const INK = '#1b1410', PARCH = '#efe3c6', SEPIA = '#8a6a44', BROWN = '#6b4a2b',
  ROAD = '#a07a4f', MUD = '#6d4c2f', STONE = '#a39d90', DSTONE = '#77716a', WATER = '#7fb0c4', DEEP = '#3f7891',
  GRASS = '#9bb07a', DGREEN = '#5f7a45', WHEAT = '#d9b04c', RED = '#b3342e', CREAM = '#fbf6ea', SKY = '#dce9ea', SNOW = '#ffffff';

const LJ = 'stroke-linejoin="round" stroke-linecap="round"';
const st = (w = 3, c = INK) => `stroke="${c}" stroke-width="${w}" ${LJ}`;
const FONT = 'font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="bold"';
const SERIF = 'font-family="Georgia, serif" font-style="italic"';
const r1 = (n) => Math.round(n * 10) / 10;
const svg = (body) => `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const text = (x, y, t, size = 16, { anchor = 'middle', fill = INK, font = FONT, extra = '' } = {}) =>
  `<text x="${x}" y="${y}" ${font} font-size="${size}" fill="${fill}" text-anchor="${anchor}" ${extra}>${t}</text>`;
const at = (x, y, s, body, rot = 0) => `<g transform="translate(${x},${y})${rot ? ` rotate(${rot})` : ''}${s !== 1 ? ` scale(${s})` : ''}">${body}</g>`;
/** A thick line with an ink outline (legs, arms, roads, rivers). */
const limb = (d, c, w = 5) => `<path d="${d}" fill="none" ${st(w + 4)}/><path d="${d}" fill="none" ${st(w, c)}/>`;

// deterministic pseudo-random numbers so the drawings are identical on every load
function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }

// ---------- shared figures ----------

function wheel(cx, cy, r) {
  let sp = '';
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; sp += `M${cx},${cy} L${r1(cx + Math.cos(a) * (r - 3))},${r1(cy + Math.sin(a) * (r - 3))} `; }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="8"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${RED}" stroke-width="3.5"/>
    <path d="${sp}" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r1(r * 0.22)}" fill="${BROWN}" ${st(2)}/>`;
}

function barrel(x, y, w, h, fill = SEPIA) {
  return `<path d="M${x + 2},${y} Q${x - 3},${y + h / 2} ${x + 2},${y + h} L${x + w - 2},${y + h} Q${x + w + 3},${y + h / 2} ${x + w - 2},${y} Z" fill="${fill}" ${st(2.5)}/>
    <path d="M${x},${y + h * 0.27} L${x + w},${y + h * 0.27} M${x},${y + h * 0.73} L${x + w},${y + h * 0.73}" ${st(2)}/>`;
}

/** Conestoga-style wagon facing right, ground at y=0, centred on x=0 (about 160 wide). */
function wagon({ cover = true, barrels = true } = {}) {
  let s = '';
  if (barrels && !cover) {
    for (const x of [-62, -37, -12, 13, 38]) s += barrel(x, -94, 23, 36);
    for (const x of [-50, -25, 0, 25]) s += barrel(x, -122, 23, 30);
  }
  if (cover) {
    s += `<path d="M-66,-64 L-82,-120 Q0,-146 82,-120 L66,-64 Z" fill="${CREAM}" ${st(3)}/>
      <path d="M-40,-62 Q-44,-100 -46,-133 M0,-60 L0,-136 M40,-62 Q44,-100 46,-133" fill="none" ${st(2)}/>`;
  }
  s += `<path d="M-78,-74 L-62,-40 L60,-40 L76,-74 Q0,-60 -78,-74 Z" fill="${DEEP}" ${st(3)}/>
    <path d="M-68,-56 Q0,-46 67,-56" fill="none" ${st(2)}/>
    <path d="M-50,-30 L50,-30" ${st(4)}/>`;
  return s + wheel(-44, -28, 28) + wheel(46, -22, 22);
}

/** Horse facing right, hooves at y=0. */
function horse(c = BROWN, far = MUD) {
  const leg = (d, col) => limb(d, col, 6);
  return `${leg('M-16,-40 L-20,-18 L-16,-2', far)}${leg('M26,-40 L28,-2', far)}
    <path d="M-30,-52 Q-46,-44 -42,-16" fill="none" ${st(7)}/>
    ${leg('M-24,-40 L-28,-18 L-24,-2', c)}${leg('M18,-40 L18,-2', c)}
    <ellipse cx="0" cy="-46" rx="33" ry="15" fill="${c}" ${st(3)}/>
    <path d="M12,-56 L30,-90 L46,-84 L32,-38 Z" fill="${c}" ${st(3)}/>
    <path d="M28,-92 L42,-97 L63,-72 Q66,-63 57,-62 L38,-74 Z" fill="${c}" ${st(3)}/>
    <path d="M33,-94 L35,-106 L41,-96 Z" fill="${c}" ${st(2)}/>
    <circle cx="45" cy="-85" r="2.2" fill="${INK}"/>
    <path d="M30,-92 Q20,-74 12,-58" fill="none" ${st(6)}/>
    <path d="M30,-58 Q36,-50 34,-40" fill="none" ${st(6)}/><path d="M30,-58 Q36,-50 34,-40" fill="none" ${st(3, RED)}/>
    <path d="M-30,-48 L32,-50" fill="none" ${st(2)}/>`;
}

/** 1790s figure (tricorn hat, coat), feet at y=0. arms: [leftHand, rightHand] points relative to the figure. */
function person({ coat = RED, legs = BROWN, hat = INK, arms = [[-16, -34], [16, -34]], bonnet = false } = {}) {
  const arm = ([x, y], sx) => limb(`M${sx},-58 L${x},${y}`, coat, 4) + `<circle cx="${x}" cy="${y}" r="4" fill="${PARCH}" ${st(2)}/>`;
  const head = bonnet
    ? `<circle cx="0" cy="-72" r="10" fill="${PARCH}" ${st(3)}/><path d="M-12,-70 Q-14,-88 0,-88 Q14,-88 12,-70 Q6,-82 0,-82 Q-6,-82 -12,-70 Z" fill="${hat}" ${st(2)}/>`
    : `<circle cx="0" cy="-72" r="10" fill="${PARCH}" ${st(3)}/><path d="M-16,-76 Q-9,-92 0,-87 Q9,-92 16,-76 Q0,-81 -16,-76 Z" fill="${hat}" ${st(2)}/>`;
  const body = bonnet
    ? `<path d="M-11,-62 L11,-62 L18,-4 L-18,-4 Z" fill="${coat}" ${st(3)}/>`
    : `${limb('M-5,-30 L-6,-3', legs, 4)}${limb('M5,-30 L6,-3', legs, 4)}<path d="M-12,-62 Q-14,-42 -15,-24 L15,-24 Q14,-42 12,-62 Z" fill="${coat}" ${st(3)}/>`;
  return `${arm(arms[0], -9)}${arm(arms[1], 9)}${body}${head}`;
}

const coin = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${WHEAT}" ${st(2.5)}/><circle cx="${x}" cy="${y}" r="${r1(r * 0.55)}" fill="none" ${st(1.5)}/>`;

/** A pike: pole with iron spikes along the top, from (0,0) to (len,0). */
function pike(len) {
  let sp = '';
  for (let x = 14; x < len - 6; x += 14) sp += `M${x - 4},-4 L${x},-14 L${x + 4},-4 `;
  return `<path d="${sp}" fill="${DSTONE}" ${st(2)}/><rect x="0" y="-5" width="${len}" height="10" rx="4" fill="${SEPIA}" ${st(3)}/>`;
}

// ---------- A. Lancaster County wheat ----------

function wheatfarm() {
  const shock = (x, y, s = 1) => at(x, y, s, `<path d="M-13,0 L-3,-30 L3,-30 L13,0 Z" fill="${WHEAT}" ${st(2.5)}/><path d="M-3,-30 L-7,-38 M0,-30 L0,-40 M3,-30 L7,-38" ${st(2)}/><path d="M-8,-14 L8,-14" ${st(3, BROWN)}/>`);
  let rows = '';
  for (let y = 172; y < 236; y += 12) for (let x = 12 + (y % 24); x < 392; x += 22) rows += `M${x},${y} l2,-6 `;
  let sun = '';
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; sun += `M${r1(56 + Math.cos(a) * 24)},${r1(46 + Math.sin(a) * 24)} L${r1(56 + Math.cos(a) * 31)},${r1(46 + Math.sin(a) * 31)} `; }
  return svg(`<rect width="400" height="300" fill="${SKY}"/>
    <path d="${sun}" ${st(3, WHEAT)}/><circle cx="56" cy="46" r="17" fill="${WHEAT}" ${st(2.5)}/>
    <path d="M0,122 Q70,96 150,110 T300,100 T400,106 L400,300 L0,300 Z" fill="${GRASS}" ${st(3)}/>
    <path d="M214,106 q-4,-22 12,-24 q16,2 12,24 Z M236,104 q-2,-18 10,-19 q12,1 10,19 Z M330,102 q-4,-22 12,-24 q16,2 12,24 Z" fill="${DGREEN}" ${st(2.5)}/>
    <g>
      <rect x="28" y="104" width="62" height="40" fill="${STONE}" ${st(3)}/>
      <path d="M22,106 L59,82 L96,106 Z" fill="${BROWN}" ${st(3)}/>
      <rect x="74" y="80" width="9" height="16" fill="${DSTONE}" ${st(2)}/>
      <rect x="36" y="114" width="12" height="12" fill="${CREAM}" ${st(2)}/><rect x="70" y="114" width="12" height="12" fill="${CREAM}" ${st(2)}/>
      <rect x="53" y="124" width="12" height="20" fill="${BROWN}" ${st(2)}/>
    </g>
    <g>
      <rect x="104" y="100" width="80" height="46" fill="${RED}" ${st(3)}/>
      <path d="M98,102 L144,74 L190,102 Z" fill="${DSTONE}" ${st(3)}/>
      <rect x="128" y="112" width="32" height="34" fill="${CREAM}" ${st(2.5)}/><path d="M128,112 L160,146 M160,112 L128,146" ${st(2)}/>
      <circle cx="144" cy="90" r="5" fill="${CREAM}" ${st(2)}/>
    </g>
    <path d="M0,160 Q110,140 220,152 T400,148 L400,300 L0,300 Z" fill="${WHEAT}" ${st(3)}/>
    <path d="${rows}" ${st(2, SEPIA)}/>
    ${shock(34, 214, 1.1)}${shock(68, 200, 0.9)}${shock(300, 190, 0.8)}${shock(330, 202, 0.9)}
    <path d="M0,238 C120,242 260,252 400,252 L400,294 C260,296 120,286 0,276 Z" fill="${ROAD}" ${st(3)}/>
    <path d="M10,258 C120,262 250,270 390,272" fill="none" ${st(2, MUD)} stroke-dasharray="14 10"/>
    <path d="M356,272 L356,96" ${st(8)}/><path d="M356,272 L356,96" ${st(4, BROWN)}/>
    <path d="M232,94 L366,94 L386,112 L366,130 L232,130 Z" fill="${CREAM}" ${st(3)}/>
    ${text(300, 118, 'PHILADELPHIA', 16)}
    <path d="M232,248 L262,244" ${st(4)}/>
    ${at(150, 274, 0.85, wagon({ cover: false }))}
    ${at(272, 266, 0.95, horse(MUD, INK))}
    ${at(264, 273, 0.95, horse(BROWN, MUD))}`);
}

// ---------- B. Stuck in the mud ----------

function mudwagon() {
  const R = rng(7);
  let rain = '';
  for (let i = 0; i < 70; i++) { const x = r1(R() * 420), y = r1(R() * 230); rain += `M${x},${y} l-5,13 `; }
  const inset = `<rect x="212" y="12" width="176" height="106" rx="8" fill="${CREAM}" ${st(3)}/>
    ${text(300, 35, 'SAME COST', 17, { fill: RED })}
    <g>
      <rect x="230" y="48" width="36" height="26" fill="${ROAD}" ${st(2.5)}/><path d="M230,48 L266,74 M266,48 L230,74" ${st(2)}/>
      <path d="M222,74 L274,74 L270,84 L226,84 Z" fill="${DEEP}" ${st(2.5)}/>
      <circle cx="233" cy="88" r="7" fill="${CREAM}" ${st(2.5)}/><circle cx="264" cy="88" r="7" fill="${CREAM}" ${st(2.5)}/>
    </g>
    ${text(248, 110, '30 miles', 15)}
    ${text(300, 78, '=', 30)}
    <g>
      <path d="M346,34 L346,78" ${st(3)}/>
      <path d="M344,38 L344,72 L322,72 Z" fill="${SNOW}" ${st(2.5)}/><path d="M349,40 L349,72 L370,72 Z" fill="${SNOW}" ${st(2.5)}/>
      <path d="M318,78 L376,78 L368,90 L326,90 Z" fill="${BROWN}" ${st(2.5)}/>
      <path d="M314,94 q6,-4 12,0 t12,0 t12,0 t12,0 t12,0" fill="none" ${st(2.5, DEEP)}/>
    </g>
    ${text(346, 110, 'Atlantic', 15)}`;
  return svg(`<rect width="400" height="300" fill="${SKY}"/>
    <path d="M-10,40 q20,-30 50,-14 q20,-26 50,-6 q26,-18 44,6 q18,6 10,22 L-10,52 Z" fill="${STONE}" ${st(3)}/>
    <path d="M150,60 q18,-24 44,-10 q16,-10 26,6 L150,62 Z" fill="${DSTONE}" ${st(3)}/>
    <path d="M0,168 Q200,150 400,166 L400,300 L0,300 Z" fill="${GRASS}" ${st(3)}/>
    <path d="M0,190 Q200,176 400,192 L400,300 L0,300 Z" fill="${MUD}" ${st(3)}/>
    <ellipse cx="330" cy="210" rx="34" ry="6" fill="${WATER}" ${st(2)}/><ellipse cx="60" cy="206" rx="26" ry="5" fill="${WATER}" ${st(2)}/>
    <path d="M0,214 Q200,200 400,218 M0,226 Q200,214 400,232" fill="none" ${st(2, BROWN)}/>
    ${at(34, 262, 1, person({ coat: RED, arms: [[34, -56], [36, -46]] }), 14)}
    <path d="M216,238 L262,248" ${st(4)}/>
    ${at(148, 262, 0.95, wagon({ cover: true }), -5)}
    ${at(300, 262, 0.84, horse(MUD, INK), 7)}
    ${at(292, 268, 0.84, horse(BROWN, MUD), 7)}
    <path d="M0,236 Q30,226 62,236 Q100,228 130,240 Q170,230 210,244 Q240,238 262,262 Q300,272 340,270 Q370,268 400,272 L400,300 L0,300 Z" fill="${MUD}" ${st(3)}/>
    <path d="M60,250 q10,-6 20,0 M150,262 q12,-6 24,0 M250,284 q12,-6 24,0 M340,288 q10,-5 20,0" fill="none" ${st(2, BROWN)}/>
    <path d="${rain}" ${st(2, DEEP)}/>
    ${inset}`);
}

// ---------- C. The route map ----------

function along(pts) {
  const seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  return (t) => {
    let d = t * total;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1], f = d / seg[i];
        return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, a: Math.atan2(by - ay, bx - ax) };
      }
      d -= seg[i];
    }
  };
}

function turnpikemap() {
  const road = [[342, 170], [322, 165], [300, 159], [282, 150], [262, 144], [240, 146], [212, 152], [180, 156], [150, 157], [124, 153], [96, 146], [66, 142]];
  const P = along(road);
  let gates = '';
  for (let i = 0; i < 9; i++) {
    const p = P((i + 0.5) / 9), nx = -Math.sin(p.a) * 12, ny = Math.cos(p.a) * 12;
    const d = `M${r1(p.x - nx)},${r1(p.y - ny)} L${r1(p.x + nx)},${r1(p.y + ny)}`;
    gates += `<path d="${d}" ${st(8)}/><path d="${d}" ${st(4, RED)}/>`;
  }
  const roadD = 'M' + road.map((p) => p.join(',')).join(' L');
  const river = (d, w) => `<path d="${d}" fill="none" ${st(w + 4)}/><path d="${d}" fill="none" ${st(w, WATER)}/>`;
  const star = `<path d="M0,-26 L6,-6 L0,0 Z M0,26 L-6,6 L0,0 Z M26,0 L6,6 L0,0 Z M-26,0 L-6,-6 L0,0 Z" fill="${INK}"/>
    <path d="M0,-26 L-6,-6 L0,0 Z M0,26 L6,6 L0,0 Z M26,0 L6,-6 L0,0 Z M-26,0 L-6,6 L0,0 Z" fill="${CREAM}" ${st(1.5)}/>
    <circle r="4" fill="${RED}" ${st(1.5)}/>`;
  const place = (x, y, t, size = 16, rot = 0, anchor = 'middle') => text(x, y, t, size, { anchor, font: SERIF,
    extra: `font-weight="bold" stroke="${PARCH}" stroke-width="5" paint-order="stroke" stroke-linejoin="round"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}` });
  const bridge = `<rect x="-40" y="-40" width="80" height="80" fill="${SKY}"/>
      <rect x="-40" y="14" width="80" height="30" fill="${WATER}"/>
      <path d="M-36,22 q6,-3 12,0 t12,0 t12,0 t12,0 t12,0 t12,0" fill="none" ${st(2, DEEP)}/>
      <path d="M-42,-8 L42,-8 L42,30 L22,30 Q18,4 0,4 Q-18,4 -22,30 L-42,30 Z" fill="${STONE}" ${st(3)}/>
      <path d="M-42,-14 L42,-14 L42,-8 L-42,-8 Z" fill="${ROAD}" ${st(3)}/>
      <path d="M-16,12 L-24,4 M0,4 L0,-8 M16,12 L24,4" ${st(2)}/>`;
  return svg(`<defs><clipPath id="tp-turnpikemap-bub"><circle r="32"/></clipPath></defs>
    <rect width="400" height="300" fill="${PARCH}"/>
    <g transform="translate(-12,0)">
      ${river('M410,104 C384,128 368,150 358,172 C346,198 300,222 272,240 C258,250 252,272 250,300', 8)}
      ${river('M150,26 C190,58 250,92 294,116 C318,130 330,158 338,190', 4)}
      ${river('M200,92 C208,116 212,136 212,160 C216,200 236,226 266,242', 3)}
      <path d="${roadD}" fill="none" ${st(12)}/><path d="${roadD}" fill="none" ${st(6, ROAD)}/>
      ${gates}
      <circle cx="342" cy="170" r="7" fill="${RED}" ${st(3)}/>
      <circle cx="64" cy="142" r="7" fill="${RED}" ${st(3)}/>
    </g>
    ${place(166, 62, 'Schuylkill', 15, 31)}
    ${place(190, 116, 'Brandywine', 15, 0, 'end')}
    ${place(316, 240, 'Delaware', 15, -38)}
    ${place(322, 148, 'Philadelphia', 17)}
    ${place(62, 128, 'Lancaster', 17)}
    <path d="M150,216 L198,158" ${st(2.5)} stroke-dasharray="5 5"/>
    ${at(132, 244, 1, `<g clip-path="url(#tp-turnpikemap-bub)">${bridge}</g><circle r="32" fill="none" ${st(3)}/>`)}
    <rect x="72" y="168" width="84" height="26" rx="13" fill="${CREAM}" ${st(2.5)}/>
    ${text(114, 187, '62 miles', 17)}
    ${at(46, 60, 1, star)}${text(46, 26, 'N', 15)}
    <path d="M290,268 L290,288" ${st(8)}/><path d="M290,268 L290,288" ${st(4, RED)}/>
    ${text(386, 284, '9 toll gates', 15, { anchor: 'end' })}
    <rect x="6" y="6" width="388" height="288" rx="6" fill="none" ${st(4)}/>`);
}

// ---------- D. Built in layers ----------

function roadlayers() {
  const T = (x) => { const u = (x - 200) / 140; return 132 - 18 * (1 - u * u); };
  const xs = []; for (let x = 60; x <= 340; x += 10) xs.push(x);
  const curve = (off) => xs.map((x) => `${x},${r1(T(x) + off)}`).join(' L');
  const back = (off) => xs.slice().reverse().map((x) => `${x},${r1(T(x) + off)}`).join(' L');
  const gravel = `M${curve(0)} L${back(26)} Z`;
  const small = `M${curve(26)} L${back(56)} Z`;
  const big = `M${curve(56)} L340,238 L60,238 Z`;
  const R = rng(11);
  const rock = (cx, cy, rad, fill) => {
    const n = 6, p = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + R() * 0.6, rr = rad * (0.7 + R() * 0.35); p.push(`${r1(cx + Math.cos(a) * rr)},${r1(cy + Math.sin(a) * rr * 0.8)}`); }
    return `<path d="M${p.join(' L')} Z" fill="${fill}" ${st(2)}/>`;
  };
  let bigR = '', smallR = '', grav = '';
  for (let y = 176; y < 250; y += 22) for (let x = 50 + (y % 44 ? 16 : 0); x < 350; x += 32) bigR += rock(x + R() * 6, y + R() * 6, 15, R() < 0.5 ? STONE : '#b8b2a5');
  for (let y = 140; y < 196; y += 12) for (let x = 56 + (y % 24 ? 7 : 0); x < 350; x += 15) smallR += rock(x + R() * 4, y + R() * 4, 7, R() < 0.5 ? DSTONE : STONE);
  for (let y = 112; y < 162; y += 7) for (let x = 60 + (y % 14 ? 4 : 0); x < 342; x += 8) grav += `<circle cx="${r1(x + R() * 3)}" cy="${r1(y + R() * 3)}" r="2" fill="${DSTONE}"/>`;
  const R2 = rng(3);
  let rain = '';
  for (let i = 0; i < 26; i++) { const x = r1(20 + R2() * 360), y = r1(14 + R2() * 70); rain += `M${x},${y} l-3,10 `; }
  let hatch = '';
  for (let x = -300; x < 400; x += 16) hatch += `M${x},300 L${x + 160},140 `;
  const pill = (x, y, w, t) => `<rect x="${x - w / 2}" y="${y - 15}" width="${w}" height="22" rx="11" fill="${CREAM}" ${st(2.5)}/>${text(x, y + 1, t, 16)}`;
  return svg(`<defs>
      <clipPath id="tp-roadlayers-big"><path d="${big}"/></clipPath>
      <clipPath id="tp-roadlayers-small"><path d="${small}"/></clipPath>
      <clipPath id="tp-roadlayers-gravel"><path d="${gravel}"/></clipPath>
      <clipPath id="tp-roadlayers-earth"><path d="M0,140 L14,140 L38,172 L58,${r1(T(60))} L60,238 L340,238 L342,${r1(T(340))} L362,172 L386,140 L400,140 L400,300 L0,300 Z"/></clipPath>
      <marker id="tp-roadlayers-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="${DEEP}"/></marker>
    </defs>
    <rect width="400" height="300" fill="${SKY}"/>
    <path d="${rain}" ${st(2.5, DEEP)}/>
    <path d="M0,140 L14,140 L38,172 L58,${r1(T(60))} L60,238 L340,238 L342,${r1(T(340))} L362,172 L386,140 L400,140 L400,300 L0,300 Z" fill="${SEPIA}"/>
    <path d="${hatch}" clip-path="url(#tp-roadlayers-earth)" ${st(2, BROWN)}/>
    <path d="M24,156 L38,172 L52,154 Z M348,154 L362,172 L376,156 Z" fill="${DEEP}"/>
    <path d="M0,140 L14,140 L38,172 L58,${r1(T(60))} M400,140 L386,140 L362,172 L342,${r1(T(340))}" fill="none" ${st(3)}/>
    <path d="${big}" fill="${DSTONE}"/><g clip-path="url(#tp-roadlayers-big)">${bigR}</g>
    <path d="${small}" fill="${STONE}"/><g clip-path="url(#tp-roadlayers-small)">${smallR}</g>
    <path d="${gravel}" fill="${PARCH}"/><g clip-path="url(#tp-roadlayers-gravel)">${grav}</g>
    <path d="${big}" fill="none" ${st(3)}/><path d="${small}" fill="none" ${st(3)}/><path d="${gravel}" fill="none" ${st(4)}/>
    <path d="M184,${r1(T(184) - 12)} C140,${r1(T(140) - 14)} 90,${r1(T(90) - 10)} 62,${r1(T(62) - 8)} Q46,124 40,150" fill="none" ${st(5, DEEP)} marker-end="url(#tp-roadlayers-arrow)"/>
    <path d="M216,${r1(T(216) - 12)} C260,${r1(T(260) - 14)} 310,${r1(T(310) - 10)} 338,${r1(T(338) - 8)} Q354,124 360,150" fill="none" ${st(5, DEEP)} marker-end="url(#tp-roadlayers-arrow)"/>
    ${pill(200, T(200) + 16, 76, 'Gravel')}
    ${pill(200, T(200) + 44, 108, 'Small stone')}
    ${pill(200, 212, 150, 'Big broken stone')}
    ${text(36, 204, 'Ditch', 16, { fill: '#fbf6ea' })}${text(364, 204, 'Ditch', 16, { fill: '#fbf6ea' })}
    ${text(200, 290, 'Earth', 16, { fill: '#fbf6ea' })}`);
}

// ---------- E. Pay at the pike ----------

function tollgate() {
  const pv = [272, 286];
  const topView = `<rect x="14" y="14" width="138" height="100" rx="8" fill="${CREAM}" ${st(3)}/>
    ${text(83, 36, 'FROM ABOVE', 15)}
    <rect x="22" y="48" width="122" height="34" fill="${ROAD}" ${st(2.5)}/>
    <path d="M58,92 L58,46" ${st(4, SEPIA)} stroke-dasharray="5 6"/>
    <path d="M58,92 L134,92" ${st(8)}/><path d="M58,92 L134,92" ${st(4, SEPIA)}/>
    <circle cx="58" cy="92" r="5" fill="${DSTONE}" ${st(2)}/>
    <path d="M66,50 Q116,52 122,80" fill="none" ${st(3, RED)} marker-end="url(#tp-tollgate-arrow)"/>`;
  return svg(`<defs><marker id="tp-tollgate-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${RED}"/></marker></defs>
    <rect width="400" height="300" fill="${SKY}"/>
    <path d="M0,150 Q90,126 200,140 T400,132 L400,300 L0,300 Z" fill="${GRASS}" ${st(3)}/>
    <path d="M176,142 q-4,-24 12,-26 q16,2 12,26 Z M206,140 q-3,-18 10,-19 q12,1 10,19 Z" fill="${DGREEN}" ${st(2.5)}/>
    <g>
      <rect x="358" y="64" width="12" height="30" fill="${DSTONE}" ${st(2)}/>
      <rect x="266" y="104" width="120" height="98" fill="${STONE}" ${st(3)}/>
      <path d="M256,106 L326,64 L394,106 Z" fill="${BROWN}" ${st(3)}/>
      <rect x="354" y="148" width="24" height="54" fill="${BROWN}" ${st(2.5)}/>
      <rect x="274" y="112" width="72" height="84" fill="${CREAM}" ${st(3)}/>
      ${text(310, 133, 'TOLL', 18, { fill: RED })}
      <path d="M282,139 L338,139" ${st(2)}/>
      ${text(310, 157, 'Wagon', 15)}${text(310, 174, 'Horse', 15)}${text(310, 191, 'Rider', 15)}
    </g>
    <path d="M0,204 L400,204 L400,284 L0,284 Z" fill="${ROAD}" ${st(3)}/>
    <path d="M0,244 L400,244" ${st(2, MUD)} stroke-dasharray="14 10"/>
    ${at(64, 256, 0.72, wagon({ cover: true }))}
    <path d="M118,238 L150,234" ${st(4)}/>
    ${at(178, 252, 0.72, horse(BROWN, MUD))}
    ${at(214, 256, 0.9, person({ coat: SEPIA, arms: [[-14, -34], [26, -46]] }))}
    ${at(258, 248, 0.9, person({ coat: DEEP, arms: [[-22, -48], [14, -34]] }))}
    ${coin(238, 211, 6)}
    <rect x="${pv[0] - 6}" y="${pv[1] - 38}" width="12" height="44" rx="3" fill="${BROWN}" ${st(3)}/>
    ${at(pv[0], pv[1] - 32, 1, pike(116), 3)}
    <circle cx="${pv[0]}" cy="${pv[1] - 32}" r="5" fill="${DSTONE}" ${st(2)}/>
    ${topView}`);
}

// ---------- F. Share certificate ----------

function sharecert() {
  let scallop = '';
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; scallop += `<circle cx="${r1(Math.cos(a) * 26)}" cy="${r1(Math.sin(a) * 26)}" r="6" fill="${RED}" ${st(2)}/>`; }
  const corner = (x, y, sx, sy) => `<path transform="translate(${x},${y}) scale(${sx},${sy})" d="M0,22 Q0,0 22,0 M6,22 Q6,6 22,6 M12,12 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0" fill="none" ${st(2, RED)}/>`;
  return svg(`<rect width="400" height="300" fill="${PARCH}"/>
    <rect x="40" y="30" width="336" height="206" fill="${CREAM}" ${st(3)} transform="rotate(3 208 133)"/>
    <rect x="30" y="24" width="336" height="206" fill="${CREAM}" ${st(3)} transform="rotate(-2 198 127)"/>
    <rect x="30" y="16" width="340" height="214" fill="${CREAM}" ${st(4)}/>
    <rect x="40" y="26" width="320" height="194" fill="none" ${st(3, RED)}/>
    <rect x="46" y="32" width="308" height="182" fill="none" ${st(2)}/>
    ${corner(50, 36, 1, 1)}${corner(350, 36, -1, 1)}${corner(50, 210, 1, -1)}${corner(350, 210, -1, -1)}
    ${text(200, 76, 'PHILADELPHIA AND LANCASTER', 16)}
    ${text(200, 97, 'TURNPIKE ROAD COMPANY', 16)}
    <path d="M114,108 Q157,100 200,108 T286,108" fill="none" ${st(2, SEPIA)}/>
    ${text(200, 142, 'ONE SHARE', 28, { fill: RED, extra: 'letter-spacing="2"' })}
    <circle cx="104" cy="178" r="30" fill="${WHEAT}" ${st(3)}/><circle cx="104" cy="178" r="24" fill="none" ${st(1.5)}/>
    ${text(104, 185, '$300', 18)}
    <path d="M158,190 q10,-18 18,-4 q6,10 14,-6 q8,-12 12,2 q4,10 14,-2 q6,-6 12,2" fill="none" ${st(2.5, BROWN)}/>
    <path d="M154,198 L238,198" ${st(2)}/>
    <path d="M284,198 L276,230 L288,222 L296,232 L300,200 Z M308,198 L314,230 L322,220 L332,228 L322,196 Z" fill="${RED}" ${st(2)}/>
    ${at(304, 178, 1, `${scallop}<circle r="24" fill="${RED}" ${st(2)}/><circle r="16" fill="none" ${st(2, CREAM)}/><path d="M-7,-3 L0,-10 L7,-3 L7,7 L-7,7 Z" fill="${CREAM}"/>`)}
    <rect x="72" y="250" width="256" height="34" rx="17" fill="${CREAM}" ${st(3)}/>
    ${text(200, 274, '1,000 × $300 = $300,000', 18)}`);
}

// ---------- G. Shares by lottery ----------

function lottery() {
  const R = rng(5);
  let slips = '';
  for (let i = 0; i < 22; i++) {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 40, x = r1(190 + Math.cos(a) * d), y = r1(118 + Math.sin(a) * d);
    slips += `<rect x="${x - 7}" y="${y - 4}" width="14" height="8" fill="${CREAM}" ${st(1.5)} transform="rotate(${Math.round(R() * 180)} ${x} ${y})"/>`;
  }
  let bricks = '';
  for (let y = 16; y < 200; y += 14) bricks += `M0,${y} L400,${y} `;
  for (let y = 2, k = 0; y < 200; y += 14, k++) for (let x = k % 2 ? 0 : 20; x < 400; x += 40) bricks += `M${x},${y} L${x},${y + 14} `;
  const crowd = [
    [30, 318, SEPIA, 1.3, [[-18, -34], [16, -34]], false], [96, 312, WHEAT, 1.3, [[-16, -34], [20, -104]], false],
    [150, 322, BROWN, 1.25, [[-16, -34], [16, -34]], true], [224, 316, DGREEN, 1.3, [[-20, -100], [16, -34]], false],
    [300, 320, SEPIA, 1.3, [[-16, -34], [16, -34]], true], [362, 312, RED, 1.3, [[-16, -34], [22, -100]], false],
  ];
  const back = [[60, 282, BROWN], [128, 276, RED], [190, 280, SEPIA], [262, 276, DEEP], [330, 282, DGREEN]];
  return svg(`<rect width="400" height="300" fill="${SEPIA}"/>
    <path d="${bricks}" ${st(1.5, BROWN)}/>
    <rect x="14" y="44" width="46" height="70" fill="${SKY}" ${st(3)}/><path d="M37,44 L37,114 M14,79 L60,79" ${st(2)}/>
    <path d="M80,18 L290,18 L280,34 L290,50 L80,50 L90,34 Z" fill="${CREAM}" ${st(3)}/>
    ${text(185, 41, 'SHARE LOTTERY', 20, { fill: RED })}
    <path d="M154,180 L176,150 M226,180 L204,150" ${st(10)}/><path d="M154,180 L176,150 M226,180 L204,150" ${st(6, BROWN)}/>
    <circle cx="190" cy="118" r="52" fill="${BROWN}" ${st(4)}/>
    <circle cx="190" cy="118" r="44" fill="${SKY}" ${st(3)}/>
    ${slips}
    <path d="M190,74 L190,162 M146,118 L234,118" ${st(2, BROWN)}/>
    <circle cx="190" cy="118" r="6" fill="${DSTONE}" ${st(2)}/>
    <path d="M190,118 L246,118 L246,96" fill="none" ${st(8)}/><path d="M190,118 L246,118 L246,96" fill="none" ${st(4, DSTONE)}/>
    <rect x="240" y="80" width="12" height="18" rx="4" fill="${BROWN}" ${st(2)}/>
    ${at(326, 180, 1.1, person({ coat: DEEP, legs: BROWN, hat: INK, arms: [[-24, -40], [10, -104]] }))}
    <g transform="rotate(-8 338 54)"><rect x="318" y="40" width="40" height="26" fill="${CREAM}" ${st(2.5)}/><path d="M324,50 L350,50 M324,58 L344,58" ${st(2, SEPIA)}/></g>
    <rect x="20" y="178" width="360" height="24" fill="${BROWN}" ${st(3)}/>
    ${back.map(([x, y, c]) => at(x, y, 1.05, person({ coat: c, hat: INK }))).join('')}
    ${crowd.map(([x, y, c, s, arms, bon]) => at(x, y, s, person({ coat: c, arms, bonnet: bon, hat: bon ? CREAM : INK }))).join('')}`);
}

// ---------- H. Pays year after year ----------

function tollcoins() {
  const mini = (ground, extra, sky = SKY) => `<circle r="46" fill="${sky}"/>
    <path d="M-50,10 L50,10 L50,50 L-50,50 Z" fill="${ground}"/>
    <path d="M-50,22 L50,22" ${st(2, MUD)}/>
    ${extra}
    <rect x="16" y="-6" width="26" height="24" fill="${STONE}" ${st(2)}/>
    <path d="M12,-4 L29,-18 L46,-4 Z" fill="${BROWN}" ${st(2)}/>
    <rect x="24" y="2" width="10" height="16" fill="${BROWN}" ${st(1.5)}/>
    ${at(-12, 28, 0.32, wagon({ cover: true }))}`;
  const clip = (id, body) => `<g clip-path="url(#tp-tollcoins-${id})">${body}</g><circle r="46" fill="none" ${st(4)}/>`;
  let sun = '';
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; sun += `M${r1(-22 + Math.cos(a) * 14)},${r1(-20 + Math.sin(a) * 14)} L${r1(-22 + Math.cos(a) * 19)},${r1(-20 + Math.sin(a) * 19)} `; }
  const spring = mini(GRASS, `<path d="M-30,-30 l-3,8 M-18,-22 l-3,8 M-8,-34 l-3,8 M6,-26 l-3,8 M-36,-12 l-3,8" ${st(2.5, DEEP)}/><circle cx="-30" cy="38" r="4" fill="${RED}" ${st(1.5)}/><circle cx="30" cy="40" r="4" fill="${SNOW}" ${st(1.5)}/>`);
  const summer = mini(DGREEN, `<path d="${sun}" ${st(2.5, WHEAT)}/><circle cx="-22" cy="-20" r="10" fill="${WHEAT}" ${st(2)}/>`);
  const fall = mini(WHEAT, `<path d="M-30,-26 q6,-6 10,0 q-4,6 -10,0 Z M-10,-34 q6,-6 10,0 q-4,6 -10,0 Z M-34,-6 q6,-6 10,0 q-4,6 -10,0 Z M2,-16 q6,-6 10,0 q-4,6 -10,0 Z" fill="${RED}" ${st(1.5)}/>`);
  let flakes = '';
  for (const [x, y] of [[-30, -26], [-12, -34], [-34, -6], [0, -18], [34, -30], [-14, -4]]) flakes += `M${x - 4},${y} L${x + 4},${y} M${x},${y - 4} L${x},${y + 4} `;
  const winter = mini(SNOW, `<path d="${flakes}" ${st(2, DEEP)}/>`, STONE);
  const seasons = [[78, 78, 'spr', spring, 'Spring', 146], [322, 78, 'sum', summer, 'Summer', 146], [322, 214, 'fal', fall, 'Fall', 288], [78, 214, 'win', winter, 'Winter', 288]];
  const flow = (x1, y1, x2, y2) => `<path d="M${x1},${y1} L${x2},${y2}" ${st(3, SEPIA)} stroke-dasharray="3 8"/>`;
  return svg(`<defs><clipPath id="tp-tollcoins-med"><circle r="46"/></clipPath>
    <marker id="tp-tollcoins-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${BROWN}"/></marker></defs>
    <rect width="400" height="300" fill="${PARCH}"/>
    <path d="M136,50 Q200,20 264,50" fill="none" ${st(4, BROWN)} marker-end="url(#tp-tollcoins-arrow)"/>
    <path d="M374,152 Q386,166 374,180" fill="none" ${st(4, BROWN)} marker-end="url(#tp-tollcoins-arrow)"/>
    <path d="M264,244 Q200,274 136,244" fill="none" ${st(4, BROWN)} marker-end="url(#tp-tollcoins-arrow)"/>
    <path d="M26,180 Q14,166 26,152" fill="none" ${st(4, BROWN)} marker-end="url(#tp-tollcoins-arrow)"/>
    ${flow(118, 104, 164, 140)}${flow(282, 104, 236, 140)}${flow(282, 190, 250, 172)}${flow(118, 190, 150, 172)}
    ${coin(140, 120, 7)}${coin(260, 120, 7)}${coin(266, 181, 7)}${coin(134, 181, 7)}
    ${seasons.map(([x, y, , body]) => `<g transform="translate(${x},${y})">${clip('med', body)}</g>`).join('')}
    ${seasons.map(([x, , , , name, ly]) => text(x, ly, name, 16)).join('')}
    ${coin(186, 128, 8)}${coin(206, 120, 8)}${coin(196, 140, 8)}${coin(214, 138, 8)}
    <path d="M152,150 L248,150 L248,204 L152,204 Z" fill="${BROWN}" ${st(3)}/>
    <path d="M152,150 L160,134 L240,134 L248,150" fill="${MUD}" ${st(3)}/>
    <path d="M170,150 L170,204 M230,150 L230,204" ${st(6, DSTONE)}/><path d="M170,150 L170,204 M230,150 L230,204" ${st(1.5)}/>
    <rect x="190" y="160" width="20" height="22" rx="3" fill="${WHEAT}" ${st(2)}/><circle cx="200" cy="169" r="3" fill="${INK}"/><path d="M200,170 L200,177" ${st(2)}/>
    ${text(200, 226, 'TOLLS', 17)}`);
}

export default {
  wheatfarm: wheatfarm(),
  mudwagon: mudwagon(),
  turnpikemap: turnpikemap(),
  roadlayers: roadlayers(),
  tollgate: tollgate(),
  sharecert: sharecert(),
  lottery: lottery(),
  tollcoins: tollcoins(),
};
