// Exhibit drawings for the Steamboat pitch (1808). One SVG per art key in content/exhibits.json.

const INK = '#1b1410', PAPER = '#f7efdc', PARCH = '#efe3c6', SEPIA = '#8a6a44', BROWN = '#6b4a2b';
const DIRT = '#a07a4f', MUD = '#6d4c2f', STONE = '#a39d90', DSTONE = '#77716a', WATER = '#7fb0c4', DWATER = '#3f7891';
const GRASS = '#9bb07a', DGREEN = '#5f7a45', BRASS = '#d9b04c', RED = '#b3342e', CREAM = '#fbf6ea', SKY = '#dce9ea';

const O = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
const T = `font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="bold" fill="${INK}"`;
const TS = `font-family="Georgia, serif" font-style="italic" fill="${INK}"`;
const svg = (body) => `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const r2 = (n) => Math.round(n * 100) / 100;

/** Open side paddle wheel: rim, spokes and paddle boards. */
function wheel(cx, cy, r, sw, rot = 0) {
  let s = `<g ${O}><circle cx="${cx}" cy="${cy}" r="${r}" fill="${PARCH}" stroke-width="${sw}"/>`;
  for (let i = 0; i < 8; i++) {
    const a = ((rot + i * 45) * Math.PI) / 180;
    s += `<line x1="${cx}" y1="${cy}" x2="${r2(cx + Math.cos(a) * r)}" y2="${r2(cy + Math.sin(a) * r)}" stroke-width="${r2(sw * 0.66)}"/>`;
  }
  for (let i = 0; i < 8; i++) {
    const a = rot + i * 45 + 22.5;
    s += `<rect x="${r2(-r * 0.12)}" y="${r2(-r * 1.14)}" width="${r2(r * 0.24)}" height="${r2(r * 0.42)}" fill="${BROWN}" stroke-width="${r2(sw * 0.66)}" transform="translate(${cx} ${cy}) rotate(${a})"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${r2(r * 0.2)}" fill="${BRASS}" stroke-width="${r2(sw * 0.66)}"/></g>`;
}

/** Smoke puffs trailing from (x, y) back toward the left (the boat is steaming right). */
function smoke(x, y, k = 1) {
  const p = [[0, 0, 8, STONE], [-14, -12, 11, DSTONE], [-34, -20, 14, STONE], [-60, -24, 16, DSTONE], [-88, -24, 17, STONE]];
  return p.map(([dx, dy, r, c]) => `<circle cx="${r2(x + dx * k)}" cy="${r2(y + dy * k)}" r="${r2(r * k)}" fill="${c}" ${O} stroke-width="2"/>`).join('');
}

/**
 * The Clermont, side view facing right: long, low, flat-decked hull, one tall thin stack
 * amidships, open side paddle wheel, small stern cabin, a short flag mast forward.
 * Waterline at local y = 0; hull spans about x -84..88.
 */
function boat({ x = 0, y = 0, s = 1, hull = BROWN, band = RED, puffs = true, flag = true, rot = 10, cabin = CREAM, stack = DSTONE } = {}) {
  const sw = r2(3 / s), sw2 = r2(2 / s);
  let g = `<g transform="translate(${x} ${y}) scale(${s})" ${O}>`;
  if (puffs) g += smoke(-13, -84, puffs === true ? 1 : puffs);
  if (flag) g += `<line x1="56" y1="-17" x2="56" y2="-60" stroke-width="${sw2}"/><path d="M56,-60 L78,-54 L56,-48 Z" fill="${RED}" stroke-width="${sw2}"/>`;
  g += `<line x1="-66" y1="-26" x2="-66" y2="-48" stroke-width="${sw2}"/>`;
  g += `<rect x="-18" y="-76" width="10" height="62" fill="${stack}" stroke-width="${sw}"/><rect x="-21" y="-80" width="16" height="6" fill="${INK}" stroke-width="${sw2}"/>`;
  g += `<rect x="-78" y="-28" width="36" height="14" rx="2" fill="${cabin}" stroke-width="${sw}"/>`;
  g += `<rect x="-72" y="-24" width="7" height="6" fill="${INK}" stroke="none"/><rect x="-57" y="-24" width="7" height="6" fill="${INK}" stroke="none"/>`;
  g += `<rect x="-30" y="-24" width="30" height="10" fill="${STONE}" stroke-width="${sw2}"/>`;
  g += `<path d="M-86,-14 L88,-18 Q84,-6 74,4 L-74,4 Q-84,-4 -86,-14 Z" fill="${hull}" stroke-width="${sw}"/>`;
  g += `<path d="M-82,-9 L84,-12" stroke="${band}" stroke-width="${r2(4 / s)}" fill="none"/>`;
  g += wheel(12, -10, 20, sw, rot);
  return g + '</g>';
}

