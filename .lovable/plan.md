# Rebranding: FixNow/FixItNow → Home Hero

## Overview

Replace all branding references across the entire application with "Home Hero" and swap the logo with the uploaded image. Update colors to deep blue + bright orange theme and add this tag line as well Home Hero

Your Trusted Service Experts

## Files to Change

### 1. Logo Asset

- Copy uploaded image `user-uploads://file_00000000ca4c720898681a4c79d95820.png` to `src/assets/logo.png` (replaces current)
- Copy to `public/favicon.png`, `public/icons/icon-192.png`, `public/icons/icon-512.png` for PWA/favicon

### 2. `src/components/layout/BrandHeader.tsx`

- Change alt text to "Home Hero logo"
- Replace `Fix<span>It</span>Now` with `Home<span> Hero</span>` (accent span in orange/primary)

### 3. `src/pages/Auth.tsx`

- Line 172: Change `FixNow` → `Home Hero`
- Line 173: Update tagline to "Your trusted home services platform" (already correct, keep as-is)

### 4. `index.html`

- Title: `Home Hero – Book Home Services Instantly`
- Meta author: `Home Hero`
- OG/Twitter titles and descriptions updated
- Theme color: change from `#1a5c5c` to `#1e3a5f` (deep blue)

### 5. `public/manifest.json`

- `name`: `Home Hero – Home Services`
- `short_name`: `HomeHero`
- `background_color` and `theme_color`: update to `#1e3a5f`

### 6. `supabase/functions/notify-provider-approval/index.ts`

- Replace all 6 occurrences of "FixNow" with "Home Hero"
- Update email header color from `#F97316` to match new brand (keep orange `#F97316` as accent -- fits the uploaded logo)
- Update `from` field: `Home Hero <onboarding@resend.dev>`
- Update subject: `Provider Account Approved – Home Hero`

### 7. Theme colors (`src/index.css`)

- Update `--primary` HSL values to deep blue (e.g., `210 55% 25%`)
- Add/update accent to bright orange
- This cascades to buttons, links, and active states throughout the app

### 8. `tailwind.config.ts`

- No structural changes needed (colors reference CSS variables)

### 9. `.lovable/plan.md`

- Update branding references from FixItNow/FixNow to Home Hero

## No structural/component changes needed

All screens already use `BrandHeader` -- updating the component and logo asset propagates everywhere automatically (Home, Services, Bookings, Messages, Profile, Admin, Provider Dashboard).