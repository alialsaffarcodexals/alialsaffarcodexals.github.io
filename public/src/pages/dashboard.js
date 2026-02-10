import Toast from '../components/toast/toast.js';
import { getGlobalLoader } from '../components/loading/loading.js';
import { requireAuth, logout } from '../features/auth/session.js';
import { fetchProfileData } from '../services/graphql/profile.service.js';
import { fetchObjectsByIds } from '../services/graphql/objects.service.js';
import { renderProfilePage } from '../features/profile/renderProfile.js';
import { renderUnifiedActivity } from '../features/activity/unifiedActivity.js';
import { initTransactionsTable } from '../features/transactions/transactionsTable.js';
import { initProjectsTable } from '../features/projects/projectsTable.js';
import { projectFromPath } from '../utils/path.js';

const DATA_TTL_MS = 90 * 1000;
const OBJECTS_TTL_MS = 5 * 60 * 1000;

export function initDashboardPages() {
  setupTopbarMenu();

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    new Toast().success('Logged out successfully!');
    setTimeout(() => logout(), 500);
  });

  const token = requireAuth();
  if (!token) return;

  window.addEventListener('DOMContentLoaded', () => load(token));
}

function setupTopbarMenu() {
  const toggle = document.getElementById('topbarMenuToggle');
  const menu = document.getElementById('topbarMenu');
  const topbar = document.querySelector('.topbar');
  if (!toggle || !menu || !topbar) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const isOpen = () => menu.classList.contains('is-open');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const next = !isOpen();
    menu.classList.toggle('is-open', next);
    toggle.setAttribute('aria-expanded', String(next));
  });

  document.addEventListener('click', (e) => {
    if (!isOpen()) return;
    if (topbar.contains(e.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  menu.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target.closest('a, button') : null;
    if (!target || target.id === 'topbarMenuToggle') return;
    closeMenu();
  });

  const mq = window.matchMedia('(min-width: 769px)');
  const handleBreakpoint = () => {
    if (mq.matches) closeMenu();
  };

  handleBreakpoint();
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', handleBreakpoint);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(handleBreakpoint);
  }
}

async function load(token) {
  const page = detectPageContext();
  const mode = getPageMode(page);
  const cacheNS = tokenCacheNamespace(token);
  const dataKey = `profile-data:${cacheNS}:${mode}`;
  const objectMapKey = `object-map:${cacheNS}`;
  const hasFetchedBefore = Boolean(sessionStorage.getItem(dataKey));

  const loader = getGlobalLoader('Loading your dashboard...');
  const shouldShowLoader = !hasFetchedBefore;
  if (shouldShowLoader) loader.show();

  let latestData = null;
  let latestObjectMap = {};

  try {
    // Cache-first for all pages. For interactive pages (transactions/projects),
    // if cache exists we render it and skip network to avoid duplicate bindings.
    const isInteractivePage = page.needsTransactions || page.needsProjects;
    const canRenderCached = true;
    const cachedData = readSessionCache(dataKey, DATA_TTL_MS);
    if (canRenderCached && cachedData) {
      latestData = cachedData;
      latestObjectMap = await getObjectMapIfNeeded(cachedData, token, page, objectMapKey);
      renderForPage(cachedData, latestObjectMap, page);
      if (isInteractivePage) return;
    }

    const freshData = await fetchProfileData(token, {
      mode,
      deferOptional: true,
      onOptionalData: (patch) => {
        if (!patch || !latestData) return;
        latestData = { ...latestData, ...patch };
        writeSessionCache(dataKey, latestData);
        if (page.needsProfile) renderProfilePage(latestData, latestObjectMap);
      },
    });

    latestData = freshData;
    writeSessionCache(dataKey, freshData);

    latestObjectMap = await getObjectMapIfNeeded(freshData, token, page, objectMapKey);
    renderForPage(freshData, latestObjectMap, page);
  } catch (err) {
    console.error('Error loading profile:', err);
    new Toast().error(err.message || 'Failed to load data');
  } finally {
    if (shouldShowLoader) loader.hide();
  }
}

