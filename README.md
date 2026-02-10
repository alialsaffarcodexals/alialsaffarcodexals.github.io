# GraphQL Profile System (Reboot01)

A no-build (plain HTML/CSS + ES modules) web app that connects to the **Reboot01 GraphQL API** and renders your profile, projects, transactions, and analytics.

## 🌐 Live Demo

**Netlify URL:** https://alsgraphql.netlify.app

## 📁 Project Structure

```
├── public/
│   ├── index.html             # Login page
│   ├── pages/                 # App pages (authenticated)
│   ├── styles/                # Modular CSS entry (main.css)
│   ├── assets/                # Images/icons
│   └── src/                   # ES modules (no build step)
│       ├── main.js            # Frontend entry point
│       ├── pages/             # Page initializers
│       ├── features/          # Feature modules (profile, tx, projects…)
│       ├── services/          # Auth + GraphQL API layer
│       ├── charts/            # Chart modules (split by chart type)
│       └── utils/             # Small shared utilities
├── scripts/
│   └── server.sh              # Local dev server helper
└── README.md
```

## 🚀 Features

- **Authentication**: Basic Auth → JWT (login + logout)
- **Profile**: user info + level + XP stats + skills
- **Projects**: merged view of results + progress
- **Transactions**: XP list with search + XP/date range sliders
- **Activity**: recent projects + recent audits done/received
- **Loading UX**: global activity indicator on first dashboard bootstrap
- **Analytics (SVG)**:
  - XP earned by date (non-cumulative)
  - Audits done vs received (ratio uses XP totals)
  - XP by project (Top 10)
- **Accessible**: ARIA labels for SVG + semantic HTML

## 🛠 Technologies Used

- HTML5
- CSS3 (with animations and modern features)
- JavaScript (ES6 modules)
- SVG for data visualization
- GraphQL API integration
- REST API for authentication

## 📊 GraphQL requirements (audit)

This project includes the mandatory query types:
- **Normal query**: `user { ... }` in `PROFILE_QUERY`
- **Query with arguments**: `object(where: { id: { _in: $ids }})` in `OBJECTS_BY_IDS_QUERY`
- **Nested query** (best-effort): `result { id user { id login } }` in `NESTED_REQUIREMENT_QUERY`

> Note: the nested query is executed opportunistically so it doesn't break the app if the schema doesn't expose `result.user`.

## 🔧 Setup

1. Clone the repository
2. Serve the files using a web server (the application requires serving to handle modules properly)
3. Access the application in your browser

### Local server (port 8000)

Use the included server toggle script:

```bash
./scripts/server.sh        # toggle start/stop
./scripts/server.sh start  # start server
./scripts/server.sh stop   # stop server
./scripts/server.sh status # check status
```

Then open: http://localhost:8000 (serves `./public` by default)

Notes:
- `scripts/server.sh` now validates Python runtime before launch and verifies that the server process actually started.
- If startup fails, it prints the relevant log tail from `public/.server.log`.

## ⚡ Performance & loading behavior

- **Page-specific GraphQL fetch mode**:
  - `full` mode for profile/activity/analytics pages
  - `transactions` mode for transactions page
  - `projects` mode for projects page
- **Session cache (TTL-based)**:
  - profile data cache: 90s
  - object metadata cache: 5 min
  - cache key includes page mode to avoid cross-page payload mismatches
- **Optional queries are deferred** (nested compliance + `user.xps`) so they do not block first render.
- **Loading indicator behavior**:
  - shown on first dashboard bootstrap (no prior fetched cache for that mode/token)
  - hidden on subsequent in-session loads when data is already fetched

## 🧭 Notes on data + formatting

- XP uses base-1000 units: `1000 B = 1 kB`, `1000 kB = 1 MB`.
- We use two formatters:
  - `formatXP()` for precise row values (transactions)
  - `formatXPStat()` for coarse headline stats (to match Reboot UI style)

## 📝 Comment conventions

See `CODE_COMMENTS.md`.

## 📋 Requirements

- Modern web browser supporting JavaScript ES modules
- Internet connection to access Reboot01 API
- Valid Reboot01 account credentials for authentication
