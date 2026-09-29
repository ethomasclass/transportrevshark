// Exhibit drawings for the Slater's Mill pitch (1792). One SVG per art key in content/exhibits.json.
// Small helpers below only build plain SVG markup strings; every export is a finished <svg>.

const INK = '#1b1410', PAPER = '#f7efdc', PARCH = '#efe3c6', SEPIA = '#8a6a44', BROWN = '#6b4a2b',
  DIRT = '#a07a4f', MUD = '#6d4c2f', STONE = '#a39d90', DSTONE = '#77716a', WATER = '#7fb0c4',
  DWATER = '#3f7891', GRASS = '#9bb07a', DGREEN = '#5f7a45', BRASS = '#d9b04c', RED = '#b3342e',
  CREAM = '#fbf6ea', SKY = '#dce9ea', SNOW = '#ffffff';

const S = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
const SANS = 'font-family="Atkinson Hyperlegible, Arial, sans-serif" font-weight="bold"';
const SERIF = 'font-family="Georgia, serif" font-style="italic"';
const r1 = (n) => Math.round(n * 10) / 10;

// Short label; halo=true gives a paper outline so it reads over busy ground.
const label = (x, y, t, { size = 18, anchor = 'middle', font = SANS, fill = INK, halo = false } = {}) =>
  `<text x="${x}" y="${y}" ${font} font-size="${size}" text-anchor="${anchor}" fill="${fill}"` +
  (halo ? ` stroke="${CREAM}" stroke-width="4" stroke-linejoin="round" paint-order="stroke"` : '') + `>${t}</text>`;

// Map outline from [lon, lat] pairs through a projection.
const geo = (proj, pts, close = true) =>
  pts.map(([lo, la], i) => { const [x, y] = proj(lo, la); return `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`; }).join(' ') + (close ? ' Z' : '');

// Toothed gear outline.
const gear = (cx, cy, r, n, fill = BRASS, sw = 2.5) => {
  const t = Math.max(3, r * 0.22), pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, w = Math.PI / n;
    [[r, a - w * 0.55], [r + t, a - w * 0.35], [r + t, a + w * 0.35], [r, a + w * 0.55]]
      .forEach(([rr, aa]) => pts.push(`${r1(cx + rr * Math.cos(aa))} ${r1(cy + rr * Math.sin(aa))}`));
  }
  return `<path d="M${pts.join(' L')} Z" fill="${fill}" ${S} stroke-width="${sw}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r1(r * 0.3)}" fill="${BROWN}" ${S} stroke-width="2"/>`;
};

// A thread: cream core with a thin ink edge so it shows on any ground.
const thread = (d, w = 2) =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 2}" stroke-linecap="round"/>` +
  `<path d="${d}" fill="none" stroke="${SNOW}" stroke-width="${w}" stroke-linecap="round"/>`;

// Arkwright-style spinning (water) frame, seen from the front.
// Creel of soft cotton rope on top -> drafting rollers stretch it -> spindles below twist it into yarn.
const spinFrame = (x, y, w, h, n, { broken = -1 } = {}) => {
  const creelY = y + 16, rollY = y + h * 0.36, spinY = y + h * 0.56, railY = y + h * 0.8;
  const pad = 22, step = (w - pad * 2) / (n - 1);
  let o = '';
  // frame body
  o += `<rect x="${x}" y="${railY + 10}" width="${w}" height="${y + h - railY - 10}" fill="${SEPIA}" ${S} stroke-width="3"/>`;
  o += `<line x1="${x + 10}" y1="${r1(railY + (y + h - railY) / 2 + 5)}" x2="${x + w - 10}" y2="${r1(railY + (y + h - railY) / 2 + 5)}" stroke="${INK}" stroke-width="2" opacity="0.5"/>`;
  o += `<rect x="${x}" y="${y}" width="10" height="${h}" fill="${BROWN}" ${S} stroke-width="3"/>`;
  o += `<rect x="${x + w - 10}" y="${y}" width="10" height="${h}" fill="${BROWN}" ${S} stroke-width="3"/>`;
  o += `<rect x="${x - 4}" y="${y - 6}" width="${w + 8}" height="12" rx="2" fill="${BROWN}" ${S} stroke-width="3"/>`;
  // creel rod and roving bobbins
  o += `<line x1="${x + 10}" y1="${creelY + 8}" x2="${x + w - 10}" y2="${creelY + 8}" stroke="${INK}" stroke-width="2"/>`;
  const bw = Math.min(11, step - 3);
  for (let i = 0; i < n; i++) {
    const px = x + pad + i * step;
    o += `<path d="M${r1(px)} ${creelY + 16} L${r1(px)} ${r1(rollY - 4)}" stroke="${INK}" stroke-width="${bw * 0.55 + 2}" stroke-linecap="round"/>` +
      `<path d="M${r1(px)} ${creelY + 16} L${r1(px)} ${r1(rollY - 4)}" stroke="${CREAM}" stroke-width="${bw * 0.55}" stroke-linecap="round"/>`;
    o += `<rect x="${r1(px - bw / 2)}" y="${creelY}" width="${r1(bw)}" height="16" rx="3" fill="${CREAM}" ${S} stroke-width="2"/>`;
  }
  // drafting rollers (two long cylinders)
  o += `<rect x="${x + 6}" y="${r1(rollY - 8)}" width="${w - 12}" height="8" rx="4" fill="${DSTONE}" ${S} stroke-width="2"/>`;
  o += `<rect x="${x + 6}" y="${r1(rollY)}" width="${w - 12}" height="8" rx="4" fill="${STONE}" ${S} stroke-width="2"/>`;
  // spindles
  const fh = h * 0.13;
  for (let i = 0; i < n; i++) {
    const px = r1(x + pad + i * step), fw = Math.min(5, step * 0.32);
    if (i === broken) {
      o += thread(`M${px} ${r1(rollY + 9)} q -3 8 2 14`);
      o += thread(`M${px} ${r1(spinY)} q 4 -8 -1 -13`);
    } else {
      o += thread(`M${px} ${r1(rollY + 9)} L${px} ${r1(spinY)}`, 1.8);
    }
    o += `<rect x="${r1(px - fw * 0.55)}" y="${r1(spinY + 3)}" width="${r1(fw * 1.1)}" height="${r1(fh - 4)}" rx="1.5" fill="${SNOW}" ${S} stroke-width="1.5"/>`;
    o += `<path d="M${r1(px - fw)} ${r1(spinY + fh)} L${r1(px - fw)} ${r1(spinY + 2)} Q${px} ${r1(spinY - 3)} ${r1(px + fw)} ${r1(spinY + 2)} L${r1(px + fw)} ${r1(spinY + fh)}" fill="none" ${S} stroke-width="2"/>`;
    o += `<line x1="${px}" y1="${r1(spinY + fh)}" x2="${px}" y2="${r1(railY)}" stroke="${INK}" stroke-width="2"/>`;
    o += `<rect x="${r1(px - fw * 0.8)}" y="${r1(railY - 9)}" width="${r1(fw * 1.6)}" height="5" fill="${BRASS}" ${S} stroke-width="1.5"/>`;
  }
  o += `<rect x="${x}" y="${r1(railY)}" width="${w}" height="10" fill="${BROWN}" ${S} stroke-width="3"/>`;
  return o;
};

