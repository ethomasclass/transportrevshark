// Logo for the Turnpike pitch: the full lockup (podium, intro card) and the square icon.
// Style: vintage American enamel road sign. A route-marker shield (road running to a
// rising sun, the spiked "pike" swung up out of the way) bolted onto a riveted green plaque.

const INK = '#1f1a17';
const CREAM = '#f4e7c5';
const GREEN = '#1f5a3a';
const GREEN_LT = '#2f7d4e';
const GOLD = '#e3a92b';
const RED = '#b23a26';

// Route-marker shield, drawn in a 200 x 200 box.
const SHIELD = 'M100,28 C84,28 72,8 46,8 C34,8 24,12 16,19 L16,96 C16,146 52,176 100,194 C148,176 184,146 184,96 L184,19 C176,12 166,8 154,8 C128,8 116,28 100,28 Z';
const at = (s) => `transform="translate(100 101) scale(${s}) translate(-100 -101)"`;

// Spikes along the top of the pike pole (pole local coords: pivot at 0,0, pole runs +x).
const spikes = [28, 48, 68, 88]
  .map((x) => `<path d="M${x - 7},-9 L${x},-26 L${x + 7},-9 Z" fill="${CREAM}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`)
  .join('');

const shieldArt = (clipId) => `
  <defs><clipPath id="${clipId}"><path d="${SHIELD}" ${at(0.8)}/></clipPath></defs>
  <path d="${SHIELD}" fill="${INK}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <path d="${SHIELD}" fill="${CREAM}" ${at(0.94)}/>
  <path d="${SHIELD}" fill="${GREEN}" ${at(0.88)}/>
  <g clip-path="url(#${clipId})">
    <rect x="0" y="0" width="200" height="200" fill="${GOLD}"/>
    <g fill="#f2c85a">${[-160, -135, -110, -85, -60, -35, -10].map((a) => `<path d="M104,112 L${(104 + 140 * Math.cos(((a - 6) * Math.PI) / 180)).toFixed(1)},${(112 + 140 * Math.sin(((a - 6) * Math.PI) / 180)).toFixed(1)} L${(104 + 140 * Math.cos(((a + 6) * Math.PI) / 180)).toFixed(1)},${(112 + 140 * Math.sin(((a + 6) * Math.PI) / 180)).toFixed(1)} Z"/>`).join('')}</g>
    <circle cx="104" cy="112" r="27" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
    <path d="M0,112 C40,98 70,104 100,112 C130,104 160,96 200,110 L200,200 L0,200 Z" fill="${GREEN_LT}" stroke="${INK}" stroke-width="4"/>
    <path d="M94,112 L106,112 L168,200 L32,200 Z" fill="${INK}"/>
    <path d="M94,112 L106,112 L150,200 L50,200 Z" fill="#3a332d"/>
    <path d="M99,120 L101,120 L102,130 L98,130 Z M98,140 L102,140 L104,156 L96,156 Z M96,168 L104,168 L107,194 L93,194 Z" fill="${GOLD}"/>
  </g>
  <path d="${SHIELD}" fill="none" stroke="${INK}" stroke-width="5" ${at(0.8)}/>
  <g transform="translate(62 138) rotate(-58)">
    ${spikes}
    <rect x="-22" y="-10" width="124" height="20" rx="3" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
    <path d="M18,-8 h14 v16 h-14 Z M52,-8 h14 v16 h-14 Z M86,-8 h14 v16 h-14 Z" fill="${RED}"/>
    <rect x="-24" y="-12" width="14" height="24" rx="3" fill="${INK}"/>
  </g>
  <rect x="54" y="136" width="16" height="34" fill="${RED}" stroke="${INK}" stroke-width="4"/>
  <circle cx="62" cy="138" r="7" fill="${GOLD}" stroke="${INK}" stroke-width="3.5"/>
`;

const rivet = (x, y) =>
  `<circle cx="${x}" cy="${y}" r="5" fill="${GOLD}" stroke="${INK}" stroke-width="2.5"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.5" fill="${CREAM}"/>`;

const SLAB = `font-family="'Alfa Slab One', Georgia, serif"`;

export default {
  mark: `<svg viewBox="0 0 480 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="140" y="30" width="334" height="180" rx="16" fill="${INK}"/>
  <rect x="145" y="35" width="324" height="170" rx="12" fill="${GREEN}"/>
  <rect x="153" y="43" width="308" height="154" rx="8" fill="none" stroke="${CREAM}" stroke-width="3"/>
  <rect x="140" y="120" width="334" height="44" fill="${RED}" stroke="${INK}" stroke-width="5"/>
  <line x1="140" y1="126" x2="474" y2="126" stroke="${CREAM}" stroke-width="2"/>
  <line x1="140" y1="158" x2="474" y2="158" stroke="${CREAM}" stroke-width="2"/>
  ${rivet(462, 51)}${rivet(462, 189)}
  <text x="340" y="70" text-anchor="middle" ${SLAB} font-size="17" letter-spacing="2" fill="${GOLD}">PHILADELPHIA &amp;</text>
  <text x="340" y="113" text-anchor="middle" ${SLAB} font-size="46" textLength="236" lengthAdjust="spacingAndGlyphs" fill="${CREAM}" stroke="${INK}" stroke-width="1.5" paint-order="stroke">LANCASTER</text>
  <text x="340" y="154" text-anchor="middle" ${SLAB} font-size="30" letter-spacing="5" fill="${CREAM}" stroke="${INK}" stroke-width="3" paint-order="stroke">TURNPIKE</text>
  <text x="340" y="188" text-anchor="middle" ${SLAB} font-size="16" letter-spacing="1.5" fill="${GOLD}">62 MILES · EST. 1792</text>
  <g transform="translate(-10 5) scale(1.15)">${shieldArt('lg-tp-clip-m')}</g>
</svg>`,
  icon: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${shieldArt('lg-tp-clip-i')}</svg>`,
};
