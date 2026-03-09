

## Enhance Provider Approval/Rejection Email Notifications

### Current State
The `notify-provider-approval` edge function already sends an approval email via Resend when the admin approves a provider. However, **no email is sent on rejection**, and the email could include more context (service category, coverage area).

### Plan

#### 1. Update Edge Function: `notify-provider-approval` → handle both approval and rejection

- Accept a new `status` field in the request body (`"approved"` or `"rejected"`)
- Fetch provider's service category name (join `provider_services` → `service_categories`) and coverage area for richer email content
- **Approval email**: Current professional template enhanced with the provider's registered service category and coverage area
- **Rejection email**: A respectful, professional template explaining the application was not approved, encouraging them to re-apply or contact support

#### 2. Update `AdminDashboard.tsx`

- Call `notify-provider-approval` for **both** approve and reject actions, passing `{ provider_user_id, status }` in the body

#### 3. Email Templates

**Approval email** (enhanced):
- Subject: "Congratulations! Your Provider Account is Approved – Home Hero"
- Body: Personalized greeting, confirmation of approval, their service category and coverage area, CTA to Provider Dashboard, support contact info

**Rejection email** (new):
- Subject: "Application Update – Home Hero"
- Body: Respectful tone, explanation that the application wasn't approved at this time, encouragement to update their profile and re-apply, support contact info

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/notify-provider-approval/index.ts` | Handle `status` param, add rejection email template, enhance approval template |
| `src/pages/AdminDashboard.tsx` | Pass `status` to the edge function for both approve and reject |

### No Database Changes Required
All needed data (profiles, provider_services, service_categories) is already accessible via the service role key in the edge function.

