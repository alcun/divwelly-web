# Divwelly Product Requirements Document 🏠

**Vision:** The simplest, most honest household expense tracker. No complexity, no games, just clear visibility into who paid what.

**Last Updated:** Nov 8, 2025

---

## Competitive Positioning

### vs Splitwise (Market Leader)
**Their weakness:** Overcomplicated UI, designed for friends splitting occasional dinners, not housemates with recurring bills
**Our advantage:**
- ✅ Built specifically for housemates (recurring bills front and center)
- ✅ Cleaner, brutalist design (zero fluff)
- ✅ Payment tracking per month (see who paid Rent in November vs October)
- ✅ No social features (pure expense tracking)
- 📊 **Missing:** Debt simplification, IOU tracking across multiple groups

**Price:** Splitwise is free (ads) or $3/month Pro
**Our sweet spot:** Free for core features, premium for automation (bank integration, receipts, WhatsApp bot)

---

### vs Flatastic (Roommate Apps)
**Their strength:** Chores, shopping lists, cleaning schedules, social features
**Our advantage:**
- ✅ Focused on ONE thing (money) - no feature bloat
- ✅ Better payment tracking (monthly recurring bills)
- ✅ Faster, cleaner UX
- ✅ Payment transparency (social pressure to pay up)
- 📊 **Missing:** Chores, shopping lists, cleaning schedules

**Price:** Flatastic is free (ads) or €2.50/month Pro
**Our niche:** Housemates who just want to track expenses, nothing else

---

### vs Tricount (Trip Expense Tracking)
**Their strength:** Great for trips, groups, events
**Our advantage:**
- ✅ Designed for long-term living situations
- ✅ Recurring bills (Rent, Council Tax, Utilities)
- ✅ Payment info integrated (account numbers, references)
- ✅ Monthly tracking (see payment history over time)
- 📊 **Missing:** Trip-specific features, multi-currency

**Price:** Tricount is free
**Our edge:** Built for housemates, not travelers

---

### vs Google Sheets (DIY Solution)
**Their weakness:** Manual, ugly, no automation, easy to mess up formulas
**Our advantage:**
- ✅ Beautiful clean UI
- ✅ Automatic calculations
- ✅ Real-time updates for all housemates
- ✅ Mobile-friendly
- ✅ Payment status tracking
- ✅ No formulas to break
- 📊 **Missing:** Nothing - we win on every dimension

**Price:** Free (but requires manual work)
**Our edge:** Automatic, beautiful, mobile-friendly

---

## Key Differentiators (Why We Win)

### 1. Built for Housemates, Not Friends
- **Recurring bills front and center** - Rent, Council Tax, Utilities (not buried in modals)
- **Monthly payment tracking** - See who paid what each month
- **Payment info** - Account details, references, due dates
- **Appeals to:** Housemates with regular bills, not friends splitting occasional dinners

### 2. Payment Transparency (Social Pressure Works)
- **Everyone sees who paid** - No hiding, no excuses
- **UNPAID badges** - Clear visibility when someone hasn't paid
- **Admin controls** - Mark others as paid when they pay cash
- **Trust-based** - Assumes honesty, makes lying embarrassing

### 3. Brutalist Design Philosophy
- **Clean & simple** - Zero distractions, just the bills
- **No social features** - No chat, no likes, no comments
- **Fast** - No loading, instant updates
- **Honest** - No dark patterns, no upsells

### 4. Monthly Payment Tracking
- **Unique feature** - See payment history month by month
- **Recurring bills** - Don't re-enter Rent every month
- **Track trends** - Who consistently pays late?
- **No competitor has this** - Splitwise treats every bill as one-off

---

## Product Roadmap

### Phase 1: MVP (CURRENT - Real User Testing)
**Goal:** Get 5 households using it, validate core concept

**Core Features:**
- [x] Recurring bills (Rent, Council Tax, Utilities)
- [x] Monthly payment tracking (mark as paid per month)
- [x] Payment info (account details, references, due dates)
- [x] One-off expenses (groceries, shared items)
- [x] Automatic split calculation
- [x] Better Auth (email/password)
- [x] Household creation + invite codes
- [x] Admin controls (promote members, manage bills)
- [x] Edit/delete expenses
- [x] Payment status transparency
- [ ] Test with real housemates (IN PROGRESS)
- [ ] Fix bugs from real usage
- [ ] Polish based on feedback

**Success Metrics:**
- 5 active households using it daily
- 90%+ bills marked as paid within 7 days
- <5 bugs reported in first month
- Users say "this is so much better than Splitwise"

---

