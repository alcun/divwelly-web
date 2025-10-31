# Bug Fixes - Testing Round 1

## ✅ Fixed Issues

### 1. Non-admins seeing Promote button
**Issue:** All users could see the "Promote" button on member profiles
**Fix:** Added role check: `{currentUserRole === 'admin' && member.role === 'member' && ...}`
**File:** `app/household/[id]/household-client.tsx:630`

### 2. Non-admins able to edit household info
**Issue:** "Edit Info" button visible to all members
**Fix:** Added admin-only condition: `{currentUserRole === 'admin' && ...}`
**File:** `app/household/[id]/household-client.tsx:518`

### 3. Modal not closing after failed household update
**Issue:** When household info update failed, modal stayed open with isSubmitting=true
**Fix:** Added `setError('')` in success path to clear errors properly
**File:** `app/household/[id]/household-client.tsx:929`

### 4. Non-admins seeing other people's "Mark as Paid" buttons
**Issue:** Users could see mark-as-paid buttons for other people's payments
**Fix:** Added user ID check: `{!payment.isPaid && payment.user.id === currentUserId && ...}`
**Bonus:** Added "UNPAID" badge for other people's unpaid payments
**File:** `app/household/[id]/household-client.tsx:720-735`

### 5. "Paid by" changed to "Created by"
**Issue:** "Paid by Alice" was confusing - Alice didn't pay, she created the expense
**Fix:** Changed label to "Created by {expense.paidByName}"
**File:** `app/household/[id]/household-client.tsx:691`

### 6. Pass current user info to client
**Issue:** Client component didn't know current user ID or role
**Fix:**
- Fetch session from `/api/auth/get-session` in parallel
- Determine user's role from members list
- Pass `currentUserId` and `currentUserRole` props to client component
**Files:**
- `app/household/[id]/page.tsx:19-111`
- `app/household/[id]/household-client.tsx:71-87`

## 🔍 Still Investigating

### 1. Paid status disappearing on refresh
**Status:** BY DESIGN - payment status is only loaded when expense is expanded
**Behavior:** User needs to re-expand expense after page refresh to see payment status
**Impact:** Low - this is for performance (don't load all payment records upfront)
**Possible Fix:** Could pre-load payment status for all expenses, but would slow down initial page load

### 2. Recurring bills generation error
**Status:** Unable to reproduce - API endpoint looks correct
**Next Steps:** Need specific error message from testing
**Possible Causes:**
- No members in household (handled with `if (members.length === 0) continue`)
- No recurring expenses due for generation
- Frequency logic not matching expected behavior

### 3. React hydration error (minified)
**Error:** `Minified React error #418`
**Status:** Need to test in production with source maps
**React Error #418:** "Hydration failed because the server rendered HTML didn't match the client"
**Possible Causes:**
- Different data between server and client render
- Using browser-only APIs during SSR
- Date formatting differences between server/client
- Conditional rendering based on client-side state

**Next Steps:** Check production console for full error details

## 📝 Not Addressed

### Expense description/notes field
**Issue:** No description box - "Write something about this expense"
**Status:** Not implemented - requires schema changes
**Would Need:**
1. Add `notes` column to `expenses` table
2. Update API schema and endpoints
3. Add notes textarea to expense form
4. Display notes in expense details

## 🧪 Testing Checklist

Run these tests again with the fixes:

- [ ] Non-admin logs in → Should NOT see "Edit Info" button
- [ ] Non-admin → Should NOT see "Promote" button on members
- [ ] Non-admin expands expense → Should only see "Mark as Paid" on their own payments
- [ ] Non-admin tries to edit household info (via API) → Should get 403 error
- [ ] Admin edits household info with error → Modal should close button after error clears
- [ ] Check expense list shows "Created by X" not "Paid by X"
- [ ] Mark payment as paid → Check it persists (expand expense again after refresh)
- [ ] Try recurring bill generation → Note exact error message

## 🚀 Deployment

Both API and Web have changes:

**API Changes:**
- Updated CORS to include `https://api.divwelly.com`
- Enhanced CORS headers for better cross-origin support

**Web Changes:**
- Permission-based UI rendering
- Fetch current user session for role/ID
- All button visibility fixes
- Label improvements

Deploy commands:
```bash
# API
cd divwelly-api
git add .
git commit -m "Fix CORS for production API domain"
git push

# Web
cd divwelly-web
git add .
git commit -m "Fix permission issues, hide buttons from non-admins, improve UX labels"
git push
```