// Tiny hand spinner icon: a woman at a spinning wheel.
const spinnerIcon = (x, y) =>
  `<g transform="translate(${x} ${y})">` +
  `<circle cx="20" cy="12" r="10" fill="none" ${S} stroke-width="2.5"/>` +
  `<path d="M20 2 V22 M10 12 H30" stroke="${INK}" stroke-width="1.5"/>` +
  `<path d="M13 30 L20 12 L27 30" fill="none" ${S} stroke-width="2"/>` +
  `<path d="M-2 30 L0 16 Q2 11 7 11 Q11 12 11 17 L12 30 Z" fill="${RED}" ${S} stroke-width="2"/>` +
  `<circle cx="5" cy="6" r="4.5" fill="${PARCH}" ${S} stroke-width="2"/>` +
  `</g>`;

// ---------- Atlantic map projection (voyage) ----------
const atl = (lo, la) => [12 + (lo + 78) * 4.6, 15 + (60 - la) * 6.8];
const NAM = [[-95, 64], [-64.5, 64], [-64.5, 60], [-61.5, 57], [-60, 55.5], [-57.5, 54], [-55.8, 52.5], [-57, 51.4], [-60, 50.2],
  [-64.5, 50.2], [-66.5, 49.5], [-69.5, 48.3], [-66.5, 49.1], [-64.3, 48.8], [-65, 48], [-64.8, 47], [-64.0, 46.1],
  [-62.5, 45.7], [-61.3, 45.9], [-60.5, 47.0], [-59.8, 46.1], [-61.2, 45.3], [-63.5, 44.6], [-65.6, 43.5], [-66.1, 44.2],
  [-64.6, 45.3], [-66.9, 45.1], [-68, 44.4], [-70.2, 43.6], [-70.8, 42.7], [-71, 42.3], [-70.5, 41.9], [-70.1, 42.05],
  [-69.95, 41.7], [-70.9, 41.55], [-71.4, 41.45], [-72.9, 41.25], [-74, 40.7], [-74.0, 40.4], [-74.9, 38.95],
  [-75.1, 38.8], [-75.3, 38.0], [-75.9, 37.2], [-76.0, 36.9], [-75.5, 35.25], [-76.5, 34.6], [-77.95, 33.85],
  [-79.9, 32.75], [-81.1, 32.0], [-81.4, 30.5], [-81.3, 29.5], [-80.6, 28.4], [-80.1, 26.5], [-80.5, 25], [-82, 24], [-95, 20]];
const LONGI = [[-74, 40.62], [-72.8, 40.72], [-71.86, 41.07], [-72.6, 41.0], [-73.8, 40.85]];
const NFLD = [[-59.3, 47.6], [-58.5, 49], [-57.5, 50.5], [-55.6, 51.6], [-55.5, 50], [-53.5, 49.3], [-52.7, 47.6],
  [-53.5, 46.6], [-55.5, 47.1], [-56.5, 47.6]];
const GB = [[-5.7, 50.05], [-4.1, 50.35], [-3, 50.6], [-1, 50.75], [0.2, 50.75], [1.4, 51.15], [1.4, 51.4], [0.9, 51.6],
  [1.7, 52.6], [0.3, 52.9], [0.1, 53.5], [-0.1, 54.1], [-1.2, 54.6], [-1.6, 55.6], [-2.6, 56.1], [-1.8, 57.5], [-3.5, 57.7],
  [-3.1, 58.6], [-5, 58.6], [-5.7, 57.6], [-5.6, 56.4], [-5.8, 55.4], [-5.0, 55.0], [-3.5, 54.9], [-3.4, 54.4], [-3.0, 53.8],
  [-3.1, 53.3], [-4.6, 53.3], [-4.2, 52.8], [-4.1, 52.3], [-5.3, 51.8], [-4.1, 51.6], [-3.0, 51.3], [-4.2, 51.15], [-5.0, 50.6]];
const IRE = [[-6.0, 55.2], [-7.3, 55.35], [-8.5, 55.1], [-10, 54.2], [-9.9, 53.4], [-10.3, 52.1], [-9.5, 51.6], [-8.2, 51.8],
  [-6.4, 52.2], [-6.0, 53.3], [-5.5, 54.3]];
const EUR = [[8, 64], [8, 52], [3, 51.3], [1.6, 50.9], [1.5, 50.1], [0.1, 49.6], [-1.1, 49.35], [-1.9, 49.7], [-1.6, 48.7],
  [-3, 48.8], [-4.7, 48.4], [-4.3, 47.8], [-2.5, 47.3], [-1.3, 46.2], [-1.2, 45], [-1.5, 43.5], [-3.8, 43.5], [-8, 43.7],
  [-9.3, 43], [-8.9, 42], [-8.8, 40.5], [-9.5, 38.8], [-8.8, 38], [-9, 37], [-7.5, 37.1], [-6.3, 36.8], [-5.6, 36.1],
  [-2, 36.7], [0, 38.7], [0.3, 40], [3, 42], [8, 43]];
const AFR = [[-5.9, 35.8], [-6.8, 34], [-8.5, 33.3], [-9.8, 31], [-9.7, 30], [-13, 27.5], [-16, 24], [-17, 21], [-17.1, 15],
  [8, 15], [8, 36.5], [-2, 35.2]];

// ---------- Rhode Island inset projection (voyage) ----------
const ri = (lo, la) => [150 + (lo + 74.4) * 42, 170 + (42.15 - la) * 55.6];
const RI_LAND = [[-74.45, 42.3], [-70.85, 42.3], [-70.85, 41.6], [-71.15, 41.47], [-71.2, 41.66], [-71.3, 41.76],
  [-71.37, 41.9], [-71.45, 41.76], [-71.42, 41.6], [-71.45, 41.45], [-71.5, 41.36], [-71.9, 41.32], [-72.3, 41.27],
  [-72.9, 41.25], [-73.3, 41.12], [-73.65, 40.98], [-73.85, 40.83], [-74.0, 40.7], [-74.1, 40.62], [-74.0, 40.46],
  [-74.05, 40.3], [-74.45, 40.3]];
const RI_LI = [[-74.03, 40.62], [-73.5, 40.58], [-72.8, 40.72], [-72.3, 40.85], [-71.86, 41.07], [-72.1, 41.1],
  [-72.6, 40.98], [-73.1, 40.93], [-73.6, 40.9], [-73.92, 40.78]];