function detectPageContext() {
  return {
    needsProfile:
      Boolean(document.getElementById('userInfo')) ||
      Boolean(document.getElementById('xpChart')) ||
      Boolean(document.getElementById('auditsChart')) ||
      Boolean(document.getElementById('xpByProjectChart')),
    needsActivity: Boolean(document.getElementById('unifiedActivityList')),
    needsTransactions: Boolean(document.getElementById('transactionsBody')),
    needsProjects: Boolean(document.getElementById('projectsBody')),
    // Object map is primarily needed for accurate total-XP filtering and project table metadata.
    needsObjectMap: Boolean(document.getElementById('totalXP')) || Boolean(document.getElementById('projectsBody')),
  };
}

function getPageMode(page) {
  if (page.needsTransactions) return 'transactions';
  if (page.needsProjects) return 'projects';
  return 'full';
}

function renderForPage(data, objectMap, page) {
  if (page.needsProfile) renderProfilePage(data, objectMap);
  if (page.needsActivity) renderUnifiedActivity(data);
  if (page.needsTransactions) initTransactionsTable(data);
  if (page.needsProjects) initProjectsTable(buildProjects(data, objectMap));
}

async function getObjectMapIfNeeded(data, token, page, cacheKey) {
  if (!page.needsObjectMap) return {};

  const ids = collectObjectIds(data);
  if (!ids.length) return {};

  const cachedMap = readSessionCache(cacheKey, OBJECTS_TTL_MS);
  if (cachedMap && Object.keys(cachedMap).length) return cachedMap;

  const objectMap = await fetchObjectsByIds(ids, token);
  if (objectMap && Object.keys(objectMap).length) writeSessionCache(cacheKey, objectMap);
  return objectMap || {};
}

function collectObjectIds(data) {
  const resultList = Array.isArray(data?.results) ? data.results : [];
  const progressList = Array.isArray(data?.progress) ? data.progress : [];
  const txList = Array.isArray(data?.transactions) ? data.transactions : [];

  const allObjectIds = [
    ...resultList.map((r) => r?.objectId),
    ...progressList.map((p) => p?.objectId),
    ...txList.map((t) => t?.objectId),
  ].filter(Boolean);

  return Array.from(new Set(allObjectIds));
}

function buildProjects(data, objectMap = {}) {
  const resultList = Array.isArray(data?.results) ? data.results : [];
  const progressList = Array.isArray(data?.progress) ? data.progress : [];

  // Merge results + progress so "Projects" page shows in-progress items too.
  const byKey = new Map();
  const upsert = (key, patch) => {
    const curr = byKey.get(key) || {};
    byKey.set(key, { ...curr, ...patch });
  };

  // Results (finished): keep first row because list is ordered newest-first.
  for (const r of resultList) {
    const key = String(r?.objectId ?? r?.path ?? Math.random());
    if (byKey.has(key)) continue;

    const obj = objectMap[r.objectId] || {};
    const gradeNum = Number(r.grade);
    const hasGrade = Number.isFinite(gradeNum);

    const isAdminSelection = String(r.type || '').toLowerCase() === 'admin_selection';
    const passThreshold = isAdminSelection ? 1 : 0;

    upsert(key, {
      name: obj.name || projectFromPath(r.path),
      type: obj.type || r.type || '-',
      objectId: r.objectId || '-',
      result: hasGrade ? (gradeNum >= passThreshold ? 'Pass' : 'Fail') : '-',
      createdAt: r.createdAt,
    });
  }

  for (const p of progressList) {
    const key = String(p?.objectId ?? p?.path ?? Math.random());
    const obj = objectMap[p.objectId] || {};
    const gradeVal = typeof p?.grade === 'number' ? p.grade : null;

    upsert(key, {
      name: obj.name || projectFromPath(p.path),
      type: obj.type || '-',
      objectId: p.objectId || '-',
      result:
        byKey.get(key)?.result && byKey.get(key)?.result !== '-'
          ? byKey.get(key).result
          : gradeVal === null
            ? 'In progress'
            : gradeVal > 0
              ? 'Pass'
              : 'Fail',
      createdAt: p.updatedAt || p.createdAt,
    });
  }

  return Array.from(byKey.values())
    .filter((p) => p && p.name)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function tokenCacheNamespace(token) {
  if (!token || typeof token !== 'string') return 'anon';
  return token.slice(-24);
}

function readSessionCache(key, ttlMs) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts > ttlMs) return null;

    return parsed.value ?? null;
  } catch {
    return null;
  }
}

function writeSessionCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), value }));
  } catch {
    // Best-effort cache only.
  }
}
