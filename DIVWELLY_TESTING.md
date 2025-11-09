# Divwelly Ground-Up Testing Script

**Goal:** Verify everything works end-to-end with fresh database

---

## 🗄️ Step 0: Reset Database

```bash
# SSH into your server (or local)
psql -U postgres -d [your-db-name]

# Run the reset script
\i /path/to/divwelly-api/scripts/reset-db.sql

# Or manually:
TRUNCATE TABLE expense_payments CASCADE;
TRUNCATE TABLE expenses CASCADE;
TRUNCATE TABLE recurring_expenses CASCADE;
TRUNCATE TABLE household_members CASCADE;
TRUNCATE TABLE households CASCADE;
TRUNCATE TABLE session CASCADE;
TRUNCATE TABLE account CASCADE;
TRUNCATE TABLE verification CASCADE;
TRUNCATE TABLE "user" CASCADE;

# Verify clean state
SELECT COUNT(*) FROM "user";  -- Should be 0
SELECT COUNT(*) FROM households;  -- Should be 0
```

---

## 👤 Step 1: Create First User (You)

**URL:** `https://divwelly.com/login` (or your domain)

1. Click "Sign Up"
2. Enter:
   - Name: `Alice`
   - Email: `alice@example.com`
   - Password: `password123`
3. Submit
4. ✅ Should redirect to `/dashboard`

**Take Note:**
- User ID: ___________
- Session works: YES / NO

---
STATUS: Signed off and working

## 🏠 Step 2: Create Household

**On Dashboard:**

1. Click "Create Household"
2. Enter:
   - Name: `123 Main Street`
3. Submit
4. ✅ Should redirect to household page

**Take Note:**
- Household ID: ___________
- Invite Code: ___________
STATUS: Signed off and working

---

## 📝 Step 3: Add Household Info (Optional)

1. Click "Edit Info"
2. Fill in:
   - Address: `123 Main Street`
   - Postcode: `SW1A 1AA`
   - WiFi Name: `MyWiFi`
   - WiFi Password: `supersecret`
   - Bin Collection: `Tuesdays - Blue bin / Thursdays - Green bin`
3. Save
4. ✅ Info displays correctly
5. ✅ WiFi password hidden by default
STATUS: Signed off and working

---

## 💰 Step 4: Add Recurring Bills

**Add Rent:**
1. Click "Add Bill" (or empty state button)
2. Enter:
   - Description: `Rent`
   - Amount: `895`
   - Frequency: `Monthly`
   - Day of Month: `6`
   - Start Date: `2025-11-01`
   - Notes: `Pay to landlord
   Account: 12-34-56 / 12345678
   Reference: RENT NOV`
3. Submit
4. ✅ Bill appears on main page
5. ✅ Shows "Total: £895.00" and "Your Share: £895.00" (1 person)
6. ✅ Payment notes visible

**Add Council Tax:**
1. Add another bill
2. Enter:
   - Description: `Council Tax`
   - Amount: `165`
   - Frequency: `Monthly`
   - Day of Month: `1`
   - Notes: `Pay online at city.gov.uk/counciltax
   Reference: Property 123MAIN`
3. ✅ Both bills now showing

**Take Note:**
- Rent shows correctly: YES / NO
- Council tax shows correctly: YES / NO
- Your share = full amount (solo): YES / NO

---
STATUS: Signed off and working

**Answer to reset question:** YES - Payment status automatically resets each month. The system tracks payments by month (stored as YYYY-MM-01), so when a new month starts, there are no payment records for that month yet. Everyone will show as UNPAID until they mark their portion as paid for the new month. 
## 👥 Step 5: Add Second Member

**Open Incognito/Different Browser:**

1. Go to signup: `https://divwelly.com/login`
2. Sign up:
   - Name: `Bob`
   - Email: `bob@example.com`
   - Password: `password123`
3. On dashboard, click "Join Household"
4. Enter invite code from Step 2: ___________
5. ✅ Should join and see household page

**Check Bob's View:**
- ✅ Sees both recurring bills
- ✅ Rent share: £447.50 (£895 / 2)
- ✅ Council tax share: £82.50 (£165 / 2)
- ✅ Payment notes visible
- ✅ Can see Alice in members list
- ✅ Shows "member" role

**Check Alice's View (refresh):**
- ✅ Sees Bob in members list
- ✅ Shares recalculated: £447.50 and £82.50

