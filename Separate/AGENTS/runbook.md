# Pipeline Runbook — URsignature Separate (Workers + Pages)

Step-by-step commands and troubleshooting for the agent pipeline. Run from repo root: `c:\Users\USER\Desktop\website\ursignature`.

---

## One-time setup

1. **Node:** Node 20+ and npm (or pnpm).
2. **Wrangler:** From repo root or globally:
   ```bash
   npm i -g wrangler
   wrangler login
   ```
   Or use project-local: `cd Separate/workers && npx wrangler login`.
3. **Artifacts directory:** Create so agents can write outputs:
   ```powershell
   New-Item -ItemType Directory -Force -Path "Separate\AGENTS\artifacts"
   ```
4. **Cloudflare:** Note your Account ID (Dashboard → Workers & Pages → overview). For deploy, you need either:
   - `wrangler login`, or
   - `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in env.

---

## Running the pipeline (Cursor Agent mode)

Execute each agent in order. In Cursor, open the agent file and run the agent (e.g. Composer / Agent mode with the file as context).

| Step | Agent file | Action |
|------|------------|--------|
| 0 | `00-PIPELINE-OVERVIEW.md` | Read for context; no execution. |
| 1 | `01-AGENT-ANALYZER.md` | Run agent. Produces `Separate/AGENTS/artifacts/*.json`. |
| 2 | `02-AGENT-WORKERS-CREATOR.md` | Run agent. Produces `Separate/workers/`. |
| 3 | `03-AGENT-PAGES-CREATOR.md` | Run agent. Produces `Separate/pages/`. |
| 4 | `04-AGENT-TESTER.md` | Run agent. Produces `artifacts/test-report.json`. |
| 5 | `05-AGENT-VERIFIER.md` | Run agent. Produces `artifacts/verification-report.json`. |
| 6 | `06-AGENT-DEPLOYER.md` | Run agent only if verification has `readyToDeploy: true`. Deploys Workers + Pages. |

---

## Manual commands (for verification / local runs)

### After Analyzer (1)

- Ensure these exist:
  - `Separate/AGENTS/artifacts/api-spec.json`
  - `Separate/AGENTS/artifacts/ui-spec.json`
  - `Separate/AGENTS/artifacts/env-schema.json`
  - `Separate/AGENTS/artifacts/contracts.json`

### After Workers Creator (2)

```powershell
cd Separate\workers
npm install
npm run build
npx wrangler dev
```

- In another terminal, try: `curl http://localhost:8787/api/settings/public` (or the path from api-spec).

### After Pages Creator (3)

```powershell
cd Separate\pages
npm install
$env:VITE_WORKERS_API_URL="http://localhost:8787"
npm run build
```

- Serve `dist/` (e.g. `npx serve dist`) and open the app; it should call the local Worker.

### After Tester (4)

- Open `Separate/AGENTS/artifacts/test-report.json`. Check `overallPassed` and `workers.contract.results`.

### After Verifier (5)

- Open `Separate/AGENTS/artifacts/verification-report.json`. If `readyToDeploy` is false, fix the failing checks (build or contract tests) and re-run from Tester or Creators as needed.

### Deploy (6)

- Set Worker secrets first (from repo root or Separate/workers):
  ```powershell
  cd Separate\workers
  npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
  ```
- Then run the Deployer agent, or manually:
  ```powershell
  cd Separate\workers
  npx wrangler deploy

  cd ..\pages
  npm run build
  npx wrangler pages deploy dist --project-name=ursignature-ui
  ```
- In Cloudflare Pages dashboard, set env `VITE_WORKERS_API_URL` to the Worker URL and trigger a new build if the app uses it at build time.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| Artifacts folder missing | Create `Separate/AGENTS/artifacts/` and re-run Analyzer. |
| api-spec.json empty or wrong | Re-run Analyzer; ensure monolith `src/app/api` is present. |
| Workers build fails | Fix TypeScript/wrangler in Separate/workers; re-run Workers Creator. |
| Pages build fails | Fix deps or env in Separate/pages; re-run Pages Creator. |
| Contract tests fail | Fix Worker route or auth; re-run Tester. Ensure Worker dev server runs during contract tests. |
| readyToDeploy false | Fix all Verifier checks (see verification-report.json messages). |
| wrangler deploy fails | Check wrangler login or CLOUDFLARE_API_TOKEN; set Worker secrets. |
| Pages deploy fails | Check `wrangler pages deploy` output; ensure project exists or create via dashboard. |

---

## Artifact paths reference

All paths relative to repo root `ursignature/`:

- `Separate/AGENTS/artifacts/api-spec.json`
- `Separate/AGENTS/artifacts/ui-spec.json`
- `Separate/AGENTS/artifacts/env-schema.json`
- `Separate/AGENTS/artifacts/contracts.json`
- `Separate/AGENTS/artifacts/test-report.json`
- `Separate/AGENTS/artifacts/verification-report.json`
- `Separate/AGENTS/artifacts/deploy-result.json` (optional, from Deployer)
- `Separate/workers/` — Workers project
- `Separate/pages/` — Pages project
