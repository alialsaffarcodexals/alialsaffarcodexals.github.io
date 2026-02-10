export function formatXP(xp) {
  if (xp >= 1_000_000) return (xp / 1_000_000).toFixed(2) + ' MB';
  if (xp >= 1_000) return (xp / 1_000).toFixed(1) + ' kB';
  return Math.round(xp) + ' B';
}

export function formatXPStat(n) {
  // Reboot UI often displays XP in coarse rounded units.
  // Use base-1000 units: 1000 B = 1 kB, 1000 kB = 1 MB.
  const xp = Math.round(n || 0);
  if (xp >= 1_000_000) return formatXP(xp);
  if (xp >= 1_000) {
    const kb = Math.round(xp / 1_000);
    const kbRoundedTo10 = Math.round(kb / 10) * 10;
    return `${kbRoundedTo10} kB`;
  }
  return `${xp} B`;
}

export function formatGrade(grade, scale = null) {
  if (grade === null || grade === undefined || Number.isNaN(Number(grade))) return '—';
  const g = Math.round(Number(grade) * 10) / 10;
  if (scale === null) return `${g.toFixed(1)}`;
  return `${g.toFixed(1)} / ${Number(scale).toFixed(1)}`;
}