---
STATUS: Signed off and working

## 💸 Step 6: Add One-Off Expense

**As Alice:**

1. Click "Add Expense"
2. Enter:
   - Description: `Groceries - Tesco`
   - Amount: `60.50`
   - Due Date: (today)
3. Submit
4. ✅ Expense appears in "Recent Expenses"
5. ✅ Shows "Created by Alice"
6. ✅ Amount: £60.50

**Expand the expense:**
1. Click the expense to expand
2. ✅ Shows payment status for both:
   - Alice: £30.25 - UNPAID
   - Bob: £30.25 - UNPAID

---

## ✅ Step 7: Mark Payments as Paid

**As Bob (in incognito):**

1. Refresh household page
2. Find "Groceries" expense
3. Click to expand
4. ✅ See Bob's portion: £30.25 - UNPAID
5. Click "Mark as Paid"
6. ✅ Status changes to PAID ✅
7. ✅ Alice's portion still shows UNPAID

**As Alice:**
1. Refresh page
2. Expand Groceries expense
3. ✅ Bob's payment shows PAID ✅
4. ✅ Alice's payment shows UNPAID with "Mark as Paid" button
5. Click "Mark as Paid"
6. ✅ Both now show PAID ✅


ISSUE - paid updates but dissappears on refresh - not liek with recurring bill
---

## 📊 Step 8: Check Balances

**On household page:**

1. Scroll to "Balances" section
2. After both marked Groceries as paid:
   - ✅ Balances should be zero (both paid their shares)

**Add another expense (as Bob):**
1. Add expense: `Pizza - £24`
2. Only Alice marks as paid (Bob doesn't)
3. ✅ Balances should show: "Bob owes Alice £12.00"

---

## ✏️ Step 9: Edit Expense

**As Alice (expense creator):**

1. Expand any expense Alice created
2. Click "Edit"
3. Change:
   - Description: `Groceries - Tesco Weekly Shop`
   - Amount: `65.00`
4. Save
5. ✅ Changes appear immediately
6. ✅ Shares recalculated: £32.50 each

---


ISSUE: there is a problem with edit - the amount so liek 250 quid shows as 0.25

## 🗑️ Step 10: Delete Expense

**As Alice:**

1. Expand expense
2. Click "Delete"
3. Confirm
4. ✅ Expense removed from list
5. ✅ Balances recalculate

---

## 👑 Step 11: Promote Member

**As Alice (admin):**

1. Go to Members section
2. Find Bob
3. ✅ "Promote" button visible next to Bob
4. Click "Promote"
5. Confirm
6. ✅ Bob's badge changes from "member" to "admin"

**As Bob (refresh):**
- ✅ Can now see "Edit Info" button
- ✅ Can now see "Add Bill" button
- ✅ Can delete recurring bills

---

## 🐛 Step 12: Edge Cases

### Test Permissions
**As Bob (now admin):**
- ✅ Can delete recurring bill
- ✅ Can add recurring bill
- ✅ Can edit household info

### Test 3+ Members
1. Add third user "Charlie"
2. ✅ Rent share: £298.33 (£895 / 3)
3. ✅ All three see correct shares

### Test Mobile
1. Open on phone
2. ✅ Layout responsive
3. ✅ All buttons accessible
4. ✅ Forms work on mobile

---

## 📋 BUGS FOUND

| Bug | Severity | Steps to Reproduce | Fixed? |
|-----|----------|-------------------|--------|
|     |          |                   | [ ]    |
|     |          |                   | [ ]    |
|     |          |                   | [ ]    |

---

## 🎯 FEATURE FEEDBACK

**What worked great:**
-

**What was confusing:**
-

**What's missing:**
-

**Ideas for improvement:**
-

---

## ✨ NOTES FOR NEXT SESSION

**What to fix:**
1.
2.
3.

**What to build next:**
1.
2.
3.

---

## 🚀 DEPLOYMENT CHECKLIST

Before sending to housemate:

- [ ] All core flows tested
- [ ] No critical bugs
- [ ] Mobile works well
- [ ] At least 2 recurring bills set up with payment info
- [ ] Invite code ready to share
- [ ] Quick demo prepared: "Sign up → Join with this code → See what you owe"

---

**Testing Date:** ___________
**Tested By:** ___________
**Result:** PASS / FAIL / NEEDS WORK
