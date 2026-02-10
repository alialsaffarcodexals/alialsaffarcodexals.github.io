import { formatXP } from '../../utils/format.js';

export function generateGridLines(width, height, padding, minX, maxX, minY, maxY, isNumericX = true) {
  const lines = [];
  const horizontalLines = 5;
  const verticalLines = Math.min(7, isNumericX ? 7 : Math.max(3, Math.min(7, maxX - minX + 1)));

  for (let i = 0; i <= horizontalLines; i++) {
    const y = padding + (i / horizontalLines) * (height - padding * 2);
    lines.push(`<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="rgba(156, 163, 175, 0.2)" stroke-width="0.5" />`);
  }

  for (let i = 0; i <= verticalLines; i++) {
    if (isNumericX) {
      const x = padding + (i / verticalLines) * (width - padding * 2);
      lines.push(`<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" stroke="rgba(156, 163, 175, 0.2)" stroke-width="0.5" />`);
    } else {
      if (i < verticalLines) {
        const x = padding + (i / Math.max(1, verticalLines - 1)) * (width - padding * 2);
        lines.push(`<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}" stroke="rgba(156, 163, 175, 0.2)" stroke-width="0.5" />`);
      }
    }
  }

  return lines.join('');
}

export function generateAxisLabels(width, height, padding, minX, maxX, minY, maxY, isNumericX = true) {
  const labels = [];
  const horizontalLines = 5;
  const verticalLines = Math.min(7, isNumericX ? 7 : Math.max(3, Math.min(7, maxX - minX + 1)));

  for (let i = 0; i <= horizontalLines; i++) {
    const y = padding + (i / horizontalLines) * (height - padding * 2);
    const value = Math.round(minY + (maxY - minY) * (horizontalLines - i) / horizontalLines);
    labels.push(`<text x="${padding - 10}" y="${y + 4}" fill="#9ca3af" font-size="10" text-anchor="end">${formatXP(value)}</text>`);
  }

  if (isNumericX) {
    for (let i = 0; i <= verticalLines; i++) {
      const x = padding + (i / verticalLines) * (width - padding * 2);
      if (minX === maxX) continue;

      const timeValue = minX + (i / verticalLines) * (maxX - minX);
      const date = new Date(timeValue);

      const timeDiff = maxX - minX;
      const daysDiff = timeDiff / (24 * 60 * 60 * 1000);

      let label;
      if (daysDiff <= 30) label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      else if (daysDiff <= 365) label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      else label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      labels.push(`<text x="${x}" y="${height - padding + 15}" fill="#9ca3af" font-size="10" text-anchor="middle">${label}</text>`);
    }
  }

  return labels.join('');
}