/** Water surface with a gentle wave top edge from x0 to x1, filled down to the bottom. */
function waves(y, fill = WATER, amp = 4, step = 40, x0 = 0, x1 = 400) {
  let d = `M${x0},${y}`;
  for (let x = x0; x < x1; x += step) d += ` q${step / 4},${-amp} ${step / 2},0 t${step / 2},0`;
  return `<path d="${d} L${x1},300 L${x0},300 Z" fill="${fill}" stroke="none"/><path d="${d}" fill="none" ${O} stroke-width="3"/>`;
}

/** A short ripple line. */
const ripple = (x, y, w = 24) => `<path d="M${x},${y} q${w / 4},-4 ${w / 2},0 t${w / 2},0" fill="none" stroke="${DWATER}" stroke-width="2" stroke-linecap="round"/>`;

/** An arrowhead-tipped line (no markers, so no ids are needed). */
function arrow(x1, y1, x2, y2, color = INK, w = 3, head = 10, both = false) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const tip = (x, y, ang) => {
    const l = [x - head * Math.cos(ang - 0.5), y - head * Math.sin(ang - 0.5)];
    const r = [x - head * Math.cos(ang + 0.5), y - head * Math.sin(ang + 0.5)];
    return `<path d="M${r2(l[0])},${r2(l[1])} L${x},${y} L${r2(r[0])},${r2(r[1])}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  };
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>` + tip(x2, y2, a) + (both ? tip(x1, y1, a + Math.PI) : '');
}

/** Numbered step badge. */
const badge = (x, y, n) => `<circle cx="${x}" cy="${y}" r="11" fill="${RED}" ${O} stroke-width="2"/><text x="${x}" y="${y + 5.5}" text-anchor="middle" font-size="15" font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="bold" fill="${CREAM}">${n}</text>`;