// ---------- East-coast map projection (onlyone) ----------
const usa = (lo, la) => [(lo + 90) * 12.3, (47 - la) * 16];
const EAST = [[-95, 50], [-64.3, 50], [-64.3, 48.8], [-65, 48], [-64.8, 47], [-64.2, 45.9], [-65.5, 45.35], [-66.9, 45.05],
  [-67.2, 44.6], [-68.2, 44.35], [-69, 44.0], [-69.8, 43.8], [-70.2, 43.6], [-70.6, 43.1], [-70.8, 42.8], [-70.6, 42.65],
  [-71.0, 42.35], [-70.7, 42.05], [-70.55, 41.8], [-70.25, 41.85], [-70.05, 42.05], [-70.2, 42.1], [-69.95, 41.9],
  [-69.95, 41.67], [-70.45, 41.6], [-70.65, 41.55], [-70.9, 41.55], [-71.15, 41.47], [-71.25, 41.7], [-71.38, 41.86],
  [-71.45, 41.7], [-71.45, 41.45], [-71.5, 41.36], [-72.0, 41.3], [-72.9, 41.25], [-73.6, 41.0], [-74.0, 40.7],
  [-74.0, 40.45], [-74.1, 40.0], [-74.4, 39.4], [-74.9, 38.95], [-75.5, 39.5], [-75.4, 39.0], [-75.1, 38.8],
  [-75.05, 38.45], [-75.3, 38.0], [-75.95, 37.15], [-76.0, 36.93], [-75.8, 36.2], [-75.5, 35.25], [-76.5, 34.6],
  [-77.95, 33.85], [-79.2, 33.2], [-79.9, 32.75], [-81.1, 32.0], [-81.4, 31.0], [-81.4, 30.3], [-81.2, 29.5],
  [-80.6, 28.4], [-80.2, 27], [-95, 27]];
const EAST_LI = [[-74.03, 40.62], [-73.0, 40.66], [-71.86, 41.07], [-72.6, 41.0], [-73.6, 40.9]];
const NOVA = [[-64.4, 45.75], [-63.0, 45.8], [-61.5, 45.7], [-61.0, 46.3], [-60.4, 47.3], [-59.8, 46.2], [-60.3, 45.6],
  [-61.3, 45.3], [-63.5, 44.6], [-64.5, 44.1], [-65.5, 43.5], [-66.1, 43.8], [-66.0, 44.4], [-65.0, 45.0], [-64.4, 45.3]];

// ---------- the drawings ----------

const handspinning = (() => {
  let o = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`;
  // cottage room: wall and floorboards
  o += `<rect x="0" y="0" width="400" height="300" fill="${PARCH}"/>`;
  o += `<rect x="0" y="236" width="400" height="64" fill="${DIRT}"/>`;
  o += `<path d="M0 236 H400 M0 262 H400 M60 236 V262 M170 236 V262 M120 262 V300 M230 262 V300" stroke="${INK}" stroke-width="2" opacity="0.45"/>`;
  o += `<path d="M0 236 H400" stroke="${INK}" stroke-width="3"/>`;
  // spinning wheel: base bench with legs
  o += `<path d="M130 238 L138 204 M236 238 L230 204 M186 238 L186 206" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;
  o += `<path d="M130 238 L138 204 M236 238 L230 204 M186 238 L186 206" stroke="${BROWN}" stroke-width="5" stroke-linecap="round"/>`;
  o += `<rect x="124" y="196" width="118" height="12" rx="3" fill="${BROWN}" ${S} stroke-width="3"/>`;
  // uprights to wheel axle
  o += `<path d="M172 198 L192 148 L212 198" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  o += `<path d="M172 198 L192 148 L212 198" fill="none" stroke="${BROWN}" stroke-width="4" stroke-linejoin="round"/>`;
  // treadle and footman
  o += `<path d="M116 236 L170 230" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  o += `<path d="M116 236 L170 230" stroke="${SEPIA}" stroke-width="3.5" stroke-linecap="round"/>`;
  o += `<path d="M166 230 L200 152" stroke="${INK}" stroke-width="2.5"/>`;
  // wheel
  o += `<circle cx="192" cy="148" r="50" fill="none" stroke="${INK}" stroke-width="11"/>`;
  o += `<circle cx="192" cy="148" r="50" fill="none" stroke="${SEPIA}" stroke-width="6"/>`;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    o += `<line x1="192" y1="148" x2="${r1(192 + 46 * Math.cos(a))}" y2="${r1(148 + 46 * Math.sin(a))}" stroke="${INK}" stroke-width="2.5"/>`;
  }
  o += `<circle cx="192" cy="148" r="7" fill="${BROWN}" ${S} stroke-width="2.5"/>`;
  // mother-of-all post and flyer
  o += `<path d="M150 198 L150 160" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M150 198 L150 160" stroke="${BROWN}" stroke-width="4" stroke-linecap="round"/>`;
  o += `<rect x="128" y="148" width="34" height="12" rx="3" fill="${BROWN}" ${S} stroke-width="2.5"/>`;
  o += `<path d="M130 145 L130 163 M158 145 L158 163" stroke="${INK}" stroke-width="2.5"/>`;
  o += `<rect x="135" y="147" width="16" height="14" rx="3" fill="${SNOW}" ${S} stroke-width="2"/>`;
  o += `<circle cx="164" cy="154" r="5" fill="${BRASS}" ${S} stroke-width="2"/>`;
  // drive band from wheel rim around the whorl
  o += `<path d="M164 149 L188 98 M164 159 L188 198" stroke="${INK}" stroke-width="1.5"/>`;
  // the spinner, seated on a stool
  o += `<path d="M38 236 L44 200 M92 236 L86 200" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  o += `<path d="M52 118 Q68 112 80 120 L86 176 L114 182 L118 232 L106 236 L34 236 Q40 180 52 118 Z" fill="${SEPIA}" ${S} stroke-width="3"/>`;
  o += `<path d="M62 128 L78 128 L84 178 L112 184 L112 214 L66 214 Z" fill="${CREAM}" ${S} stroke-width="2"/>`;
  o += `<path d="M110 234 L124 234" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  o += `<path d="M74 130 Q86 152 106 154" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>`;
  o += `<path d="M74 130 Q86 152 106 154" fill="none" stroke="${SEPIA}" stroke-width="6" stroke-linecap="round"/>`;
  o += `<circle cx="66" cy="100" r="16" fill="${PARCH}" ${S} stroke-width="3"/>`;
  o += `<path d="M49 99 Q48 80 66 80 Q84 80 83 96 Q70 90 58 96 Z" fill="${SNOW}" ${S} stroke-width="2.5"/>`;
  o += `<circle cx="72" cy="102" r="1.8" fill="${INK}"/>`;
  // cotton in her hand, one thread to the flyer
  o += `<path d="M96 160 q-6 -10 4 -13 q4 -9 12 -3 q9 -2 8 7 q6 8 -4 11 q-8 6 -14 0 q-8 2 -6 -2 Z" fill="${SNOW}" ${S} stroke-width="2"/>`;
  o += thread('M117 154 L129 154', 2.5);
  // label and pointer
  o += label(120, 42, '1 thread', { size: 21 });
  o += `<path d="M120 50 Q118 90 122 142" fill="none" ${S} stroke-width="2.5"/><path d="M115 134 L122 146 L128 134" fill="none" ${S} stroke-width="2.5"/>`;
  // England inset: a frame spinning many threads at once
  o += `<rect x="264" y="18" width="124" height="264" rx="8" fill="${CREAM}" ${S} stroke-width="3"/>`;
  o += label(326, 45, 'England', { size: 18, font: SERIF });
  o += spinFrame(278, 70, 96, 150, 8);
  o += label(326, 262, 'dozens', { size: 20 });
  o += `</svg>`;
  return o;
})();

