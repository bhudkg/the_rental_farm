# The Rental Farm

A full-stack fruit tree rental platform — browse, rent, and manage fruit trees online.

**Tech Stack:** FastAPI + PostgreSQL (backend) | React + Vite + Tailwind CSS (frontend)

---

## Prerequisites

- **Python 3.14+**
- **Node.js 18+** and **npm**
- **PostgreSQL 14+** (local install or Docker)
- **uv** (Python package manager) — `curl -LsSf https://astral.sh/uv/install.sh | sh`

---

## Project Structure

```
the_rental_farm/
├── backend/
│   ├── .env.example        # Environment variables template
│   ├── requirements.txt     # Python dependencies (all pinned)
│   └── my_project/
│       ├── main.py          # FastAPI app entry point
│       ├── models.py        # SQLAlchemy ORM models
│       ├── schemas.py       # Pydantic request/response schemas
│       ├── crud.py          # Database operations
│       ├── database.py      # DB connection setup
│       ├── auth_utils.py    # JWT auth helpers
│       ├── seed.py          # Seed data (16 fruit trees)
│       ├── pyproject.toml   # uv project config
│       └── routes/
│           ├── auth.py      # Register, Login, Me
│           ├── trees.py     # CRUD + filters for trees
│           ├── availability.py
│           ├── orders.py
│           └── owner.py     # Owner dashboard APIs
├── frontend/
│   └── app/
│       ├── package.json
│       ├── vite.config.js
│       └── src/
│           ├── App.jsx
│           ├── pages/       # Home, Trees, TreeDetail, Orders, Login, owner/*
│           ├── components/  # TreeCard, Navbar, BookingModal, etc.
│           ├── store/       # Zustand state management
│           └── services/    # Axios API client
├── docker-compose.yml       # Optional Docker PostgreSQL
└── README.md
```

---

## Quick Start

### 1. Clone the repo

```bash
git clone <repo-url>
cd the_rental_farm
```

### 2. Set up PostgreSQL

**Option A — Local PostgreSQL:**

```bash
# Create the database and user
psql -U postgres -c "CREATE USER rental_farm_user WITH PASSWORD 'rental_farm_pass';"
psql -U postgres -c "CREATE DATABASE the_rental_farm OWNER rental_farm_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE the_rental_farm TO rental_farm_user;"
```

**Option B — Docker:**

```bash
docker compose up -d
```

> Note: Docker uses port **5431**. Update `DATABASE_URL` in `.env` accordingly.

### 3. Set up the Backend

```bash
cd backend

# Create .env from template
cp .env.example .env
# Edit .env if your DB port/credentials differ

# Option A — Using uv (recommended)
cd my_project
uv sync
uv run uvicorn main:app --reload

# Option B — Using pip
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd my_project
uvicorn main:app --reload
```

The backend starts at **http://localhost:8000**.
Swagger docs at **http://localhost:8000/docs**.

On first startup, the database tables are auto-created and seeded with 16 fruit trees.

### 4. Set up the Frontend

```bash
cd frontend/app

npm install
npm run dev
```

The frontend starts at **http://localhost:5173**.
API calls are proxied to the backend via Vite config.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://rental_farm_user:rental_farm_pass@localhost:5432/the_rental_farm` |
| `SECRET_KEY` | JWT signing secret | `change-me-to-a-real-secret-key` |
| `DEBUG` | Enable debug mode | `true` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | `rzp_test_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | Required for Razorpay |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret | Required for webhook verification |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_xxxxx` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_xxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Required for webhook verification |
| `PAYMENT_GATEWAY` | Active payment gateway | `razorpay` (or `stripe`) |
| `PAYMENT_CURRENCY` | Payment currency | `INR` |

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register (renter or owner) |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/trees` | List trees (with filters) |
| `GET` | `/api/trees/:id` | Tree detail |
| `POST` | `/api/trees` | Create tree (owner) |
| `PUT` | `/api/trees/:id` | Update tree (owner) |
| `DELETE` | `/api/trees/:id` | Delete tree (owner) |
| `POST` | `/api/trees/:id/availability` | Check availability |
| `POST` | `/api/orders` | Place order + create payment |
| `GET` | `/api/orders` | My orders |
| `POST` | `/api/orders/:id/payment/verify` | Verify payment signature |
| `GET` | `/api/orders/:id/payment-status` | Get payment status |
| `POST` | `/api/orders/:id/cancel` | Cancel order + refund |
| `POST` | `/api/webhooks/razorpay` | Razorpay webhook handler |
| `POST` | `/api/webhooks/stripe` | Stripe webhook handler |
| `GET` | `/api/owner/trees` | Owner's trees |
| `GET` | `/api/owner/orders` | Orders on owner's trees |
| `GET` | `/api/owner/stats` | Owner dashboard stats |

**Tree filters:** `?type=mango&price_min=30&price_max=60&size=Large&maintenance=true&state=Maharashtra&city=Ratnagiri&search=alphonso&sort_by=price_low`

---

## User Roles

- **Renter** (default) — Browse trees, check availability, place orders, track rentals.
- **Owner** — List trees with full details (variety, location, pricing), manage listings, view orders, generate QR codes.

---

## Payment Integration

The platform supports secure online payments through **Razorpay** (India) and **Stripe** (Global).

### Features

- Multiple payment methods: UPI, Cards, Net Banking, Wallets, EMI
- Secure payment processing (PCI DSS compliant)
- Real-time payment verification
- Webhook-based status updates
- Automatic refund processing on cancellation
- Payment receipts and transaction history

### Setup

1. **Get API Keys:**
   - Razorpay: Sign up at https://dashboard.razorpay.com/signup
   - Stripe: Sign up at https://dashboard.stripe.com/register

2. **Add to `.env`:**
   ```bash
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   RAZORPAY_WEBHOOK_SECRET=xxxxx
   PAYMENT_GATEWAY=razorpay
   PAYMENT_CURRENCY=INR
   ```

3. **Install Dependencies:**
   ```bash
   cd backend/my_project
   uv sync
   ```

4. **Run Migration:**
   ```bash
   uv run alembic upgrade head
   ```

### Testing

See [PAYMENT_TESTING.md](PAYMENT_TESTING.md) for comprehensive testing guide with test cards and webhook setup.

---

## Tree Data Model

Each tree listing has these fields:

| Field | Type | Description |
|---|---|---|
| `name` | string | Tree name |
| `type` | string | Fruit type (mango, banana, orange, etc.) |
| `variety` | string | Breed/cultivar (e.g. Alphonso, Dasheri) |
| `speciality` | string | What makes it special |
| `description` | string | Detailed description |
| `location` | string | Local area / farm name |
| `city` | string | Nearest city |
| `state` | string | State |
| `price_per_day` | float | Daily rental price (₹) |
| `price_per_month` | float | Monthly rental price (₹) |
| `price_per_season` | float | Seasonal rental price (₹) |
| `deposit` | float | Refundable deposit (₹) |
| `size` | string | Tree size |
| `min_quantity` | int | Minimum quantity guarantee |
| `available_quantity` | int | Stock available |
| `maintenance_required` | bool | Whether maintenance is included |
| `image_url` | string | Tree photo URL |
