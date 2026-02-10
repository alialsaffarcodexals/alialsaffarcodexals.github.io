import { GRAPHQL_URL } from '../reboot01/endpoints.js';

/**
 * Minimal GraphQL client.
 *
 * Notes:
 * - Reboot01 uses Hasura. Endpoint expects POST JSON: { query, variables }.
 * - Auth is `Authorization: Bearer <JWT>`.
 * - We surface the first GraphQL error message for readability.
 */
export async function gqlRequest(query, variables = {}, token) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await res.json();
  if (data.errors?.length) {
    throw new Error(data.errors[0].message || 'GraphQL error');
  }
  return data.data;
}
