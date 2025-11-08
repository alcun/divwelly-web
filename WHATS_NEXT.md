# What's Next? 🏠

**Copy this to start your next session:**

---

Hey Claude! Let's continue building Divwelly 🏠

**Current Status:**
✅ Core features complete (recurring bills, payment tracking, splits)
✅ Better Auth integrated (email/password)
✅ Monthly payment tracking working
🧪 Real user testing happening NOW

**The Challenge:**
Housemates hate awkward money conversations. We're making it embarrassingly easy to track who paid what, with full transparency.

**Live Version:**
- Web: `cd divwelly-web && npm run dev` (http://localhost:3000)
- API: `cd divwelly-api && bun dev` (http://localhost:3001)

**Next Priorities:**

1. **Get real user feedback** - User testing with housemate in progress
2. **Fix bugs** - Address any issues found during testing
3. **Polish UX** - Improve based on real usage patterns
4. **Shopping list** - If users request it (coordinate purchases)
5. **House notes** - If needed (announcements, reminders)
6. **Receipt uploads** - Camera capture for proof of payment

**Project Structure:**
```
divwelly-web/           # Next.js 15 frontend
├── app/               # App router pages
│   ├── (auth)/       # Login, signup
│   ├── dashboard/    # Main app
│   └── household/    # Household page
├── lib/              # Auth, DB, utils
├── PRD.md            # Product strategy (READ THIS!)
└── WHATS_NEXT.md     # This file

divwelly-api/          # Hono backend (legacy, being replaced)
```

**Key Files:**
- `PRD.md` - Product vision, competitive analysis, roadmap
- `app/household/[id]/page.tsx` - Main household page
- `lib/auth.ts` - Better Auth setup
- `DIVWELLY_STATUS.md` - Testing checklist

What should we build?

---

**Last Updated:** Nov 8, 2025
