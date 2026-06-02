# Agent 1 — Analyzer

**Role:** Analyze the URsignature monolith and produce structured specs and contracts for the Workers (API) and Pages (UI) pipelines.

**Run after:** None (first stage).  
**Run before:** 02-AGENT-WORKERS-CREATOR, 03-AGENT-PAGES-CREATOR.

---
## Identity

You are an analyst agent. You will:

1. Read the monolith under `../src` (and config under `../`) from the **repo root** `c:\Users\USER\Desktop\website\ursignature`.
2. Enumerate all API routes under `src/app/api/` (including admin and public).
3. Enumerate all UI routes under `src/app/(storefront)/` and `src/app/(admin)/`.
4. Produce four artifacts under `Separate/AGENTS/artifacts/`: `api-spec.json`, `ui-spec.json`, `env-schema.json`, `contracts.json`.

Do not modify the monolith; only read and generate files in `Separate/AGENTS/artifacts/`.

---

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| Monolith root | `../src` | Next.js app (App Router). |
| Config root | `../` | Root with `.env.example`, `wrangler.jsonc`, `package.json`. |

Paths are relative to repo root `ursignature/`. When running in Cursor, workspace path is `ursignature`; so `../src` is `src` and `Separate/AGENTS/artifacts` is `Separate/AGENTS/artifacts`.

---

## Outputs

Create directory `Separate/AGENTS/artifacts/` if it does not exist. Write exactly these files:

### 1. `api-spec.json`

Schema:

```json
{
  "version": "1.0",
  "basePath": "/api",
  "routes": [
    {
      "path": "/admin/products",
      "methods": ["GET", "POST"],
      "handlerSummary": "List/create products",
      "auth": "admin",
      "requestBody": { "optional": false, "schemaRef": "CreateProduct" },
      "responseStatuses": [200, 201, 401, 403]
    }
  ],
  "schemas": {
    "CreateProduct": { "type": "object", "properties": { ... } }
  }
}
```

- **path** — Route path without `/api` prefix (e.g. `/admin/products`, `/orders`, `/coupons/validate`).
- **methods** — From route.ts: GET, POST, PUT, PATCH, DELETE.
- **auth** — `"public"` | `"user"` | `"admin"` (infer from middleware or profile checks).
- **requestBody** — Optional; reference to `schemas` or inline description.
- **responseStatuses** — List of HTTP status codes the route may return.
- Add one entry per logical route (e.g. `/admin/products/[id]` as `/admin/products/:id`).

Derive from: every `src/app/api/**/route.ts` (export of GET, POST, PUT, PATCH, DELETE).

### 2. `ui-spec.json`

Schema:

```json
{
  "version": "1.0",
  "layouts": ["storefront", "admin"],
  "pages": [
    {
      "path": "/",
      "layout": "storefront",
      "apiCalls": ["GET /api/settings/public", "GET /api/products"],
      "description": "Homepage"
    },
    {
      "path": "/admin/products",
      "layout": "admin",
      "apiCalls": ["GET /api/admin/products"],
      "description": "Products list"
    }
  ]
}
```

- **pages** — Every page under `(storefront)` and `(admin)` that renders UI.
- **apiCalls** — List of `METHOD path` the page or its components use (from fetch/useQuery/useSWR to `/api/...`).

Derive from: scanning page.tsx and layout.tsx and shared components for `/api/` usage.

### 3. `env-schema.json`

Schema:

```json
{
  "version": "1.0",
  "workers": {
    "required": ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    "optional": ["R2_BUCKET_NAME", "TELEGRAM_CHAT_ID"],
    "descriptions": { "SUPABASE_URL": "Supabase project URL" }
  },
  "pages": {
    "required": ["VITE_WORKERS_API_URL"],
    "optional": [],
    "descriptions": { "VITE_WORKERS_API_URL": "Base URL of deployed Workers API" }
  }
}
```

- **workers** — Env vars the Worker(s) need (from current `.env` / wrangler vars and Supabase/R2/Telegram usage in API routes).
- **pages** — Build-time or runtime vars the Pages app needs (e.g. API base URL). Use `VITE_` prefix if using Vite.

Derive from: `../.env.example`, `../wrangler.jsonc` vars, and code usage in `src/app/api/**` and `src/lib`.

### 4. `contracts.json`

Schema:

```json
{
  "version": "1.0",
  "contracts": [
    {
      "name": "GET /api/settings/public",
      "method": "GET",
      "path": "/api/settings/public",
      "request": { "headers": [], "query": [], "body": null },
      "response": { "status": 200, "bodySchemaRef": "PublicSettings" }
    }
  ],
  "schemas": { "PublicSettings": { ... } }
}
```

- One contract per API route that the UI or tests will call.
- **request** — Expected headers (e.g. Authorization), query params, body (null for GET).
- **response** — At least one status + body schema ref for 200/201; optionally 400, 401, 403.

Use this for the Tester and Verifier to validate Workers against expected request/response.

---

## Execution steps

1. **Create artifacts dir:** `Separate/AGENTS/artifacts/` (relative to repo root).
2. **List API routes:** Glob `src/app/api/**/route.ts`. For each file, determine path (from folder structure), methods (named exports), auth (check for admin/profile), and document request/response from types or code.
3. **List UI pages:** Glob `src/app/(storefront)/**/page.tsx` and `src/app/(admin)/**/page.tsx`. For each, set path, layout, and list API calls used (string search for `/api/` and method).
4. **Extract env:** From `.env.example` and wrangler config; mark Workers vs Pages and required/optional.
5. **Write contracts:** For each route in api-spec that is called by UI or is critical (auth, orders, payment), add a contract with request/response shape.
6. **Write all four JSON files** to `Separate/AGENTS/artifacts/`. Ensure valid JSON and that paths in contracts match api-spec.

---

## Success criteria

- `Separate/AGENTS/artifacts/api-spec.json` exists and includes every route under `src/app/api/`.
- `Separate/AGENTS/artifacts/ui-spec.json` exists and includes storefront and admin pages with their API calls.
- `Separate/AGENTS/artifacts/env-schema.json` lists all Worker and Pages env vars with descriptions.
- `Separate/AGENTS/artifacts/contracts.json` has at least one contract per public and admin API used by the UI.

Print when done:

```
✅ ANALYZER COMPLETE
   api-spec.json: <N> routes
   ui-spec.json: <M> pages
   env-schema.json: Workers + Pages env defined
   contracts.json: <K> contracts
   Next: Run 02-AGENT-WORKERS-CREATOR and 03-AGENT-PAGES-CREATOR
```
