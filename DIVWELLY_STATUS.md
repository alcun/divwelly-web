# Divwelly - Status & Roadmap

**Last Updated:** 2025-11-06
**Status:** 🚀 Ready for Real-World Testing

---

## ✅ COMPLETED (Ready for Testing)

### Core Features Working
- ✅ **Recurring Bills** - Front and center on household page (NOT in modal!)
- ✅ **Payment Tracking** - Mark individual portions as paid
- ✅ **Edit/Delete Expenses** - Full CRUD for expenses
- ✅ **Payment Notes** - Add payment instructions to recurring bills
- ✅ **Split Calculation** - Automatic per-person share calculation
- ✅ **Better Auth** - Email/password authentication
- ✅ **Admin Controls** - Promote members, manage bills
- ✅ **No Generate Button** - Simplified UX, just see what you owe

### UX Improvements
- ✅ Recurring bills show YOUR SHARE prominently
- ✅ Payment info displayed clearly (account details, references)
- ✅ Auto-load recurring expenses on page mount
- ✅ Clean, brutalist design
- ✅ Mobile-friendly responsive layout

---

## 🧪 TESTING CHECKLIST (Ground-Up Audit)

### 1. Authentication Flow
- [ ] Sign up new account
- [ ] Login with existing account
- [ ] Logout and login again
- [ ] Session persists across page refreshes

### 2. Household Creation
- [ ] Create new household
- [ ] Household shows on dashboard
- [ ] Invite code is generated
- [ ] Can view household details

### 3. Member Management
- [ ] Second user signs up
- [ ] Second user joins via invite code
- [ ] Both members show in household
- [ ] Admin can promote member
- [ ] Promoted member has admin controls

### 4. Recurring Bills (The Core Feature!)
- [ ] Admin adds recurring bill (Rent - £895, 6th of month)
- [ ] Add payment notes: "Pay to John's account: XX-XX-XX"
- [ ] Both members see the bill
- [ ] Correct share calculated (£895 / 2 = £447.50)
- [ ] Payment info displays correctly
- [ ] Admin can delete recurring bill

### 5. Expenses & Payment Tracking
- [ ] Add one-off expense (Groceries - £50)
- [ ] Expense splits correctly between members
- [ ] Expand expense to see payment status
- [ ] Each member sees "Mark as Paid" for their portion
- [ ] Mark payment as paid
- [ ] Payment status updates immediately
- [ ] Other member sees "UNPAID" badge for unpaid portion
- [ ] Balances update correctly

### 6. Edit/Delete Expenses
- [ ] Click Edit on expense
- [ ] Change description and amount
- [ ] Changes save and reflect immediately
- [ ] Delete expense
- [ ] Expense removed from list
- [ ] Balances recalculate

### 7. Household Info
- [ ] Admin adds household info (address, WiFi, etc)
- [ ] Info saves correctly
- [ ] WiFi password hidden by default
- [ ] Non-admin can view but not edit

### 8. Balances
- [ ] Balances calculate correctly after expenses
- [ ] Shows "Alice owes Bob £X"
- [ ] Updates after marking payments as paid

---

## 🚀 HOW TO MAKE THIS AMAZING

### Quick Wins (1-2 hours each)
1. **Push Notifications** 📱
   - "Rent is due tomorrow - £298.33"
   - "Alice marked their payment as paid"
   - Use web push API (no app needed!)

2. **Payment Reminders**
   - Auto-remind unpaid members 2 days before due date
   - Show "Overdue" badge for late payments

3. **Receipt Uploads** 📸
   - Upload image when marking as paid
   - Quick camera capture on mobile
   - Store in S3 or Cloudinary

4. **Monthly Summary**
   - "November: You paid £895, your share was £850"
   - Export to PDF/CSV
   - Email monthly recap

5. **Quick Actions**
   - "Split £X" button at top
   - Common amounts: £10, £20, £50, £100
   - "I paid for everyone" mode

### Game Changers (Weekend Projects)

6. **WhatsApp Integration** 💬
   - Send expense receipt → auto-add to Divwelly
   - Bot reminds people to pay
   - "Mark as paid" via WhatsApp reply

7. **Bank Integration** 🏦
   - Connect to Monzo/Revolut
   - Auto-mark as paid when transaction detected
   - Match "RENT" → Rent bill

8. **Smart Suggestions** 🧠
   - "Rent is usually due 6th - add it now?"
   - "This looks like groceries - split with 2 people?"
   - Learn patterns over time

9. **Settle Up Flow** 💸
   - "You owe Alice £142.50"
   - → Generate payment link (PayPal/Venmo/Revolut)
   - → Mark as settled automatically

10. **Expo Mobile App** 📱
    - Native feel, push notifications
    - Camera for receipts
    - Face ID/Touch ID
    - App Store presence = credibility

### The Vision (What Makes It Sticky)

**Core Insight:** People hate chasing money. Make it EMBARRASSINGLY EASY to pay.

**The Flow Should Be:**
1. Get notification: "Rent due tomorrow"
2. Click notification → Opens app
3. See: "Your share: £298.33 - Pay to: John's account XX-XX-XX"
4. Click "Mark as Paid" → Upload receipt (optional)
5. Done. Everyone knows you paid.

**Social Pressure:**
- Everyone sees who paid, who hasn't
- No awkward conversations needed
- Visual indicators make it clear

**Delight Moments:**
- "All caught up! 🎉" when everything paid
- "You saved £50 this month vs last month"
- "3 months streak of paying on time 🔥"

---

## 🎯 IMMEDIATE PRIORITIES

