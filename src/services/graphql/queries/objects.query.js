/**
 * Query with arguments requirement.
 *
 * Fetch object metadata for a set of objectIds found in transactions/results.
 * Used to categorize XP by object type (project/exam/exercise) and show nicer names.
 */
export const OBJECTS_BY_IDS_QUERY = `
query ObjectsByIds($ids: [Int!]) {
  object(where: { id: { _in: $ids } }) {
    id
    name
    type
  }
}
`;
