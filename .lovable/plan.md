- FixNow MVP — Refined Implementation Plan

### Phase 1: Foundation & Design System

- **PWA setup** with manifest, service worker, offline support
- **Custom design system** — NOT generic template UI:
  - Primary: deep teal (`hsl(185, 64%, 25%)`) for trust/reliability
  - Accent: bright orange (`hsl(25, 95%, 53%)`) for CTAs (Book Now, Confirm)
  - Modern typography, consistent spacing scale, large touch targets (min 48px)
  - Custom service category icon system using Lucide icons with color-coded backgrounds
  - Subtle micro-interactions: button press scale, fade-in cards, skeleton loaders, booking confirmation animation
- **Mobile-first layout** with bottom tab navigation (Home, Services, Bookings, Messages, Profile)

### Phase 2: Supabase Backend & Auth

- **Connect external Supabase project**
- **Auth**: Email/password for MVP; `profiles` table includes `phone` field for future OTP support
- **User roles table** (separate from profiles): Customer, Provider, Admin with RLS + `has_role()` security definer function
- **Core database tables**:
  - `profiles` (name, email, phone, avatar_url)
  - `addresses` (street, city, lat, lng coordinates)
  - `service_categories` (name, icon, color, description) — seed 14 categories
  - `service_providers` (user_id, experience_years, verified, is_online, coverage_area, commission_rate)
  - `provider_services` (provider_id, category_id, base_price)
  - `bookings` (customer_id, provider_id, service_id, status enum: requested→accepted→on_the_way→in_progress→completed→cancelled, scheduled_date, address_id)
  - `reviews` (booking_id, quality, punctuality, professionalism, cleanliness, comment)
  - `system_logs` (event_type, user_id, details, timestamp)
- **Supabase Storage** buckets: profile-photos, portfolio-images, verification-documents
- **RLS policies** on all tables

### Phase 3: Customer Experience

- **Home screen** (distinctive, not template-like):
  - Location indicator bar at top
  - Large search bar with placeholder "What service do you need?"
  - Service category grid: rounded icon cards with category color accents
  - "Recommended Providers" horizontal scroll section
  - Active/upcoming bookings card
- **Service discovery**:
  - Category → provider list with filter controls (rating, distance, availability)
  - Dynamic search results
  - Provider cards: photo, rating stars, jobs completed, distance, ETA, prominent orange "Book Now" button
- **Provider profile page**: verification badge, portfolio gallery, reviews list
- **Step-based booking flow** with progress indicator:
  1. Select service category
  2. Choose provider
  3. Pick date & time (calendar)
  4. Review & confirm details
  5. Payment method (placeholder)
- **Booking management**: view history, cancel, reschedule
- **Error handling**: clear feedback for network issues, duplicate bookings, provider cancellations
- **Profile**: edit info, manage addresses (with lat/lng)

### Phase 4: Provider Dashboard

- Registration: profile setup, document upload (to Supabase Storage), select categories, define coverage area
- **Online/Offline toggle** — only online providers appear in customer search
- Dashboard: incoming requests (accept/reject), current jobs with status progression, earnings summary
- Schedule management, mark jobs complete
- Status updates sync across all interfaces via Supabase realtime

### Phase 5: Admin Dashboard

- Sidebar navigation layout
- **Provider verification**: review documents from storage, approve/reject
- **Service category management**: CRUD with icons
- **Booking monitoring**: filter by status/date/category, full lifecycle view
- **Commission configuration**: set percentage per category (inactive in MVP)
- **System logs viewer**: auth events, booking events, provider actions, errors
- **Analytics**: daily bookings chart, revenue, popular services, top providers (using Recharts)

### Phase 6: Ratings & Reviews

- Post-completion rating: Quality, Punctuality, Professionalism, Cleanliness (star ratings)
- Only verified completed bookings can review
- Reviews displayed on provider profiles with averages

### Cross-Cutting Concerns

- Booking status lifecycle synced across all roles via Supabase realtime subscriptions
- System event logging for all critical actions

## Architecture prepared for future: caching, CDN, background jobs, OTP auth — no restructuring needed