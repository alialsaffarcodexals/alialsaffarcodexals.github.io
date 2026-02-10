/**
 * Main profile query (preferred).
 *
 * Notes:
 * - Uses Hasura-style filtering + ordering.
 * - Includes transaction.objectId (when available) so we can fetch object metadata.
 * - Adds convenience aliases (topProjects, auditsDone, auditsReceived) so the UI can render quickly.
 */

// Try this first (includes user.createdAt). If the API doesn't expose createdAt, fall back.
// Prefer this query: includes transaction.objectId so we can compute XP by object type (project/exam/exercise)
export const PROFILE_QUERY = `
query ProfileData {
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

  # Nested query requirement (result -> user). This is a real nested relationship in the Reboot schema.
  nestedCheck: result(limit: 1, order_by: { createdAt: desc }) {
    id
    user {
      id
      login
    }
  }
  levels: transaction(where: { type: { _eq: "level" } }, order_by: { createdAt: desc }, limit: 1) {
    amount
  }
  transactions: transaction(where: { type: { _eq: "xp" } }, order_by: { createdAt: desc }, limit: 2000) {
    amount
    createdAt
    path
    type
    objectId
  }

  # Audits: inferred from transactions
  auditsDone: transaction(where: { type: { _eq: "up" } }, order_by: { createdAt: desc }, limit: 500) {
    amount
    createdAt
    path
    type
  }
  auditsReceived: transaction(where: { type: { _eq: "down" } }, order_by: { createdAt: desc }, limit: 500) {
    amount
    createdAt
    path
    type
  }

  # Top 10 XP "projects" (best-effort filter by path; excludes exams/exercises/checkpoints/piscine)
  topProjects: transaction(
    where: {
      type: { _eq: "xp" }
      _and: [
        { path: { _nlike: "%exam%" } }
        { path: { _nlike: "%exercise%" } }
        { path: { _nlike: "%checkpoint%" } }
        { path: { _nlike: "%piscine%" } }
      ]
    }
    order_by: { amount: desc }
    limit: 10
  ) {
    amount
    createdAt
    path
  }

  # Skills: Reboot UI shows "percentage" as the MAX value per skill_* (not a distribution).
  # We pick one row per type, preferring the highest amount.
  skills: transaction(
    where: { type: { _like: "skill_%" } }
    distinct_on: [type]
    order_by: [{ type: asc }, { amount: desc }]
  ) {
    type
    amount
    path
    createdAt
  }

  # Raw results (kept for tables/history)
  results: result(order_by: { createdAt: desc }, limit: 200) {
    id
    objectId
    grade
    type
    path
    createdAt
  }

  # Pass/Fail projects (best-effort filter by path)
  passedProjects: result(
    where: {
      grade: { _gt: 0 }
      _and: [
        { path: { _nlike: "%exam%" } }
        { path: { _nlike: "%exercise%" } }
        { path: { _nlike: "%checkpoint%" } }
        { path: { _nlike: "%piscine%" } }
      ]
    }
    order_by: { createdAt: desc }
    limit: 200
  ) {
    path
    grade
    createdAt
    type
  }

  failedProjects: result(
    where: {
      grade: { _eq: 0 }
      _and: [
        { path: { _nlike: "%exam%" } }
        { path: { _nlike: "%exercise%" } }
        { path: { _nlike: "%checkpoint%" } }
        { path: { _nlike: "%piscine%" } }
      ]
    }
    order_by: { createdAt: desc }
    limit: 200
  ) {
    path
    grade
    createdAt
    type
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

export const PROFILE_QUERY_FALLBACK = `
query ProfileDataFallback {
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

  # Nested query requirement (result -> user). This is a real nested relationship in the Reboot schema.
  nestedCheck: result(limit: 1, order_by: { createdAt: desc }) {
    id
    user {
      id
      login
    }
  }
  levels: transaction(where: { type: { _eq: "level" } }, order_by: { createdAt: desc }, limit: 1) {
    amount
  }
  transactions: transaction(where: { type: { _eq: "xp" } }, order_by: { createdAt: desc }, limit: 2000) {
    amount
    createdAt
    path
    type
    objectId
  }

  # Audits: inferred from transactions
  auditsDone: transaction(where: { type: { _eq: "up" } }, order_by: { createdAt: desc }, limit: 500) {
    amount
    createdAt
    path
    type
  }
  auditsReceived: transaction(where: { type: { _eq: "down" } }, order_by: { createdAt: desc }, limit: 500) {
    amount
    createdAt
    path
    type
  }

  # Top 10 XP "projects" (best-effort filter by path; excludes exams/exercises/checkpoints/piscine)
  topProjects: transaction(
    where: {
      type: { _eq: "xp" }
      _and: [
        { path: { _nlike: "%exam%" } }
        { path: { _nlike: "%exercise%" } }
        { path: { _nlike: "%checkpoint%" } }
        { path: { _nlike: "%piscine%" } }
      ]
    }
    order_by: { amount: desc }
    limit: 10
  ) {
    amount
    createdAt
    path
  }

  # Skills: Reboot UI shows "percentage" as the MAX value per skill_* (not a distribution).
  # We pick one row per type, preferring the highest amount.
  skills: transaction(
    where: { type: { _like: "skill_%" } }
    distinct_on: [type]
    order_by: [{ type: asc }, { amount: desc }]
  ) {
    type
    amount
    path
    createdAt
  }

  # Raw results (kept for tables/history)
  results: result(order_by: { createdAt: desc }, limit: 200) {
    id
    objectId
    grade
    type
    path
    createdAt
  }

  # Pass/Fail projects (best-effort filter by path)
  passedProjects: result(
    where: {
      grade: { _gt: 0 }
      _and: [
        { path: { _nlike: "%exam%" } }
        { path: { _nlike: "%exercise%" } }
        { path: { _nlike: "%checkpoint%" } }
        { path: { _nlike: "%piscine%" } }
      ]
    }
    order_by: { createdAt: desc }
    limit: 200
  ) {
    path
    grade
    createdAt
    type
  }

  failedProjects: result(
    where: {
      grade: { _eq: 0 }
      _and: [
        { path: { _nlike: "%exam%" } }
        { path: { _nlike: "%exercise%" } }
        { path: { _nlike: "%checkpoint%" } }
        { path: { _nlike: "%piscine%" } }
      ]
    }
    order_by: { createdAt: desc }
    limit: 200
  ) {
    path
    grade
    createdAt
    type
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