### Phase 2: Quick Wins (Month 1-2)
**Goal:** Make it sticky, add features users ask for

**Features:**
- [ ] Shopping list (coordinate purchases, mark as bought)
- [ ] House notes (announcements, reminders)
- [ ] Receipt uploads (proof of payment via camera)
- [ ] Payment reminders (2 days before due date)
- [ ] "Overdue" badges for late payments
- [ ] Monthly summary export (PDF/CSV)

**Target:**
- 15 active households
- Users invite other households organically
- Feature requests = product-market fit

---

### Phase 3: Automation (Month 2-3)
**Goal:** Reduce friction, automate everything

**Features:**
- [ ] WhatsApp bot (send receipt → auto-add expense)
- [ ] WhatsApp reminders ("Rent due tomorrow")
- [ ] Mark as paid via WhatsApp reply
- [ ] Push notifications (web + mobile)
- [ ] Quick actions ("Split £50" button)
- [ ] Common amounts (£10, £20, £50, £100)

**Target:**
- 50 active households
- 70%+ payments marked automatically
- Users say "I barely open the app, it just works"

---

### Phase 4: Bank Integration (Month 3-6)
**Goal:** Full automation, compete with premium apps

**Features:**
- [ ] Monzo/Revolut integration (Open Banking API)
- [ ] Auto-mark as paid when transaction detected
- [ ] Match "RENT" → Rent bill automatically
- [ ] Transaction categorization
- [ ] Smart suggestions ("This looks like groceries")
- [ ] Learn patterns over time

**Target:**
- 200 active households
- 90%+ payments auto-detected
- First revenue from premium tier

---

### Phase 5: Mobile App (Month 6-12)
**Goal:** Native experience, app store presence

**Features:**
- [ ] Expo mobile app (React Native)
- [ ] Native push notifications
- [ ] Camera for receipts
- [ ] Face ID/Touch ID
- [ ] Offline support
- [ ] App Store + Google Play submission

**Target:**
- 1,000 active households
- 4.5+ star rating
- Featured in App Store (Finance category)

---

## Growth Strategy

### Month 1: Real User Validation
**Goal:** 5 households, honest feedback

**Tactics:**
- Test with real housemate (HAPPENING NOW)
- Share with friends in shared houses
- Post in local Facebook housing groups
- Ask for brutal feedback

**Content:**
- Demo video (30 seconds, show payment tracking)
- Simple landing page (explain recurring bills)
- Screenshots of clean UI

---

### Month 2: Organic Growth
**Goal:** 15 households, word of mouth

**Channels:**
- **Reddit:** r/UKPersonalFinance, r/HouseShare
- **Facebook Groups:** Local housing groups, uni accommodation
- **Twitter/X:** "Built a better Splitwise for housemates"
- **Indie Hackers:** "How I'm solving my own housemate money drama"

**Messaging:**
- "Splitwise is for friends. Divwelly is for housemates."
- "See who actually paid rent this month"
- "No more awkward 'did you pay yet?' messages"

---

### Month 3-6: Content & SEO
**Goal:** 100 households, inbound traffic

**SEO Keywords:**
- "house share expense tracker"
- "roommate bill splitting app"
- "recurring bills tracker"
- "housemate payment tracking"
- "better than Splitwise for housemates"

**Content:**
- Blog: "Why Splitwise isn't built for housemates"
- Blog: "How to split rent fairly (calculator included)"
- Blog: "Awkward money conversations with housemates (solved)"
- YouTube: App tour + setup guide

**Partnerships:**
- University accommodation offices
- Property management companies
- Housemate matching services
- Student unions

---

## Technical Roadmap

### Current Stack (MVP)
- [x] Next.js 15 + React 19
- [x] Better Auth (email/password)
- [x] PostgreSQL (Neon serverless)
- [x] Drizzle ORM
- [x] Server Actions (no API routes)
- [x] Brutalist UI (clean, fast)
- [x] Deployed on Coolify

### Phase 2: Performance
- [ ] Optimistic UI updates (instant feedback)
- [ ] Real-time sync (WebSockets or Pusher)
- [ ] Mobile responsive polish
- [ ] PWA support (add to home screen)

### Phase 3: Integrations
- [ ] WhatsApp Business API
- [ ] Twilio for SMS reminders
- [ ] Open Banking API (TrueLayer or Plaid)
- [ ] Cloudinary for receipt storage

### Phase 4: Scale
- [ ] Horizontal scaling (multiple servers)
- [ ] Redis caching (session + data)
- [ ] CDN for static assets
- [ ] Database read replicas

---

