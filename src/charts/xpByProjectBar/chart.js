/**
 * chart.js
 * Renders the XP-by-project horizontal SVG bar chart, including labels and gradients.
 */
import { addAriaToSvg } from '../../utils/a11y.js';
import { formatXP } from '../../utils/format.js';
import { escapeXml } from '../../utils/xml.js';

/**
 * Horizontal bar chart for XP by project.
 *
 * points format:
 * [{ x: projectName, y: xpAmount }, ...]
 */
export function renderXpByProjectBarChart(container, points) {
  const width = 800;
  const height = 350;

  const paddingTop = 30;
  const paddingBottom = 30;
  const paddingLeft = 220;
  const paddingRight = 50;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'floating-chart');

  addAriaToSvg(
    svg,
    'XP by Project Chart',
    points && points.length > 0
      ? `Horizontal bar chart showing XP earned by project. Showing top ${points.length} projects.`
      : 'Horizontal bar chart showing XP earned by project. No data available.'
  );

  const valid = (Array.isArray(points) ? points : [])
    .filter((p) => p && typeof p.y === 'number')
    .map((p) => ({ label: String(p.x ?? ''), value: p.y }));

  if (valid.length === 0) {
    svg.innerHTML = `<text x="${width / 2}" y="${height / 2}" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle" font-size="16">No project data</text>`;
    container.innerHTML = '';
    container.appendChild(svg);
    return;
  }

  valid.sort((a, b) => b.value - a.value);

  const maxV = Math.max(...valid.map((d) => d.value)) || 1;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const barGap = 6;
  const barH = Math.max(10, Math.min(22, (chartH - barGap * (valid.length - 1)) / valid.length));
  const totalBarsH = valid.length * barH + (valid.length - 1) * barGap;
  const startY = paddingTop + (chartH - totalBarsH) / 2;

  const scaleX = (v) => paddingLeft + (Math.max(0, v) / maxV) * chartW;

  const gridCount = 5;
  const grid = [];
  for (let i = 0; i <= gridCount; i++) {
    const t = i / gridCount;
    const x = paddingLeft + t * chartW;
    // Make first tick easier to read.
    const val = i === 0 ? 0 : Math.round(t * maxV);
    grid.push(`<line x1="${x}" y1="${paddingTop}" x2="${x}" y2="${height - paddingBottom}" stroke="rgba(156, 163, 175, 0.18)" stroke-width="0.8" />`);
    const tickLabel = i === 0 ? '0 kB' : formatXP(val);
    grid.push(`<text x="${x}" y="${height - paddingBottom + 16}" fill="#9ca3af" font-size="10" text-anchor="middle">${tickLabel}</text>`);
  }

  const gradients = `
    <defs>
      <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(59, 130, 246, 0.95)" />
        <stop offset="60%" stop-color="rgba(96, 165, 250, 0.85)" />
        <stop offset="100%" stop-color="rgba(59, 130, 246, 0.75)" />
      </linearGradient>
      <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.6  0 0 0 0 1  0 0 0 0.25 0" result="glow"/>
        <feBlend in="SourceGraphic" in2="glow" mode="screen" />
      </filter>
    </defs>
  `;

  const bars = valid
    .map((d, i) => {
      const y = startY + i * (barH + barGap);
      const x0 = paddingLeft;
      const x1 = scaleX(d.value);
      const w = Math.max(2, x1 - x0);

      const maxLen = 24;
      const label = d.label.length > maxLen ? d.label.slice(0, maxLen) + '…' : d.label;
      const formattedValue = formatXP(d.value);

      return `
      <g>
        <text x="${paddingLeft - 12}" y="${y + barH / 2}" fill="#cbd5e1" font-size="11" text-anchor="end" dominant-baseline="middle">${escapeXml(label)}<title>${escapeXml(d.label)}</title></text>
        <rect x="${x0}" y="${y}" width="${w}" height="${barH}" rx="8" ry="8" fill="url(#barGradient)" filter="url(#barGlow)">
          <title>${escapeXml(d.label)}\nXP: ${formattedValue}</title>
        </rect>
        <circle cx="${x1}" cy="${y + barH / 2}" r="4.5" fill="rgba(147, 197, 253, 0.9)">
          <animate attributeName="r" values="4.5;6;4.5" dur="2.8s" repeatCount="indefinite" />
          <title>${escapeXml(d.label)}\nXP: ${formattedValue}</title>
        </circle>
      </g>
    `;
    })
    .join('');

  svg.innerHTML = `
    ${gradients}
    ${grid.join('')}
    ${bars}
  `;

  container.innerHTML = '';
  container.appendChild(svg);
}