const forbidden = (() => {
  let o = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`;
  o += `<rect x="0" y="0" width="400" height="300" fill="${PAPER}"/>`;
  // scroll sheet with rolled ends
  o += `<rect x="72" y="36" width="256" height="226" fill="${PARCH}" ${S} stroke-width="3"/>`;
  o += `<rect x="58" y="24" width="284" height="22" rx="11" fill="${CREAM}" ${S} stroke-width="3"/>`;
  o += `<rect x="58" y="252" width="284" height="22" rx="11" fill="${CREAM}" ${S} stroke-width="3"/>`;
  o += `<path d="M70 30 Q64 35 70 40 M330 258 Q336 263 330 268" fill="none" stroke="${INK}" stroke-width="2"/>`;
  // crown
  o += `<path d="M176 88 L172 62 L186 74 L200 56 L214 74 L228 62 L224 88 Z" fill="${BRASS}" ${S} stroke-width="3"/>`;
  o += `<rect x="174" y="86" width="52" height="9" rx="2" fill="${BRASS}" ${S} stroke-width="2.5"/>`;
  o += `<circle cx="200" cy="56" r="4" fill="${RED}" ${S} stroke-width="2"/><circle cx="172" cy="62" r="3" fill="${RED}" ${S} stroke-width="1.5"/><circle cx="228" cy="62" r="3" fill="${RED}" ${S} stroke-width="1.5"/>`;
  // machine plan drawn in sepia lines
  const pl = `fill="none" stroke="${SEPIA}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`;
  o += `<g ${pl}>`;
  o += `<rect x="104" y="112" width="192" height="118"/>`;
  o += `<path d="M104 146 H296 M104 196 H296" stroke-dasharray="6 5"/>`;
  for (let i = 0; i < 6; i++) {
    const x = 128 + i * 29;
    o += `<circle cx="${x}" cy="130" r="8"/><circle cx="${x}" cy="130" r="2"/>`;
    o += `<path d="M${x} 138 V170 M${x - 5} 170 H${x + 5} V190 H${x - 5} Z M${x} 190 V212"/>`;
  }
  o += `</g>`;
  o += gear(266, 208, 12, 10, 'none', 2).split(INK).join(SEPIA).replace(`fill="${BROWN}"`, 'fill="none"');
  // stamp
  o += `<g transform="rotate(-11 200 165)">`;
  o += `<rect x="102" y="128" width="196" height="76" rx="8" fill="${PARCH}" fill-opacity="0.8" stroke="${RED}" stroke-width="5"/>`;
  o += `<rect x="110" y="136" width="180" height="60" rx="5" fill="none" stroke="${RED}" stroke-width="2"/>`;
  o += `<text x="200" y="165" ${SANS} font-size="22" letter-spacing="2" text-anchor="middle" fill="${RED}">FORBIDDEN</text>`;
  o += `<text x="200" y="188" ${SANS} font-size="17" letter-spacing="1" text-anchor="middle" fill="${RED}">TO EXPORT</text>`;
  o += `</g>`;
  // wax seal with ribbon
  o += `<path d="M298 248 L288 284 L298 278 L304 288 L310 250 Z" fill="${RED}" ${S} stroke-width="2.5"/>`;
  o += `<path d="M318 248 L326 282 L316 276 L310 286 L306 250 Z" fill="${RED}" ${S} stroke-width="2.5"/>`;
  o += `<circle cx="306" cy="238" r="19" fill="${RED}" ${S} stroke-width="3"/>`;
  o += `<circle cx="306" cy="238" r="12" fill="none" stroke="${INK}" stroke-width="1.5" opacity="0.6"/>`;
  o += `<path d="M299 242 L298 232 L302 236 L306 230 L310 236 L314 232 L313 242 Z" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round" opacity="0.7"/>`;
  o += `</svg>`;
  return o;
})();

