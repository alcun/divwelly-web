# Divwelly MVP Requirements

## Real-World Use Case (Your Household)

**Goal:** Get housemates to sign in, see what they owe, mark as paid, upload proof of payment.

### Current Expenses
- **Rent:** £895/month split 3 ways = £298.33/person (6th of each month, started June 6th, 12 months)
- **Internet:** Fixed amount, same day each month
- **Electricity:** Variable, start of each month
- **Council Tax:** £165/month split 3 ways = £55/person (start of each month)

---

## MVP Feature Priorities (In Order)

### 🔴 Critical - Must Have Before Launch

#### 1. Recurring Expenses ⭐⭐⭐
**Problem:** Have to manually add rent/internet/council tax every month
**Solution:**
- Add "Recurring" toggle when creating expense
- Set frequency: Monthly, Weekly, Yearly
- Set start date (e.g., 6th of month for rent)
- Set end date or "ongoing"
- System auto-creates expense on due date
- Show upcoming recurring expenses

**Backend:**
- New table: `recurring_expenses`
- Cron job or scheduled task to create expenses
- New endpoints: CRUD for recurring expenses

**Frontend:**
- Recurring expense setup form
- List of recurring expenses
- Edit/delete recurring expenses

---

#### 2. Individual Payment Tracking ⭐⭐⭐
**Problem:** Can't see who has/hasn't paid for each expense
**Solution:**
- Each expense shows 3 columns: Person | Amount Owed | Status (Paid/Unpaid)
- Members can mark their portion as "Paid"
- Upload screenshot/receipt when marking paid
- Admin sees who has/hasn't paid at a glance

**Backend:**
- New table: `expense_payments` (expense_id, user_id, amount, paid_at, receipt_url)
- New endpoint: `POST /api/expenses/:id/payments` (mark as paid + upload receipt)
- Update balances to reflect paid expenses
- File upload handling (S3 or local storage)

**Frontend:**
- Payment status table on each expense
- "Mark as Paid" button for each member
- Image upload for receipt
- Visual indicators (✓ paid, ✗ unpaid)

---

#### 3. Leave/Remove Members ⭐⭐
**Problem:** Members can't leave, admins can't remove people
**Solution:**
- "Leave Household" button for members
- "Remove Member" button for admins (on each member)
- Confirmation dialogs
- Check for unpaid balances before leaving (warning)

**Backend:**
- New endpoint: `POST /api/households/:id/leave`
- New endpoint: `DELETE /api/households/:id/members/:memberId` (admin only)
- Update `householdMembers.isActive` instead of deleting (keep history)
- Recalculate balances after removal

**Frontend:**
- Leave button in settings/profile
- Remove button next to each member (admin only)
- Confirmation modals

---

### 🟡 Important - Nice to Have

#### 4. Edit/Delete Expenses ⭐⭐
**Problem:** Can't fix mistakes
**Solution:**
- Edit expense (description, amount, date)
- Delete expense (with confirmation)
- Only creator or admin can edit/delete
- Recalculate balances after changes

---

#### 5. Expense Categories ⭐
**Problem:** Can't organize expenses
**Solution:**
- Fixed categories: Rent, Utilities, Groceries, Bills, Other
- Color-coded badges
- Filter expenses by category
- Monthly summary by category

---

#### 6. Date Filtering ⭐
**Problem:** Can't see monthly breakdown
**Solution:**
- Month selector (Jan 2025, Feb 2025, etc.)
- Show expenses for selected month
- Total spent for that month
- Outstanding payments for that month

---

### 🟢 Optional - Future

#### 7. Notifications
- Email when expense added
- Reminder when payment due
- Notification when someone marks as paid

#### 8. Settle Up
- Record direct payments between members
- "I paid John £50"

---

## MVP Data Model Changes

### New Tables Needed

#### expense_payments
```sql
CREATE TABLE expense_payments (
  id uuid PRIMARY KEY,
  expense_id uuid REFERENCES expenses(id),
  user_id text REFERENCES user(id),
  amount integer NOT NULL, -- in pence
  paid_at timestamp,
  receipt_url text,
  created_at timestamp DEFAULT now()
);
```

#### recurring_expenses
```sql
CREATE TABLE recurring_expenses (
  id uuid PRIMARY KEY,
  household_id uuid REFERENCES households(id),
  description text NOT NULL,
  amount integer NOT NULL,
  frequency text NOT NULL, -- 'monthly', 'weekly', 'yearly'
  start_date date NOT NULL,
  end_date date,
  day_of_month integer, -- for monthly (1-31)
  day_of_week integer, -- for weekly (0-6)
  created_by text REFERENCES user(id),
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);
```

---

## Implementation Order (2-3 Weeks)

### Week 1: Individual Payment Tracking
**Why First:** Core to "see what you owe and mark as paid"
1. Create `expense_payments` table
2. Backend endpoints for marking paid + upload receipt
3. Frontend payment status UI
4. Receipt upload handling

### Week 2: Recurring Expenses
**Why Second:** Eliminate manual entry for rent/bills
1. Create `recurring_expenses` table
2. Admin UI to set up recurring expenses
3. Cron job to auto-create expenses
4. Edit/delete recurring expenses

### Week 3: Polish & Member Management
1. Leave/remove members
2. Edit/delete expenses
3. Categories & filtering
4. Testing with real housemates

---

## MVP Success Criteria

✅ Housemates can sign in
✅ See all expenses for the month
✅ See exactly what they owe for each expense
✅ Mark their portion as paid
✅ Upload payment screenshot
✅ Admins see payment status at a glance
✅ Rent/bills auto-added each month
✅ No manual data entry needed

---

## Questions to Answer

1. **File storage:** Where to store receipt images? (S3, Cloudinary, or local?)
2. **Recurring expense conflicts:** What if someone already added this month's rent manually?
3. **Payment verification:** Should admin approve payments or trust uploads?
4. **Partial payments:** Allow paying less than full amount?
5. **Payment methods:** Track how they paid (bank transfer, cash, etc.)?

---

## Next Steps

Ready to start building? I recommend:
1. ✅ Start with **Individual Payment Tracking** (most critical)
2. ✅ Then **Recurring Expenses** (eliminate manual work)
3. ✅ Then **Leave/Remove Members** (basic hygiene)

Want to start on payment tracking? That's the foundation for everything else.
