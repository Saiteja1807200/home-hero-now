
-- Create conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS: conversations - participants can read
CREATE POLICY "Customers can read own conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Providers can read own conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.service_providers sp
    WHERE sp.id = conversations.provider_id AND sp.user_id = auth.uid()
  ));

-- RLS: conversations - customers can create (linked to their booking)
CREATE POLICY "Customers can create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = conversations.booking_id AND b.customer_id = auth.uid()
    )
  );

-- RLS: messages - participants can read
CREATE POLICY "Participants can read messages"
  ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.service_providers sp
      WHERE sp.id = c.provider_id AND sp.user_id = auth.uid()
    ))
  ));

-- RLS: messages - participants can send
CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.customer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.service_providers sp
        WHERE sp.id = c.provider_id AND sp.user_id = auth.uid()
      ))
    )
  );

-- RLS: messages - participants can update read_at
CREATE POLICY "Participants can mark messages read"
  ON public.messages FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.service_providers sp
      WHERE sp.id = c.provider_id AND sp.user_id = auth.uid()
    ))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.service_providers sp
      WHERE sp.id = c.provider_id AND sp.user_id = auth.uid()
    ))
  ));

-- Enable Realtime on messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
