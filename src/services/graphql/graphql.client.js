/**
 * graphql.client.js
 * Lightweight GraphQL HTTP client with auth header support and normalized error handling.
 */
import { GRAPHQL_URL } from '../reboot01/endpoints.js';

/**
 * Small helper to send GraphQL requests.
 * Sends query + variables and returns data field.
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
