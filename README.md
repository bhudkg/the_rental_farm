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
| `POST` | `/api/orders` | Place order |
| `GET` | `/api/orders` | My orders |
| `GET` | `/api/owner/trees` | Owner's trees |
| `GET` | `/api/owner/orders` | Orders on owner's trees |
| `GET` | `/api/owner/stats` | Owner dashboard stats |

**Tree filters:** `?type=mango&price_min=30&price_max=60&size=Large&maintenance=true&state=Maharashtra&city=Ratnagiri&search=alphonso&sort_by=price_low`

---

## User Roles

- **Renter** (default) — Browse trees, check availability, place orders, track rentals.
- **Owner** — List trees with full details (variety, location, pricing), manage listings, view orders, generate QR codes.

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
