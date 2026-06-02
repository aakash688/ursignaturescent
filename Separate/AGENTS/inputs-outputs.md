# Pipeline inputs and outputs reference

Paths are relative to **repo root** (`ursignature/`). When an agent runs in Cursor, the workspace root is typically `ursignature`, so e.g. `Separate/AGENTS/artifacts/api-spec.json` is valid.

---

## Stage 1 — Analyzer

| Type | Path | Description |
|------|------|-------------|
| Input | `src/` | Monolith app (API + UI routes). |
| Input | `.env.example`, `wrangler.jsonc`, `package.json` | Config root. |
| Output | `Separate/AGENTS/artifacts/api-spec.json` | API routes, methods, auth, schemas. |
| Output | `Separate/AGENTS/artifacts/ui-spec.json` | Pages, layouts, apiCalls. |
| Output | `Separate/AGENTS/artifacts/env-schema.json` | Workers + Pages env vars. |
| Output | `Separate/AGENTS/artifacts/contracts.json` | API contracts for tests. |

---

## Stage 2 — Workers Creator

| Type | Path | Description |
|------|------|-------------|
| Input | `Separate/AGENTS/artifacts/api-spec.json` | Route definitions. |
| Input | `Separate/AGENTS/artifacts/contracts.json` | Request/response contracts. |
| Input | `Separate/AGENTS/artifacts/env-schema.json` | Env for wrangler. |
| Output | `Separate/workers/` | Full Workers project (wrangler.toml, src/, package.json). |

---

## Stage 3 — Pages Creator

| Type | Path | Description |
|------|------|-------------|
| Input | `Separate/AGENTS/artifacts/ui-spec.json` | Page list and API calls. |
| Input | `Separate/AGENTS/artifacts/contracts.json` | Types and API shape. |
| Output | `Separate/pages/` | Full Pages project (Vite/React, dist/, package.json). |

---

## Stage 4 — Tester

| Type | Path | Description |
|------|------|-------------|
| Input | `Separate/workers/` | Worker source. |
| Input | `Separate/pages/` | Pages source. |
| Input | `Separate/AGENTS/artifacts/contracts.json` | Contract tests. |
| Output | `Separate/AGENTS/artifacts/test-report.json` | Build + contract results. |

---

## Stage 5 — Verifier

| Type | Path | Description |
|------|------|-------------|
| Input | `Separate/workers/`, `Separate/pages/` | Projects. |
| Input | `Separate/AGENTS/artifacts/contracts.json` | Reference. |
| Input | `Separate/AGENTS/artifacts/test-report.json` | Test results. |
| Output | `Separate/AGENTS/artifacts/verification-report.json` | readyToDeploy + checks. |

---

## Stage 6 — Deployer

| Type | Path | Description |
|------|------|-------------|
| Input | `Separate/workers/`, `Separate/pages/` | Projects. |
| Input | `Separate/AGENTS/artifacts/verification-report.json` | Must have readyToDeploy true. |
| Output | Live Workers URL | From wrangler deploy. |
| Output | Live Pages URL | From wrangler pages deploy. |
| Output (optional) | `Separate/AGENTS/artifacts/deploy-result.json` | URLs + timestamp. |