## Revenue Projections

### Conservative (Freemium, 5% conversion)
- Month 3: 15 households → 1 premium = $5
- Month 6: 50 households → 3 premium = $15
- Month 12: 200 households → 10 premium = $50

### Realistic (Bank integration, 15% conversion)
- Month 6: 50 households → 8 premium = $80
- Month 9: 100 households → 15 premium = $150
- Month 12: 200 households → 30 premium = $300

### Optimistic (Viral growth, 25% conversion)
- Month 6: 200 households → 50 premium = $500
- Month 9: 500 households → 125 premium = $1,250
- Month 12: 1,000 households → 250 premium = $2,500

**Target:** Realistic scenario = $150-300 in first year (validates concept)

---

## Monetization Strategy

**Free Tier (Core Features):**
- Unlimited recurring bills
- Unlimited one-off expenses
- Monthly payment tracking
- Up to 6 housemates per household
- Basic payment info
- Community support

**Premium Tier ($5/month per household):**
- Bank integration (auto-detect payments)
- WhatsApp bot (send receipts, get reminders)
- Receipt uploads (unlimited storage)
- Payment reminders (push + SMS)
- Monthly summaries (PDF export)
- Priority support
- Up to 12 housemates

**Why it works:**
- Free tier is genuinely useful (not crippled)
- Premium tier saves serious time (worth $5/month)
- Household pays once, everyone benefits
- Bank integration is killer feature

---

## Success Metrics

### Product KPIs
- [ ] Payment completion rate >90% (users mark as paid)
- [ ] Average time to pay <3 days after due date
- [ ] Daily active users >30% of households
- [ ] Retention rate >80% month-over-month

### Business KPIs
- [ ] 5 active households by Week 2
- [ ] 50 active households by Month 3
- [ ] 15% free-to-premium conversion by Month 6
- [ ] 4.5+ star rating (if on app stores)

### Growth KPIs
- [ ] 50+ daily active users by Month 3
- [ ] 1,000+ total bills tracked
- [ ] 20+ social media mentions
- [ ] 10+ organic referrals per month

---

## Risks & Mitigation

### Product Risks
**Risk:** People prefer informal tracking (WhatsApp groups, verbal agreements)
**Mitigation:** Make app EASIER than WhatsApp (WhatsApp bot integration)

**Risk:** Awkward social dynamics (embarrassing to chase payments)
**Mitigation:** Make transparency the default (everyone sees status, no chasing needed)

**Risk:** Too simple = looks unfinished
**Mitigation:** Polish UI, add delightful micro-interactions, professional branding

### Business Risks
**Risk:** Hard to monetize (people won't pay for expense tracking)
**Mitigation:** Bank integration is premium feature worth paying for

**Risk:** Splitwise dominates market awareness
**Mitigation:** Niche down (housemates only), content marketing (SEO)

**Risk:** Requires critical mass (need multiple housemates)
**Mitigation:** Solo user can invite housemates, provide value immediately

### Technical Risks
**Risk:** Bank integration fails (Open Banking API issues)
**Mitigation:** Start with manual tracking, bank integration is bonus

**Risk:** WhatsApp bot gets blocked
**Mitigation:** Use official WhatsApp Business API (costs money but reliable)

---

## Next Steps (This Week)

1. **Real User Testing** (TODAY)
   - User testing with real housemate
   - Add real bills (Rent, Council Tax)
   - Get honest feedback
   - Find UX friction points

2. **Bug Fixes** (1-2 days)
   - Fix any issues found in testing
   - Polish UX based on feedback
   - Add missing features if critical

3. **Iterate** (1 week)
   - Shopping list if requested
   - House notes if useful
   - Receipt uploads if needed
   - Get 2-3 more households

4. **Launch Prep** (1 week)
   - Create landing page (divwelly.com)
   - Write App Store description
   - Take screenshots
   - Record demo video

**Total:** 2-3 weeks to launch publicly

---

## Long-Term Vision (2-3 Years)

**Year 1:** 500 active households, 50 premium users ($250 MRR), 4.5+ rating
**Year 2:** 5,000 households, 750 premium users ($3,750 MRR), bank integration working
**Year 3:** 20,000 households, 3,000 premium users ($15,000 MRR), acquisition interest

**Exit Strategy:**
- Ideal acquirer: Monzo/Revolut (add to their ecosystem)
- Alternative: Property tech company (SpareRoom, Rightmove)
- Bootstrap option: Keep profitable, passive income ($10k+ MRR)

---

**Housemates need honesty about money. We're building the anti-Splitwise.** 🏠💰
