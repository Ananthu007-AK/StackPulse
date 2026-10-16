# StackPulse ⚡

> Advanced Developer Intelligence Platform & Repository Curation Engine.

StackPulse is a full-stack web application designed for exploring GitHub developer profiles, benchmarking engineering talent across teams and ecosystems, and curating repositories with custom annotations and taxonomy tags.

---

## 🌟 Key Features

- **Developer Intelligence Profiles:**
  - Real-time profile exploration powered by the GitHub REST API.
  - Core metrics: Cumulative stargazers, fork counts, average stars per repository, and follower reach.
  - Primary language distribution breakdown with custom color mappings.
  - Commit velocity area chart visualizing weekly commit cadence.
  - Searchable, filterable, and sortable repository catalog.

- **Multi-Developer Benchmarking (/compare):**
  - Compare 2 to 5 developers simultaneously side-by-side.
  - Automated winner highlight trophies (Most Stars, Most Followers, Most Repositories, Highest Avg Stars).
  - Telemetry matrix table with mobile-friendly sticky column.
  - Comparative grouped bar charts comparing core metrics and language shares.
  - Save, reload, and rename custom comparisons.

- **Repository Curation & Pinning (/pins):**
  - Star and pin any repository from profile views.
  - Add personal notes and taxonomy tags (e.g., `#Linux`, `#Architecture`, `#Favorite`).
  - Search and filter pins by tag chips or full-text query.

- **Personalized Dashboard (/dashboard):**
  - User greeting with profile stats.
  - Fast search with preset shortcuts (`@torvalds`, `@gaearon`, `@sindresorhus`).
  - Quick-start comparison presets (e.g., React vs Vue, Systems Leaders).
  - Pinned repository grid and saved benchmark cards.

- **Enterprise-Grade Rate Limit & Cache Architecture (6 Layers + Deduplication):**
  - **Layer 1 (Authenticated Requests):** GITHUB_TOKEN integration raising capacity from 60 to 5,000 req/hr.
  - **Layer 2 (PostgreSQL Caching):** 15-minute fresh TTL; popular developer searches trigger zero GitHub calls.
  - **Layer 3 (Selective Fetching):** Uses repo list data for stars & languages; commit stats capped strictly to top 10 repos.
  - **Layer 4 (Stale-While-Revalidate):** Serves cached profiles instantly (<6h) with non-blocking background revalidation.
  - **Layer 5 (ETags & HTTP 304):** Sends `If-None-Match` headers; unchanged profiles return 304 costing 0 quota.
  - **Layer 6 (Telemetry & Lockdown):** Active `x-ratelimit-remaining` monitoring with automatic cache-only lockdown mode when low.
  - **Bonus (Request Deduplication):** In-flight promise map coalescing concurrent duplicate searches into 1 API call.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | Blazing fast client, strong typing, instant HMR |
| **Styling** | Tailwind CSS + Glassmorphism | Custom dark palette, neon teal accents, micro-animations |
| **Visualizations** | Recharts | Responsive horizontal bars, gradient area charts, grouped bars |
| **Icons** | Lucide React | Clean, modern feather icon set |
| **Backend** | Node.js + Express + TypeScript | Modular, scalable REST API architecture |
| **Database** | PostgreSQL | Relational consistency, native array support for tags |
| **ORM** | Prisma ORM (v6) | Type-safe queries, automated migrations |
| **Authentication** | JWT Bearer Tokens + bcrypt | Stateless authentication with 12-round password hashing |
| **Validation** | Zod | Runtime schema validation on API payloads |
| **External API** | GitHub REST API v3 | Live developer and repository telemetry data |

---

## 📁 Project Structure

