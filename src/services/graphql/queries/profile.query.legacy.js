// Legacy profile queries when transaction.objectId is missing.

export const PROFILE_QUERY_LEGACY = `
query ProfileDataLegacy {
  user {
    id
    login
    createdAt
    email
    firstName
    lastName
    campus
    auditRatio
    avatarUrl
    discordLogin
    githubId
  }
  levels: transaction(where: { type: { _eq: "level" } }, order_by: { createdAt: desc }, limit: 1) {
    amount
  }
  transactions: transaction(where: { type: { _eq: "xp" } }, order_by: { createdAt: desc }, limit: 400) {
    amount
    createdAt
    path
    type
  }
  skills: transaction(where: { type: { _like: "skill_%" } }, order_by: { amount: desc }) {
    type
    amount
    path
  }
  results: result(order_by: { createdAt: desc }, limit: 200) {
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

export const PROFILE_QUERY_LEGACY_FALLBACK = `
query ProfileDataLegacyFallback {
  user {
    id
    login
    email
    firstName
    lastName
    campus
    auditRatio
    avatarUrl
    discordLogin
    githubId
  }
  levels: transaction(where: { type: { _eq: "level" } }, order_by: { createdAt: desc }, limit: 1) {
    amount
  }
  transactions: transaction(where: { type: { _eq: "xp" } }, order_by: { createdAt: desc }, limit: 400) {
    amount
    createdAt
    path
    type
  }
  skills: transaction(where: { type: { _like: "skill_%" } }, order_by: { amount: desc }) {
    type
    amount
    path
  }
  results: result(order_by: { createdAt: desc }, limit: 200) {
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
