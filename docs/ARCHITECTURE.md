# ARCHITECTURE.md

## 1. Overview

Flowshopper is one repository with two parts that talk over HTTP. The web part (`web/`) is the store, the back-office and their server. The recommendation part (`reco/`) is a local API that the web server calls to get suggestions. Today, the web server reads the catalog from the provided CSV file and serves it to the React store.

```
Browser (React store)  --/api-->  Web server (Express, web/server)  --reads-->  reco/data/flowshopper_catalog.csv
                                          |
                                          +--(coming)--> Recommendation API (reco/, or mocks/reco-mock)
```

The full diagram will be completed as each part is built.

## 2. Components

- **Store** - what villagers see: catalog, product pages, cart. React 18 built with Vite, in `web/client/`. Owner: Web team (Lina).
- **Web server** - store API, and later sign-in, payment webhook, WebSocket and the call to the recommendation API. Node.js 20 with Express 4, in `web/server/`. Owner: Web team (Lina).
- **Recommendation API** - suggestions with their reason. Python with FastAPI, in `reco/`. Owner: AI team (Loris).
- **Mock of the recommendation API** - same routes with fixed data, so the store works without the AI team's service. Node.js, in `mocks/reco-mock/`. Owner: AI team.

## 3. Data flows

### Browsing and recommendations (fallback included)

1. The store calls `GET /api/products` on the web server.
2. The web server answers from the catalog held in memory, read once from the CSV file at start-up.
3. Recommendations and their fallback are added at step 9 of the Web plan.

### Events

To be written at step 4 (first event and batching).

### Payment

To be written at step 5 (Stripe in test mode).

### Real time

To be written at step 5 (WebSocket confirmation of the order).

## 4. Data model

A product is one row of `flowshopper_catalog.csv`, typed by `web/server/catalog.js`:

- numbers: `size`, `price_bells`, `unit_price_bells`, `stock` and the nutrition fields;
- lists: `labels` and `allergens`, split on `|`;
- `allergens` is `null` when the field is empty: unknown, never "no allergen";
- `in_stock` is added: `true` when `stock` is above 0.

Accounts, carts and orders are added with the database at a later step.

## 5. Technical choices

- **React with Vite** for the interface, rather than plain HTML (more code by hand for the cart and live updates) or Next.js (heavier for a short project). See DECISIONS.md, 2026-11-27.
- **Express** for the server: small, well known, and the Stripe and WebSocket libraries work with it.
- **One command in development**: `npm run dev` starts the server and Vite together; Vite forwards `/api` calls to the server, so the browser only talks to one address.
- **Fonts installed with npm** (`@fontsource/plus-jakarta-sans`), not loaded from Google: everything runs locally, as the subject requires.
- **Catalog in memory**: 896 products are read once at start-up; a database is not needed to show them.
- **Sign-in method**: to be chosen at step 7.

## 6. Performance

To be measured at step 12, on both teams' machines, before and after optimization.

## 7. Known limits

- The catalog is read only at start-up: a change to the CSV file needs a restart of the server.
- There is no search, cart or sign-in yet.