/** A clock face. */
function clock(cx, cy, r, h = 10, m = 10) {
  let s = `<g ${O}><circle cx="${cx}" cy="${cy}" r="${r}" fill="${CREAM}" stroke-width="3"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180, l = i % 3 === 0 ? 0.72 : 0.8;
    s += `<line x1="${r2(cx + Math.sin(a) * r * l)}" y1="${r2(cy - Math.cos(a) * r * l)}" x2="${r2(cx + Math.sin(a) * r * 0.9)}" y2="${r2(cy - Math.cos(a) * r * 0.9)}" stroke-width="${i % 3 === 0 ? 3 : 2}"/>`;
  }
  const ha = ((h % 12) * 30 + m * 0.5) * Math.PI / 180, ma = m * 6 * Math.PI / 180;
  s += `<line x1="${cx}" y1="${cy}" x2="${r2(cx + Math.sin(ha) * r * 0.45)}" y2="${r2(cy - Math.cos(ha) * r * 0.45)}" stroke-width="4"/>`;
  s += `<line x1="${cx}" y1="${cy}" x2="${r2(cx + Math.sin(ma) * r * 0.68)}" y2="${r2(cy - Math.cos(ma) * r * 0.68)}" stroke-width="3"/>`;
  return s + `<circle cx="${cx}" cy="${cy}" r="3" fill="${INK}"/></g>`;
}

/** Simple cartoon figure standing with feet at (x, y). */
function person(x, y, { coat = BROWN, hat = 'top', s = 1, face = CREAM } = {}) {
  let g = `<g transform="translate(${x} ${y}) scale(${s})" ${O}>`;
  g += `<line x1="-6" y1="-20" x2="-7" y2="0" stroke-width="5"/><line x1="6" y1="-20" x2="7" y2="0" stroke-width="5"/>`;
  g += `<path d="M-13,-18 L-11,-44 Q0,-50 11,-44 L13,-18 Z" fill="${coat}" stroke-width="3"/>`;
  g += `<circle cx="0" cy="-56" r="10" fill="${face}" stroke-width="3"/>`;
  if (hat === 'top') g += `<rect x="-8" y="-82" width="16" height="18" fill="${INK}" stroke-width="2"/><line x1="-13" y1="-64" x2="13" y2="-64" stroke-width="4"/>`;
  if (hat === 'bonnet') g += `<path d="M-12,-56 Q-12,-72 0,-72 Q12,-72 12,-56 Q6,-66 -12,-56 Z" fill="${BRASS}" stroke-width="2"/>`;
  if (hat === 'cocked') g += `<path d="M-16,-63 Q0,-80 16,-63 Q0,-68 -16,-63 Z" fill="${INK}" stroke-width="2"/>`;
  return g + '</g>';
}

// ---------------------------------------------------------------------------------------------
// nowind: the steamboat pushing ahead beside a becalmed sloop, and a crossed-out wind symbol.
const nowind = svg(`
<rect x="0" y="0" width="400" height="300" fill="${SKY}"/>
<path d="M0,190 Q40,170 90,186 Q150,160 210,184 Q280,166 330,182 Q370,172 400,178 L400,200 L0,200 Z" fill="${GRASS}" ${O} stroke-width="3"/>
${waves(198, WATER, 3)}
<g ${O}>
  <line x1="66" y1="84" x2="66" y2="214" stroke-width="4"/>
  <path d="M66,86 L68,98 L66,108" fill="${RED}" stroke-width="2"/>
  <path d="M65,96 Q44,108 30,124" fill="none" stroke-width="4"/>
  <path d="M65,98 Q50,108 31,124 Q40,150 33,168 Q38,178 30,196 L65,198 Q58,176 64,160 Q58,130 65,98 Z" fill="${CREAM}" stroke-width="3"/>
  <path d="M46,120 Q52,150 45,190 M56,108 Q60,140 55,196" fill="none" stroke="${SEPIA}" stroke-width="2"/>
  <line x1="28" y1="198" x2="70" y2="198" stroke-width="4"/>
  <path d="M68,94 Q84,150 108,204 Q98,198 94,184 Q84,174 86,158 Q72,138 68,94 Z" fill="${CREAM}" stroke-width="3"/>
  <path d="M14,204 L120,204 Q116,214 106,220 L26,220 Q16,214 14,204 Z" fill="${SEPIA}" stroke-width="3"/>
</g>
${ripple(40, 232)}${ripple(82, 238)}
<path d="M150,228 L190,228 M158,238 L200,238 M170,248 L208,248" stroke="${CREAM}" stroke-width="3" stroke-linecap="round"/>
${boat({ x: 262, y: 222, s: 1.0, rot: 18 })}
<path d="M352,214 q10,6 22,4 M348,226 q12,6 26,4" fill="none" stroke="${CREAM}" stroke-width="3" stroke-linecap="round"/>
<g ${O}>
  <circle cx="200" cy="58" r="36" fill="${CREAM}" stroke="${RED}" stroke-width="6"/>
  <path d="M176,48 L206,48 Q218,48 218,38 Q218,30 210,30 Q203,30 203,37" fill="none" stroke="${DWATER}" stroke-width="4"/>
  <path d="M172,60 L222,60" fill="none" stroke="${DWATER}" stroke-width="4"/>
  <path d="M180,72 L210,72 Q220,72 220,81 Q220,88 212,88 Q206,88 206,82" fill="none" stroke="${DWATER}" stroke-width="4"/>
  <line x1="175" y1="33" x2="225" y2="83" stroke="${RED}" stroke-width="7"/>
</g>
<text x="92" y="276" text-anchor="middle" font-size="16" ${T}>SLOOP</text>
<text x="274" y="276" text-anchor="middle" font-size="16" ${T}>STEAMBOAT</text>
`);

// ---------------------------------------------------------------------------------------------
// hudsonmap: north-up map, New York City to Albany, 150 miles, 5 mph, about 32 hours.
const hudsonRiver = 'M198,292 L200,262 C203,244 194,232 200,214 C205,198 192,192 202,180 C212,168 202,150 206,130 C210,110 208,90 214,70 C218,56 218,48 220,26';
const mtn = (x, y, w = 22, h = 18) => `<path d="M${x - w / 2},${y} L${x},${y - h} L${x + w / 2},${y} Z" fill="${SEPIA}" ${O} stroke-width="2"/>`;
const hudsonmap = svg(`
<rect x="0" y="0" width="400" height="300" fill="${PARCH}"/>
<path d="M8,276 Q100,268 190,276 L230,276 Q320,270 392,280 L392,292 L8,292 Z" fill="${WATER}" ${O} stroke-width="2"/>
<path d="M219,38 Q190,30 160,34 Q140,36 120,30" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
<path d="M219,38 Q190,30 160,34 Q140,36 120,30" fill="none" stroke="${WATER}" stroke-width="5" stroke-linecap="round"/>
<path d="${hudsonRiver}" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${hudsonRiver}" fill="none" stroke="${WATER}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
${mtn(168, 98)}${mtn(184, 110, 20, 15)}${mtn(160, 118, 18, 14)}${mtn(180, 190, 18, 14)}${mtn(224, 188, 18, 14)}
<path d="M207,258 L215,262 L213,284 L205,282 Z" fill="${GRASS}" ${O} stroke-width="2"/>
<circle cx="208" cy="272" r="5" fill="${RED}" ${O} stroke-width="2"/>
<circle cx="219" cy="46" r="5" fill="${RED}" ${O} stroke-width="2"/>
<text x="232" y="52" font-size="19" ${TS}>Albany</text>
<text x="192" y="266" text-anchor="end" font-size="19" ${TS}>New York</text>
<text x="118" y="206" font-size="15" ${TS}>Hudson</text>
<g ${O} stroke-width="3" fill="none"><path d="M290,46 L304,46 M297,46 L297,268 M290,268 L304,268"/></g>
<rect x="312" y="128" width="70" height="56" rx="6" fill="${CREAM}" ${O} stroke-width="3"/>
<text x="347" y="155" text-anchor="middle" font-size="22" ${T}>150</text>
<text x="347" y="175" text-anchor="middle" font-size="15" ${T}>miles</text>
<line x1="297" y1="156" x2="312" y2="156" ${O} stroke-width="3"/>
${boat({ x: 206, y: 152, s: 0.42, puffs: false, flag: false })}
${arrow(252, 158, 252, 120, RED, 4, 10)}
<g ${O}><path d="M26,100 L96,100 L108,114 L96,128 L26,128 Z" fill="${BRASS}" stroke-width="3"/></g>
<text x="61" y="121" text-anchor="middle" font-size="20" ${T}>5 mph</text>
${clock(64, 196, 30, 8, 0)}
<text x="64" y="252" text-anchor="middle" font-size="17" ${T}>~32 hours</text>
<g ${O}><path d="M44,28 L52,58 L44,52 L36,58 Z" fill="${INK}" stroke-width="2"/></g>
<text x="44" y="78" text-anchor="middle" font-size="16" ${T}>N</text>
<rect x="5" y="5" width="390" height="290" fill="none" ${O} stroke-width="4"/>
`);

// ---------------------------------------------------------------------------------------------
// engine: cutaway, fire -> boiler -> steam pipe -> cylinder & piston -> crank -> paddle wheel.
const flame = (x, y, s = 1) => `<path d="M${x},${y} q${-10 * s},${-12 * s} ${-2 * s},${-30 * s} q${2 * s},${10 * s} ${8 * s},${12 * s} q${2 * s},${-12 * s} ${10 * s},${-18 * s} q${-2 * s},${22 * s} ${4 * s},${36 * s} Z" fill="${RED}" ${O} stroke-width="2"/><path d="M${x + 2 * s},${y - 2 * s} q${-4 * s},${-8 * s} ${2 * s},${-16 * s} q${4 * s},${8 * s} ${6 * s},${16 * s} Z" fill="${BRASS}" stroke="none"/>`;
const engine = svg(`
<rect x="0" y="0" width="400" height="300" fill="${PAPER}"/>
${waves(236, WATER, 4)}
<path d="M8,236 L260,236 L256,258 L14,258 Z" fill="${BROWN}" ${O} stroke-width="3"/>
<g ${O}>
  <rect x="26" y="192" width="104" height="44" fill="${SEPIA}" stroke-width="3"/>
  <path d="M26,207 L130,207 M26,222 L130,222 M52,192 L52,207 M104,192 L104,207 M78,207 L78,222 M40,222 L40,236 M116,222 L116,236" fill="none" stroke-width="2"/>
  <rect x="46" y="200" width="64" height="32" rx="4" fill="${INK}" stroke-width="2"/>
  <line x1="52" y1="228" x2="104" y2="224" stroke="${BROWN}" stroke-width="7"/>
  <line x1="54" y1="222" x2="102" y2="229" stroke="${MUD}" stroke-width="7"/>
</g>
${flame(62, 226, 0.75)}${flame(76, 226, 0.85)}${flame(92, 226, 0.75)}
<g ${O}>
  <rect x="18" y="104" width="120" height="88" rx="30" fill="${STONE}" stroke-width="4"/>
  <rect x="30" y="114" width="96" height="70" rx="20" fill="${CREAM}" stroke-width="2"/>
  <path d="M30,150 L126,150 L126,164 Q126,184 106,184 L50,184 Q30,184 30,164 Z" fill="${WATER}" stroke-width="2"/>
  <circle cx="52" cy="166" r="4" fill="${CREAM}" stroke-width="1.5"/><circle cx="72" cy="160" r="3" fill="${CREAM}" stroke-width="1.5"/><circle cx="96" cy="170" r="4" fill="${CREAM}" stroke-width="1.5"/><circle cx="110" cy="158" r="3" fill="${CREAM}" stroke-width="1.5"/>
</g>
<text x="78" y="140" text-anchor="middle" font-size="16" ${T}>BOILER</text>
<path d="M100,106 L100,74 L166,74 L166,98" fill="none" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>
<path d="M100,106 L100,74 L166,74 L166,98" fill="none" stroke="${STONE}" stroke-width="8" stroke-linejoin="round"/>
${arrow(112, 58, 156, 58, INK, 3, 9)}
<text x="116" y="42" font-size="16" ${T}>STEAM</text>
<g ${O}>
  <rect x="146" y="96" width="94" height="44" rx="4" fill="${STONE}" stroke-width="4"/>
  <rect x="154" y="103" width="78" height="30" fill="${CREAM}" stroke-width="2"/>
  <circle cx="166" cy="113" r="5" fill="${STONE}" stroke="none"/><circle cx="178" cy="122" r="6" fill="${STONE}" stroke="none"/><circle cx="168" cy="126" r="4" fill="${STONE}" stroke="none"/>
  <rect x="190" y="101" width="12" height="34" fill="${BROWN}" stroke-width="3"/>
  <line x1="202" y1="118" x2="266" y2="118" stroke-width="7"/>
  <rect x="258" y="110" width="16" height="16" fill="${BRASS}" stroke-width="3"/>
  <line x1="266" y1="118" x2="306" y2="172" stroke-width="7"/>
</g>
${arrow(170, 156, 226, 156, RED, 4, 9, true)}
<text x="176" y="182" font-size="16" ${T}>PISTON</text>
${wheel(320, 190, 54, 4, 8)}
<g ${O}>
  <circle cx="320" cy="190" r="22" fill="${BRASS}" stroke-width="3"/>
  <line x1="320" y1="190" x2="306" y2="172" stroke-width="7"/>
  <circle cx="306" cy="172" r="5" fill="${INK}" stroke-width="2"/>
  <circle cx="320" cy="190" r="5" fill="${INK}" stroke-width="2"/>
</g>
${waves(248, WATER, 4, 36, 256, 400)}
<path d="M340,116 A76,76 0 0 1 392,160" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
${arrow(388, 150, 392, 162, RED, 4, 10)}
<text x="266" y="281" font-size="16" ${T}>PADDLE WHEEL</text>
<text x="38" y="281" font-size="16" ${T}>WOOD FIRE</text>
${badge(24, 275, 1)}${badge(102, 36, 2)}${badge(162, 176, 3)}${badge(252, 275, 4)}
`);

// ---------------------------------------------------------------------------------------------
// schedule: a posted handbill for the New-York to Albany steam boat.
const crate = (x, y) => `<g ${O}><rect x="${x - 20}" y="${y - 34}" width="40" height="34" fill="${SEPIA}" stroke-width="3"/><path d="M${x - 20},${y - 34} L${x + 20},${y} M${x + 20},${y - 34} L${x - 20},${y}" fill="none" stroke-width="2"/></g>`;
const sack = (x, y) => `<g ${O}><path d="M${x - 16},${y} Q${x - 24},${y - 22} ${x - 8},${y - 34} L${x - 12},${y - 42} L${x + 12},${y - 42} L${x + 8},${y - 34} Q${x + 24},${y - 22} ${x + 16},${y} Z" fill="${PARCH}" stroke-width="3"/><path d="M${x - 10},${y - 36} L${x + 10},${y - 36}" stroke-width="3"/><rect x="${x - 10}" y="${y - 24}" width="20" height="13" fill="${CREAM}" stroke-width="2"/><path d="M${x - 10},${y - 24} L${x},${y - 16} L${x + 10},${y - 24}" fill="none" stroke-width="2"/></g>`;
const schedule = svg(`
<rect x="0" y="0" width="400" height="300" fill="${BROWN}"/>
<path d="M50,0 L50,300 M100,0 L100,300 M150,0 L150,300 M200,0 L200,300 M250,0 L250,300 M300,0 L300,300 M350,0 L350,300" stroke="${MUD}" stroke-width="3"/>
<g ${O}>
  <path d="M48,16 L352,12 L356,286 L44,290 Z" fill="${CREAM}" stroke-width="4"/>
  <path d="M58,26 L342,23 L345,276 L55,279 Z" fill="none" stroke="${SEPIA}" stroke-width="2"/>
  <circle cx="60" cy="24" r="5" fill="${RED}" stroke-width="2"/><circle cx="340" cy="21" r="5" fill="${RED}" stroke-width="2"/>
</g>
<text x="200" y="52" text-anchor="middle" font-size="24" ${T} letter-spacing="2">STEAM BOAT</text>
${boat({ x: 206, y: 114, s: 0.5, rot: 5 })}
<path d="M140,116 q10,-4 20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0" fill="none" stroke="${DWATER}" stroke-width="2" stroke-linecap="round"/>
<text x="124" y="148" text-anchor="middle" font-size="19" ${T}>NEW-YORK</text>
${arrow(184, 142, 222, 142, INK, 3, 9)}
<text x="274" y="148" text-anchor="middle" font-size="19" ${T}>ALBANY</text>
<line x1="80" y1="162" x2="320" y2="162" stroke="${RED}" stroke-width="3"/>
<text x="200" y="183" text-anchor="middle" font-size="16" ${T}>DEPARTS ON SCHEDULE</text>
<line x1="80" y1="192" x2="320" y2="192" stroke="${RED}" stroke-width="3"/>
${clock(106, 236, 32, 9, 0)}
${person(170, 258, { coat: DWATER, hat: 'top', s: 0.72 })}${person(192, 258, { coat: RED, hat: 'bonnet', s: 0.66 })}
${crate(252, 258)}
${sack(314, 258)}
<line x1="146" y1="258" x2="336" y2="258" stroke="${SEPIA}" stroke-width="2"/>
<text x="181" y="276" text-anchor="middle" font-size="15" ${T}>PEOPLE</text>
<text x="252" y="276" text-anchor="middle" font-size="15" ${T}>FREIGHT</text>
<text x="314" y="276" text-anchor="middle" font-size="15" ${T}>MAIL</text>
`);

// ---------------------------------------------------------------------------------------------
// nymonopoly: New York State with every river and lake highlighted, sealed "exclusive rights".
// Outline traced from longitude/latitude: x = 20 + (lon + 79.9) * 44, y = 20 + (45.2 - lat) * 58,
// then the whole map is nudged up 8 units to leave room for the seal over Pennsylvania.
const NYS = 'M26,206 L26,190 L64,155 L57,132 L92,134 L121,133 L148,128 L170,121 L180,108 L183,95 L177,82 L196,70 L215,55 L235,42 L249,32 L308,32 L308,70 L306,116 L312,116 L312,162 L302,203 L302,252 L295,264 L283,264 L266,254 L249,243 L236,222 L220,206 Z';
const LI = 'M284,268 L300,264 L330,258 L354,253 L342,261 L374,257 L360,266 L330,276 L302,284 L286,287 L282,278 Z';
const lakeLine = (d, w = 6) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${WATER}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
function sealStar(cx, cy, R) {
  let d = '';
  for (let i = 0; i < 32; i++) {
    const a = (i * Math.PI) / 16, r = i % 2 ? R * 0.86 : R;
    d += `${i ? 'L' : 'M'}${r2(cx + Math.sin(a) * r)},${r2(cy - Math.cos(a) * r)} `;
  }
  return `<path d="${d}Z" fill="${RED}" ${O} stroke-width="3"/>`;
}
const nymonopoly = svg(`
<rect x="0" y="0" width="400" height="300" fill="${PAPER}"/>
<g transform="translate(0 -8)">
<path d="M295,264 L330,254 L374,246 L400,243 L400,308 L277,308 L278,290 L283,264 Z" fill="${WATER}" ${O} stroke-width="2"/>
<path d="M57,132 L92,134 L121,133 L148,128 L170,121 L180,108 L183,95 L177,82 L150,82 L120,86 L80,98 L44,108 L34,122 Z" fill="${WATER}" ${O} stroke-width="2"/>
<path d="M26,190 L64,155 L54,150 L30,154 L0,158 L0,200 Z" fill="${WATER}" ${O} stroke-width="2"/>
${lakeLine('M177,82 L196,70 L215,55 L235,42 L249,32 L276,20 L292,10', 7)}
<path d="${NYS}" fill="${BRASS}" ${O} stroke-width="4"/>
<path d="${LI}" fill="${BRASS}" ${O} stroke-width="3"/>
<path d="M305,34 Q312,60 306,84 Q304,104 306,118 L302,118 Q298,100 300,80 Q302,56 298,34 Z" fill="${WATER}" ${O} stroke-width="2"/>
${lakeLine('M300,101 L302,118', 4)}
${lakeLine('M281,284 L282,264 L282,240 L282,223 L281,210 L286,194 L291,168 L293,163 L295,130 L280,113 L271,92', 6)}
${lakeLine('M293,163 L282,159 L271,151 L242,145 L225,142 L215,135', 5)}
${lakeLine('M104,204 L110,180 L114,160 L121,134', 4)}
${lakeLine('M192,136 L205,135', 6)}
${lakeLine('M160,152 L170,180', 4)}${lakeLine('M150,155 L153,183', 4)}${lakeLine('M143,168 L139,182', 4)}${lakeLine('M135,156 L133,168', 4)}${lakeLine('M173,151 L175,160', 4)}
<circle cx="291" cy="168" r="4" fill="${INK}"/>
<text x="120" y="106" text-anchor="middle" font-size="15" ${TS}>L. Ontario</text>
<text x="230" y="194" text-anchor="middle" font-size="18" ${T}>NEW YORK</text>
<text x="332" y="146" font-size="15" ${TS}>Hudson</text>
${arrow(330, 141, 299, 146, INK, 2, 7)}
</g>
<g ${O}>
  <path d="M104,216 L228,216 L218,246 L228,276 L104,276 Z" fill="${RED}" stroke-width="3"/>
  <rect x="114" y="223" width="98" height="46" fill="${CREAM}" stroke-width="2"/>
</g>
<text x="163" y="243" text-anchor="middle" font-size="15" ${T}>EXCLUSIVE</text>
<text x="163" y="262" text-anchor="middle" font-size="15" ${T}>RIGHTS</text>
${sealStar(66, 246, 44)}
<circle cx="66" cy="246" r="33" fill="none" stroke="${CREAM}" stroke-width="2.5"/>
<text x="66" y="250" text-anchor="middle" font-size="26" font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="bold" fill="${CREAM}">30</text>
<text x="66" y="268" text-anchor="middle" font-size="15" font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="bold" fill="${CREAM}">YEARS</text>
`);

// ---------------------------------------------------------------------------------------------
// seized: an unlicensed rival steamboat chained at the wharf and stamped SEIZED.
const seized = svg(`
<rect x="0" y="0" width="400" height="300" fill="${SKY}"/>
<path d="M0,170 Q60,150 130,168 Q210,146 290,166 Q350,152 400,160 L400,190 L0,190 Z" fill="${GRASS}" ${O} stroke-width="3"/>
${waves(188, WATER, 3)}
<g ${O}>
  <rect x="0" y="178" width="108" height="20" fill="${SEPIA}" stroke-width="3"/>
  <rect x="10" y="198" width="12" height="102" fill="${BROWN}" stroke-width="3"/>
  <rect x="70" y="198" width="12" height="102" fill="${BROWN}" stroke-width="3"/>
  <rect x="90" y="160" width="14" height="22" rx="3" fill="${MUD}" stroke-width="3"/>
</g>
${ripple(120, 262)}${ripple(318, 272)}${ripple(34, 250)}
${boat({ x: 244, y: 222, s: 0.95, hull: DSTONE, band: INK, puffs: false, flag: false, cabin: PARCH, stack: STONE, rot: 0 })}
<path d="M104,170 Q130,192 160,208" fill="none" ${O} stroke-dasharray="1 9" stroke-width="7"/>
<g transform="translate(42 178)">
  ${person(0, 0, { coat: DWATER, hat: 'cocked', s: 1.0 })}
  <g ${O}>
    <path d="M10,-38 L26,-46" stroke-width="5"/>
    <rect x="22" y="-80" width="30" height="38" fill="${CREAM}" stroke-width="3" transform="rotate(8 37 -61)"/>
    <path d="M30,-70 L46,-68 M29,-62 L45,-60 M28,-54 L40,-52" stroke-width="2" stroke="${SEPIA}"/>
  </g>
</g>
<g transform="rotate(-10 246 150)" stroke-linejoin="round">
  <rect x="150" y="116" width="192" height="66" rx="8" fill="none" stroke="${CREAM}" stroke-width="13"/>
  <rect x="150" y="116" width="192" height="66" rx="8" fill="none" stroke="${RED}" stroke-width="7"/>
  <text x="248" y="165" text-anchor="middle" font-size="42" font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="bold" fill="${RED}" stroke="${CREAM}" stroke-width="6" paint-order="stroke" letter-spacing="4">SEIZED</text>
</g>
<text x="244" y="282" text-anchor="middle" font-size="16" ${T}>NO LICENSE</text>
`);

// ---------------------------------------------------------------------------------------------
// riverdeed: a share certificate whose vignette is the whole Hudson with boats on it.
const riverdeed = svg(`
<defs><clipPath id="sb-riverdeed-oval"><ellipse cx="200" cy="146" rx="120" ry="70"/></clipPath></defs>
<rect x="0" y="0" width="400" height="300" fill="${SEPIA}"/>
<g ${O}>
  <rect x="14" y="12" width="372" height="276" rx="6" fill="${CREAM}" stroke-width="4"/>
  <rect x="24" y="22" width="352" height="256" rx="4" fill="none" stroke="${DWATER}" stroke-width="3"/>
  <rect x="30" y="28" width="340" height="244" rx="2" fill="none" stroke="${DWATER}" stroke-width="1.5" stroke-dasharray="4 4"/>
  <circle cx="30" cy="28" r="9" fill="${BRASS}" stroke-width="2"/><circle cx="370" cy="28" r="9" fill="${BRASS}" stroke-width="2"/>
  <circle cx="30" cy="272" r="9" fill="${BRASS}" stroke-width="2"/><circle cx="370" cy="272" r="9" fill="${BRASS}" stroke-width="2"/>
</g>
<text x="200" y="56" text-anchor="middle" font-size="17" ${T}>NORTH RIVER STEAM BOAT CO.</text>
<g clip-path="url(#sb-riverdeed-oval)">
  <rect x="70" y="70" width="260" height="160" fill="${SKY}"/>
  <circle cx="252" cy="104" r="12" fill="${BRASS}" ${O} stroke-width="2"/>
  <path d="M70,124 Q100,98 132,116 Q160,96 190,120 L210,120 Q236,100 262,114 Q296,94 330,120 L330,230 L70,230 Z" fill="${DGREEN}" ${O} stroke-width="2"/>
  <path d="M70,134 Q130,120 196,126 L204,126 Q270,120 330,134 L330,230 L70,230 Z" fill="${GRASS}" ${O} stroke-width="2"/>
  <path d="M194,126 L206,126 Q214,150 262,172 Q300,190 330,196 L330,230 L70,230 L70,200 Q120,186 150,164 Q186,142 194,126 Z" fill="${WATER}" ${O} stroke-width="2"/>
  ${boat({ x: 201, y: 131, s: 0.1, puffs: false, flag: false })}
  ${boat({ x: 170, y: 156, s: 0.24, puffs: false, rot: 20 })}
  ${boat({ x: 214, y: 196, s: 0.48, rot: 5 })}
  ${ripple(110, 214, 20)}${ripple(286, 212, 20)}
</g>
<ellipse cx="200" cy="146" rx="120" ry="70" fill="none" ${O} stroke-width="4"/>
<g ${O}>
  <path d="M104,226 L296,226 L282,244 L296,262 L104,262 L118,244 Z" fill="${RED}" stroke-width="3"/>
  <rect x="122" y="231" width="156" height="26" fill="${CREAM}" stroke-width="2"/>
</g>
<text x="200" y="250" text-anchor="middle" font-size="19" ${T} letter-spacing="1">ONE SHARE</text>
`);

// ---------------------------------------------------------------------------------------------
// secondboat: a second hull going up on the stocks beside the first boat; a pleased gentleman.
const frame = (d, w = 5) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${BROWN}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ribs = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => frame(`M${50 + i * 17},170 L${48 + i * 17},${139 - i * 0.6}`, 4)).join('');
const secondboat = svg(`
<rect x="0" y="0" width="400" height="300" fill="${SKY}"/>
<path d="M0,116 Q50,96 120,112 Q200,90 270,110 Q340,94 400,104 L400,132 L0,132 Z" fill="${GRASS}" ${O} stroke-width="3"/>
<path d="M0,130 L400,130 L400,300 L0,300 Z" fill="${DIRT}" ${O} stroke-width="3"/>
<path d="M240,300 Q226,226 262,196 Q286,180 320,178 L400,176 L400,300 Z" fill="${WATER}" ${O} stroke-width="3"/>
${ripple(300, 282)}${ripple(356, 266)}
${boat({ x: 330, y: 232, s: 0.7, rot: 12 })}
<g ${O}>
  <line x1="18" y1="206" x2="18" y2="112" stroke="${MUD}" stroke-width="5"/>
  <line x1="222" y1="206" x2="222" y2="112" stroke="${MUD}" stroke-width="5"/>
  <line x1="12" y1="122" x2="228" y2="122" stroke="${MUD}" stroke-width="6"/>
  <rect x="44" y="186" width="16" height="18" fill="${MUD}" stroke-width="2"/><rect x="90" y="186" width="16" height="18" fill="${MUD}" stroke-width="2"/>
  <rect x="136" y="186" width="16" height="18" fill="${MUD}" stroke-width="2"/><rect x="172" y="186" width="16" height="18" fill="${MUD}" stroke-width="2"/>
</g>
${ribs}
<g ${O}>
  <path d="M42,186 L188,186 Q198,178 202,166 L36,166 Z" fill="${SEPIA}" stroke-width="3"/>
  <path d="M38,176 L196,176" fill="none" stroke-width="2"/>
</g>
${frame('M30,140 L42,186 L188,186 Q204,170 208,134', 6)}
${frame('M30,140 Q120,146 208,134', 5)}
${person(118, 119, { coat: SEPIA, hat: null, s: 0.62 })}
<g ${O}><path d="M124,89 L136,77" stroke-width="4"/><rect x="130" y="67" width="14" height="9" fill="${DSTONE}" stroke-width="2" transform="rotate(-30 137 71)"/></g>
<g transform="translate(212 294) scale(0.8)" ${O}>
  <line x1="-8" y1="-34" x2="-10" y2="0" stroke-width="7"/><line x1="8" y1="-34" x2="10" y2="0" stroke-width="7"/>
  <path d="M-24,-30 L-20,-86 Q0,-96 20,-86 L24,-30 Z" fill="${INK}" stroke-width="3"/>
  <path d="M0,-86 L-6,-60 L0,-40 L6,-60 Z" fill="${CREAM}" stroke-width="2"/>
  <circle cx="0" cy="-106" r="16" fill="${CREAM}" stroke-width="3"/>
  <path d="M-8,-100 Q0,-92 8,-100" fill="none" stroke-width="3"/>
  <circle cx="-6" cy="-110" r="2" fill="${INK}"/><circle cx="6" cy="-110" r="2" fill="${INK}"/>
  <rect x="-14" y="-152" width="28" height="34" fill="${INK}" stroke-width="2"/>
  <line x1="-24" y1="-118" x2="24" y2="-118" stroke-width="6"/>
  <rect x="-14" y="-128" width="28" height="6" fill="${RED}" stroke="none"/>
  <path d="M20,-80 L44,-98 L50,-116" fill="none" stroke-width="8"/>
  <path d="M42,-104 Q42,-94 52,-94 L58,-94 Q62,-102 56,-106 L52,-104 L54,-118 Q50,-122 46,-116 L44,-104 Z" fill="${CREAM}" stroke-width="3"/>
  <path d="M-20,-78 L-40,-52" fill="none" stroke-width="8"/>
  <path d="M-46,-50 Q-66,-36 -56,-12 Q-40,0 -24,-12 Q-16,-34 -34,-50 Z" fill="${BRASS}" stroke-width="3"/>
  <path d="M-48,-52 L-32,-52" stroke-width="4"/>
  <text x="-42" y="-18" text-anchor="middle" font-size="22" font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="bold" fill="${INK}" stroke="none">$</text>
</g>
`);
export default { nowind, hudsonmap, engine, schedule, nymonopoly, seized, riverdeed, secondboat };
