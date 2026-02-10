/**
 * Alternative XP totals query.
 *
 * Some Reboot schemas expose a `user { xps(...) }` relationship which matches the platform total XP
 * more closely than summing `transaction(type: "xp")`.
 *
 * We run this query best-effort (try/catch) and use it only if it succeeds.
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
