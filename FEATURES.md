# Divwelly Features Roadmap

## Current State
✅ User authentication (sign up/login)
✅ Create/join households
✅ Add expenses
✅ View balances (who owes whom)
✅ View members
✅ Household info (address, postcode, WiFi, bins, emergency contacts, notes)
✅ Promote members to admin
✅ SSR implementation
✅ Brutalist design system

---

## Feature Ideas (Prioritized)

### 🟢 High Priority - Core Functionality

#### 1. Settle Up / Mark Balance as Paid
**Description:** Allow users to record payments between household members to settle debts.

**Frontend Work:**
- Add "Settle Up" button in balances section
- Modal to select who paid whom and amount
- Confirmation message
- Refresh balances after settlement

**Backend Work:**
- New endpoint: `POST /api/households/:id/settle`
- Create settlement transaction in database
- Recalculate balances after settlement
- Store settlement history

**Complexity:** Medium
**Impact:** High - Core feature for the app

---

#### 2. Edit/Delete Expenses
**Description:** Let users modify or remove expenses they created.

**Frontend Work:**
- Add edit/delete buttons to expense items (only for creator)
- Edit modal (pre-filled with existing data)
- Confirmation dialog for delete
- Optimistic UI updates

**Backend Work:**
- New endpoint: `PATCH /api/expenses/:id`
- New endpoint: `DELETE /api/expenses/:id`
- Permission check (only creator or household admin can edit/delete)
- Recalculate balances after edit/delete

**Complexity:** Low-Medium
**Impact:** High - Users will make mistakes

---

#### 3. Expense History / Activity Feed
**Description:** Show a chronological view of all household activity (expenses added, settlements, members joined).

**Frontend Work:**
- New activity feed component
- Timeline view with icons for different event types
- Filter by date range
- Pagination or infinite scroll

**Backend Work:**
- New endpoint: `GET /api/households/:id/activity`
- Create activity log table (or query across expenses/settlements/members)
- Return paginated, sorted activity
- Include event types: expense_added, expense_edited, expense_deleted, settlement, member_joined

**Complexity:** Medium
**Impact:** Medium - Nice to have for transparency

---

### 🟡 Medium Priority - Quality of Life

#### 4. Expense Categories/Tags
**Description:** Organize expenses by category (groceries, utilities, rent, etc.)

**Frontend Work:**
- Category dropdown in add expense form
- Category filter/group on expenses page
- Color-coded category badges
- Summary by category

**Backend Work:**
- Add `category` field to expenses table
- Update expense endpoints to accept/return category
- New endpoint: `GET /api/households/:id/expenses/by-category` (summary)

**Complexity:** Low
**Impact:** Medium - Helps with organization

---

#### 5. Date Filtering / Monthly View
**Description:** Filter expenses by date range or view monthly summaries.

**Frontend Work:**
- Date range picker component
- Monthly view toggle
- Show total spent per month
- Chart/graph of spending over time (optional)

**Backend Work:**
- Update expenses endpoint to accept date filters: `?from=YYYY-MM-DD&to=YYYY-MM-DD`
- New endpoint: `GET /api/households/:id/expenses/monthly` (aggregated by month)

**Complexity:** Low-Medium
**Impact:** Medium - Useful for budgeting

---

#### 6. User Profile / Settings
**Description:** Let users update their name, email, password.

**Frontend Work:**
- New `/profile` or `/settings` page
- Forms for updating name, email, password
- Success/error messages

**Backend Work:**
- New endpoint: `PATCH /api/auth/profile`
- New endpoint: `PATCH /api/auth/password`
- Validation and password hashing
- Better Auth may already provide these

**Complexity:** Low
**Impact:** Low-Medium - Basic user management

---

#### 7. Invite Members by Email
**Description:** Send email invitations instead of just sharing invite codes.

**Frontend Work:**
- "Invite by Email" button in household members section
- Email input form
- Show pending invitations

**Backend Work:**
- New endpoint: `POST /api/households/:id/invite`
- Email sending service (SendGrid, Resend, etc.)
- Store pending invitations
- Email template with invite link

**Complexity:** Medium-High (requires email service)
**Impact:** Medium - Nicer UX than sharing codes

---

### 🔵 Lower Priority - Nice to Have

#### 8. Leave Household
**Description:** Allow members to leave a household.

**Frontend Work:**
- "Leave Household" button (with confirmation)
- Redirect to dashboard after leaving

**Backend Work:**
- New endpoint: `POST /api/households/:id/leave`
- Remove member from household
- Check if leaving would leave household empty (delete household?)
- Prevent leaving if user has unsettled debts (optional)

**Complexity:** Low
**Impact:** Low - Not frequently used

---

#### 9. Delete Household
**Description:** Allow household admins to delete a household.

**Frontend Work:**
- "Delete Household" button in settings (admin only)
- Strong confirmation dialog (type household name to confirm)
- Redirect to dashboard after deletion

