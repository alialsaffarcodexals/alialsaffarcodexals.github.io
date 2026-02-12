/**
 * chart.js
 * Renders the XP-over-time SVG chart with area, line, labels, and animations.
 */
import { addAriaToSvg } from '../../utils/a11y.js';
import { generateGridLines, generateAxisLabels } from '../base/grid.js';

/**
 * XP line + area chart.
 *
 * points format:
 * [{ x: timestampMs, y: xpAmount }, ...]
 *
 * This chart is not cumulative.
 * It shows each transaction amount on timeline.
 */
export function renderXpChart(container, points) {
  const width = 800;
  const height = 350;
  const padding = 60;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'floating-chart');

  addAriaToSvg(
    svg,
    'XP Over Time Chart',
    points && points.length > 0
      ? `Chart showing XP progression over time with ${points.length} data points`
      : 'Chart showing XP progression over time with no data available'
  );

  if (!points || points.length < 1) {
    svg.innerHTML = `<text x="${width / 2}" y="${height / 2}" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle" font-size="16">Not enough data</text>`;
    container.innerHTML = '';
    container.appendChild(svg);
    return;
  }

  const isNumericX = typeof points[0]?.x === 'number';

  let minX, maxX;
  if (isNumericX) {
    maxX = Math.max(...points.map((p) => p?.x || 0));
    minX = Math.min(...points.map((p) => p?.x || 0));
  } else {
    minX = 0;
    maxX = points.length - 1;
  }

  const validYValues = points.filter((p) => p && typeof p.y === 'number').map((p) => p.y);
  if (validYValues.length === 0) {
    svg.innerHTML = `<text x="${width / 2}" y="${height / 2}" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle" font-size="16">No valid data points</text>`;
    container.innerHTML = '';
    container.appendChild(svg);
    return;
  }

  const maxY = Math.max(...validYValues);
  const minY = Math.min(...validYValues);

  // scaleX: Converts an X domain value into chart pixel coordinates.
  const scaleX = (xValue, index) => {
    if (isNumericX) {
      return padding + ((xValue - minX) / (maxX - minX || 1)) * (width - padding * 2);
    }
    return padding + (index / (points.length - 1 || 1)) * (width - padding * 2);
  };

  // scaleY: Converts a Y domain value into chart pixel coordinates.
  const scaleY = (yValue) => {
    const range = maxY - minY || 1;
    return height - padding - ((yValue - minY) / range) * (height - padding * 2);
  };

  const validPoints = points.filter((p) => {
    if (!p || typeof p.y !== 'number') return false;
    if (isNumericX) return typeof p.x === 'number';
    return typeof p.x === 'string' || typeof p.x === 'number';
  });

  let areaPath = '';
  let linePath = '';

  if (validPoints.length >= 2) {
    areaPath =
      validPoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.x, i)} ${scaleY(p.y)}`)
        .join(' ') +
      ` L${scaleX(validPoints[validPoints.length - 1].x, validPoints.length - 1)},${height - padding}` +
      ` L${scaleX(validPoints[0].x, 0)},${height - padding} Z`;

    linePath = validPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${scaleX(p.x, i)} ${scaleY(p.y)}`)
      .join(' ');
  } else if (validPoints.length === 1) {
    const singleX = scaleX(validPoints[0].x, 0);
    const singleY = scaleY(validPoints[0].y);
    linePath = `M ${singleX} ${singleY} L ${singleX} ${singleY}`;
  }

  const gridLines = generateGridLines(width, height, padding, minX, maxX, minY, maxY, isNumericX);
  const axisLabels = generateAxisLabels(width, height, padding, minX, maxX, minY, maxY, isNumericX);

  const gradients = `
    <defs>
      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(59, 130, 246, 0.4)" />
        <stop offset="100%" stop-color="rgba(59, 130, 246, 0.05)" />
      </linearGradient>
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="50%" stop-color="#60a5fa" />
        <stop offset="100%" stop-color="#3b82f6" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.3 0 0 0 0 0.6 0 0 0 0 1 0 0 0 0.4 0" result="glow"/>
        <feBlend in="SourceGraphic" in2="glow" mode="screen" />
      </filter>
    </defs>
  `;

  svg.innerHTML = `
    ${gradients}
    ${gridLines}
    ${areaPath ? `<path d="${areaPath}" fill="url(#areaGradient)" />` : ''}
    ${linePath ? `<path d="${linePath}" fill="none" stroke="rgba(96, 165, 250, 0.4)" stroke-width="2" stroke-dasharray="4,4" />` : ''}
    ${linePath ? `<path d="${linePath}" fill="none" stroke="url(#lineGradient)" stroke-width="3" filter="url(#glow)" />` : ''}
    ${axisLabels}
  `;

  container.innerHTML = '';
  container.appendChild(svg);
}