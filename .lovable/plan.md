

## Add Provider Login Option to Auth Page

Currently the Sign Up page only has a single flow — no way to distinguish between a Customer and a Service Provider during signup/signin. The memory confirms there should be a Customer/Provider choice during signup.

### Plan

**Modify `src/pages/Auth.tsx`:**

1. **Add a role selector** (Customer / Service Provider toggle) visible during **Sign Up** mode, placed below the Sign Up/Sign In toggle.
   - Use two styled buttons or a radio-style selector.
   - Default to "Customer".

2. **Store selected role in state** (`userType: "customer" | "provider"`).

3. **Pass role context in OTP metadata**: Include `user_type` in the `data` option of `signInWithOtp` so it's available after verification.

4. **Post-verification redirect logic**:
   - If `userType === "provider"` → navigate to `/become-provider` after successful OTP verification.
   - If `userType === "customer"` → navigate to `/` (current behavior).

5. **Sign In mode**: Hide the role selector (existing users already have their role determined). Keep current behavior — redirect to `/`.

This approach avoids creating separate login pages and keeps the flow unified while letting new providers self-identify during signup.

