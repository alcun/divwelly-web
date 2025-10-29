# Divwelly Web - Codebase Context

## Project Overview
Divwelly is a household expense splitting app built with Next.js 15 (App Router) for the frontend and Hono + Better Auth for the backend API.

**Live URLs:**
- Frontend: https://divwelly.com
- Backend API: https://api.divwelly.com

---

## Tech Stack

### Frontend (divwelly-web)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Custom CSS (Brutalist design system)
- **Forms:** @tanstack/react-form
- **Deployment:** Hetzner VPS (Docker)

### Backend (divwelly-api)
- **Framework:** Hono
- **Language:** TypeScript
- **Runtime:** Bun
- **Database:** PostgreSQL (via Drizzle ORM)
- **Auth:** Better Auth (email/password)
- **Deployment:** Hetzner VPS (Docker)

---

## Current Architecture

### Frontend Structure
```
app/
├── page.tsx                      # Login/signup page (/)
├── dashboard/
│   ├── page.tsx                  # SSR dashboard page
│   └── dashboard-client.tsx      # Client component (modals, interactions)
├── household/[id]/
│   ├── page.tsx                  # SSR household detail page
│   └── household-client.tsx      # Client component (add expense, interactions)
├── globals.css                   # Custom brutalist CSS system
└── layout.tsx                    # Root layout

lib/
└── auth-actions.ts               # Server actions (getSession, logout)

middleware.ts                     # Protects /dashboard and /household routes
```

### Backend Structure
```
src/
├── index.ts                      # Main Hono app setup
├── auth.ts                       # Better Auth configuration
├── db.ts                         # Database connection
├── schema.ts                     # Drizzle schema (users, households, expenses, etc.)
└── routes/
    ├── households.ts             # Household CRUD + join
    └── expenses.ts               # Expense CRUD

middleware/
└── auth.ts                       # requireAuth middleware
```

---

## Database Schema (Current)

### users
- id (uuid, pk)
- email (text, unique)
- name (text)
- password (hashed)
- createdAt, updatedAt

### households
- id (uuid, pk)
- name (text)
- inviteCode (text, unique, 6 chars)
- createdById (uuid, fk -> users)
- address (text, optional)
- postcode (text, optional)
- wifiName (text, optional)
- wifiPassword (text, optional)
- binCollection (text, optional)
- emergencyContacts (text, optional)
- notes (text, optional)
- createdAt, updatedAt

### householdMembers
- id (uuid, pk)
- householdId (uuid, fk -> households)
- userId (uuid, fk -> users)
- role (text: 'admin' | 'member')
- joinedAt

### expenses
- id (uuid, pk)
- householdId (uuid, fk -> households)
- description (text)
- amount (decimal)
- paidById (uuid, fk -> users)
- createdAt, updatedAt

---

## API Endpoints (Current)

### Auth (Better Auth)
- `POST /api/auth/sign-up/email` - Create account
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get current session

### Households
- `GET /api/households` - List user's households
- `POST /api/households` - Create household
- `GET /api/households/:id` - Get household details
- `POST /api/households/join` - Join household with invite code
- `GET /api/households/:id/members` - List household members
- `GET /api/households/:id/expenses` - List household expenses
- `GET /api/households/:id/balances` - Get who owes whom
- `PATCH /api/households/:id/info` - Update household info (admin only)
- `PATCH /api/households/:id/members/:memberId/promote` - Promote member to admin

### Expenses
- `POST /api/expenses` - Create expense

---

## Authentication Flow

1. User signs up/logs in via frontend
2. Better Auth sets cookie: `better-auth.session_token`
3. Cookie domain set to `.divwelly.com` (shared across subdomains)
4. Middleware checks cookie on protected routes
5. SSR pages forward cookie to API via `Cookie` header
6. Client components use `credentials: 'include'` for automatic cookie sending

---

## Design System

### Colors
- Primary: #000 (black)
- Background: #fff (white)
- Accent: #10b981 (green)
- Muted: #666 (gray)
- Error: #ef4444 (red)

### Typography
- Font: 'SF Mono', 'Monaco', 'Courier New' (monospace)
- Headers: Uppercase, bold, tight letter-spacing
- Labels: Uppercase, 12px, 0.5px letter-spacing

### Components
- Cards: 2px solid black borders
- Buttons: Uppercase, bold, no rounded corners
- Inputs: 2px borders, subtle focus state
- Modals: 3px borders, dark overlay
- Lists: 2px borders, hover states

---

## Key Features (Implemented)

✅ User registration and login
✅ Create households
✅ Join households with invite codes
✅ Add expenses (splits evenly among all members)
✅ View balances (calculated automatically)
✅ View household members
✅ Household info management (address, postcode, WiFi, bins, emergency contacts, notes)
✅ WiFi password with show/hide toggle
✅ Promote members to admin
✅ Admin-only controls for editing household info
✅ SSR for dashboard and household pages
✅ Cookie-based auth across subdomains
✅ Brutalist design system

---

## Known Limitations / TODOs

### Missing Features
- Cannot edit or delete expenses
- Cannot settle up / mark balances as paid
- No expense categories or tags
- No date filtering
- No recurring expenses
- No custom split amounts
- No user profile/settings page
- No way to leave or delete household
- No expense history or activity log
- Cannot demote admins back to members

### Technical Debt
- No loading states in some places
- Limited error handling
- No optimistic UI updates
- No automated tests
- No expense validation beyond required fields
- Balance calculation happens on-demand (could be cached)

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.divwelly.com
```

### Backend (.env)
```
BETTER_AUTH_SECRET=<secret>
BETTER_AUTH_URL=https://api.divwelly.com
DATABASE_URL=postgresql://...
NODE_ENV=production
```

---

## Deployment

### Frontend
- Dockerized Next.js app
- Reverse proxy: likely nginx/caddy
- SSL via Let's Encrypt

### Backend
- Dockerized Bun + Hono app
- Reverse proxy: likely nginx/caddy
- SSL via Let's Encrypt
- PostgreSQL database

---

## Development Setup

### Frontend
```bash
cd divwelly-web
npm install  # or bun install
npm run dev
# Opens on http://localhost:3000
```

### Backend
```bash
cd divwelly-api
bun install
bun run dev
# Opens on http://localhost:3000 (or 3001)
```

---

## Next Steps

See `FEATURES.md` for detailed feature roadmap and implementation plans.

**Recommended Order:**
1. Settle Up feature (core functionality)
2. Edit/Delete expenses (usability)
3. Expense categories (organization)
4. Date filtering (analytics)
5. Everything else...
