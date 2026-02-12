/**
 * profile.service.js
 * Profile data service with schema fallbacks and optional background queries.
 */
import { gqlRequest } from './graphql.client.js';
import { PROFILE_QUERY, PROFILE_QUERY_FALLBACK } from './queries/profile.query.js';
import { PROFILE_QUERY_LEGACY, PROFILE_QUERY_LEGACY_FALLBACK } from './queries/profile.query.legacy.js';
import { TRANSACTIONS_PAGE_QUERY, PROJECTS_PAGE_QUERY } from './queries/dashboard.query.js';
import { NESTED_REQUIREMENT_QUERY } from './queries/compliance.query.js';
import { USER_XPS_TOTAL_QUERY } from './queries/xpsTotals.query.js';

// fetchProfileData: Loads profile-related GraphQL data, optionally deferring non-critical queries.
export async function fetchProfileData(
  token,
  { mode = 'full', deferOptional = false, onOptionalData = null } = {}
) {
  if (mode === 'transactions') return gqlRequest(TRANSACTIONS_PAGE_QUERY, {}, token);
  if (mode === 'projects') return gqlRequest(PROJECTS_PAGE_QUERY, {}, token);

  const data = await fetchProfileCore(token);

  const runOptional = () => runOptionalQueries(token, data, onOptionalData);
  if (deferOptional) {
    // Run optional calls in background so first render is faster.
    runOptional();
  } else {
    await runOptional();
  }

  return data;
}

// fetchProfileCore: Fetches core profile data using fallback queries for schema differences.
async function fetchProfileCore(token) {
  // First try the query that includes transaction.objectId.
  try {
    return await gqlRequest(PROFILE_QUERY, {}, token);
  } catch (e) {
    const msg = (e && e.message) ? e.message : '';

    // Some schemas do not have user.createdAt.
    if (msg.toLowerCase().includes('createdat') && msg.toLowerCase().includes('not found')) {
      try {
        return await gqlRequest(PROFILE_QUERY_FALLBACK, {}, token);
      } catch (e2) {
        // If fallback still fails, try legacy query next.
      }
    }

    // Some schemas also do not expose transaction.objectId.
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

// runOptionalQueries: Runs non-blocking optional queries and merges successful results.
async function runOptionalQueries(token, data, onOptionalData) {
  const tasks = [];

  // Run nested query when possible.
  // If it fails, we ignore it and keep app working.
  tasks.push(
    gqlRequest(NESTED_REQUIREMENT_QUERY, {}, token).catch(() => null)
  );

  // Some accounts expose user.xps(...). If yes, it can match Reboot total XP better.
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
