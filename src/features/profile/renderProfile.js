/**
 * renderProfile.js
 * Populates profile sections and renders all dashboard charts from fetched data.
 */
import { formatXPStat } from '../../utils/format.js';
import { projectFromPath } from '../../utils/path.js';
import { groupSkills } from './skills.js';
import { renderXpChart, renderPassFailChart, renderXpByProjectBarChart } from '../../charts/index.js';

// renderProfilePage: Fills profile cards/sections and renders charts from normalized API data.
export function renderProfilePage(data, objectMap = {}) {
  const userInfoEl = document.getElementById('userInfo');
  const userInitialsEl = document.getElementById('userInitials');
  const userAvatarEl = document.getElementById('userAvatar');
  const avatarCircleEl = document.getElementById('avatarCircle');

  const totalXPEl = document.getElementById('totalXP');
  const skillsList = document.getElementById('skillsList');
  const topSkillEl = document.getElementById('topSkill');
  const passFailRatioEl = document.getElementById('passFailRatio');
  const auditsRatioEl = document.getElementById('auditsRatio');
  const xpOverTimeRatioEl = document.getElementById('xpOverTimeRatio');
  const dailyXPEl = document.getElementById('dailyXP');
  const weeklyXPEl = document.getElementById('weeklyXP');
  const monthlyXPEl = document.getElementById('monthlyXP');
  const xpByProjectRatioEl = document.getElementById('xpByProjectRatio');

  const xpChart = document.getElementById('xpChart');
  const passFailChart = document.getElementById('passFailChart');
  const auditsChart = document.getElementById('auditsChart');
  const xpByProjectChart = document.getElementById('xpByProjectChart');

  const user = data.user?.[0];
  if (user && userInfoEl) {
    if (user?.login && userInitialsEl) {
      userInitialsEl.textContent = user.login.charAt(0).toUpperCase();
    }

    const rows = [];
    // pushRow: Adds a key/value row only when value is present.
    const pushRow = (label, value) => {
      if (value === undefined || value === null || value === '') return;
      rows.push(`<div class=\"kv-row\"><span class=\"label\">${label}</span><strong class=\"value\">${value}</strong></div>`);
    };

    pushRow('Login', user?.login);
    pushRow('User ID', user?.id);

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
    if (fullName) pushRow('Name', fullName);

    pushRow('Email', user?.email);
    pushRow('Campus', user?.campus);
    const levelAmount = Number(data?.levels?.[0]?.amount);
    if (Number.isFinite(levelAmount)) pushRow('Level', levelAmount.toFixed(2));
    if (typeof user?.auditRatio === 'number') pushRow('Audit Ratio', user.auditRatio.toFixed(3));
    if (user?.githubId !== undefined && user?.githubId !== null) pushRow('GitHub ID', user.githubId);
    pushRow('Discord', user?.discordLogin);
    if (user?.createdAt) pushRow('Created', new Date(user.createdAt).toLocaleDateString());

    userInfoEl.innerHTML = rows.join('') || '<div class="kv-row"><span class="label">Info</span><strong class="value">No data</strong></div>';

    if (user?.avatarUrl && userAvatarEl) {
      userAvatarEl.src = user.avatarUrl;
      userAvatarEl.style.display = 'block';
      if (userInitialsEl) userInitialsEl.style.display = 'none';
      if (avatarCircleEl) avatarCircleEl.classList.add('has-image');
    }
  }

  const transactions = Array.isArray(data.transactions) ? data.transactions : [];
  // API can return amount as number or string, so normalize first.
  const validTransactions = transactions
    .map((t) => ({ ...t, amount: Number(t?.amount) }))
    .filter((t) => t && t.createdAt && Number.isFinite(t.amount));

  // Total XP note:
  // Reboot total usually skips exam/exercise XP.
  // If object info exists, filter those out.
  // If not, fallback to sum all XP transactions.
  let totalXP = null;

  if (totalXPEl) {
    const canUseObjectType = validTransactions.some((t) => t?.objectId) && objectMap && Object.keys(objectMap).length > 0;

    const filtered = canUseObjectType
      ? validTransactions.filter((t) => {
          const obj = objectMap[t.objectId];
          const type = String(obj?.type || '').toLowerCase();
          // Keep unknown types, but remove obvious exam/exercise types.
          if (!type) return true;
          if (type.includes('exercise')) return false;
          if (type.includes('exam')) return false;
          return true;
        })
      : validTransactions;

    totalXP = filtered.reduce((sum, t) => sum + t.amount, 0);

    // If user.xps(...) was returned, prefer it for total XP.
    if (Array.isArray(data?.xpsTotal) && data.xpsTotal.length) {
      const xpsTotal = data.xpsTotal
        .map((x) => Number(x?.amount))
        .filter((n) => Number.isFinite(n))
        .reduce((s, n) => s + n, 0);
      if (Number.isFinite(xpsTotal) && xpsTotal > 0) totalXP = xpsTotal;
    }

    totalXPEl.textContent = formatXPStat(totalXP);
  }


  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  if (dailyXPEl || weeklyXPEl || monthlyXPEl) {
    const dailyXP = validTransactions.filter((t) => now - new Date(t.createdAt) < oneDay).reduce((sum, t) => sum + t.amount, 0);
    const weeklyXP = validTransactions.filter((t) => now - new Date(t.createdAt) < oneWeek).reduce((sum, t) => sum + t.amount, 0);
    const monthlyXP = validTransactions.filter((t) => now - new Date(t.createdAt) < oneMonth).reduce((sum, t) => sum + t.amount, 0);

    if (dailyXPEl) dailyXPEl.textContent = formatXPStat(dailyXP);
    if (weeklyXPEl) weeklyXPEl.textContent = formatXPStat(weeklyXP);
    if (monthlyXPEl) monthlyXPEl.textContent = formatXPStat(monthlyXP);
  }

  if (skillsList) {
    const topSkills = groupSkills(data.skills || []);

    if (topSkillEl) {
      topSkillEl.textContent = topSkills.length ? `${topSkills[0].name} (${topSkills[0].pct}%)` : '—';
    }

    skillsList.innerHTML = topSkills.length
      ? topSkills
          .map((s) => `<li class=\"skill-item\"><span class=\"skill-name\">${s.name}</span><span class=\"skill-value\">${s.pct}%</span></li>`)
          .join('')
      : '<li class="muted">No skills found yet</li>';
  }

  if (xpChart && validTransactions.length > 0) {
    const xpPoints = validTransactions
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((t) => ({ x: new Date(t.createdAt).getTime(), y: t.amount }));
    renderXpChart(xpChart, xpPoints);
    if (xpOverTimeRatioEl) xpOverTimeRatioEl.textContent = `Total Transactions: ${validTransactions.length}`;
  }

  // Pass/fail chart for projects.
  if (passFailChart || passFailRatioEl) {
    // Prefer already filtered project lists from query.
    const passedProjects = Array.isArray(data.passedProjects) ? data.passedProjects : [];
    const failedProjects = Array.isArray(data.failedProjects) ? data.failedProjects : [];

    let passCount = passedProjects.length;
    let failCount = failedProjects.length;

    // Fallback to raw results if filtered lists are empty.
    if (!passCount && !failCount) {
      const results = Array.isArray(data.results) ? data.results : [];
      const validResults = results.filter((r) => r && typeof r.grade === 'number');
      passCount = validResults.filter((r) => r.grade > 0).length;
      failCount = validResults.filter((r) => r.grade === 0).length;
    }

    const total = passCount + failCount;
    const passRate = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;

    if (passFailChart) renderPassFailChart(passFailChart, passCount, failCount);
    if (passFailRatioEl) passFailRatioEl.textContent = `Pass Rate: ${passRate}% (${passCount}:${failCount})`;
  }

  // Audits done vs received (from up/down transactions).
  if (auditsChart || auditsRatioEl) {
    const auditsDone = Array.isArray(data.auditsDone) ? data.auditsDone : [];
    const auditsReceived = Array.isArray(data.auditsReceived) ? data.auditsReceived : [];

    const doneCount = auditsDone.length;
    const receivedCount = auditsReceived.length;

    // Use XP amount for ratio, not just item count.
    const doneXP = auditsDone.reduce((s, t) => s + (Number(t?.amount) || 0), 0);
    const receivedXP = auditsReceived.reduce((s, t) => s + (Number(t?.amount) || 0), 0);

    // Ratio = done / received.
    const ratio = receivedXP > 0 ? doneXP / receivedXP : (doneXP > 0 ? Infinity : 0);
    const ratioText = Number.isFinite(ratio) ? ratio.toFixed(2) : '∞';

    if (auditsChart) renderPassFailChart(auditsChart, doneXP, receivedXP);
    if (auditsRatioEl) {
      auditsRatioEl.textContent = `Done: ${doneCount} • Received: ${receivedCount}`;
    }

    // Replace chart center text to show audits ratio.
    const svg = auditsChart?.querySelector('svg');
    const texts = svg ? Array.from(svg.querySelectorAll('text')) : [];

    // Text positions in donut chart:
    // [0] big value, [1] small label, [2] caption line.
    if (texts[0]) texts[0].textContent = ratioText;
    if (texts[1]) texts[1].textContent = 'Ratio';
    if (texts[2]) texts[2].textContent = `Done: ${formatXPStat(doneXP)} | Received: ${formatXPStat(receivedXP)}`;
  }

  if (xpByProjectChart) {
    // Prefer topProjects from API when available.
    const topProjects = Array.isArray(data.topProjects) ? data.topProjects : [];

    if (topProjects.length) {
      const projectPoints = topProjects
        .slice(0, 10)
        .map((t) => ({ x: projectFromPath(t.path), y: Number(t.amount) || 0 }));

      renderXpByProjectBarChart(xpByProjectChart, projectPoints);
      if (xpByProjectRatioEl) xpByProjectRatioEl.textContent = `Projects: ${projectPoints.length}`;
    } else {
      // Fallback: group all XP transactions by project name.
      const xpByProject = {};
      validTransactions.forEach((t) => {
        const project = projectFromPath(t.path);
        xpByProject[project] = (xpByProject[project] || 0) + (t.amount || 0);
      });

      const projectPoints = Object.entries(xpByProject)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([project, amount]) => ({ x: project, y: amount }));

      renderXpByProjectBarChart(xpByProjectChart, projectPoints);
      if (xpByProjectRatioEl) xpByProjectRatioEl.textContent = `Projects: ${Object.keys(xpByProject).length}`;
    }
  }
}