```
stackpulse/
├── client/                     # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/         # LanguageChart, CommitActivityChart, ComparisonChart
│   │   │   ├── common/         # StatCard, SearchInput, LoadingSpinner, EmptyState
│   │   │   ├── developers/     # ProfileHeader, MetricsCards, DeveloperSelector
│   │   │   ├── layout/         # Navbar, Sidebar, MobileMenu, ProtectedRoute
│   │   │   └── repositories/   # RepoTable, RepoCard, PinButton, NoteModal
│   │   ├── context/            # AuthContext (JWT management & session state)
│   │   ├── hooks/              # useAuth, useDeveloper, useCompare
│   │   ├── pages/              # Login, Register, Dashboard, Developer, Compare, Pins, Saved
│   │   ├── services/           # Axios instance with auth interceptor
│   │   ├── types/              # TypeScript interface contracts
│   │   ├── App.tsx             # Route configuration
│   │   ├── index.css           # Design tokens, glassmorphism, scrollbars
│   │   └── main.tsx            # Entry mount point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript backend
│   ├── prisma/
│   │   ├── schema.prisma       # 6 normalized models (User, Developer, Repo, Pin, etc.)
│   │   └── migrations/         # PostgreSQL migration history
│   ├── src/
│   │   ├── config/             # Environment & Prisma client singleton
│   │   ├── controllers/        # Request controllers with Zod validation
│   │   ├── middleware/         # Auth, ErrorHandler, RateLimiter
│   │   ├── routes/             # Express route declarations
│   │   ├── services/           # GitHub API, Metrics computation, Auth
│   │   ├── utils/              # ApiError custom exception class
│   │   ├── app.ts              # Express application setup & CORS
│   │   └── server.ts           # Server bootstrap & graceful shutdown
│   ├── tsconfig.json
│   └── package.json
│
├── docs/
│   └── technical-notes.md      # Deep dive into architecture, caching & decisions
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore rules for node_modules, .env, dist
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v18.0.0 or later (v20+ / v24+ recommended)
- **npm**: v9.0.0 or later
- **PostgreSQL**: v14.0 or later running on port `5432`
- **GitHub Token (Optional but Recommended)**: A Personal Access Token (classic with public access, no scopes needed) to raise GitHub rate limits from 60 to 5,000 requests/hour.

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/stackpulse.git
cd stackpulse
```

---

### Step 2: Configure and Start the Backend Server

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Copy the environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and verify your PostgreSQL credentials:
   ```env
   PORT=6001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5178
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/stackpulse
   JWT_SECRET=super-secret-stackpulse-jwt-key-2026-production-ready
   JWT_EXPIRES_IN=7d
   GITHUB_TOKEN=your_github_token_here
   CACHE_TTL_MINUTES=15
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will be running on `http://localhost:6001` with the health check available at `http://localhost:6001/api/health`.*

---

### Step 3: Configure and Start the Frontend Client

1. Open a new terminal and navigate to `client/`:
   ```bash
   cd ../client
   ```

2. Copy the client environment file:
   ```bash
   cp .env.example .env
   ```
   *(Defaults to `VITE_API_URL=http://localhost:6001/api`)*

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to **`http://localhost:5178`**.

---

## 🧪 Manual Testing & Verification

| Area | Test Case | Expected Result |
|---|---|---|
| **Auth** | Register a new user | Redirects to `/dashboard` with auth token saved |
| **Auth** | Sign in with wrong password | Displays clean error message |
| **Auth** | Sign out | Clears token, redirects to `/login` |
| **Developer** | Search `@torvalds` | Loads Linus Torvalds profile, 170k+ stars, C breakdown |
| **Developer** | Search invalid user | Returns graceful 404 "Developer Not Found" state |
| **Pins** | Pin repository + add note & tag | Appears in `/pins` with note and badge |
| **Pins** | Filter pins by tag | Filters list dynamically |
| **Compare** | Compare `@torvalds` vs `@gaearon` | Side-by-side benchmark matrix and winner trophies |
| **Compare** | Save comparison as "Titans" | Appears in `/comparisons`, reloads telemetry on click |
| **Responsive** | Mobile screen (<768px) | Hamburger drawer opens, tables support horizontal scroll |

---

## 🔒 Security & Best Practices

- **Zero Client Trust:** All database queries for user pins, notes, and comparisons are strictly bound to `req.userId` verified from the JWT signature.
- **Rate Limiting:** Global rate limiters (300 req/15min) and dedicated authentication limiters (30 req/15min) protect against abuse.
- **Input Validation:** Strict runtime input schema validation using Zod.
- **Environment Isolation:** Sensitive tokens and credentials reside exclusively in `.env` files and are ignored by git.

---

## 📄 Documentation

For deep technical rationale, database schema diagrams, and rate limit algorithms, refer to:
- [`docs/technical-notes.md`](docs/technical-notes.md)