const memory = (() => {
  let o = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`;
  o += `<rect x="0" y="0" width="400" height="300" fill="${PAPER}"/>`;
  // shoulders and coat
  o += `<path d="M14 300 C22 266 52 252 84 248 L172 248 C204 252 236 266 246 300 Z" fill="${BROWN}" ${S} stroke-width="3"/>`;
  o += `<path d="M104 250 L132 286 L160 250 Z" fill="${SNOW}" ${S} stroke-width="2.5"/>`;
  // head in profile (facing right) with tied-back hair
  o += `<path d="M84 252 C74 222 48 196 46 140 C44 78 92 36 148 36 C198 36 226 72 222 112 L240 150 L224 156 L228 168 L222 174 L226 184 C222 200 208 204 190 204 L176 208 L172 252 Z" fill="${SEPIA}" ${S} stroke-width="3.5"/>`;
  o += `<path d="M52 124 C50 76 94 40 148 40 C120 50 104 60 98 76 C80 80 64 100 60 128 Z" fill="${MUD}" stroke="none"/>`;
  // queue of hair tied with a ribbon bow
  o += `<path d="M50 154 Q38 172 40 200" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`;
  o += `<path d="M50 154 Q38 172 40 200" fill="none" stroke="${MUD}" stroke-width="6" stroke-linecap="round"/>`;
  o += `<ellipse cx="40" cy="146" rx="9" ry="5" transform="rotate(-35 40 146)" fill="${INK}"/>`;
  o += `<ellipse cx="40" cy="162" rx="9" ry="5" transform="rotate(35 40 162)" fill="${INK}"/>`;
  o += `<circle cx="48" cy="154" r="5" fill="${INK}"/>`;
  // what is in his head
  o += `<circle cx="136" cy="124" r="62" fill="${CREAM}" ${S} stroke-width="3"/>`;
  o += gear(112, 106, 24, 12);
  o += gear(152, 84, 14, 8, STONE);
  // drafting rollers feeding a thread down to a spindle
  o += `<circle cx="160" cy="124" r="9" fill="${DSTONE}" ${S} stroke-width="2.5"/><circle cx="178" cy="124" r="9" fill="${STONE}" ${S} stroke-width="2.5"/>`;
  o += thread('M169 132 L169 146', 2);
  o += `<rect x="163" y="148" width="12" height="22" rx="3" fill="${SNOW}" ${S} stroke-width="2"/>`;
  o += `<path d="M160 172 L160 150 Q169 142 178 150 L178 172" fill="none" ${S} stroke-width="2"/>`;
  o += `<path d="M169 172 L169 180" stroke="${INK}" stroke-width="2.5"/>`;
  // two more spindles
  for (const x of [104, 128]) {
    o += thread(`M${x} 138 L${x} 148`, 2);
    o += `<rect x="${x - 6}" y="150" width="12" height="22" rx="3" fill="${SNOW}" ${S} stroke-width="2"/>`;
    o += `<path d="M${x - 9} 174 L${x - 9} 152 Q${x} 144 ${x + 9} 152 L${x + 9} 174" fill="none" ${S} stroke-width="2"/>`;
    o += `<path d="M${x} 174 L${x} 180" stroke="${INK}" stroke-width="2.5"/>`;
  }
  o += `<rect x="92" y="136" width="96" height="6" rx="3" fill="${DSTONE}" ${S} stroke-width="2"/>`;
  // empty travel trunk, lid open
  o += `<path d="M270 178 L280 108 L388 108 L382 178 Z" fill="${BROWN}" ${S} stroke-width="3"/>`;
  o += `<path d="M280 170 L288 116 L380 116 L374 170 Z" fill="${SEPIA}" ${S} stroke-width="2"/>`;
  o += `<path d="M258 198 L270 176 L382 176 L376 198 Z" fill="${INK}" ${S} stroke-width="3"/>`;
  o += `<path d="M266 196 L274 182 L376 182 L372 196 Z" fill="${MUD}"/>`;
  o += `<rect x="258" y="196" width="118" height="66" rx="4" fill="${BROWN}" ${S} stroke-width="3"/>`;
  o += `<path d="M284 196 V262 M350 196 V262" stroke="${BRASS}" stroke-width="7"/><path d="M280 196 V262 M288 196 V262 M346 196 V262 M354 196 V262" stroke="${INK}" stroke-width="2"/>`;
  o += `<rect x="309" y="204" width="16" height="16" rx="2" fill="${BRASS}" ${S} stroke-width="2"/>`;
  o += `<path d="M256 262 H378" stroke="${INK}" stroke-width="3"/>`;
  o += label(326, 84, 'no plans', { size: 21 });
  o += `</svg>`;
  return o;
})();

const voyage = (() => {
  let o = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`;
  o += `<rect x="0" y="0" width="400" height="300" fill="${WATER}"/>`;
  // faint wave marks
  o += `<path d="M170 196 q6 -5 12 0 q6 5 12 0 M300 224 q6 -5 12 0 q6 5 12 0 M110 40 q6 -5 12 0 q6 5 12 0 M232 38 q6 -5 12 0 q6 5 12 0" fill="none" stroke="${DWATER}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`;
  const land = `fill="${GRASS}" ${S} stroke-width="2.5"`;
  o += `<path d="${geo(atl, NAM)}" ${land}/>`;
  o += `<path d="${geo(atl, NFLD)}" ${land}/>`;
  o += `<path d="${geo(atl, LONGI)}" ${land} stroke-width="1.5"/>`;
  o += `<path d="${geo(atl, EUR)}" fill="${PARCH}" ${S} stroke-width="2.5"/>`;
  o += `<path d="${geo(atl, AFR)}" fill="${PARCH}" ${S} stroke-width="2.5"/>`;
  o += `<path d="${geo(atl, IRE)}" fill="${PARCH}" ${S} stroke-width="2.5"/>`;
  o += `<path d="${geo(atl, GB)}" fill="${BRASS}" ${S} stroke-width="2.5"/>`;
  // sailing route: London, down the Channel, across to New York
  const [lx, ly] = atl(-0.1, 51.5), [c1x, c1y] = atl(-2, 50.1), [c2x, c2y] = atl(-6.5, 49.4), [nx, ny] = atl(-73.9, 40.5);
  const route = `M${r1(lx)} ${r1(ly)} L${r1(c1x)} ${r1(c1y)} L${r1(c2x)} ${r1(c2y)} C 260 60, 110 70, ${r1(nx)} ${r1(ny)}`;
  o += `<path d="${route}" fill="none" stroke="${CREAM}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<path d="${route}" fill="none" stroke="${RED}" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<circle cx="${r1(lx)}" cy="${r1(ly)}" r="4.5" fill="${RED}" ${S} stroke-width="2"/>`;
  // ship
  o += `<g transform="translate(190 64)">`;
  o += `<path d="M-24 8 L24 8 L17 21 L-18 21 Z" fill="${BROWN}" ${S} stroke-width="3"/>`;
  o += `<path d="M-6 8 V-30 M10 8 V-22" stroke="${INK}" stroke-width="2.5"/>`;
  o += `<path d="M-19 4 Q-6 -8 -19 -26 L-6 -26 L-6 4 Z" fill="${CREAM}" ${S} stroke-width="2.5"/>`;
  o += `<path d="M-3 4 Q10 -6 -3 -20 L10 -20 L10 4 Z" fill="${CREAM}" ${S} stroke-width="2.5"/>`;
  o += `<path d="M-6 -30 L4 -27 L-6 -24" fill="${RED}" ${S} stroke-width="1.5"/>`;
  o += `</g>`;
  o += label(248, 60, '1789', { size: 21, halo: true });
  // labels
  o += label(66, 60, 'America', { size: 18, font: SERIF, halo: true });
  o += label(336, 38, 'England', { size: 17, font: SERIF, anchor: 'end', halo: true });
  o += label(250, 150, 'Atlantic Ocean', { size: 16, font: SERIF, fill: DWATER });
  // inset of the last leg: New York through Long Island Sound to Providence and Pawtucket
  const [ax, ay] = atl(-74.4, 42.15), [bx, by] = atl(-70.9, 40.14);
  o += `<rect x="${r1(ax)}" y="${r1(ay)}" width="${r1(bx - ax)}" height="${r1(by - ay)}" fill="none" stroke="${INK}" stroke-width="2"/>`;
  o += `<path d="M${r1(bx)} ${r1(ay)} L150 170 M${r1(ax)} ${r1(by)} L150 284" stroke="${INK}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  o += `<defs><clipPath id="sl-voyage-inset"><rect x="150" y="170" width="147" height="114"/></clipPath></defs>`;
  o += `<rect x="150" y="170" width="147" height="114" fill="${WATER}"/>`;
  o += `<g clip-path="url(#sl-voyage-inset)">`;
  o += `<path d="${geo(ri, RI_LAND)}" fill="${GRASS}" ${S} stroke-width="2"/>`;
  o += `<path d="${geo(ri, RI_LI)}" fill="${GRASS}" ${S} stroke-width="2"/>`;
  const legPts = [[-73.7, 40.0], [-73.95, 40.4], [-74.02, 40.55], [-73.93, 40.76], [-73.7, 40.9], [-73.0, 41.1], [-72.2, 41.18], [-71.6, 41.25],
    [-71.38, 41.42], [-71.35, 41.64], [-71.38, 41.82]].map(([a, b]) => ri(a, b).map(r1));
  const leg = 'M' + legPts.map((p) => p.join(' ')).join(' L');
  o += `<path d="${leg}" fill="none" stroke="${CREAM}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<path d="${leg}" fill="none" stroke="${RED}" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `</g>`;
  o += `<rect x="150" y="170" width="147" height="114" fill="none" ${S} stroke-width="3"/>`;
  const [px, py] = ri(-71.38, 41.88), [yx, yy] = ri(-74.0, 40.7);
  o += `<circle cx="${r1(yx)}" cy="${r1(yy)}" r="4" fill="${INK}"/>`;
  o += `<path d="M${r1(px)} ${r1(py - 7)} l2.4 5 5.4 0.6 -4 3.6 1.2 5.4 -5 -2.8 -5 2.8 1.2 -5.4 -4 -3.6 5.4 -0.6 Z" fill="${RED}" ${S} stroke-width="1.5"/>`;
  o += label(r1(px - 10), r1(py + 4), 'Pawtucket', { size: 15, anchor: 'end', halo: true });
  o += label(r1(yx + 16), r1(yy + 24), 'New York', { size: 15, anchor: 'start', halo: true });
  o += `</svg>`;
  return o;
})();

