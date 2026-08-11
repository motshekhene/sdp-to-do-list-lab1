# Third-Party Code

- **next** — React framework and API routes for the frontend and backend.
- **react / react-dom** — UI library Next.js renders with.
- **sqlite3** — Local SQLite driver, chosen for local-first persistence.
- **jest** — Test runner for the test suite.
- **next-test-api-route-handler** — Simulates HTTP requests against Next.js API routes in tests, without a running server.
- **tailwindcss / @tailwindcss/postcss** — Installed for utility-first styling via PostCSS; not currently used in components, which use CSS Modules instead.
- **zod / zod-validation-error** — Installed for schema validation; not currently wired into any route.
- **express / body-parser** — Installed early on for a possible custom server; not used, since Next.js API routes cover all backend needs.
- **supertest** — Installed as an alternative HTTP-testing library; not used, since `next-test-api-route-handler` covers testing needs instead.