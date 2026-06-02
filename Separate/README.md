# URsignature — Separate Deployment (Workers API + Pages UI)

This folder contains the **split architecture** for URsignature:

| Target | Product | Contents |
|--------|---------|----------|
| **APIs** | **Cloudflare Workers** | All REST/API routes as standalone Workers. Deploy with `wrangler deploy` from `workers/`. |
| **UI** | **Cloudflare Pages** | Storefront + Admin UI as static/SPA. Deploy with `wrangler pages deploy` (or Git integration) from `pages/`. |

The main repo (`../`) is the current **monolith** (Next.js on OpenNext → single Worker). This `Separate/` layout is for a **clean split** so APIs and UI can be versioned and deployed independently.

---

## Folder layout

```
Separate/
├── README.md                 # This file
├── AGENTS/                   # Agentic pipeline (run in order)
│   ├── 00-PIPELINE-OVERVIEW.md
│   ├── 01-AGENT-ANALYZER.md
│   ├── 02-AGENT-WORKERS-CREATOR.md
│   ├── 03-AGENT-PAGES-CREATOR.md
│   ├── 04-AGENT-TESTER.md
│   ├── 05-AGENT-VERIFIER.md
│   ├── 06-AGENT-DEPLOYER.md
│   ├── pipeline-manifest.json
│   └── runbook.md
├── workers/                  # Cloudflare Workers (API)
│   └── (created by pipeline)
└── pages/                    # Cloudflare Pages (UI)
    └── (created by pipeline)
```

---

## Agent pipeline (high level)

1. **Analyzer** — Reads the monolith (`../src`), outputs API spec + UI spec (contracts, routes, env).
2. **Workers Creator** — Generates `workers/` with Hono or fetch-handlers, one Worker or per-route Workers.
3. **Pages Creator** — Generates `pages/` (e.g. Vite + React or Astro) that call Worker API base URL.
4. **Tester** — Runs unit/integration tests for Workers and Pages.
5. **Verifier** — Checks build, env, and API contracts.
6. **Deployer** — Runs `wrangler deploy` (Workers) and `wrangler pages deploy` (Pages).

Run agents in order via Cursor Agent mode; handoffs use the artifact paths defined in `AGENTS/pipeline-manifest.json`.

---

## Quick start

1. Run the pipeline from `AGENTS/`: start with `00-PIPELINE-OVERVIEW.md`, then execute `01` → `06` in sequence.
2. Ensure `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (or `wrangler login`) are set for deploy steps.
3. After pipeline run: deploy Workers from `workers/`, deploy Pages from `pages/`, then point the UI to the Worker API URL.