const spindles = (() => {
  let o = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`;
  o += `<rect x="0" y="0" width="400" height="300" fill="${PARCH}"/>`;
  o += `<rect x="0" y="252" width="400" height="48" fill="${DIRT}"/>`;
  o += `<path d="M0 252 H400" stroke="${INK}" stroke-width="3"/><path d="M0 272 H400" stroke="${INK}" stroke-width="2" opacity="0.4"/>`;
  // ---- carding machine ----
  o += `<path d="M40 252 L46 212 M160 252 L154 212" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M40 252 L46 212 M160 252 L154 212" stroke="${BROWN}" stroke-width="5" stroke-linecap="round"/>`;
  o += `<rect x="30" y="202" width="140" height="16" rx="3" fill="${BROWN}" ${S} stroke-width="3"/>`;
  // feed table with raw cotton
  o += `<path d="M14 144 L50 150 L50 158 L14 152 Z" fill="${SEPIA}" ${S} stroke-width="2.5"/>`;
  o += `<path d="M14 142 q-2 -12 10 -12 q4 -10 14 -4 q10 -4 12 6 q8 2 4 10 q-10 4 -20 2 q-12 4 -20 -2 Z" fill="${SNOW}" ${S} stroke-width="2"/>`;
  o += `<circle cx="56" cy="146" r="6" fill="${DSTONE}" ${S} stroke-width="2"/><circle cx="56" cy="159" r="6" fill="${DSTONE}" ${S} stroke-width="2"/>`;
  // big toothed drum
  let teeth = '';
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    teeth += `M${r1(100 + 44 * Math.cos(a))} ${r1(150 + 44 * Math.sin(a))} L${r1(100 + 50 * Math.cos(a + 0.06))} ${r1(150 + 50 * Math.sin(a + 0.06))} `;
  }
  o += `<path d="${teeth}" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
  o += `<circle cx="100" cy="150" r="44" fill="${STONE}" ${S} stroke-width="3.5"/>`;
  o += `<circle cx="100" cy="150" r="30" fill="${SNOW}" opacity="0.55"/>`;
  o += `<circle cx="100" cy="150" r="7" fill="${BROWN}" ${S} stroke-width="2.5"/>`;
  o += `<path d="M100 200 L100 157" stroke="${INK}" stroke-width="3"/>`;
  // rotation arrow
  o += `<path d="M62 102 A56 56 0 0 1 132 100" fill="none" stroke="${RED}" stroke-width="3.5" stroke-linecap="round"/><path d="M122 92 L134 101 L120 106" fill="none" stroke="${RED}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  // doffer and soft rope (sliver) out into a can
  o += `<circle cx="154" cy="170" r="14" fill="${STONE}" ${S} stroke-width="2.5"/>`;
  o += `<path d="M166 176 C184 180 186 196 190 214" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>`;
  o += `<path d="M166 176 C184 180 186 196 190 214" fill="none" stroke="${SNOW}" stroke-width="7" stroke-linecap="round"/>`;
  o += `<path d="M174 214 L174 250 Q190 256 206 250 L206 214 Z" fill="${SEPIA}" ${S} stroke-width="3"/>`;
  o += `<ellipse cx="190" cy="214" rx="16" ry="5" fill="${SNOW}" ${S} stroke-width="2.5"/>`;
  o += label(100, 284, 'Carding', { size: 18 });
  // arrow: rope goes to the spinning frame
  o += `<path d="M198 196 Q210 150 224 132" fill="none" stroke="${RED}" stroke-width="3.5" stroke-linecap="round"/><path d="M212 134 L225 131 L223 144" fill="none" stroke="${RED}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  // ---- spinning frame ----
  o += spinFrame(236, 64, 150, 188, 10);
  o += label(311, 40, '72 spindles', { size: 19 });
  o += label(311, 284, 'Spinning', { size: 18 });
  o += `</svg>`;
  return o;
})();

const watermill = (() => {
  let o = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`;
  o += `<rect x="0" y="0" width="400" height="300" fill="${SKY}"/>`;
  // the falls: river above the stone ledge, spilling down into the river below
  o += `<rect x="0" y="140" width="96" height="160" fill="${WATER}"/>`;
  o += `<rect x="0" y="262" width="400" height="38" fill="${DWATER}"/>`;
  o += `<path d="M80 300 L80 150 L92 140 L104 146 L104 200 L112 212 L112 262 L118 300 Z" fill="${STONE}" ${S} stroke-width="3"/>`;
  o += `<path d="M84 176 L96 180 M84 222 L98 226" stroke="${INK}" stroke-width="2" opacity="0.5"/>`;
  o += `<path d="M84 140 Q110 140 114 180 L120 264 L106 264 L102 184 Q100 152 84 146 Z" fill="${WATER}" ${S} stroke-width="2.5"/>`;
  o += `<path d="M110 186 L114 254 M104 156 Q108 162 108 174" stroke="${SNOW}" stroke-width="2.5" stroke-linecap="round"/>`;
  o += `<path d="M0 140 H86" stroke="${DWATER}" stroke-width="3"/>`;
  o += `<path d="M102 270 q8 -6 16 0 q8 6 16 0 M20 282 q8 -6 16 0 q8 6 16 0" fill="none" stroke="${SNOW}" stroke-width="2" stroke-linecap="round"/>`;
  o += label(14, 124, 'Blackstone River', { size: 17, anchor: 'start', font: SERIF, halo: true });
  // flume: a wooden trough carries water to the top of the wheel
  o += `<path d="M30 144 L182 144 L182 156 L30 156 Z" fill="${BROWN}" ${S} stroke-width="3"/>`;
  o += `<rect x="32" y="140" width="148" height="5" fill="${WATER}"/>`;
  o += `<path d="M182 146 Q196 148 198 168 L190 170 Q188 158 182 156 Z" fill="${WATER}" ${S} stroke-width="2"/>`;
  // waterwheel with buckets
  const wx = 176, wy = 214, wr = 42;
  let buckets = '';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    buckets += `M${r1(wx + wr * Math.cos(a))} ${r1(wy + wr * Math.sin(a))} L${r1(wx + (wr + 10) * Math.cos(a + 0.13))} ${r1(wy + (wr + 10) * Math.sin(a + 0.13))} `;
  }
  o += `<circle cx="${wx}" cy="${wy}" r="${wr + 10}" fill="none" stroke="${INK}" stroke-width="3"/>`;
  o += `<path d="${buckets}" stroke="${INK}" stroke-width="3"/>`;
  o += `<circle cx="${wx}" cy="${wy}" r="${wr}" fill="none" stroke="${INK}" stroke-width="9"/><circle cx="${wx}" cy="${wy}" r="${wr}" fill="none" stroke="${BROWN}" stroke-width="5"/>`;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3, ex = r1(wx + wr * Math.cos(a)), ey = r1(wy + wr * Math.sin(a));
    o += `<line x1="${wx}" y1="${wy}" x2="${ex}" y2="${ey}" stroke="${INK}" stroke-width="7"/><line x1="${wx}" y1="${wy}" x2="${ex}" y2="${ey}" stroke="${BROWN}" stroke-width="3.5"/>`;
  }
  // water riding down in the right-hand buckets (the heavy side goes down)
  o += `<path d="M200 174 A47 47 0 0 1 222 216" fill="none" stroke="${WATER}" stroke-width="7" stroke-linecap="round"/>`;
  // rotation arrow (clockwise)
  o += `<path d="M122 204 A56 56 0 0 1 150 164" fill="none" stroke="${RED}" stroke-width="3.5" stroke-linecap="round"/><path d="M138 162 L151 163 L147 175" fill="none" stroke="${RED}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  // mill: stone foundation, cutaway wooden building, roof and bell cupola
  const L = 236, R = 390;
  o += `<rect x="${L}" y="252" width="${R - L}" height="36" fill="${STONE}" ${S} stroke-width="3"/>`;
  o += `<path d="M268 252 V270 M306 270 V288 M344 252 V270 M${L} 270 H${R} M372 270 V288" stroke="${INK}" stroke-width="2" opacity="0.5"/>`;
  o += `<path d="M${L - 10} 74 L${(L + R) / 2} 32 L${R + 8} 74 Z" fill="${DSTONE}" ${S} stroke-width="3"/>`;
  o += `<rect x="302" y="16" width="22" height="20" fill="${CREAM}" ${S} stroke-width="2.5"/><path d="M298 18 L313 6 L328 18 Z" fill="${DSTONE}" ${S} stroke-width="2.5"/>`;
  o += `<rect x="${L}" y="70" width="${R - L}" height="182" fill="${CREAM}" ${S} stroke-width="3"/>`;
  o += `<rect x="${L}" y="70" width="10" height="182" fill="${DIRT}" ${S} stroke-width="3"/>`;
  o += `<rect x="${R - 10}" y="70" width="10" height="182" fill="${DIRT}" ${S} stroke-width="3"/>`;
  o += `<rect x="${L}" y="160" width="${R - L}" height="8" fill="${DIRT}" ${S} stroke-width="2.5"/>`;
  // power train: wheel shaft -> gears -> upright shaft -> line shafts -> belts -> machines
  const vx = 292;
  o += `<path d="M${wx} ${wy} L262 ${wy}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M${wx} ${wy} L262 ${wy}" stroke="${SEPIA}" stroke-width="4" stroke-linecap="round"/>`;
  o += `<circle cx="${wx}" cy="${wy}" r="8" fill="${BROWN}" ${S} stroke-width="3"/>`;
  o += `<path d="M${vx} ${wy} L${vx} 84" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M${vx} ${wy} L${vx} 84" stroke="${SEPIA}" stroke-width="4" stroke-linecap="round"/>`;
  o += gear(266, wy, 15, 12);
  o += gear(vx + 1, wy, 9, 8);
  for (const sy of [90, 182]) {
    o += `<path d="M${vx} ${sy} L${R - 12} ${sy}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M${vx} ${sy} L${R - 12} ${sy}" stroke="${SEPIA}" stroke-width="3.5" stroke-linecap="round"/>`;
    o += gear(vx, sy, 8, 8);
    const my = sy + 44;
    for (const bx of [324, 358]) {
      o += `<path d="M${bx - 7} ${sy} L${bx - 5} ${my + 4} M${bx + 7} ${sy} L${bx + 5} ${my + 4}" stroke="${INK}" stroke-width="2.5"/>`;
      o += `<circle cx="${bx}" cy="${sy}" r="7" fill="${BRASS}" ${S} stroke-width="2"/>`;
    }
    o += `<rect x="308" y="${my}" width="66" height="${sy === 90 ? 26 : 34}" rx="2" fill="${BROWN}" ${S} stroke-width="2.5"/>`;
    for (let i = 0; i < 6; i++) o += `<rect x="${312 + i * 10.5}" y="${my - 12}" width="5" height="12" rx="1.5" fill="${SNOW}" ${S} stroke-width="1.5"/>`;
  }
  o += `</svg>`;
  return o;
})();

