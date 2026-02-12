// Reboot skills come as transactions with type skill_*.
// We keep the highest value per skill.
// groupSkills: normalizes, deduplicates, and returns top skill rows for UI.
export function groupSkills(skills, _totalXp = null) {
  const map = new Map();
  if (!skills || !Array.isArray(skills)) return [];

  skills.forEach((s) => {
    if (!s) return;
    const name = (s.type || '').replace('skill_', '') || s.path?.split('/').pop() || 'skill';
    const amount = Number(s.amount);
    if (!name || !Number.isFinite(amount) || amount <= 0) return;

    // If duplicates exist, keep max value.
    const prev = Number(map.get(name) || 0);
    map.set(name, Math.max(prev, amount));
  });

  // Keep list short so UI stays clean.
  const top = Array.from(map.entries())
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 12);

  return top.map(([name, val]) => ({
    name,
    val,
    pct: Number(val).toFixed(1),
  }));
}
