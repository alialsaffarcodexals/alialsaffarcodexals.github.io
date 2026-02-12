/**
 * Main profile query we try first.
 * Includes most data needed for dashboard pages.
 */

// Try this first. If schema is missing some fields, fallback query is used.
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

  # Nested query example.
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

  # Audits are inferred from transaction types.
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

  # Top 10 XP projects (path filter).
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

  # Skills: keep top value per skill type.
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

  # Raw results for tables/history.
  results: result(order_by: { createdAt: desc }, limit: 200) {
    id
    objectId
    grade
    type
    path
    createdAt
  }

  # Pass/fail projects using path-based filter.
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

  # Nested query example.
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

  # Audits are inferred from transaction types.
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

  # Top 10 XP projects (path filter).
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

  # Skills: keep top value per skill type.
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

  # Raw results for tables/history.
  results: result(order_by: { createdAt: desc }, limit: 200) {
    id
    objectId
    grade
    type
    path
    createdAt
  }

  # Pass/fail projects using path-based filter.
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
