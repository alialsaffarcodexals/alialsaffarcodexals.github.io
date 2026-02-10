# GraphQL Profile Project – Requirements

## Overview
Build a personal profile web app using the Reboot01 GraphQL API. The app must authenticate a user, query their data, and display it in a clean UI with SVG-based statistics.

## Mandatory Objectives
- Learn and use GraphQL by querying your own data.
- Build a **profile page** populated from the GraphQL API.
- Implement a **login page** to obtain a JWT for API access.
- Display **three pieces of user information** (you choose which).
- Include a **statistics section** with **at least two SVG graphs**.
- Host the project online (GitHub Pages, Netlify, etc.).

## API Endpoints
- **Signin (JWT):** `https://learn.reboot01.com/api/auth/signin`
- **GraphQL:** `https://learn.reboot01.com/api/graphql-engine/v1/graphql`

## Authentication Requirements
- Login must accept:
  - `username:password`
  - `email:password`
- Use **Basic Auth** with base64 encoding to obtain JWT.
- Show an appropriate error for invalid credentials.
- Must provide **logout**.
- GraphQL requests must use **Bearer <JWT>**.

## Required GraphQL Query Types
You must use all three types:
1. **Normal query**
   ```graphql
   { user { id login } }
   ```
2. **Nested query**
   ```graphql
   { result { id user { id login } } }
   ```
3. **Query with arguments**
   ```graphql
   { object(where: { id: { _eq: 3323 }}) { name type } }
   ```

## Profile Page Requirements
- Display **at least 3 user data sections**, e.g.:
  - Basic user info (login, id)
  - XP amount
  - Grades
  - Audit ratio
  - Skills
- UI design is up to you, but must follow good UI/UX practices.

## Statistics Section Requirements
- Must be a **separate section** on the profile page.
- **At least 2 different graphs** created with **SVG**.
- Graphs can be static or interactive/animated.
- Suggested graph ideas:
  - XP over time
  - XP by project
  - Audit ratio
  - Pass/Fail ratio
  - Piscine stats
  - Attempts per exercise

## Helpful Tables (GraphQL)
- `user` → id, login
- `transaction` → XP + audit info
- `progress` → grades + progress
- `result` → pass/fail per project
- `object` → exercises/projects metadata

## Hosting Requirement
Project must be **deployed online** and accessible via a public URL.
