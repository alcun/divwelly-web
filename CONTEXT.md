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
└── layout.tsx                    # Root layout with analytics

components/
└── loggerlizard-tracker.tsx     # LoggerLizard analytics integration

lib/
└── auth-actions.ts               # Server actions (getSession, logout)

middleware.ts                     # Auth + redirects (protects routes, redirects logged-in from auth pages)
```

### Backend Structure
```
src/
├── index.ts                      # Main Hono app setup
├── auth.ts                       # Better Auth configuration
├── db.ts                         # Database connection
├── schema.ts                     # Drizzle schema (users, households, expenses, recurring, payments)
└── routes/
    ├── households.ts             # Household CRUD + join + members
    ├── expenses.ts               # Expense CRUD + payment tracking
    └── recurring-expenses.ts     # Recurring bills + monthly payment tracking

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
- dueDate (date, optional)
- createdAt, updatedAt

### expensePayments
- id (uuid, pk)
- expenseId (uuid, fk -> expenses)
- userId (uuid, fk -> users)
- amount (decimal)
- isPaid (boolean)
- paidAt (timestamp, optional)
- receiptUrl (text, optional)
- createdAt, updatedAt

### recurringExpenses
- id (uuid, pk)
- householdId (uuid, fk -> households)
- name (text)
- amount (decimal)
- frequency (text: 'monthly' | 'weekly' | 'yearly')
- startDate (date)
- endDate (date, optional)
- isActive (boolean)
- lastGenerated (timestamp, optional)
- createdAt, updatedAt

### recurringBillPayments
- id (uuid, pk)
- recurringExpenseId (uuid, fk -> recurringExpenses)
- userId (uuid, fk -> users)
- month (date) - First day of month (YYYY-MM-01)
- paidAt (timestamp)
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
- `PATCH /api/expenses/:id` - Update expense (description, amount, dueDate)
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/:id/payments` - Get payment tracking for expense
- `POST /api/expenses/:expenseId/payments/:userId/mark-paid` - Mark user's payment as paid
- `POST /api/expenses/:expenseId/payments/:userId/upload-receipt` - Upload receipt (image upload)

### Recurring Expenses
- `POST /api/recurring-expenses` - Create recurring bill
- `PATCH /api/recurring-expenses/:id` - Update recurring bill
- `DELETE /api/recurring-expenses/:id` - Delete (deactivate) recurring bill
- `GET /api/households/:id/recurring-expenses` - List household's recurring bills
- `POST /api/recurring-expenses/:id/mark-paid` - Mark your portion as paid for current month

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

### Core Functionality
✅ User registration and login (email/password via Better Auth)
✅ Create households with auto-generated invite codes
✅ Join households with invite codes
✅ Add/edit/delete one-off expenses
✅ Payment tracking for expenses (who has/hasn't paid)
✅ Mark payments as paid + upload receipt screenshots
✅ Recurring bills (rent, council tax, utilities)
✅ Monthly payment tracking for recurring bills
✅ Auto-reset recurring payments each month
✅ View balances (calculated automatically - who owes whom)
✅ View household members
✅ Promote members to admin

### Household Info
✅ Address, postcode
✅ WiFi name/password with show/hide toggle
✅ Bin collection schedule
✅ Emergency contacts
✅ General notes
✅ Admin-only controls for editing

### UX/UI
✅ SSR for dashboard and household pages
✅ Cookie-based auth across subdomains
✅ Brutalist design system
✅ Logout buttons on all pages
✅ Copy invite code button
✅ Prominent balances display
✅ Improved dashboard with gradient header
✅ Auth redirects (logged-in users redirected from /login to /dashboard)

### Analytics
✅ LoggerLizard integration (@loggerlizard/lizard npm package)
✅ Auto-tracking: page views, clicks, forms, scroll depth, errors
✅ Optional via environment variables

---

## Known Limitations / TODOs

### Missing Features
- No expense categories or tags
- No date filtering for expenses
- No custom split amounts (always even split)
- No user profile/settings page
- No way to leave or delete household
- Cannot demote admins back to members
- No settle up flow (balances are auto-calculated, no formal settlement)
- No expense search
- No notifications/reminders for unpaid bills

### Technical Debt
- Loading states could be improved in some areas
- Error handling could be more comprehensive
- Some optimistic UI updates implemented, could expand
- No automated tests
- Balance calculation happens on-demand (could be cached for performance)

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.divwelly.com

# Optional: LoggerLizard Analytics
NEXT_PUBLIC_LOGGERLIZARD_API_KEY=llz_pub_your_key_here
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
See `MVP-REQUIREMENTS.md` for detailed real-world use case.
See `MONETIZATION.md` for business strategy, pricing, and growth plans.

**Product Vision:**
1. **Phase 1 (Weeks 1-3):** MVP for our household - payment tracking, recurring expenses, core features
2. **Phase 2 (Months 1-2):** React Native mobile app (iOS + Android)
3. **Phase 3 (Months 2-3):** Launch free + paid tiers (£5/month consumer, £30/month landlords)
4. **Phase 4 (Months 3-6):** Scale - target landlord market, marketing push

**Immediate Priority (Tomorrow):**
1. Individual payment tracking (who has/hasn't paid each expense)
2. Mark as paid + upload receipt screenshot
3. Recurring expenses (auto-create rent/bills monthly)

**Monetization Strategy:**
- Free tier: 1 household, basic features
- Pro tier: £5/month - unlimited households, analytics, exports
- Landlord tier: £30/month - multi-property dashboard, payment reminders, tenant portal
- Revenue goal: £5k MRR by Month 12
