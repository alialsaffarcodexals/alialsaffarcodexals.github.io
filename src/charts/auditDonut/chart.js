/**
 * chart.js
 * Renders pass/fail (and audits ratio) donut chart SVG graphics.
 */
import { addAriaToSvg } from '../../utils/a11y.js';
import { generateCenterBubbles, generateFloatingBubbles } from './bubbles.js';

/**
 * Donut chart with bubbles.
 * Started for pass/fail and reused for done/received ratio too.
 */
export function renderPassFailChart(container, passCount, failCount) {
  const width = 720;
  const height = 520;
  const total = passCount + failCount || 1;

  const passAngle = (passCount / total) * Math.PI * 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'floating-chart');

  addAriaToSvg(
    svg,
    'Pass vs Fail Ratio Chart',
    `Donut chart showing pass vs fail ratio. Pass: ${passCount}, Fail: ${failCount}, Total: ${total}`
  );

  const cx = width / 2;
  const cy = height / 2;
  const r = 150;

  // donutArc: Builds an SVG path string for a donut segment between two angles.
  const donutArc = (start, end, innerRadius) => {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const ix1 = cx + innerRadius * Math.cos(end);
    const iy1 = cy + innerRadius * Math.sin(end);
    const ix2 = cx + innerRadius * Math.cos(start);
    const iy2 = cy + innerRadius * Math.sin(start);
    const large = end - start > Math.PI ? 1 : 0;

    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${ix2} ${iy2} Z`;
  };

  // Make donut a bit thicker so center labels are clearer.
  const innerR = r * 0.72;
  const passDonutPath = donutArc(0, passAngle, innerR);
  const failDonutPath = donutArc(passAngle, Math.PI * 2, innerR);

  const centerBubbles = generateCenterBubbles(cx, cy, innerR * 0.7);
  const passBubbles = generateFloatingBubbles(cx, cy, r * 0.8, 0, passAngle, '#34d399', passCount);
  const failBubbles = generateFloatingBubbles(cx, cy, r * 0.8, passAngle, Math.PI * 2, '#f87171', failCount);

  const gradients = `
    <defs>
      <radialGradient id="passGradient" cx="30%" cy="30%">
        <stop offset="0%" stop-color="rgba(52, 211, 153, 0.9)" />
        <stop offset="70%" stop-color="rgba(52, 211, 153, 0.6)" />
        <stop offset="100%" stop-color="rgba(52, 211, 153, 0)" />
      </radialGradient>
      <radialGradient id="failGradient" cx="30%" cy="30%">
        <stop offset="0%" stop-color="rgba(248, 113, 113, 0.9)" />
        <stop offset="70%" stop-color="rgba(248, 113, 113, 0.6)" />
        <stop offset="100%" stop-color="rgba(248, 113, 113, 0)" />
      </radialGradient>
      <radialGradient id="centerGradient" cx="30%" cy="30%">
        <stop offset="0%" stop-color="rgba(18, 24, 38, 0.9)" />
        <stop offset="100%" stop-color="rgba(18, 24, 38, 0.6)" />
      </radialGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.24 0 0 0 0 0.56 0 0 0 0 1 0 0 0 0.3 0" result="glow"/>
        <feBlend in="SourceGraphic" in2="glow" mode="screen" />
      </filter>
    </defs>
  `;

  svg.innerHTML = `
    ${gradients}
    <path d="${passDonutPath}" fill="url(#passGradient)" filter="url(#glow)" />
    <path d="${failDonutPath}" fill="url(#failGradient)" filter="url(#glow)" />
    <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="url(#centerGradient)" />
    <text x="${cx}" y="${cy - 16}" fill="#e5e7eb" text-anchor="middle" font-size="18" font-weight="bold">${passCount + failCount}</text>
    <text x="${cx}" y="${cy + 4}" fill="#9ca3af" text-anchor="middle" font-size="12">Total</text>
    <text x="${cx}" y="${cy + 44}" fill="#c7d2fe" text-anchor="middle" font-size="11">Pass: ${passCount} | Fail: ${failCount}</text>
    ${centerBubbles}
    ${passBubbles}
    ${failBubbles}
  `;

  container.innerHTML = '';
  container.appendChild(svg);
}
