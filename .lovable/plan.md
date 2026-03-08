

# Fix Auth Page: Bottom Nav + Placeholder + Name Field

## Issues Identified

1. **No bottom navigation on Auth page** — The `/auth` route is outside the `MobileLayout` wrapper (line 50 in App.tsx), so BottomNav doesn't render. Users have no way to navigate back.
2. **Placeholder shows a sample number** — Line 225: `"you@example.com or 9876543210"` should be changed to something like `"you@example.com or mobile number"`.
3. **Name field** — Already exists for Sign Up (lines 208-218). This is working correctly. No change needed.

## Plan

### 1. Add a "Back to Home" button on the Auth page
Rather than wrapping Auth inside MobileLayout (which would show the full bottom nav on a login screen — unusual UX), add a simple back/home navigation link at the top of the Auth page so users can return to the home screen.

**File: `src/pages/Auth.tsx`**
- Add a "Back to Home" link/button at the top-left of the auth page using `useNavigate` to go to `/`.
- Replace the `Wrench` icon in the header with the actual Home Hero logo from `src/assets/logo.png`.

### 2. Update the placeholder text
**File: `src/pages/Auth.tsx`** (line 225)
- Change `"you@example.com or 9876543210"` → `"you@example.com or mobile number"`

### 3. Update hint text
**File: `src/pages/Auth.tsx`** (line 236)
- Change `"Enter a valid email or 10+ digit phone number"` → `"Enter a valid email or 10+ digit mobile number"`

