// Logo for the Northern Cross pitch: the full lockup (podium, intro card) and the square icon.
// Style: speedy railroad herald. A four-pointed compass star (the "cross") with a little
// 1830s balloon-stack locomotive charging out of its crimson centre, beside a slanted
// crimson banner carrying an italic slab wordmark with speed stripes.

const K = '#1a1210'; // ink black
const R = '#b8142f'; // crimson
const RD = '#7e0c20'; // deep crimson
const O = '#f36a1c'; // bright orange
const G = '#f7bb2c'; // prairie gold
const C = '#fff3d6'; // cream

// Four-pointed compass star centred on (100,100), faceted gold/orange.
const star = (() => {
  const c = 100, R1 = 95, r = 46;
  const d = r * Math.SQRT1_2;
  const pts = [
    [c, c - R1], [c + d, c - d], [c + R1, c], [c + d, c + d],
    [c, c + R1], [c - d, c + d], [c - R1, c], [c - d, c - d],
  ];
  const f = (p) => p.map((n) => n.toFixed(1)).join(',');
  let facets = '';
  for (let i = 0; i < 8; i += 2) {
    const tip = pts[i], next = pts[(i + 1) % 8], prev = pts[(i + 7) % 8];
    facets += `<polygon points="${c},${c} ${f(prev)} ${f(tip)}" fill="${O}"/>`;
    facets += `<polygon points="${c},${c} ${f(next)} ${f(tip)}" fill="${G}"/>`;
  }
  const outline = pts.map(f).join(' ');
  return `<polygon points="${outline}" fill="${G}" stroke="${K}" stroke-width="12" stroke-linejoin="round"/>${facets}` +
    `<polygon points="${outline}" fill="none" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>`;
})();

// Little 4-2-0 locomotive facing right, rails at y=0, drawn in local units.
const loco = `
  <g stroke="${K}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <circle cx="-6" cy="-96" r="10" fill="${C}"/>
    <circle cx="13" cy="-99" r="10" fill="${C}"/>
    <circle cx="31" cy="-94" r="9" fill="${C}"/>
    <path d="M43,-60 C35,-66 32,-78 35,-84 L61,-84 C64,-78 61,-66 53,-60 Z" fill="${K}"/>
    <rect x="33" y="-88" width="30" height="7" rx="2" fill="${G}"/>
    <rect x="44" y="-64" width="8" height="12" fill="${K}"/>
    <rect x="-14" y="-52" width="64" height="26" rx="6" fill="${K}"/>
    <path d="M4,-52 C4,-64 20,-64 20,-52 Z" fill="${G}"/>
    <rect x="-40" y="-72" width="34" height="8" rx="2" fill="${K}"/>
    <rect x="-36" y="-66" width="26" height="42" fill="${R}"/>
    <rect x="-31" y="-60" width="15" height="13" fill="${C}" stroke-width="3"/>
    <rect x="-40" y="-28" width="98" height="8" fill="${K}"/>
    <rect x="50" y="-66" width="12" height="11" rx="2" fill="${G}"/>
    <path d="M54,-22 L78,-1 L50,-1 Z" fill="${G}"/>
    <circle cx="-22" cy="-19" r="18" fill="${G}"/>
    <circle cx="-22" cy="-19" r="5" fill="${K}" stroke="none"/>
    <circle cx="20" cy="-11" r="10" fill="${G}"/>
    <circle cx="42" cy="-11" r="10" fill="${G}"/>
    <path d="M-22,-19 L8,-19" stroke-width="6"/>
  </g>
  <g fill="${G}">
    <rect x="-2" y="-47" width="5" height="16"/>
    <rect x="28" y="-47" width="5" height="16"/>
  </g>`;

const iconBody = `
  ${star}
  <circle cx="100" cy="100" r="58" fill="${R}" stroke="${K}" stroke-width="6"/>
  <circle cx="100" cy="100" r="50" fill="none" stroke="${C}" stroke-width="3"/>
  <g stroke="${C}" stroke-width="7" stroke-linecap="round">
    <line x1="50" y1="92" x2="64" y2="92"/>
    <line x1="46" y1="110" x2="60" y2="110"/>
  </g>
  <rect x="46" y="140" width="120" height="7" fill="${K}"/>
  <g transform="translate(100,142) scale(1.02)">${loco}</g>`;

const icon = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${iconBody}</svg>`;

const slab = `font-family="'Alfa Slab One', Georgia, serif"`;
const sans = `font-family="'Atkinson Hyperlegible', Arial, sans-serif" font-weight="700"`;

const mark = `<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg">
  <path d="M184,22 L476,22 L435,218 L143,218 Z" fill="${R}" stroke="${K}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M168,92 L466,92 L464,100 L166,100 Z" fill="${O}"/>
  <path d="M165,104 L463,104 L462,108 L164,108 Z" fill="${G}"/>
  <path d="M170,176 L446,176 L440,210 L164,210 Z" fill="${K}"/>
  <g transform="skewX(-12)">
    <text x="${204 + 0.2126 * 79}" y="82" ${slab} font-size="48" fill="${K}" textLength="250" lengthAdjust="spacingAndGlyphs">NORTHERN</text>
    <text x="${202 + 0.2126 * 76}" y="79" ${slab} font-size="48" fill="${C}" stroke="${K}" stroke-width="2" textLength="250" lengthAdjust="spacingAndGlyphs">NORTHERN</text>
    <text x="${240 + 0.2126 * 170}" y="170" ${slab} font-size="76" fill="${K}" textLength="218" lengthAdjust="spacingAndGlyphs">CROSS</text>
    <text x="${236 + 0.2126 * 166}" y="166" ${slab} font-size="76" fill="${O}" textLength="218" lengthAdjust="spacingAndGlyphs">CROSS</text>
    <text x="${234 + 0.2126 * 164}" y="164" ${slab} font-size="76" fill="${G}" stroke="${K}" stroke-width="2.5" textLength="218" lengthAdjust="spacingAndGlyphs">CROSS</text>
    <text x="${310 + 0.2126 * 200}" y="200" ${sans} font-size="19" fill="${G}" text-anchor="middle" letter-spacing="2.5">ILLINOIS RAIL ROAD</text>
  </g>
  <g stroke="${C}" stroke-width="6" stroke-linecap="round">
    <line x1="200" y1="128" x2="226" y2="128"/>
    <line x1="194" y1="144" x2="222" y2="144"/>
    <line x1="192" y1="160" x2="216" y2="160"/>
  </g>
  <g transform="translate(0,25) scale(0.95)">${iconBody}</g>
</svg>`;

export default { mark, icon };