const compare = (() => {
  let o = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`;
  o += `<rect x="0" y="0" width="400" height="300" fill="${PAPER}"/>`;
  // one mill (with its wheel and river)
  o += `<rect x="12" y="214" width="150" height="26" fill="${WATER}"/>`;
  o += `<path d="M12 214 H162" stroke="${DWATER}" stroke-width="2.5"/>`;
  o += `<path d="M58 110 L110 76 L162 110 Z" fill="${DSTONE}" ${S} stroke-width="3"/>`;
  o += `<rect x="102" y="60" width="14" height="14" fill="${CREAM}" ${S} stroke-width="2"/><path d="M99 62 L109 52 L119 62 Z" fill="${DSTONE}" ${S} stroke-width="2"/>`;
  o += `<rect x="64" y="108" width="92" height="112" fill="${DIRT}" ${S} stroke-width="3"/>`;
  for (const wy of [122, 162]) for (const wxx of [74, 100, 126]) o += `<rect x="${wxx}" y="${wy}" width="18" height="24" fill="${CREAM}" ${S} stroke-width="2"/><path d="M${wxx + 9} ${wy} V${wy + 24} M${wxx} ${wy + 12} H${wxx + 18}" stroke="${INK}" stroke-width="1.5"/>`;
  o += `<circle cx="44" cy="196" r="28" fill="none" stroke="${INK}" stroke-width="9"/><circle cx="44" cy="196" r="28" fill="none" stroke="${BROWN}" stroke-width="5"/>`;
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; o += `<line x1="${r1(44 - 28 * Math.cos(a))}" y1="${r1(196 - 28 * Math.sin(a))}" x2="${r1(44 + 28 * Math.cos(a))}" y2="${r1(196 + 28 * Math.sin(a))}" stroke="${INK}" stroke-width="3"/>`; }
  o += `<circle cx="44" cy="196" r="5" fill="${BROWN}" ${S} stroke-width="2"/>`;
  o += label(90, 272, '1 mill', { size: 20 });
  // equals
  o += `<path d="M168 138 H194 M168 154 H194" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  // many hand spinners
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) o += spinnerIcon(208 + c * 36, 34 + r * 42);
  o += label(292, 272, 'the work of hundreds', { size: 17 });
  o += `</svg>`;
  return o;
})();

