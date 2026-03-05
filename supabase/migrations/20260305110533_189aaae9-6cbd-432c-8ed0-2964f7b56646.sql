
-- 1. Update profiles with names
UPDATE profiles SET full_name = 'Ravi Kumar' WHERE id = 'f8ee66b8-066e-452f-9af0-2ed731560c0b';
UPDATE profiles SET full_name = 'Srinu Reddy' WHERE id = '5ece9186-b15e-44e3-a48d-2a5aaa99de3c';
UPDATE profiles SET full_name = 'Ganesh Babu' WHERE id = '8f1694a3-ef06-4e40-af14-3650d7dda5e1';
UPDATE profiles SET full_name = 'Suresh Naidu' WHERE id = 'd6498a98-c43d-4dff-a62c-8518c23b472a';
UPDATE profiles SET full_name = 'Ramesh Yadav' WHERE id = 'ee472002-4578-4fe3-949d-db767337cda4';

-- 2. Insert service_providers
INSERT INTO service_providers (id, user_id, bio, experience_years, verified, is_online, status, coverage_area_km) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'f8ee66b8-066e-452f-9af0-2ed731560c0b', 'Expert electrician with 8 years experience in residential and commercial wiring.', 8, true, true, 'approved', 15),
  ('a1000000-0000-0000-0000-000000000002', '5ece9186-b15e-44e3-a48d-2a5aaa99de3c', 'Experienced plumber specializing in pipe fitting and water systems.', 6, true, true, 'approved', 12),
  ('a1000000-0000-0000-0000-000000000003', '8f1694a3-ef06-4e40-af14-3650d7dda5e1', 'Skilled carpenter for furniture repair, woodwork and interior fittings.', 10, true, true, 'approved', 20),
  ('a1000000-0000-0000-0000-000000000004', 'd6498a98-c43d-4dff-a62c-8518c23b472a', 'Professional home cleaner and pest control specialist.', 4, false, true, 'approved', 10),
  ('a1000000-0000-0000-0000-000000000005', 'ee472002-4578-4fe3-949d-db767337cda4', 'TV and appliance repair technician with factory training.', 7, true, false, 'approved', 18);

-- 3. Insert provider_services (10 rows)
INSERT INTO provider_services (id, provider_id, category_id, base_price) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '671cf8c8-4736-41b1-a46e-1bb24af2e2c0', 299),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', '94c3ab63-508c-411b-8431-4f12e4a95a9f', 399),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', '40865212-ad66-473b-87ff-68019d9f9a17', 249),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'd23ed5ef-9af6-48a8-9ed7-8ab6879669a3', 349),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', '89d697e0-d1be-4b32-b6ec-b736f6f29cc5', 349),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'a9b6dbb0-56bf-4439-a2a4-46f464e0812d', 499),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'e1d022f6-2465-41e9-98be-9cbe8805e051', 199),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', '95e4d803-5228-4127-9233-c02c22b8264e', 299),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005', '73813369-1e44-4c4a-87ee-5f57042f1bc9', 299),
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000005', '7db7a9ca-0811-4f92-becb-3f967e079234', 349);

-- 4. Insert addresses (2 for Ravi)
INSERT INTO addresses (id, user_id, label, street, city, state, pincode, lat, lng) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'f8ee66b8-066e-452f-9af0-2ed731560c0b', 'Home', '12-3-456, Kukatpally', 'Hyderabad', 'Telangana', '500072', 17.4947, 78.3996),
  ('c1000000-0000-0000-0000-000000000002', 'f8ee66b8-066e-452f-9af0-2ed731560c0b', 'Office', '8-2-120, Banjara Hills', 'Hyderabad', 'Telangana', '500034', 17.4156, 78.4489);

-- 5. Insert bookings (2 rows)
INSERT INTO bookings (id, customer_id, provider_id, service_id, status, scheduled_date, scheduled_time, address_id, notes) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'f8ee66b8-066e-452f-9af0-2ed731560c0b', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'completed', '2026-02-20', '10:00', 'c1000000-0000-0000-0000-000000000001', 'Kitchen sink leak repair'),
  ('d1000000-0000-0000-0000-000000000002', 'f8ee66b8-066e-452f-9af0-2ed731560c0b', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000005', 'requested', '2026-03-10', '14:00', 'c1000000-0000-0000-0000-000000000002', 'Bookshelf installation');

-- 6. Insert reviews (1 per booking - booking_id is unique)
INSERT INTO reviews (id, booking_id, provider_id, customer_id, quality, punctuality, cleanliness, professionalism, comment) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'f8ee66b8-066e-452f-9af0-2ed731560c0b', 5, 4, 5, 4, 'Excellent plumber! Fixed the leak quickly and cleanly.');

-- 7. Insert user_roles
INSERT INTO user_roles (user_id, role) VALUES
  ('f8ee66b8-066e-452f-9af0-2ed731560c0b', 'admin'),
  ('5ece9186-b15e-44e3-a48d-2a5aaa99de3c', 'user');
