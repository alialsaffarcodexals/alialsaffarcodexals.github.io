/**
 * Optional query for XP totals.
 * On some accounts this matches platform total better than summing transactions.
 */
export const USER_XPS_TOTAL_QUERY = `
query UserXpsTotal {
  user {
    login
    xps(
      where: {
        _or: [
          { originEventId: { _eq: 763 } }
          {
            path: {
              _like: "/bahrain/bh-module/piscine-%"
              _nlike: "/bahrain/bh-module/piscine-%/%"
            }
          }
        ]
      }
    ) {
      amount
    }
  }
}
`;
