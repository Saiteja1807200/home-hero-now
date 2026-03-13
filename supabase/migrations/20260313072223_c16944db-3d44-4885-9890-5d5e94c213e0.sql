
-- Create dummy auth users (the handle_new_user trigger will auto-create profiles)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES
  ('d0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'venkat.reddy@example.com',   crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Venkat Reddy"}'::jsonb,   now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'naresh.kumar@example.com',   crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Naresh Kumar"}'::jsonb,   now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pavan.rao@example.com',      crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Pavan Rao"}'::jsonb,      now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mahesh.goud@example.com',    crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Mahesh Goud"}'::jsonb,    now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'shankar.das@example.com',    crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Shankar Das"}'::jsonb,    now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rajesh.verma@example.com',   crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Rajesh Verma"}'::jsonb,   now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'satish.yadav@example.com',   crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Satish Yadav"}'::jsonb,   now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anil.sharma@example.com',    crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Anil Sharma"}'::jsonb,    now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vinod.reddy@example.com',    crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Vinod Reddy"}'::jsonb,    now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kishore.babu@example.com',   crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Kishore Babu"}'::jsonb,   now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'srinivas.rao@example.com',   crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Srinivas Rao"}'::jsonb,   now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'raju.naidu@example.com',     crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Raju Naidu"}'::jsonb,     now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manoj.kumar@example.com',    crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Manoj Kumar"}'::jsonb,    now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'prasad.goud@example.com',    crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Prasad Goud"}'::jsonb,    now(), now(), '', ''),
  ('d0000001-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'harish.reddy@example.com',   crypt('DummyPass123!', gen_salt('bf')), now(), '{"full_name":"Harish Reddy"}'::jsonb,   now(), now(), '', '');

-- Create identities for each user (required by Supabase auth)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('d0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', '{"sub":"d0000001-0000-0000-0000-000000000001","email":"venkat.reddy@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', '{"sub":"d0000001-0000-0000-0000-000000000002","email":"naresh.kumar@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000003', '{"sub":"d0000001-0000-0000-0000-000000000003","email":"pavan.rao@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000004', '{"sub":"d0000001-0000-0000-0000-000000000004","email":"mahesh.goud@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000005', '{"sub":"d0000001-0000-0000-0000-000000000005","email":"shankar.das@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000006', '{"sub":"d0000001-0000-0000-0000-000000000006","email":"rajesh.verma@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000007', '{"sub":"d0000001-0000-0000-0000-000000000007","email":"satish.yadav@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000008', '{"sub":"d0000001-0000-0000-0000-000000000008","email":"anil.sharma@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000009', '{"sub":"d0000001-0000-0000-0000-000000000009","email":"vinod.reddy@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000010', 'd0000001-0000-0000-0000-000000000010', 'd0000001-0000-0000-0000-000000000010', '{"sub":"d0000001-0000-0000-0000-000000000010","email":"kishore.babu@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000011', 'd0000001-0000-0000-0000-000000000011', 'd0000001-0000-0000-0000-000000000011', '{"sub":"d0000001-0000-0000-0000-000000000011","email":"srinivas.rao@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000012', 'd0000001-0000-0000-0000-000000000012', 'd0000001-0000-0000-0000-000000000012', '{"sub":"d0000001-0000-0000-0000-000000000012","email":"raju.naidu@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000013', 'd0000001-0000-0000-0000-000000000013', 'd0000001-0000-0000-0000-000000000013', '{"sub":"d0000001-0000-0000-0000-000000000013","email":"manoj.kumar@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000014', 'd0000001-0000-0000-0000-000000000014', 'd0000001-0000-0000-0000-000000000014', '{"sub":"d0000001-0000-0000-0000-000000000014","email":"prasad.goud@example.com"}'::jsonb, 'email', now(), now(), now()),
  ('d0000001-0000-0000-0000-000000000015', 'd0000001-0000-0000-0000-000000000015', 'd0000001-0000-0000-0000-000000000015', '{"sub":"d0000001-0000-0000-0000-000000000015","email":"harish.reddy@example.com"}'::jsonb, 'email', now(), now(), now());

-- Insert service_providers (approved, online) for each location
INSERT INTO public.service_providers (id, user_id, status, is_online, verified, coverage_area, city, experience_years, bio) VALUES
  ('d0000002-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'approved', true, true,  'Bellampally Bus Stand', 'Mancherial', 4, 'Expert plumber with 4 years experience'),
  ('d0000002-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', 'approved', true, true,  'IB Chowrasta',          'Mancherial', 6, 'Certified electrician, residential & commercial'),
  ('d0000002-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000003', 'approved', true, false, 'Bus Stand Area',         'Mancherial', 3, 'AC repair and installation specialist'),
  ('d0000002-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000004', 'approved', true, true,  'Railway Station Area',   'Mancherial', 5, 'Mobile and tablet repair expert'),
  ('d0000002-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000005', 'approved', true, false, 'Ramakrishnapur',         'Mancherial', 7, 'Skilled carpenter for furniture and woodwork'),
  ('d0000002-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000006', 'approved', true, true,  'Indaram',                'Mancherial', 5, 'Professional painter, interior & exterior'),
  ('d0000002-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000007', 'approved', true, false, 'Bheemaram',              'Mancherial', 2, 'Thorough home cleaning services'),
  ('d0000002-0000-0000-0000-000000000008', 'd0000001-0000-0000-0000-000000000008', 'approved', true, true,  'Chennur',                'Mancherial', 8, 'TV repair specialist, all brands'),
  ('d0000002-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000009', 'approved', true, false, 'Luxettipet',             'Mancherial', 3, 'Eco-friendly pest control solutions'),
  ('d0000002-0000-0000-0000-000000000010', 'd0000001-0000-0000-0000-000000000010', 'approved', true, true,  'Mandamarri',             'Mancherial', 4, 'Washing machine repair for all models'),
  ('d0000002-0000-0000-0000-000000000011', 'd0000001-0000-0000-0000-000000000011', 'approved', true, false, 'Jaipur',                 'Mancherial', 6, 'Gas stove repair and installation'),
  ('d0000002-0000-0000-0000-000000000012', 'd0000001-0000-0000-0000-000000000012', 'approved', true, true,  'Thandur',                'Mancherial', 5, 'Geyser repair and water heater expert'),
  ('d0000002-0000-0000-0000-000000000013', 'd0000001-0000-0000-0000-000000000013', 'approved', true, false, 'Devapur',                'Mancherial', 4, 'Laptop repair and data recovery'),
  ('d0000002-0000-0000-0000-000000000014', 'd0000001-0000-0000-0000-000000000014', 'approved', true, true,  'Dandepally',             'Mancherial', 3, 'RO water purifier service and repair'),
  ('d0000002-0000-0000-0000-000000000015', 'd0000001-0000-0000-0000-000000000015', 'approved', true, false, 'Kotapalli',              'Mancherial', 5, 'Refrigerator repair, all brands');

-- Insert provider_services
INSERT INTO public.provider_services (provider_id, category_id, base_price) VALUES
  ('d0000002-0000-0000-0000-000000000001', '40865212-ad66-473b-87ff-68019d9f9a17', 250),
  ('d0000002-0000-0000-0000-000000000002', '671cf8c8-4736-41b1-a46e-1bb24af2e2c0', 300),
  ('d0000002-0000-0000-0000-000000000003', '94c3ab63-508c-411b-8431-4f12e4a95a9f', 500),
  ('d0000002-0000-0000-0000-000000000004', '8fec4915-11f0-46dd-87b7-a049bf9e256a', 350),
  ('d0000002-0000-0000-0000-000000000005', '89d697e0-d1be-4b32-b6ec-b736f6f29cc5', 400),
  ('d0000002-0000-0000-0000-000000000006', 'a9b6dbb0-56bf-4439-a2a4-46f464e0812d', 600),
  ('d0000002-0000-0000-0000-000000000007', 'e1d022f6-2465-41e9-98be-9cbe8805e051', 200),
  ('d0000002-0000-0000-0000-000000000008', '73813369-1e44-4c4a-87ee-5f57042f1bc9', 350),
  ('d0000002-0000-0000-0000-000000000009', '95e4d803-5228-4127-9233-c02c22b8264e', 450),
  ('d0000002-0000-0000-0000-000000000010', '7db7a9ca-0811-4f92-becb-3f967e079234', 400),
  ('d0000002-0000-0000-0000-000000000011', '024befae-ed0f-4dae-9bea-c1782797099f', 300),
  ('d0000002-0000-0000-0000-000000000012', '075fbaef-a720-4345-bf35-8e886b86061e', 350),
  ('d0000002-0000-0000-0000-000000000013', 'fb3ee6bd-87db-450f-86df-44e46b1d25d7', 500),
  ('d0000002-0000-0000-0000-000000000014', 'e4082b8b-a9c4-49ce-a09e-fc0e86b90ddd', 350),
  ('d0000002-0000-0000-0000-000000000015', 'c1a89e7e-f39d-469d-b480-9a8d588ddefd', 400);

-- Fix existing Naspur provider to online
UPDATE public.service_providers SET is_online = true WHERE id = 'a1000000-0000-0000-0000-000000000005';
