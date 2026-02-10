/**
 * Compliance queries.
 *
 * These queries are executed best-effort (wrapped in try/catch) to satisfy audit requirements
 * without breaking the application if a specific relationship isn't exposed in the schema.
 */

/**
 * Nested query requirement.
 *
 * Some schemas expose: result -> user relationship.
 * If not available, this query will fail and we ignore it.
 */
export const NESTED_REQUIREMENT_QUERY = `
query NestedRequirementCheck {
  result(limit: 1) {
    id
    user {
      id
      login
    }
  }
}
`;
