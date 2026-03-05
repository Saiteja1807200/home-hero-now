

# Plan: Seed Sample Data Into All Tables

All 8 tables exist with correct schemas. Categories (14 rows) and profiles (5 rows) have data, but profiles lack names. All other tables are empty. Here's what we'll insert using the Supabase data insert tool.

## Data Inserts (7 operations)

### 1. Update 5 profiles with names
| User | full_name |
|---|---|
| ravifixnow@gmail.com | Ravi Kumar |
| srinufixnow@gmail.con | Srinu Reddy |
| ganeshfixnow@gmail.com | Ganesh Babu |
| sureshfixnow@gmail.com | Suresh Naidu |
| rameshfixnow@gmail.com | Ramesh Yadav |

### 2. Insert 5 rows into `service_providers`
Each user becomes an approved provider with a bio, experience, and `is_online = true`.

### 3. Insert 10 rows into `provider_services`
Link each provider to 2 categories with prices:
- Ravi → Electrician (₹299), AC Repair (₹399)
- Srinu → Plumber (₹249), Water Purifier (₹349)
- Ganesh → Carpenter (₹349), Painting (₹499)
- Suresh → Home Cleaning (₹199), Pest Control (₹299)
- Ramesh → TV Repair (₹299), Washing Machine (₹349)

### 4. Insert 2 rows into `addresses`
Two sample addresses for Ravi's user account.

### 5. Insert 2 rows into `bookings`
- Booking 1: Ravi books Srinu for Plumber service (status: completed)
- Booking 2: Ravi books Ganesh for Carpenter service (status: requested)

### 6. Insert 2 rows into `reviews`
A review from Ravi for the completed booking with Srinu.

### 7. Insert 2 rows into `user_roles`
- Ravi → admin
- Srinu → user

No schema/migration changes needed. All inserts use existing tables and columns.

