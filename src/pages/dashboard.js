/**
 * dashboard.js
 * Dashboard page orchestrator for auth checks, caching, data fetch, and rendering.
 */
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
import { tokenCacheNamespace } from '../services/cache/namespace.js';
import { profileDataCacheKey, objectMapCacheKey } from '../services/cache/keys.js';
import { readSessionCache, writeSessionCache } from '../services/cache/sessionStorageCache.js';

const DATA_TTL_MS = 90 * 1000;
const OBJECTS_TTL_MS = 5 * 60 * 1000;

// initDashboardPages: Wires dashboard global events and starts data loading on DOM ready.
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

// setupTopbarMenu: Initializes responsive topbar menu open/close behavior.
function setupTopbarMenu() {
  const toggle = document.getElementById('topbarMenuToggle');
  const menu = document.getElementById('topbarMenu');
  const topbar = document.querySelector('.topbar');
  if (!toggle || !menu || !topbar) return;

  // closeMenu: Closes the mobile menu and resets ARIA expanded state.
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
  // handleBreakpoint: Auto-closes the mobile menu when switching to desktop breakpoint.
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

// load: Loads data (cache-first), fetches fresh data, then renders page sections.
async function load(token) {
  const page = detectPageContext();
  const mode = getPageMode(page);
  const cacheNS = tokenCacheNamespace(token);
  const dataKey = profileDataCacheKey(cacheNS, mode);
  const objectMapKey = objectMapCacheKey(cacheNS);
  const hasFetchedBefore = Boolean(sessionStorage.getItem(dataKey));

  const loader = getGlobalLoader('Loading your dashboard...');
  const shouldShowLoader = !hasFetchedBefore;
  if (shouldShowLoader) loader.show();

  let latestData = null;
  let latestObjectMap = {};

  try {
    // Try cache first on every page.
    // For interactive tables, cached render is enough for this load.
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

// detectPageContext: Detects which widgets are present so only needed data is loaded/rendered.
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
    // Object map helps with better XP filtering and project info.
    needsObjectMap: Boolean(document.getElementById('totalXP')) || Boolean(document.getElementById('projectsBody')),
  };
}

// getPageMode: Selects a minimal query mode based on current page needs.
function getPageMode(page) {
  if (page.needsTransactions) return 'transactions';
  if (page.needsProjects) return 'projects';
  return 'full';
}

// renderForPage: Dispatches rendering to profile/activity/transactions/projects sections.
function renderForPage(data, objectMap, page) {
  if (page.needsProfile) renderProfilePage(data, objectMap);
  if (page.needsActivity) renderUnifiedActivity(data);
  if (page.needsTransactions) initTransactionsTable(data);
  if (page.needsProjects) initProjectsTable(buildProjects(data, objectMap));
}

// getObjectMapIfNeeded: Fetches or returns cached object metadata when current page requires it.
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

// collectObjectIds: Collects unique object IDs from results, progress, and transactions.
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

// buildProjects: Merges result and progress records into normalized project rows.
function buildProjects(data, objectMap = {}) {
  const resultList = Array.isArray(data?.results) ? data.results : [];
  const progressList = Array.isArray(data?.progress) ? data.progress : [];

  // Merge results + progress so projects page can show both finished and in-progress.
  const byKey = new Map();
  const upsert = (key, patch) => {
    const curr = byKey.get(key) || {};
    byKey.set(key, { ...curr, ...patch });
  };

  // Keep first result row because data is already newest-first.
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
