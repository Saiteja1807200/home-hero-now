
-- =============================================
-- Fix all RLS policies: replace has_role() with is_admin(), make all PERMISSIVE
-- =============================================

-- === BOOKINGS ===
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can read own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Providers can read their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can cancel own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Providers can update booking status" ON public.bookings;

CREATE POLICY "Admins can read all bookings" ON public.bookings FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Customers can read own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = customer_id);
CREATE POLICY "Providers can read their bookings" ON public.bookings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM service_providers WHERE id = bookings.provider_id AND user_id = auth.uid()));
CREATE POLICY "Customers can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can cancel own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = customer_id AND status = 'requested'::booking_status) WITH CHECK (auth.uid() = customer_id AND status = 'cancelled'::booking_status);
CREATE POLICY "Providers can update booking status" ON public.bookings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM service_providers WHERE id = bookings.provider_id AND user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM service_providers WHERE id = bookings.provider_id AND user_id = auth.uid()));

-- === PROFILES ===
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- === SERVICE_CATEGORIES ===
DROP POLICY IF EXISTS "Admins can manage categories" ON public.service_categories;
DROP POLICY IF EXISTS "Anyone can read active categories" ON public.service_categories;

CREATE POLICY "Admins can manage categories" ON public.service_categories FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Anyone can read active categories" ON public.service_categories FOR SELECT TO anon, authenticated USING (is_active = true);

-- === SERVICE_PROVIDERS ===
DROP POLICY IF EXISTS "Admins can manage all providers" ON public.service_providers;
DROP POLICY IF EXISTS "Owners can read own provider" ON public.service_providers;
DROP POLICY IF EXISTS "Owners can update own provider" ON public.service_providers;
DROP POLICY IF EXISTS "Users can create own provider" ON public.service_providers;

CREATE POLICY "Admins can manage all providers" ON public.service_providers FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Owners can read own provider" ON public.service_providers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can update own provider" ON public.service_providers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND status = (SELECT sp.status FROM service_providers sp WHERE sp.user_id = auth.uid()) AND verified = (SELECT sp.verified FROM service_providers sp WHERE sp.user_id = auth.uid()) AND commission_rate = (SELECT sp.commission_rate FROM service_providers sp WHERE sp.user_id = auth.uid()));
CREATE POLICY "Users can create own provider" ON public.service_providers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending'::provider_status AND verified = false AND commission_rate = 15.00);

-- === REVIEWS ===
DROP POLICY IF EXISTS "Admins can read all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers can read own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Providers can read their reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers can create reviews for own bookings" ON public.reviews;

CREATE POLICY "Admins can read all reviews" ON public.reviews FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Customers can read own reviews" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = customer_id);
CREATE POLICY "Providers can read their reviews" ON public.reviews FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM service_providers WHERE id = reviews.provider_id AND user_id = auth.uid()));
CREATE POLICY "Customers can create reviews for own bookings" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id AND EXISTS (SELECT 1 FROM bookings WHERE id = reviews.booking_id AND customer_id = auth.uid()));

-- === SYSTEM_LOGS ===
DROP POLICY IF EXISTS "Admins can read logs" ON public.system_logs;

CREATE POLICY "Admins can read logs" ON public.system_logs FOR SELECT TO authenticated USING (public.is_admin());

-- === USER_ROLES ===
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- === ADDRESSES ===
DROP POLICY IF EXISTS "Users can CRUD own addresses" ON public.addresses;

CREATE POLICY "Users can CRUD own addresses" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id);

-- === PROVIDER_SERVICES ===
DROP POLICY IF EXISTS "Anyone can read provider services" ON public.provider_services;
DROP POLICY IF EXISTS "Providers can insert own services" ON public.provider_services;
DROP POLICY IF EXISTS "Providers can manage own services" ON public.provider_services;

CREATE POLICY "Anyone can read provider services" ON public.provider_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Providers can manage own services" ON public.provider_services FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM service_providers WHERE id = provider_services.provider_id AND user_id = auth.uid()));

-- === CONVERSATIONS ===
DROP POLICY IF EXISTS "Customers can read own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Providers can read own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Customers can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Providers can create conversations" ON public.conversations;

CREATE POLICY "Customers can read own conversations" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = customer_id);
CREATE POLICY "Providers can read own conversations" ON public.conversations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM service_providers sp WHERE sp.id = conversations.provider_id AND sp.user_id = auth.uid()));
CREATE POLICY "Customers can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id AND EXISTS (SELECT 1 FROM bookings b WHERE b.id = conversations.booking_id AND b.customer_id = auth.uid()));
CREATE POLICY "Providers can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM service_providers sp WHERE sp.id = conversations.provider_id AND sp.user_id = auth.uid()) AND EXISTS (SELECT 1 FROM bookings b WHERE b.id = conversations.booking_id AND b.provider_id = conversations.provider_id));

-- === MESSAGES ===
DROP POLICY IF EXISTS "Participants can read messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can mark messages read" ON public.messages;

CREATE POLICY "Participants can read messages" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM service_providers sp WHERE sp.id = c.provider_id AND sp.user_id = auth.uid()))));
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM service_providers sp WHERE sp.id = c.provider_id AND sp.user_id = auth.uid()))));
CREATE POLICY "Participants can mark messages read" ON public.messages FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM service_providers sp WHERE sp.id = c.provider_id AND sp.user_id = auth.uid())))) WITH CHECK (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.customer_id = auth.uid() OR EXISTS (SELECT 1 FROM service_providers sp WHERE sp.id = c.provider_id AND sp.user_id = auth.uid()))));
