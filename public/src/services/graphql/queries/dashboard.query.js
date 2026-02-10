/**
 * Lightweight page-specific queries to avoid fetching the full profile payload
 * when only one table is needed.
 */

export const TRANSACTIONS_PAGE_QUERY = `
query TransactionsPageData {
  transactions: transaction(
    where: { type: { _eq: "xp" } }
    order_by: { createdAt: desc }
    limit: 2000
  ) {
    amount
    createdAt
    path
    type
    objectId
  }
}
`;

export const PROJECTS_PAGE_QUERY = `
query ProjectsPageData {
  results: result(order_by: { createdAt: desc }, limit: 2000) {
    id
    objectId
    grade
    type
    path
    createdAt
  }
  progress: progress(order_by: { updatedAt: desc }, limit: 50) {
    objectId
    grade
    createdAt
    updatedAt
    path
  }
}
`;

