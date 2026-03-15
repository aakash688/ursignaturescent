# URsignature — Agentic Build System for Cursor

## Overview
This folder contains **12 sequential Cursor Agent prompts** that will build the complete URsignature e-commerce platform from scratch. Run them **in order**, one at a time, using Cursor's Agent mode (Ctrl+Shift+P → "Run Agent").

---

## Stack
| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Razorpay |
| Shipping | Shiprocket API |
| File Storage | Cloudflare R2 |
| Hosting | Cloudflare Pages |
| Bot Notifications | Telegram Bot API |
| Analytics | Google Analytics 4 + Meta Pixel |
| SEO | Next.js built-in + structured data |

---

## Agent Execution Order

| # | File | Purpose |
|---|---|---|
| 01 | `agent-01-project-scaffold.md` | Next.js project setup, folder structure, env vars, dependencies |
| 02 | `agent-02-supabase-schema.md` | Full DB schema: products, orders, users, inventory, coupons, POS |
| 03 | `agent-03-cloudflare-r2.md` | R2 bucket setup, image upload utility, admin image manager |
| 04 | `agent-04-design-system.md` | Global design tokens, fonts, luxury UI component library |
| 05 | `agent-05-storefront.md` | Homepage, collections, product pages, cart, checkout UI |
| 06 | `agent-06-auth-user-portal.md` | User signup/login, order history, profile, address book |
| 07 | `agent-07-payment-shipping.md` | Razorpay integration, Shiprocket integration, order lifecycle |
| 08 | `agent-08-admin-panel.md` | Full admin: products, categories, inventory, coupons, POS |
| 09 | `agent-09-telegram-bot.md` | Order alerts, low stock alerts, daily reports, order lookup |
| 10 | `agent-10-analytics-seo.md` | GA4, Meta Pixel, structured data, sitemap, robots.txt |
| 11 | `agent-11-cloudflare-deploy.md` | Cloudflare Pages deployment, wrangler config, edge functions |
| 12 | `agent-12-testing-qa.md` | End-to-end tests, performance audit, SEO audit, final checklist |

### Single-run agents (full vertical)

| File | Purpose |
|------|--------|
| **`AGENT-ADMIN-PANEL-FULL.md`** | **Complete admin panel end-to-end** — layout, dashboard, products CRUD, categories, orders, inventory, coupons, customers, POS, analytics, settings, contacts, reviews. Run after storefront + auth exist. |

---

## Before You Start

1. Create accounts on: Supabase, Cloudflare, Razorpay, Shiprocket, Telegram, Google Analytics, Meta Business
2. Copy `.env.example` (generated in Agent 01) → `.env.local` and fill all keys
3. Place all perfume images into `/public/images/products/` with filenames matching `agent-01` naming convention
4. Run agents ONE AT A TIME — each one builds on the previous

---

## Brand Config (Pre-filled for Agents)
- **Brand**: URsignature
- **Tagline**: "Your Scent. Your Identity."
- **Colors**: Deep Noir `#0A0A0A`, Champagne Gold `#C9A84C`, Ivory `#F5F0E8`, Smoke `#6B6B6B`
- **Font Pair**: Cormorant Garamond (display) + DM Sans (body)
- **Currency**: INR ₹
- **Shipping**: Prepaid only (no COD)
- **Default SKU size**: 50ml (more sizes via admin)