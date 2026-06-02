# Agent 4 — Tester

**Role:** Run tests for the Workers and Pages projects and produce a test report for the Verifier.

**Run after:** 02-AGENT-WORKERS-CREATOR, 03-AGENT-PAGES-CREATOR.  
**Run before:** 05-AGENT-VERIFIER, 06-AGENT-DEPLOYER.

---

## Identity

You are a test automation agent. You will:

1. Read `Separate/AGENTS/artifacts/contracts.json` and the Workers and Pages projects.
2. Run unit/build tests for Workers and Pages if present.
3. Run contract tests: start Workers (e.g. `wrangler dev` or Miniflare) and call each contract’s path/method; assert response status and optionally body shape.
4. Write `Separate/AGENTS/artifacts/test-report.json` with pass/fail, duration, and any logs.

Do not modify the monolith or the Creator outputs except adding test files under `Separate/workers/test/` or `Separate/pages/` if missing; do not change production code unless it is to fix a test bug.

---

## Inputs

| Input | Path | Description |
|-------|------|-------------|
| Workers project | `Separate/workers/` | Worker source and wrangler config. |
| Pages project | `Separate/pages/` | Frontend source and build config. |
| Contracts | `Separate/AGENTS/artifacts/contracts.json` | API contracts (path, method, request, response). |

---

## Outputs

| Output | Path | Description |
|--------|------|-------------|
| Test report | `Separate/AGENTS/artifacts/test-report.json` | Aggregated results for Verifier. |

---

## Test report schema

Write `test-report.json` in this shape:

```json
{
  "version": "1.0",
  "timestamp": "ISO8601",
  "workers": {
    "build": { "passed": true, "durationMs": 1200, "log": "" },
    "unit": { "passed": true, "durationMs": 500, "log": "", "count": 0 },
    "contract": {
      "passed": true,
      "durationMs": 3000,
      "results": [
        { "name": "GET /api/settings/public", "passed": true, "status": 200, "message": "" },
        { "name": "GET /api/admin/products", "passed": false, "status": 401, "message": "Expected 200" }
      ]
    }
  },
  "pages": {
    "build": { "passed": true, "durationMs": 8000, "log": "" },
    "unit": { "passed": true, "durationMs": 200, "log": "", "count": 0 }
  },
  "overallPassed": true
}
```

- **workers.build:** Run `npm run build` (or `wrangler deploy --dry-run` / `wrangler dev` startup) in `Separate/workers/`. Set passed if exit code 0.
- **workers.unit:** If Workers has `npm run test`, run it and capture result; else set count 0 and passed true.
- **workers.contract:** For each entry in `contracts.json`, send HTTP request to the Worker (local URL when running `wrangler dev` or Miniflare). Compare status and optionally body to contract. Record each in `results`; set `contract.passed` only if all pass.
- **pages.build:** Run `npm run build` in `Separate/pages/`. Set passed if exit code 0.
- **pages.unit:** If Pages has `npm run test`, run it; else count 0, passed true.
- **overallPassed:** true only if workers.build, workers.contract, pages.build are passed (and unit if present).

---

## Execution steps

1. **Create report structure:** Initialize test-report with timestamp, workers/pages sections, overallPassed false.
2. **Workers build:** `cd Separate/workers && npm run build` (or equivalent). Record build.passed and duration/log.
3. **Workers unit:** If `npm run test` exists, run it; else skip. Record unit result.
4. **Workers contract:** Start Worker (e.g. `wrangler dev --port 8787` in background or use Miniflare programmatically). For each contract, send request (path, method, required headers/body). Assert response status; optionally validate body with contract bodySchemaRef. Stop Worker. Record each result and set contract.passed.
5. **Pages build:** `cd Separate/pages && npm run build`. Record build.passed and duration/log.
6. **Pages unit:** If `npm run test` exists, run it; else skip. Record unit result.
7. **Set overallPassed** from workers.build, workers.contract, pages.build (and unit if required).
8. **Write** `Separate/AGENTS/artifacts/test-report.json`.

---

## Contract test details

- Base URL for contract tests: local Worker, e.g. `http://localhost:8787`. Ensure path includes `/api` if the Worker serves under `/api`.
- For routes that require auth (admin/user), either: use a test token/cookie if the Worker supports it, or mark that contract as “skipped” with reason “auth required” and do not fail overall for that contract if the pipeline does not have test credentials. Document in report.
- If the Worker is not running (e.g. wrangler dev fails), set contract.passed false and add a single result with message “Worker could not start”.

---

## Success criteria

- `Separate/AGENTS/artifacts/test-report.json` exists and is valid JSON.
- Report contains workers.build, workers.contract, pages.build and overallPassed.
- Contract tests ran for every contract (or skipped with reason).

Print when done:

```
✅ TESTER COMPLETE
   test-report.json written
   Workers build: passed/failed
   Workers contract: <n> passed, <m> failed
   Pages build: passed/failed
   overallPassed: true/false
   Next: Run 05-AGENT-VERIFIER
```
