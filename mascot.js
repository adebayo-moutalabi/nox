// Mascotte vectorielle : petit robot jaune, visiere sombre, yeux lumineux.
// Les couleurs lumineuses suivent l'humeur (--glow). Couches animees separement
// (voir renderer.js) : .body (saut, squash), .look (regard), .eyes (clignement),
// .mouth (ouverture selon le volume de la voix), .antenna (pulsation, ondes).
function buildMascot() {
  // Yeux seuls : la bouche est une couche commune pilotee par l'audio
  const eyes = {
    // yeux fermes, dort
    idle: `<path d="M34 46 q6 4 12 0 M54 46 q6 4 12 0" class="eye-line"/>`,
    // yeux ronds, attentif
    focus: `<rect x="36" y="39" width="7" height="11" rx="3.5" class="eye"/><rect x="57" y="39" width="7" height="11" rx="3.5" class="eye"/>
            <circle cx="41" cy="42" r="1.4" fill="#fff"/><circle cx="62" cy="42" r="1.4" fill="#fff"/>`,
    // yeux en ^ ^
    happy: `<path d="M34 47 q6 -8 12 0 M54 47 q6 -8 12 0" class="eye-line"/>`,
    // petits yeux + sourcils inquiets
    worried: `<rect x="37" y="42" width="6" height="8" rx="3" class="eye"/><rect x="57" y="42" width="6" height="8" rx="3" class="eye"/>
              <path d="M35 40 l8 -3 M65 40 l-8 -3" class="eye-line thin"/>`,
    // yeux etoiles
    proud: `<path d="M40 39 l1.8 4.2 4.4 .4 -3.4 2.9 1 4.4 -3.8 -2.3 -3.8 2.3 1 -4.4 -3.4 -2.9 4.4 -.4z" class="eye"/>
            <path d="M60 39 l1.8 4.2 4.4 .4 -3.4 2.9 1 4.4 -3.8 -2.3 -3.8 2.3 1 -4.4 -3.4 -2.9 4.4 -.4z" class="eye"/>`
  };
  // Decors hors de la visiere (ne clignent pas)
  const extras = {
    worried: `<path d="M76 26 q3 5 0 7 q-3 -2 0 -7z" fill="#8fd8ff"/>`,
    proud: `<path d="M10 22 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z M88 14 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z" class="spark"/>`
  };
  return `
  <defs>
    <linearGradient id="head" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6c45c"/><stop offset="1" stop-color="#e9ad42"/>
    </linearGradient>
    <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1d2028"/><stop offset="1" stop-color="#121418"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="50" cy="97" rx="16" ry="2.4" class="shadow"/>
  <g class="float"><g class="body">
    <!-- jambes et bras -->
    <g stroke="#a98538" stroke-width="3" stroke-linecap="round">
      <line x1="42" y1="84" x2="42" y2="93"/><line x1="58" y1="84" x2="58" y2="93"/>
      <line x1="28" y1="66" x2="20" y2="76" class="hand l"/><line x1="72" y1="66" x2="80" y2="76" class="hand r"/>
    </g>
    <!-- corps -->
    <rect x="33" y="64" width="34" height="21" rx="7" fill="#c9a04f"/>
    <rect x="45" y="72" width="10" height="4" rx="2" class="core" filter="url(#glow)"/>
    <!-- antenne (+ ondes pendant l'ecoute) -->
    <g class="antenna">
      <line x1="50" y1="30" x2="50" y2="19" stroke="#a98538" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="50" cy="15" r="4.6" class="led" filter="url(#glow)"/>
      <circle cx="50" cy="15" r="7" class="wave"/><circle cx="50" cy="15" r="7" class="wave w2"/>
    </g>
    <!-- oreilles -->
    <rect x="14" y="41" width="10" height="17" rx="5" fill="#e9ad42"/>
    <rect x="76" y="41" width="10" height="17" rx="5" fill="#e9ad42"/>
    <!-- tete -->
    <rect x="21" y="29" width="58" height="40" rx="18" fill="url(#head)"/>
    <ellipse cx="32" cy="34" rx="5" ry="2" fill="#fff" opacity=".35" transform="rotate(-15 32 34)"/>
    <!-- visiere -->
    <rect x="28" y="35" width="44" height="27" rx="12" fill="url(#visor)"/>
    <rect x="31" y="37" width="13" height="2.6" rx="1.3" fill="#fff" opacity=".1"/>
    <g filter="url(#glow)" transform="translate(0 3)">
      <g id="look">
        <g class="eyes">${Object.entries(eyes).map(([k, v]) => `<g class="face f-${k}">${v}</g>`).join('')}</g>
        <g class="mouth">
          <path d="M45 53 q5 3.5 10 0" class="eye-line thin smile"/>
          <circle cx="50" cy="53" r="1.8" class="eye mouth-o"/>
          <ellipse id="mouthOpen" cx="50" cy="54" rx="4.2" ry="0" class="eye"/>
        </g>
      </g>
    </g>
    ${Object.entries(extras).map(([k, v]) => `<g class="face f-${k}">${v}</g>`).join('')}
    <!-- points de reflexion -->
    <g class="dots"><circle cx="80" cy="22" r="2" class="eye"/><circle cx="86" cy="17" r="2.4" class="eye"/><circle cx="93" cy="11" r="2.8" class="eye"/></g>
  </g></g>`;
}
if (typeof module !== 'undefined') module.exports = { buildMascot };
