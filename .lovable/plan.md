# UI Branding Update — Add Logo + "fixitnow" Header

## Changes

### 1. Copy logo to project

- Copy uploaded logo to `src/assets/logo.png`

### 2. Create a `BrandHeader` component (`src/components/layout/BrandHeader.tsx`)

- Displays the logo image (32–40px height) + "FixItNow" text beside it
- Centered horizontally in the header area
- Used consistently across Home, Services, Bookings, Messages, and Profile screens
- Adapts to light/dark backgrounds (logo is green/teal gradient, works on both)

### 3. Add `BrandHeader` to all main screens

- `**Index.tsx**` — add above `LocationBar`
- `**Services.tsx**` — replace the plain `<h1>` with `BrandHeader` above it
- `**Bookings.tsx**` — add at top
- `**Messages.tsx**` — add at top
- `**Profile.tsx**` — add at top

### 4. PWA icons

- Copy the logo to `public/icons/icon-192.png` and `public/icons/icon-512.png` for the manifest
- Update favicon reference

### Files

- **New**: `src/assets/logo.png`, `src/components/layout/BrandHeader.tsx`
- **Edit**: `Index.tsx`, `Services.tsx`, `Bookings.tsx`, `Messages.tsx`, `Profile.tsx`
- **Copy to public**: `public/icons/icon-192.png`, `public/icons/icon-512.png`