
Goal: make email auth always deliver a 6-digit OTP (not a clickable confirmation link), especially during Sign Up.

1) Confirm root cause (already identified)
- Your screenshot shows the **“Confirm your signup”** template is being sent.
- Current auth logs also show `mail_type: "confirmation"` for `/otp` requests.
- This means only the **Magic Link** template was likely changed, while **Confirm signup** still contains `{{ .ConfirmationURL }}`.

2) Update both email templates in Supabase (no app code change required first)
- Go to **Auth → Email Templates**.
- Update **Confirm signup** template:
  - Subject: `Your verification code`
  - Body should use `{{ .Token }}` (not `{{ .ConfirmationURL }}`).
- Update **Magic Link** template similarly to use `{{ .Token }}`.
- Keep both templates OTP-style so existing users (magic-link flow) and first-time users (confirmation flow) both receive a code.

3) Validate provider/auth settings
- In **Auth → Providers → Email**, ensure email OTP/passwordless flow is enabled.
- Keep your app using `signInWithOtp` (already correct in `src/pages/Auth.tsx`).

4) Optional hardening (only if verification fails after template fix)
- Add a safe fallback in `verifyOtp` for signup mode:
  - Try `type: "email"` first.
  - If Supabase returns token-type mismatch for new users, retry with `type: "signup"`.
- This is only a resilience step; many projects work with `type: "email"` alone.

5) End-to-end test checklist
- Sign up with a brand-new email.
- Confirm email content shows a **6-digit code** and no confirmation link CTA.
- Enter code in app and verify successful login/session creation.
- Repeat with an existing email (Sign In) to confirm both flows send OTP.

Technical details
- Current code path is correct for OTP send: `supabase.auth.signInWithOtp(...)`.
- Behavior differs by Supabase email template type:
  - New user via OTP can trigger **confirmation** template.
  - Returning user often triggers **magic link** template.
- Therefore, OTP must be configured in both templates by replacing link variable with `{{ .Token }}`.
