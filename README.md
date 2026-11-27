# Flowshopper

> The grocery store that knows its villagers.

## 1. Presentation

Flowshopper is the online grocery store of Tom Nook's island. It suggests to each villager
the few products that matter to them (usual products, products to buy again, similar products,
products they might like) instead of making them browse the whole catalog. Every suggestion
comes with a reason, can be dismissed, and never contains a declared allergen.

This repository is a monorepo holding the whole integrated product:

| Folder | Content | Place in the product |
|--------|---------|----------------------|
| `reco/` | Recommendation system and its API (5 features, allergen filter, evaluation) | Serves suggestions to the site and receives villagers' reactions |
| `web/` | Site (`client/`), back-office (`backoffice/`) and server (`server/`) | Shows the suggestions, takes payments, collects events |
| `simulator/` | Traffic simulator and villager profiles | Generates sessions to feed the back-office and test the system |
| `mocks/` | `reco-mock/` (stands in for the recommendation API) and `web-mock/` (stands in for the site's events) | Lets each part run without the other |
| `docs/` | Architecture, accessibility, privacy, payment, instrumentation, simulator and testing docs | Documentation |
| `CONTRACT.md` | Versioned interface contract between site and recommendation system | |
| `DECISIONS.md` | Log of decisions and disagreements | |
| `AI_USAGE.md` | Disclosure of AI usage during the project | |

Everything runs locally. No external AI service is used; the only external service is the
payment provider, in test mode.

> **Current status**: the repository is a skeleton. The `reco/` API starts and its tests pass.
> The site shows the catalog by aisle. The five features, the rest of the site, the back-office
> and the simulator are still to be implemented.
> Parts that do not work yet are marked **(not implemented yet)** below.

## 2. Prerequisites

| Tool | Version | Used for |
|------|---------|----------|
| Python | 3.11 or newer | Recommendation system (`reco/`) |
| Node.js | 20 or newer | Site, back-office and server (`web/`) |
| Git | any recent version | Cloning |

Minimum machine: any laptop with 4 GB of RAM. No GPU is needed: models are trained on CPU.

## 3. Installation

From a fresh clone:

```bash
git clone <repository-url> flowshopper
cd flowshopper

# Configuration (see section 4)
cp .env.example .env

# Recommendation system
cd reco
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Site, back-office and server
cd web
npm install
cd ..
```

### Provided data

The catalog and the purchase history are provided as CSV files. Place them in `reco/data/`
(this folder is not filled by the repository). **(file names to be confirmed once the data is in place)**

### Obtaining the models

Model weights are not committed to the repository (they are listed in `.gitignore`).
They are rebuilt from the provided CSV files with a single command, run from `reco/`:

```bash
python scripts/train.py          # (not implemented yet)
```

The trained files are written to `reco/models/`. Training and evaluation protocol:
see [reco/docs/MODEL_COMPARISON.md](reco/docs/MODEL_COMPARISON.md).

## 4. Configuration

All configuration comes from environment variables; nothing is hardcoded. Copy `.env.example`
to `.env` and adapt it. Only test keys are used; no secret is committed.

| Variable | Role | Example value |
|----------|------|---------------|
| `SITE_PORT` | Port of the site | `3000` |
| `BACKOFFICE_PORT` | Port of the back-office | `3001` |
| `CLIENT_DEV_PORT` | Port of the React app in development; it forwards `/api` to `SITE_PORT` | `5173` |
| `CATALOG_PATH` | Catalog CSV read by the web server, relative to the repository root | `reco/data/flowshopper_catalog.csv` |
| `DATABASE_URL` | Database of the site (accounts, carts, orders, stock) | `sqlite:./data/flowshopper.db` |
| `RECO_API_URL` | Address of the recommendation API (real one, or `mocks/reco-mock`) | `http://localhost:8000` |
| `RECO_TIMEOUT_MS` | Time the site waits for the recommendation API before running without suggestions | `800` |
| `STRIPE_SECRET_KEY` | Stripe secret key, **test mode only** | `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Secret used to verify webhook signatures | `whsec_xxx` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key, **test mode only** | `pk_test_xxx` |

## 5. Launch

One command per part, each from the repository root.

| Part | Command | URL / port |
|------|---------|-----------|
| Recommendation API | `cd reco && source .venv/bin/activate && uvicorn src.api:app --port 8000` | http://localhost:8000 (`/health` answers `{"status":"ok"}`) |
| Site | `cd web && npm run dev` (store API and React app together) | http://localhost:5173 (API on http://localhost:3000) |
| Back-office | served by the web server **(not implemented yet)** | http://localhost:3001 |
| Simulator | **(not implemented yet)** | - |
| Webhook forwarding | `stripe listen --forward-to localhost:3000/webhooks/stripe` **(route not implemented yet)** | - |
| Mock of the recommendation API | `node mocks/reco-mock/server.js` **(not implemented yet)** | http://localhost:8000 |
| Mock of the site's events | `python mocks/web-mock/send_events.py` **(not implemented yet)** | - |

Start the recommendation API (or its mock) before the site. If it is unreachable, the site is
meant to keep working without suggestions.

## 6. Tests

```bash
# Recommendation system (allergen filter, cold start)
cd reco && source .venv/bin/activate && pytest

# Site: unit tests and end-to-end tests (placeholders for now)
cd web && npm run test:unit
cd web && npm run test:e2e
```

The `reco` tests currently pass (4 tests). Both suites also run on every push through
`.github/workflows/ci.yml`. The coverage threshold (at least 60 %) is **not enforced yet**.

## 7. Documentation

| Document | Link |
|----------|------|
| Interface contract | [CONTRACT.md](CONTRACT.md) |
| Decisions and disagreements | [DECISIONS.md](DECISIONS.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Accessibility | [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) |
| Privacy | [docs/PRIVACY.md](docs/PRIVACY.md) |
| Payment | [docs/PAYMENT.md](docs/PAYMENT.md) |
| Instrumentation | [docs/INSTRUMENTATION.md](docs/INSTRUMENTATION.md) |
| Simulator | [docs/SIMULATOR.md](docs/SIMULATOR.md) |
| Testing | [docs/TESTING.md](docs/TESTING.md) |
| Model comparison | [reco/docs/MODEL_COMPARISON.md](reco/docs/MODEL_COMPARISON.md) |
| Mockups | [docs/mockups/README.md](docs/mockups/README.md) |
| Recommendation system | [reco/README.md](reco/README.md) |
| AI usage disclosure | [AI_USAGE.md](AI_USAGE.md) |

## 8. Team

| Member | Main parts |
|--------|-----------|
| _Name 1_ | _to fill in_ |
| _Name 2_ | _to fill in_ |
| _Name 3_ | _to fill in_ |