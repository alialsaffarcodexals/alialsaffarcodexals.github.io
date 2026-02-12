/**
 * Query-with-arguments example.
 * Fetch object metadata for a list of objectIds.
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
