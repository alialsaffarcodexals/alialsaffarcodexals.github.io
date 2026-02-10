# Code Comments & Conventions

This project is intentionally **no-build** (plain HTML/CSS + ES modules). The codebase is organized by feature and keeps comments lightweight and useful.

## Comment style

- Prefer **JSDoc** on exported functions:
  - What it does
  - Inputs/outputs
  - Important assumptions (API quirks)

- Use short **block comments** for:
  - "Why" a decision exists
  - Schema quirks (e.g. `admin_selection` grading)
  - Non-obvious UI behavior

- Avoid commenting the obvious (e.g. `i++`).

## Data conventions

- **XP units** are base-1000:
  - `1000 B = 1 kB`
  - `1000 kB = 1 MB`

- Two XP formatters are used:
  - `formatXP()` → precise formatting (good for transaction rows)
  - `formatXPStat()` → coarse rounding to match Reboot UI (good for headline stats)

## GraphQL conventions

- Keep core queries in: `public/src/services/graphql/queries/`
- Prefer `PROFILE_QUERY` and fall back when schema differs.
- A best-effort nested query exists to satisfy the project audit requirement.

