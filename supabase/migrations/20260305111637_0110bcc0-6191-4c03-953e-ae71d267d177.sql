
CREATE POLICY "Users can create own provider"
ON service_providers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can insert own services"
ON provider_services FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM service_providers
  WHERE id = provider_services.provider_id
  AND user_id = auth.uid()
));
