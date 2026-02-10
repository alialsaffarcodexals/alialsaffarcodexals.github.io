import { formatXP, formatXPStat, formatGrade } from '../../utils/format.js';
import { projectFromPath } from '../../utils/path.js';

export function renderUnifiedActivity(data) {
  renderRecentProjects(data);
  renderRecentAudits(data);
}

function renderRecentProjects(data) {
  const unifiedActivityList = document.getElementById('unifiedActivityList');
  const unifiedActivityFooter = document.getElementById('unifiedActivityFooter');
  if (!unifiedActivityList) return;

  const transactions = Array.isArray(data.transactions) ? data.transactions : [];
  const validTransactions = transactions.filter((t) => t && t.createdAt && typeof t.amount === 'number');

  const results = Array.isArray(data.results) ? data.results : [];
  const validResults = results.filter((r) => r && typeof r.grade === 'number');

  const progress = Array.isArray(data.progress) ? data.progress : [];

  const byProject = new Map();

  const addEntry = (name, update) => {
    if (!name) return;
    const curr = byProject.get(name) || { name };
    byProject.set(name, { ...curr, ...update });
  };

  validTransactions.forEach((t) => {
    const name = projectFromPath(t.path);
    addEntry(name, {
      xp: t.amount || 0,
      date: t.createdAt ? new Date(t.createdAt).getTime() : byProject.get(name)?.date || 0,
    });
  });

  validResults.forEach((r) => {
    const name = projectFromPath(r.path);
    addEntry(name, {
      grade: r.grade,
      resultDate: r.createdAt ? new Date(r.createdAt).getTime() : byProject.get(name)?.resultDate || 0,
    });
  });

  progress.forEach((p) => {
    const name = p?.path ? projectFromPath(p.path) : null;
    addEntry(name, {
      progressGrade: typeof p?.grade === 'number' ? p.grade : null,
      progressDate: p?.updatedAt ? new Date(p.updatedAt).getTime() : byProject.get(name)?.progressDate || 0,
    });
  });

  const rows = Array.from(byProject.values())
    .map((item) => {
      const date = Math.max(item.date || 0, item.resultDate || 0, item.progressDate || 0);
      return { ...item, lastDate: date };
    })
    .sort((a, b) => b.lastDate - a.lastDate)
    .slice(0, 6);

  unifiedActivityList.innerHTML =
    rows.length
      ? rows
          .map((item) => {
            const gradeVal = item.grade ?? item.progressGrade;
            const passed = typeof gradeVal === 'number' ? gradeVal > 0 : null;
            const status = passed === null ? '⏳ In progress' : passed ? '✔ Pass' : '✖ Fail';
            const statusClass = passed === null ? 'status-info' : passed ? 'status-pass' : 'status-fail';
            const gradeText = typeof gradeVal === 'number' ? formatGrade(gradeVal, null) : '—';
            const dateText = item.lastDate ? new Date(item.lastDate).toLocaleDateString() : '';
            const xpText = typeof item.xp === 'number' ? formatXPStat(item.xp) : '—';
            return `
              <li class="list-item">
                <div>
                  <div class="title">${item.name}</div>
                  <div class="meta">${dateText}</div>
                </div>
                <div>
                  <span class="status-pill ${statusClass}">${status}</span>
                  <div class="meta">Grade: ${gradeText} • XP: ${xpText}</div>
                </div>
              </li>
            `;
          })
          .join('')
      : '<li class="muted">No recent projects found</li>';

  if (unifiedActivityFooter) unifiedActivityFooter.textContent = `Showing latest ${rows.length} projects`;
}

function renderRecentAudits(data) {
  const auditsDoneList = document.getElementById('auditsDoneList');
  const auditsDoneFooter = document.getElementById('auditsDoneFooter');
  const auditsReceivedList = document.getElementById('auditsReceivedList');
  const auditsReceivedFooter = document.getElementById('auditsReceivedFooter');

  const auditsDone = Array.isArray(data.auditsDone) ? data.auditsDone : [];
  const auditsReceived = Array.isArray(data.auditsReceived) ? data.auditsReceived : [];

  if (auditsDoneList) {
    const rows = auditsDone
      .filter((t) => t && t.createdAt)
      .slice(0, 6);

    auditsDoneList.innerHTML = rows.length
      ? rows
          .map((t) => {
            const dateText = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '';
            // Use precise formatting here (not coarse stat rounding), otherwise small audits show as 0 kB
            const xpText = formatXP(Number(t.amount) || 0);
            const name = projectFromPath(t.path);
            return `
              <li class="list-item">
                <div>
                  <div class="title">${name}</div>
                  <div class="meta">${dateText}</div>
                </div>
                <div>
                  <span class="status-pill status-pass">Done</span>
                  <div class="meta">XP: ${xpText}</div>
                </div>
              </li>
            `;
          })
          .join('')
      : '<li class="muted">No audits done found</li>';

    if (auditsDoneFooter) auditsDoneFooter.textContent = `Showing latest ${rows.length} audits`;
  }

  if (auditsReceivedList) {
    const rows = auditsReceived
      .filter((t) => t && t.createdAt)
      .slice(0, 6);

    auditsReceivedList.innerHTML = rows.length
      ? rows
          .map((t) => {
            const dateText = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '';
            // Use precise formatting here (not coarse stat rounding), otherwise small audits show as 0 kB
            const xpText = formatXP(Number(t.amount) || 0);
            const name = projectFromPath(t.path);
            return `
              <li class="list-item">
                <div>
                  <div class="title">${name}</div>
                  <div class="meta">${dateText}</div>
                </div>
                <div>
                  <span class="status-pill status-fail">Received</span>
                  <div class="meta">XP: ${xpText}</div>
                </div>
              </li>
            `;
          })
          .join('')
      : '<li class="muted">No audits received found</li>';

    if (auditsReceivedFooter) auditsReceivedFooter.textContent = `Showing latest ${rows.length} audits`;
  }
}
