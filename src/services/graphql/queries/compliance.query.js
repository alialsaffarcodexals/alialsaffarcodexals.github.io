/**
 * Extra queries we run when available.
 * If they fail, UI should still keep working.
 */

/**
 * Nested query example: result -> user.
 * Some schemas may not expose this relation.
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