### This Week
1. ⏳ Ground-up testing with real data
2. ⏳ Fix any bugs found during testing
3. ⏳ Get housemate using it (real user feedback!)

### Next Week (Quick Wins)
1. **Shopping List** 🛒 - Coordinate who buys what
2. **House Notes** 📝 - Pinboard for household info
3. **Receipt uploads** - Prove you paid (mobile camera)

### Month 1 (Game Changers)
1. **Smart Receipt Scanning** - Photo → Auto-add expense
2. **Payment Reminders** - Push notifications
3. **WhatsApp Integration** - Bot for reminders
4. Mobile app (Expo) for app store presence

---

## 🛒 NEXT FEATURE: Shopping List (1-2 hours)

### What It Does
Simple shared shopping list so you coordinate what to buy:
- "We need milk" (Alice adds)
- Bob sees it, buys it, ticks it off
- Optional: "Create expense from bought items" (£12 for 3 items)

### How It Works
**UI:**
- Small card on household page: "Shopping List (3 items needed)"
- Click to expand: checkboxes for each item
- Add item button, mark as bought button
- Shows who added, who bought

**Schema:**
```sql
CREATE TABLE shopping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  description text NOT NULL,
  added_by text REFERENCES "user"(id),
  bought_by text REFERENCES "user"(id),
  bought_at timestamp,
  created_at timestamp DEFAULT now()
);
```

**API:**
- GET /api/shopping-list/household/:id
- POST /api/shopping-list (description, householdId)
- PATCH /api/shopping-list/:id/buy (mark as bought)
- DELETE /api/shopping-list/:id

**The Vibe:**
- Simple checklist, NOT a discussion board
- No comments, no prices (until creating expense)
- Think: "kitchen whiteboard" not "group chat"

### Why This Feature?
1. You're already splitting groceries
2. Prevents "I didn't know we needed that"
3. Natural bridge to expenses (bought items → add expense)
4. Low complexity, high utility

---

## 📝 FEATURE AFTER THAT: House Notes (1 hour)

### What It Does
Pinboard for important household stuff:
- "Boiler repair Tuesday 2-4pm"
- "WiFi router is in cupboard under stairs"
- "Landlord inspection on 15th"

### How It Works
**UI:**
- Pinned notes at top (bright yellow card)
- Recent notes below (last 5)
- Add note button (admins only or everyone?)

**Schema:**
```sql
CREATE TABLE house_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  pinned boolean DEFAULT false,
  expires_at timestamp,
  created_by text REFERENCES "user"(id),
  created_at timestamp DEFAULT now()
);
```

**The Vibe:**
- Announcements, NOT discussions
- No replies, no threads
- Auto-delete after 30 days (or on expire date)
- Admin can delete trolling/spam

### Why This Feature?
1. Replaces chaotic WhatsApp group for official stuff
2. Info doesn't get buried in chat history
3. New housemates see important info immediately

---

## 💡 PRODUCT PRINCIPLES

1. **Zero Friction** - Less steps = more likely to actually use it
2. **Social Clarity** - Everyone knows who paid, no awkward DMs
3. **Trust Through Transparency** - All transactions visible to all members
4. **Mobile First** - 90% of use will be on phone
5. **Delight in Details** - Animations, celebrations, personality

---

## 📊 METRICS TO TRACK

- **Activation:** % users who add first recurring bill
- **Engagement:** % expenses marked as paid within 7 days
- **Retention:** % households active after 30 days
- **Viral:** Invites sent per household
- **Revenue:** Premium features (unlimited households, export, integrations)

---

## 🔥 COMPETITIVE EDGE

**vs Splitwise:**
- Splitwise is for splitting dinners, we're for **living together**
- Recurring bills = our killer feature
- Cleaner, simpler, more focused

**vs Venmo/PayPal:**
- They solve payments, we solve **knowing what you owe**
- We add context (rent, bills, groceries)
- We remind you to pay

**vs Spreadsheets:**
- lol come on

---

## 🚀 LAUNCH STRATEGY

### Phase 1: Friends & Family (Now)
- Get 3-5 households using it
- Fix bugs, gather feedback
- Learn what features matter most

### Phase 2: Reddit/Forums (Week 2)
- Post to r/UKPersonalFinance, r/HouseShare
- "Built a free app to track household bills"
- Offer to add features users want

### Phase 3: App Stores (Month 2)
- Launch Expo app
- App Store = legitimacy
- Push notifications = retention

### Phase 4: Universities (Month 3)
- Student houses = perfect market
- Facebook groups, notice boards
- "Stop chasing your housemates for rent"

---

## 💰 MONETIZATION (Later)

**Free Forever:**
- 1 household
- Unlimited bills & expenses
- Basic features

**Premium (£2.99/month):**
- Unlimited households
- Receipt uploads & storage
- Export to PDF/CSV
- Priority support
- Bank integration
- Custom reminders

**Target:** 1,000 users = £30-50/month (1-2% conversion)

---

## 🎬 NEXT SESSION PROMPT

```
Hey Claude! Continue Divwelly work.

Status:
✅ Recurring bills redesigned (front & center)
✅ Payment notes added
✅ DB cleared for testing
✅ Pushed to production

Now:
1. Help me test ground-up (use checklist in DIVWELLY_STATUS.md)
2. Fix any bugs we find
3. [Pick next feature based on testing feedback]

Working directory: /Users/alasdair/Desktop/git/divwelly-web
```

---

**Let's make this the app that solves household money awkwardness once and for all. 🏠💰**
