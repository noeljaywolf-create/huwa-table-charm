# HUWA TABLE CHARM

A full-stack tableware/kitchenware e-commerce storefront with a guided-selling AI assistant ("Charm").

## Stack

- **shared** `@huwa/shared` — domain types, Zod schemas, feature flags (single source of truth)
- **backend** — Express + TypeScript + Knex (SQLite for dev/tests, PostgreSQL for prod)
- **frontend** — React + Vite + Tailwind (storefront + admin + Charm chat widget)
- **agent** — prompts/ and scaffold for the Charm Agent (logic lives in `backend/src/services/agent.service.ts`)

## Features

- Public catalog (categories, products, variants) with filters/search
- Product detail with compatibility badges + bundle recommendations
- Cart (guest + authenticated) and checkout (dev/mock Stripe, assisted-revenue attribution)
- Hybrid inventory: `stocked` (reserve/restock/reorder warnings) and `make_to_order` (engraving, `IN_PRODUCTION`)
- Order state machine (OPEN → PAID → READY/IN_PRODUCTION → SHIPPED → DELIVERED) with order tracking
- Admin dashboard (stats, orders, products, low-stock alerts)
- **Charm Agent**: rule-based guided selling + optional OpenAI tool-calling (search, compatibility, bundles, cart, track)

## Quick start (local dev)

```bash
# shared must be built to JS first (runtime uses dist/)
cd shared && npm install && npm run build

# backend
cd ../backend && npm install
npm run db:reset   # rollback + migrate + seed
npm run test       # vitest suite (8 tests)
npm run dev        # API on http://localhost:4000

# frontend (new terminal)
cd ../frontend && npm install
npm run dev        # app on http://localhost:5173 (proxy -> :4000/api)
```

### Demo accounts

| Role     | Email             | Password    |
|----------|-------------------|-------------|
| Customer | `demo@huwa.com`   | `Pass1234!` |
| Admin    | `admin@huwa.com`  | `Pass1234!` |

## Docker (prod-like: Postgres + API + nginx frontend)

```bash
docker compose up --build
```

- Frontend: http://localhost:8080 (nginx proxies `/api` → backend)
- API: http://localhost:4000
- Postgres: localhost:5432 (huwa / huwa_secret / huwa_table_charm)
- Migrations run automatically on backend start

## Agent

The Charm Agent is mounted at `/api/agent/chat`. Without `LLM_API_KEY` it runs a deterministic guided-selling flow; set `LLM_API_KEY` (and optionally `LLM_MODEL`) in the backend env to enable OpenAI tool-calling.

## API reference (summary)

- `GET /api/products`, `/api/products/:slug`, `/api/categories`, `/api/bundles`
- Auth: `POST /api/register`, `/login`, `/refresh`, `/logout`, `GET /api/me`
- Cart: `GET/PUT/DELETE /api/cart`, `POST/PATCH/DELETE /api/cart/items/:id`
- Checkout: `POST /api/checkout`, `POST /api/checkout/:orderId/confirm`, `GET /api/orders/:orderNumber`, `GET /api/orders/mine`
- Admin: `/api/admin/*` (auth + role required)
- Agent: `POST /api/agent/chat`, `GET /api/agent/search`, `/compatibility/:variantId`, `POST /api/agent/bundles`, `/cart`, `GET /api/agent/track/:orderNumber`
