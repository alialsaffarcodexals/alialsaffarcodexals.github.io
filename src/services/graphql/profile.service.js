import { gqlRequest } from './graphql.client.js';
import { PROFILE_QUERY, PROFILE_QUERY_FALLBACK } from './queries/profile.query.js';
import { PROFILE_QUERY_LEGACY, PROFILE_QUERY_LEGACY_FALLBACK } from './queries/profile.query.legacy.js';
import { TRANSACTIONS_PAGE_QUERY, PROJECTS_PAGE_QUERY } from './queries/dashboard.query.js';
import { NESTED_REQUIREMENT_QUERY } from './queries/compliance.query.js';
import { USER_XPS_TOTAL_QUERY } from './queries/xpsTotals.query.js';

export async function fetchProfileData(
  token,
  { mode = 'full', deferOptional = false, onOptionalData = null } = {}
) {
  if (mode === 'transactions') return gqlRequest(TRANSACTIONS_PAGE_QUERY, {}, token);
  if (mode === 'projects') return gqlRequest(PROJECTS_PAGE_QUERY, {}, token);

  const data = await fetchProfileCore(token);

  const runOptional = () => runOptionalQueries(token, data, onOptionalData);
  if (deferOptional) {
    // fire-and-forget; don't block first paint
    runOptional();
  } else {
    await runOptional();
  }

  return data;
}

async function fetchProfileCore(token) {
  // 1) Prefer query with transaction.objectId
  try {
    return await gqlRequest(PROFILE_QUERY, {}, token);
  } catch (e) {
    const msg = (e && e.message) ? e.message : '';

    // createdAt not exposed on user
    if (msg.toLowerCase().includes('createdat') && msg.toLowerCase().includes('not found')) {
      try {
        return await gqlRequest(PROFILE_QUERY_FALLBACK, {}, token);
      } catch (e2) {
        // fall through to legacy
      }
    }

    // transaction.objectId not exposed (or other schema mismatch)
    try {
      return await gqlRequest(PROFILE_QUERY_LEGACY, {}, token);
    } catch (e3) {
      const msg3 = (e3 && e3.message) ? e3.message : '';
      if (msg3.toLowerCase().includes('createdat') && msg3.toLowerCase().includes('not found')) {
        return await gqlRequest(PROFILE_QUERY_LEGACY_FALLBACK, {}, token);
      }
      throw e3;
    }
  }
}

async function runOptionalQueries(token, data, onOptionalData) {
  const tasks = [];

  // Best-effort: run a nested query to satisfy project requirements.
  // Do NOT block the app if the schema doesn't expose the relationship.
  tasks.push(
    gqlRequest(NESTED_REQUIREMENT_QUERY, {}, token).catch(() => null)
  );

  // Best-effort: some accounts expose `user { xps(...) }` which can match platform Total XP.
  tasks.push(
    gqlRequest(USER_XPS_TOTAL_QUERY, {}, token)
      .then((xpsRes) => {
        const xps = xpsRes?.user?.[0]?.xps;
        if (!Array.isArray(xps)) return;
        data.xpsTotal = xps;
        if (typeof onOptionalData === 'function') onOptionalData({ xpsTotal: xps });
      })
      .catch(() => null)
  );

  await Promise.allSettled(tasks);
}
