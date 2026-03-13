

## Plan: Add Dummy Providers for All Locations + Fix Filtering

### Current State
- Only 5 approved providers exist, covering 5 of 20 locations
- RecommendedProviders filters by `coverage_area` match — locations without providers show "No providers available"
- ServiceDetail page shows providers by category but does NOT filter by location at all

### Changes

#### 1. Insert dummy provider data (via Supabase insert tool)

Create ~15 new profiles, service_providers (approved, online), and provider_services entries to cover all 20 Mancherial locations. Each location gets at least 1 provider offering a relevant service category with realistic names, bios, and prices.

Locations needing providers (15 remaining):
- Bellampally Bus Stand, IB Chowrasta, Bus Stand Area, Railway Station Area, Naspur (update existing Ramesh to online), Ramakrishnapur, Indaram, Bheemaram, Chennur, Luxettipet, Mandamarri, Jaipur, Thandur, Devapur, Dandepally, Kotapalli

Each provider will have:
- A profile in `profiles` (full_name, email)
- A `service_providers` row (status=approved, is_online=true, coverage_area=location)
- One or two `provider_services` rows linking to different categories with base prices

#### 2. Fix Ramesh Yadav (Naspur) — set `is_online = true`

Currently offline, so Naspur shows no providers.

#### 3. No frontend code changes needed

- RecommendedProviders already filters by `coverage_area` match and `is_online=true` — once data exists, it will show up
- ServiceDetail shows all providers for a category regardless of location (this is correct behavior for browsing by category)

### Data Plan (16 new providers across remaining locations)

| Location | Provider Name | Service |
|----------|--------------|---------|
| Bellampally Bus Stand | Venkat Reddy | Plumber |
| IB Chowrasta | Naresh Kumar | Electrician |
| Bus Stand Area | Pavan Rao | AC Repair |
| Railway Station Area | Mahesh Goud | Mobile Repair |
| Ramakrishnapur | Shankar Das | Carpenter |
| Indaram | Rajesh Verma | Painting |
| Bheemaram | Satish Yadav | Home Cleaning |
| Chennur | Anil Sharma | TV Repair |
| Luxettipet | Vinod Reddy | Pest Control |
| Mandamarri | Kishore Babu | Washing Machine |
| Jaipur | Srinivas Rao | Gas Stove |
| Thandur | Raju Naidu | Geyser Repair |
| Devapur | Manoj Kumar | Laptop Repair |
| Dandepally | Prasad Goud | RO Filter |
| Kotapalli | Harish Reddy | Refrigerator |
| Naspur | (fix existing Ramesh) | already has TV Repair |

Total inserts: ~16 profiles + 16 service_providers + 16 provider_services + 1 update

