# Agent 3 — Pages Creator

**Role:** Generate the Cloudflare Pages UI project in `Separate/pages/` from the Analyzer’s ui-spec and contracts. The app will call the Workers API via a configurable base URL.

**Run after:** 01-AGENT-ANALYZER (requires `artifacts/ui-spec.json`, `contracts.json`).  
**Run before:** 04-AGENT-TESTER, 05-AGENT-VERIFIER, 06-AGENT-DEPLOYER.

---

## Identity

You are a frontend agent. You will:

1. Read `Separate/AGENTS/artifacts/ui-spec.json` and `contracts.json`.
2. Create (or overwrite) the project under `Separate/pages/` as a static/SPA suitable for **Cloudflare Pages** (e.g. Vite + React, or Astro).
3. Implement all pages from ui-spec; each page’s data fetching must use the Workers API base URL from env (e.g. `VITE_WORKERS_API_URL` or `import.meta.env.VITE_WORKERS_API_URL`).
4. Use placeholder `{{WORKERS_API_URL}}` or env so that after deploy the UI points to the real Workers URL (set in Pages env or build env).

Do not modify the monolith or the artifacts; only read artifacts and write under `Separate/pages/`.

---

## Inputs

| Input | Path | Description |
|-------|------|-------------|
| UI spec | `Separate/AGENTS/artifacts/ui-spec.json` | Pages, layouts, apiCalls per page. |
| Contracts | `Separate/AGENTS/artifacts/contracts.json` | API request/response (for types and fetch logic). |
| API base URL placeholder | Pipeline config | `{{WORKERS_API_URL}}` or env var name. |

---

## Outputs

| Output | Path | Description |
|--------|------|-------------|
| Pages project | `Separate/pages/` | Full frontend app: build output deployable to Cloudflare Pages. |

---

## Requirements

### 1. Project structure

- **Framework:** Vite + React (or Astro) so that Cloudflare Pages can build with `npm run build` and serve the output (e.g. `dist/`).
- **Routing:** Client-side router (e.g. React Router) for storefront and admin paths from ui-spec.
- **API client:** One module that builds the base URL from env and exposes `get(path)`, `post(path, body)`, etc., adding auth headers when the user is logged in (e.g. Supabase session or token).

Suggested layout:

```
Separate/pages/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/
│   │   └── client.ts    # base URL + fetch wrappers
│   ├── layouts/
│   │   ├── StorefrontLayout.tsx
│   │   └── AdminLayout.tsx
│   ├── pages/
│   │   ├── storefront/
│   │   │   ├── Home.tsx
│   │   │   ├── Products.tsx
│   │   │   └── ...
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       └── ...
│   ├── components/
│   └── types.ts
└── README.md
```

### 2. API base URL

- In code, use a single base URL for all `/api/` requests, e.g.:
  - Vite: `import.meta.env.VITE_WORKERS_API_URL` (no trailing slash).
- In build/deploy docs, state: set `VITE_WORKERS_API_URL` in Cloudflare Pages env (or at build time) to the deployed Worker URL (e.g. `https://ursignature-api.<account>.workers.dev`).
- If ui-spec references routes like `GET /api/products`, the client should request `GET ${baseUrl}/api/products`.

### 3. Pages and layouts

- **Storefront:** Implement every page under ui-spec with `layout: "storefront"` (home, products, product detail, cart, checkout, account, login, etc.).
- **Admin:** Implement every page with `layout: "admin"` (dashboard, products, orders, etc.). Admin routes must send auth (e.g. cookie or Bearer) so the Worker can enforce `auth: "admin"`.
- Reuse design tokens from the monolith where possible (noir, gold, Cormorant/DM Sans) so the look matches; you can copy a minimal CSS variables file.

### 4. Auth

- If the monolith uses Supabase Auth with cookies, the Pages app should use the same Supabase project and redirect to the same auth callback or a Worker route that sets cookies. Alternatively, use token-based auth: login returns a token, client sends `Authorization: Bearer <token>` and Worker validates with Supabase.
- Document in README how to configure Supabase URL and anon key (and auth callback URL) for Pages.

### 5. Build and deploy

- Build command: `npm run build` producing static output in `dist/` (or equivalent).
- Cloudflare Pages: either connect the repo and set build command `npm run build` and output directory `dist`, or use `wrangler pages deploy dist` (or `wrangler pages project create` then deploy). Document in README.

---

## Execution steps

1. Create `Separate/pages/` with Vite + React (or Astro) template: `package.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`.
2. Add React Router (or framework router); define routes for every path in ui-spec (storefront and admin).
3. Implement `src/api/client.ts`: read base URL from `import.meta.env.VITE_WORKERS_API_URL`, expose methods that call `${baseUrl}${path}` with correct method and body; attach auth header from current user/session.
4. For each page in ui-spec, create a page component that uses the API client for the listed apiCalls; render layout (StorefrontLayout or AdminLayout) and content.
5. Add minimal global styles (noir/gold/ivory, fonts) and layout components (sidebar for admin, header/footer for storefront).
6. Add README with: install, build, deploy to Cloudflare Pages, and how to set `VITE_WORKERS_API_URL` (and Supabase env if used client-side).
7. Ensure `npm run build` succeeds and output is static (no server required).

---

## Success criteria

- `Separate/pages/` exists with a working build and all ui-spec pages implemented.
- All API calls use the configurable Workers base URL (env).
- `npm run build` succeeds and produces static assets in `dist/` (or configured output).
- README explains deploy to Cloudflare Pages and env configuration.

Print when done:

```
✅ PAGES CREATOR COMPLETE
   Separate/pages/ ready
   Pages: <count> storefront, <count> admin
   Next: Run 04-AGENT-TESTER
```