// Child figure: x = centre at feet, y = floor, h = height; arms given as paths relative to shoulders.
const child = ({ x, y, h, girl, face = 1, arms, holding = '' }) => {
  const s = h / 120;
  const T = (px, py) => `${r1(x + px * s * face)} ${r1(y - py * s)}`;
  let o = '';
  // legs
  o += `<path d="M${T(-6, 0)} L${T(-6, 34)} M${T(6, 0)} L${T(6, 34)}" stroke="${INK}" stroke-width="${r1(9 * s)}" stroke-linecap="round"/>`;
  o += `<path d="M${T(-6, 2)} L${T(-6, 34)} M${T(6, 2)} L${T(6, 34)}" stroke="${girl ? PARCH : BROWN}" stroke-width="${r1(5 * s)}" stroke-linecap="round"/>`;
  if (girl) {
    o += `<path d="M${T(-10, 84)} L${T(10, 84)} L${T(20, 22)} L${T(-20, 22)} Z" fill="${RED}" ${S} stroke-width="3"/>`;
    o += `<path d="M${T(-4, 70)} L${T(12, 70)} L${T(15, 28)} L${T(-4, 28)} Z" fill="${CREAM}" ${S} stroke-width="2"/>`;
  } else {
    o += `<path d="M${T(-11, 84)} L${T(11, 84)} L${T(12, 44)} L${T(-12, 44)} Z" fill="${CREAM}" ${S} stroke-width="3"/>`;
    o += `<path d="M${T(-12, 46)} L${T(12, 46)} L${T(12, 26)} L${T(2, 26)} L${T(0, 34)} L${T(-2, 26)} L${T(-12, 26)} Z" fill="${BROWN}" ${S} stroke-width="3"/>`;
    o += `<path d="M${T(-9, 84)} L${T(-8, 48)} M${T(9, 84)} L${T(8, 48)}" stroke="${INK}" stroke-width="2"/>`;
  }
  // arms
  for (const a of arms) {
    const d = 'M' + a.map(([px, py]) => T(px, py)).join(' L');
    o += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${r1(10 * s)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    o += `<path d="${d}" fill="none" stroke="${girl ? RED : CREAM}" stroke-width="${r1(6 * s)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const [hx, hy] = a[a.length - 1];
    o += `<circle cx="${r1(x + hx * s * face)}" cy="${r1(y - hy * s)}" r="${r1(4.5 * s)}" fill="${PARCH}" ${S} stroke-width="2"/>`;
  }
  // head
  const [hx, hy] = [x, y - 100 * s];
  o += `<circle cx="${r1(hx)}" cy="${r1(hy)}" r="${r1(15 * s)}" fill="${PARCH}" ${S} stroke-width="3"/>`;
  if (girl) o += `<path d="M${T(-16, 102)} Q${T(-16, 120)} ${T(0, 120)} Q${T(17, 120)} ${T(15, 104)} Q${T(0, 110)} ${T(-16, 102)} Z" fill="${SNOW}" ${S} stroke-width="2.5"/>`;
  else o += `<path d="M${T(-15, 100)} Q${T(-14, 118)} ${T(2, 117)} Q${T(16, 116)} ${T(15, 104)} Q${T(4, 108)} ${T(-15, 100)} Z" fill="${MUD}" ${S} stroke-width="2.5"/>`;
  o += `<circle cx="${r1(hx + 7 * s * face)}" cy="${r1(hy + 1)}" r="1.8" fill="${INK}"/>`;
  return o + holding;
};

const children = (() => {
  let o = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`;
  o += `<rect x="0" y="0" width="400" height="300" fill="${PARCH}"/>`;
  o += `<rect x="0" y="256" width="400" height="44" fill="${DIRT}"/>`;
  o += `<path d="M0 256 H400" stroke="${INK}" stroke-width="3"/><path d="M0 276 H400 M80 256 V276 M210 256 V276 M340 256 V276 M150 276 V300 M280 276 V300" stroke="${INK}" stroke-width="2" opacity="0.4"/>`;
  // window
  o += `<rect x="18" y="30" width="66" height="84" fill="${SKY}" ${S} stroke-width="3"/>`;
  o += `<path d="M51 30 V114 M18 58 H84 M18 86 H84" stroke="${INK}" stroke-width="2.5"/>`;
  // tall spinning frame
  o += spinFrame(150, 28, 190, 222, 9, { broken: 0 });
  // girl piecing a broken thread at the first spindle
  o += child({ x: 132, y: 262, h: 124, girl: true, face: 1, arms: [[[-6, 80], [14, 94], [27, 112]], [[8, 80], [24, 96], [35, 120]]] });
  // small boy carrying a full bobbin
  o += child({ x: 366, y: 262, h: 100, girl: false, face: -1, arms: [[[-9, 78], [4, 62], [14, 62]], [[9, 78], [16, 64], [14, 62]]],
    holding: `<rect x="344" y="190" width="16" height="22" rx="3" fill="${SNOW}" ${S} stroke-width="2"/>` });
  // girl with a basket of bobbins
  o += child({ x: 66, y: 262, h: 116, girl: true, face: 1, arms: [[[-8, 80], [-12, 58], [0, 50]], [[8, 80], [16, 60], [26, 52]]] });
  o += `<path d="M44 196 L94 196 L88 228 L50 228 Z" fill="${SEPIA}" ${S} stroke-width="3"/><path d="M50 206 H88 M52 216 H86" stroke="${INK}" stroke-width="1.5" opacity="0.6"/>`;
  for (let i = 0; i < 4; i++) o += `<rect x="${52 + i * 10}" y="184" width="8" height="14" rx="2" fill="${SNOW}" ${S} stroke-width="1.8"/>`;
  o += `</svg>`;
  return o;
})();

const onlyone = (() => {
  let o = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`;
  o += `<rect x="0" y="0" width="400" height="300" fill="${WATER}"/>`;
  o += `<path d="${geo(usa, EAST)}" fill="${GRASS}" ${S} stroke-width="3"/>`;
  o += `<path d="${geo(usa, EAST_LI)}" fill="${GRASS}" ${S} stroke-width="2"/>`;
  o += `<path d="${geo(usa, NOVA)}" fill="${GRASS}" ${S} stroke-width="3"/>`;
  o += `<path d="M186 214 q7 -5 14 0 q7 5 14 0 M250 244 q7 -5 14 0 q7 5 14 0 M300 120 q7 -5 14 0 q7 5 14 0" fill="none" stroke="${DWATER}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`;
  o += label(268, 178, 'Atlantic Ocean', { size: 16, font: SERIF, fill: DWATER });
  // glow and star at Pawtucket
  const [px, py] = usa(-71.38, 41.88);
  for (const [rr, op] of [[40, 0.18], [28, 0.28], [18, 0.45]]) o += `<circle cx="${r1(px)}" cy="${r1(py)}" r="${rr}" fill="${BRASS}" opacity="${op}"/>`;
  let star = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 6 : 14;
    star += `${i ? 'L' : 'M'}${r1(px + rr * Math.cos(a))} ${r1(py + rr * Math.sin(a))} `;
  }
  o += `<path d="${star}Z" fill="${BRASS}" ${S} stroke-width="2.5"/>`;
  o += label(272, 72, 'Pawtucket', { size: 20, anchor: 'start', halo: true });
  o += label(272, 94, 'Rhode Island', { size: 15, anchor: 'start', font: SERIF, halo: true });
  o += `<path d="M268 70 L${r1(px + 16)} ${r1(py - 4)}" stroke="${INK}" stroke-width="2"/>`;
  // "shh": keep it secret
  o += `<g transform="translate(318 236)">`;
  o += `<circle cx="0" cy="0" r="28" fill="${CREAM}" ${S} stroke-width="3"/>`;
  o += `<path d="M-14 -8 q5 -4 10 0 M6 -8 q5 -4 10 0" fill="none" ${S} stroke-width="2.5"/>`;
  o += `<path d="M-8 12 q9 4 18 0" fill="none" ${S} stroke-width="2.5"/>`;
  o += `<rect x="-4" y="0" width="9" height="30" rx="4.5" fill="${PARCH}" ${S} stroke-width="2.5"/>`;
  o += `</g>`;
  o += label(356, 216, 'shh', { size: 18, anchor: 'start' });
  o += `</svg>`;
  return o;
})();

export default { handspinning, forbidden, memory, voyage, spindles, watermill, compare, children, onlyone };
