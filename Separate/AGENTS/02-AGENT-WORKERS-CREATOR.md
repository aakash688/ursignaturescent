# Agent 2 — Workers Creator

**Role:** Generate the Cloudflare Workers API project in `Separate/workers/` from the Analyzer’s api-spec, contracts, and env-schema.

**Run after:** 01-AGENT-ANALYZER (requires `artifacts/api-spec.json`, `contracts.json`, `env-schema.json`).  
**Run before:** 04-AGENT-TESTER, 05-AGENT-VERIFIER, 06-AGENT-DEPLOYER.

---

## Identity

You are a backend agent. You will:

1. Read `Separate/AGENTS/artifacts/api-spec.json`, `contracts.json`, and `env-schema.json`.
2. Create (or overwrite) the project under `Separate/workers/` with a single Worker that implements all API routes, or a multi-route Worker with a router (e.g. Hono).
3. Use Cloudflare Workers runtime (fetch handler). Use env from `env-schema.json` (Workers section) and expose them via `wrangler.toml` (vars and secrets).
4. Produce a deployable project: `npm install` and `wrangler deploy` (or `wrangler dev`) must succeed.

Do not modify the monolith or the artifacts; only read artifacts and write under `Separate/workers/`.

---

## Inputs

| Input | Path | Description |
|-------|------|-------------|
| API spec | `Separate/AGENTS/artifacts/api-spec.json` | Routes, methods, auth, request/response. |
| Contracts | `Separate/AGENTS/artifacts/contracts.json` | Request/response contracts for verification. |
| Env schema | `Separate/AGENTS/artifacts/env-schema.json` | Workers env vars (required/optional, descriptions). |

---

## Outputs

| Output | Path | Description |
|--------|------|-------------|
| Workers project | `Separate/workers/` | Full Worker app: entry, router, handlers, wrangler config. |

---

## Requirements

### 1. Project structure

- **Package manager:** npm (package.json with `type: "module"`).
- **Runtime:** Cloudflare Workers (ES modules).
- **Router:** Use [Hono](https://hono.dev) or a simple path+method router so one Worker handles all routes in api-spec.
- **Entry:** `src/index.ts` (or `worker.ts`) as the default export fetch handler. Wrangler `main` points to built output (e.g. `dist/worker.js` or worker bundle).

Suggested layout:

```
Separate/workers/
├── package.json
├── wrangler.toml
├── tsconfig.json
├── src/
│   ├── index.ts          # Hono app / fetch router
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   └── ...
│   │   ├── auth/
│   │   └── public/
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── auth.ts       # admin/user verification
│   │   └── r2.ts         # if R2 used
│   └── types.ts
└── test/                 # optional
```

### 2. Route implementation

- For each route in api-spec:
  - Map path to handler (e.g. `/api/admin/products` → GET list, POST create).
  - Implement auth: for `auth: "admin"` check profile.role from Supabase; for `auth: "user"` require valid session; for `auth: "public"` no check.
- Use the same path and method as the monolith so contracts and UI stay valid (e.g. `/api/admin/products`, `/api/orders`).
- CORS: if Pages is on a different origin, set CORS headers (e.g. Hono CORS middleware) for the Pages origin.

### 3. Env and bindings

- In `wrangler.toml`:
  - `vars`: all non-secret vars from env-schema (Workers).
  - Document that secrets (e.g. `SUPABASE_SERVICE_ROLE_KEY`) must be set with `wrangler secret put`.
- In code, use `env` (or `context.env`) passed to the fetch handler; no `process.env` (Workers don’t have Node env).

### 4. Dependencies

- Use Supabase server client (e.g. `@supabase/supabase-js`) for DB and auth.
- If R2 is in spec: use Workers R2 binding in wrangler and `env.R2_BUCKET` or similar in code.
- Keep dependencies minimal; prefer Workers-compatible packages.

### 5. Build and deploy

- Build step: e.g. `tsup`, `esbuild`, or `wrangler deploy` with built-in bundle. Ensure output is a single script or Worker entry.
- `wrangler.toml` must have: `name`, `main`, `compatibility_date`, and optionally `compatibility_flags: ["nodejs_compat"]` if using Node-style APIs.

---

## Execution steps

1. Create `Separate/workers/` directory and `package.json` (name e.g. `ursignature-workers`, scripts: `build`, `dev`, `deploy`).
2. Add `wrangler.toml` with name `ursignature-api` (or similar), `main` pointing to built worker, vars from env-schema, and R2 binding if needed.
3. Create `src/index.ts`: init Hono (or router), attach CORS, mount routes under `/api` to match api-spec paths.
4. For each route group in api-spec (e.g. admin/products, admin/orders, public/settings), create handler modules that use Supabase and optional R2. Enforce auth in middleware or per-route.
5. Add shared lib: Supabase client factory, auth helper (get user from cookie/header, check admin).
6. Add TypeScript config and build so `wrangler deploy` runs successfully.
7. Create a short README in `Separate/workers/README.md` with: how to run `npm install`, `npm run dev`, `npm run deploy`, and how to set secrets.

---

## Success criteria

- `Separate/workers/` exists with package.json, wrangler.toml, and src/ implementing all api-spec routes.
- `npm install` and `wrangler deploy` (or `npm run build && wrangler deploy`) succeed from `Separate/workers/`.
- Env vars from env-schema are present in wrangler.toml (vars) or documented as secrets.
- Response shapes align with contracts (same status codes and body structure for key routes).

Print when done:

```
✅ WORKERS CREATOR COMPLETE
   Separate/workers/ ready
   Routes: <list key route paths>
   Next: Run 03-AGENT-PAGES-CREATOR, then 04-AGENT-TESTER
```
