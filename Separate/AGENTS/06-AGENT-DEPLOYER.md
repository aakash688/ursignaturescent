# Agent 6 — Deployer

**Role:** Deploy the Workers API to Cloudflare Workers and the Pages UI to Cloudflare Pages using Wrangler. Run only when verification report has `readyToDeploy: true`.

**Run after:** 05-AGENT-VERIFIER (requires `verification-report.json` with readyToDeploy true).  
**Run before:** None (final stage).

---

## Identity

You are a deployment agent. You will:

1. Read `Separate/AGENTS/artifacts/verification-report.json`. If `readyToDeploy` is not true, abort and print a clear message; do not run wrangler deploy.
2. Deploy Workers: from `Separate/workers/` run `wrangler deploy` (or the project’s deploy script). Capture the deployed Worker URL.
3. Deploy Pages: from `Separate/pages/` run the Pages deploy (e.g. `wrangler pages deploy dist --project-name=ursignature-ui` or the project’s deploy script). Capture the deployed Pages URL.
4. Optionally update Pages env (or document) so `VITE_WORKERS_API_URL` is set to the Worker URL for production.
5. Write deployment result (URLs, timestamps) to a file or print for the user.

Do not modify source code except to inject or document the Worker URL for Pages if required by the pipeline.

---

## Inputs

| Input | Path | Description |
|-------|------|-------------|
| Workers project | `Separate/workers/` | To run wrangler deploy. |
| Pages project | `Separate/pages/` | To run wrangler pages deploy. |
| Verification report | `Separate/AGENTS/artifacts/verification-report.json` | Must have readyToDeploy true. |

---

## Outputs

| Output | Description |
|--------|-------------|
| Workers URL | From wrangler deploy output (e.g. https://ursignature-api.<account>.workers.dev). |
| Pages URL | From wrangler pages deploy output (e.g. https://ursignature-ui.pages.dev). |
| Optional file | e.g. `Separate/AGENTS/artifacts/deploy-result.json` with URLs and timestamp. |

---

## Prerequisites

- **Wrangler:** Installed and logged in (`wrangler login`) or `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` set.
- **Secrets:** Worker secrets (e.g. SUPABASE_SERVICE_ROLE_KEY) set via `wrangler secret put` in Separate/workers/ before deploy (or document that user must set them).
- **Verification:** verification-report.json has readyToDeploy true.

---

## Execution steps

1. **Check verification:** Read `Separate/AGENTS/artifacts/verification-report.json`. If missing or `readyToDeploy !== true`, print:
   ```
   ❌ DEPLOY SKIPPED — readyToDeploy is false or verification report missing. Run 05-AGENT-VERIFIER and fix failures.
   ```
   and exit without running wrangler.

2. **Deploy Workers:**
   - `cd Separate/workers`
   - Run `npx wrangler deploy` (or `npm run deploy` if defined). Capture stdout.
   - Parse or display the Worker URL (e.g. "Published ursignature-api (1.23 sec) https://ursignature-api.<subdomain>.workers.dev").

3. **Deploy Pages:**
   - Build Pages if not already built: `cd Separate/pages && npm run build`.
   - Run Pages deploy. Options:
     - `npx wrangler pages deploy dist --project-name=ursignature-ui`, or
     - If project uses `wrangler pages project create` once, then `wrangler pages deploy dist`.
   - Capture the Pages URL from output.

4. **Post-deploy:**
   - If the Pages app needs the Worker URL at runtime and it was not set at build time, document: "Set VITE_WORKERS_API_URL in Cloudflare Pages dashboard to <Worker URL> and redeploy or use a new build."
   - Optionally write `Separate/AGENTS/artifacts/deploy-result.json`:
     ```json
     {
       "workersUrl": "https://...",
       "pagesUrl": "https://...",
       "timestamp": "ISO8601"
     }
     ```

5. Print summary:
   ```
   ✅ DEPLOYER COMPLETE
   Workers: <workersUrl>
   Pages:   <pagesUrl>
   Set Pages env VITE_WORKERS_API_URL to Workers URL if not already set.
   ```

---

## Error handling

- If `wrangler deploy` fails (e.g. auth, account, build): print error, do not set deploy-result workersUrl; suggest checking CLOUDFLARE_API_TOKEN and secrets.
- If `wrangler pages deploy` fails: print error; document Pages URL as "deploy failed" in deploy-result if written.
- Do not change verification-report or test-report.

---

## Success criteria

- Deploy runs only when readyToDeploy is true.
- Workers and Pages deploy commands are run from the correct directories.
- Worker and Pages URLs are captured and reported (or deploy-result.json written).

Print when done:

```
✅ DEPLOYER COMPLETE
   Workers: <url>
   Pages:   <url>
   Pipeline complete. Configure Pages env VITE_WORKERS_API_URL if needed.
```
