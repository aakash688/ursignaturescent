# Agent Pipeline Overview — URsignature Separate (Workers + Pages)

**Purpose:** Run a multi-agent pipeline that analyzes the monolith, creates Cloudflare Workers (API) and Cloudflare Pages (UI) in `Separate/`, then tests, verifies, and deploys with Wrangler.

**Execution:** Run each agent in Cursor in **Agent mode**, in order. Each agent consumes outputs from the previous stage (see `pipeline-manifest.json`).

---

## Pipeline stages

| Order | Agent file | Stage | Inputs | Outputs |
|-------|------------|--------|--------|--------|
| 1 | `01-AGENT-ANALYZER.md` | Analyze | Monolith `../src`, root config | `artifacts/api-spec.json`, `ui-spec.json`, `env-schema.json`, `contracts.json` |
| 2 | `02-AGENT-WORKERS-CREATOR.md` | Create (API) | api-spec, contracts, env-schema | `Separate/workers/` |
| 3 | `03-AGENT-PAGES-CREATOR.md` | Create (UI) | ui-spec, contracts, api base URL placeholder | `Separate/pages/` |
| 4 | `04-AGENT-TESTER.md` | Test | workers/, pages/, contracts | `artifacts/test-report.json` |
| 5 | `05-AGENT-VERIFIER.md` | Verify | workers/, pages/, contracts, test-report | `artifacts/verification-report.json` |
| 6 | `06-AGENT-DEPLOYER.md` | Deploy | workers/, pages/, verification-report | Live Workers URL, Pages URL (Wrangler) |

---

## Artifacts (under `AGENTS/artifacts/`)

- **api-spec.json** — List of API routes, methods, request/response shapes, auth requirements. Source: `../src/app/api/**/route.ts`.
- **ui-spec.json** — Pages, components, data dependencies (which API each page calls). Source: `../src/app/(storefront)`, `(admin)`.
- **env-schema.json** — Env vars needed by Workers and Pages (keys, required/optional, where they are used).
- **contracts.json** — API contract (path, method, request body schema, response schema, status codes) for testing and verification.
- **test-report.json** — Test run results (pass/fail, duration, logs).
- **verification-report.json** — Build success, contract checks, env readiness; must pass before deploy.

---

## Handoff rules

1. **Analyzer** must create `AGENTS/artifacts/` and write all four spec files. Paths in manifest are relative to repo root; agent runs from repo root or `Separate/AGENTS/`.
2. **Workers Creator** reads from `artifacts/` and writes to `Separate/workers/`. It must produce a valid `wrangler.toml` (or `wrangler.jsonc`) and deployable Worker code.
3. **Pages Creator** reads from `artifacts/` and writes to `Separate/pages/`. It must use `{{WORKERS_API_URL}}` or an env var for the API base URL so deploy can substitute the real Workers URL.
4. **Tester** runs tests for both `workers/` and `pages/` (e.g. `npm run test` or `wrangler dev` + contract tests). Writes `test-report.json`.
5. **Verifier** ensures Workers and Pages build, and that contract tests passed. Writes `verification-report.json` with `"readyToDeploy": true/false`.
6. **Deployer** runs only if `readyToDeploy === true`. Runs `wrangler deploy` in `workers/`, then `wrangler pages deploy` in `pages/`, and optionally writes final URLs to a file or env.

---

## Prerequisites

- Node 20+, npm (or pnpm).
- Wrangler CLI: `npm i -g wrangler` or use project-local.
- Cloudflare: account ID and API token (or `wrangler login`) for Deployer.
- Monolith: `../src` and `../` config (Next.js, Supabase, R2, etc.) available for Analyzer.

---

## Runbook

See **`runbook.md`** in this folder for step-by-step commands and troubleshooting.
