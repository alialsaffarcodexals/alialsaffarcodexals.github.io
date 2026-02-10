// Skills in Reboot01 are exposed as transactions with type `skill_*`.
// The platform UI commonly shows the "percentage" as the MAX value ever achieved per skill.
export function groupSkills(skills, _totalXp = null) {
  const map = new Map();
  if (!skills || !Array.isArray(skills)) return [];

  skills.forEach((s) => {
    if (!s) return;
    const name = (s.type || '').replace('skill_', '') || s.path?.split('/').pop() || 'skill';
    const amount = Number(s.amount);
    if (!name || !Number.isFinite(amount) || amount <= 0) return;

    // Robust even if the API returns duplicates: keep MAX per skill.
    const prev = Number(map.get(name) || 0);
    map.set(name, Math.max(prev, amount));
  });

  // Show a reasonable list (UI can scroll); bump if you want everything.
  const top = Array.from(map.entries())
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 12);

  return top.map(([name, val]) => ({
    name,
    val,
    pct: Number(val).toFixed(1),
  }));
}