**Backend Work:**
- New endpoint: `DELETE /api/households/:id`
- Permission check (only admin)
- Cascade delete all expenses, members, settlements

**Complexity:** Low
**Impact:** Low - Rarely needed

---

#### 10. Export to CSV
**Description:** Download expense history as CSV for personal records.

**Frontend Work:**
- "Export CSV" button
- Generate CSV client-side from expense data
- Trigger download

**Backend Work:**
- Optional: New endpoint: `GET /api/households/:id/expenses/export` (returns CSV)
- Or: Handle entirely client-side with existing data

**Complexity:** Low
**Impact:** Low - Nice for power users

---

#### 11. Recurring Expenses
**Description:** Set up expenses that repeat monthly (rent, subscriptions, etc.)

**Frontend Work:**
- "Recurring" checkbox in add expense form
- Select frequency (weekly, monthly, yearly)
- View/manage recurring expenses
- Show next occurrence date

**Backend Work:**
- New table: `recurring_expenses`
- Cron job to create expenses automatically
- New endpoints: CRUD for recurring expenses

**Complexity:** High (requires background jobs)
**Impact:** Medium - Helpful for predictable expenses

---

#### 12. Split Expenses Unevenly
**Description:** Allow custom split percentages or amounts per person.

**Frontend Work:**
- "Custom Split" option in add expense form
- Input for each member's share
- Validation (total must equal expense amount)

**Backend Work:**
- Update expense schema to support custom splits
- Store split data (expense_splits table)
- Update balance calculation logic

**Complexity:** High (major data model change)
**Impact:** Medium - More flexible but complex

---

#### 13. Mobile App (React Native)
**Description:** Build native iOS + Android apps for better mobile experience.

**Tech Stack:**
- React Native (Expo)
- Shared API (existing Hono backend)
- AsyncStorage for offline
- RevenueCat for subscriptions

**Mobile-Specific Features:**
- Camera integration (snap receipts)
- Push notifications (rent due, payment made)
- Face ID/Touch ID login
- Share sheet (invite via WhatsApp)
- Home screen widgets
- Offline mode

**Backend Work:**
- Push notification service (Firebase)
- App Store receipt validation
- Deep linking setup

**Complexity:** High (separate codebase)
**Impact:** High - Most users are mobile-first, app store presence critical for growth

**PWA Alternative (Stopgap):**
- Add manifest.json
- Service worker for offline
- Install prompt
- Much faster to implement, less native feel

---

#### 14. Push Notifications
**Description:** Notify users of new expenses, settlements, etc.

**Frontend Work:**
- Request notification permission
- Show notification when events occur
- Notification settings page

**Backend Work:**
- Store push tokens
- Send notifications when events happen
- Use service like Firebase Cloud Messaging

**Complexity:** High (requires notification service)
**Impact:** Low-Medium - Nice to have but not essential

---

## Recommended Next Steps (MVP Focus)

**See `MVP-REQUIREMENTS.md` for detailed real-world use case**
**See `MONETIZATION.md` for business strategy, pricing, and growth plans**

### Phase 1: Payment Tracking (Week 1) ⭐ CRITICAL
1. Individual payment tracking per expense
2. Mark as paid functionality
3. Upload payment receipt/screenshot
4. Payment status indicators

### Phase 2: Recurring Expenses (Week 2) ⭐ CRITICAL
1. Set up recurring expenses (rent, bills, etc.)
2. Auto-create expenses on schedule
3. Edit/delete recurring expenses
4. View upcoming recurring expenses

### Phase 3: Member Management (Week 3) ⭐ CRITICAL
1. Leave household functionality
2. Admin can remove/kick members
3. Edit/delete expenses
4. Expense categories

### Phase 4: Polish & Launch
1. Date filtering / monthly view
2. Better error handling
3. Loading states
4. Test with real housemates

### Phase 5: Advanced (Post-Launch)
1. Notifications (email/push)
2. Settle up (direct payments)
3. Export to CSV
4. Custom split amounts

---

## Technical Considerations

### Database Changes Needed
- New table: `settlements` (user_from, user_to, amount, date, household_id)
- New table: `activity_log` (or query existing tables)
- Add `category` to `expenses` table
- New table: `recurring_expenses` (if implemented)
- New table: `expense_splits` (if custom splits implemented)

### API Routes Needed
See individual features above for specific endpoints.

### Frontend State Management
- Consider adding more optimistic UI updates
- Add loading states for all actions
- Better error handling and recovery
- Consider React Query or similar for cache management

---

## Questions to Consider
1. **Which features are most important to you?**
2. **Do you want to tackle API work first or frontend first?**
3. **Should we add categories as a fixed list or allow custom categories?**
4. **For settlements - should we allow partial payments or full settlement only?**
5. **Should we track settlement history or just update balances?**

Let me know which features you want to prioritize and we'll start building!
