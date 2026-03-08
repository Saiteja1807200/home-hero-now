import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const adminClient = createClient(supabaseUrl, serviceKey);
    const userId = user.id;

    // Get provider IDs owned by this user
    const { data: providers } = await adminClient
      .from("service_providers")
      .select("id")
      .eq("user_id", userId);
    const providerIds = (providers || []).map((p) => p.id);

    // Delete provider_services for user's providers
    if (providerIds.length > 0) {
      await adminClient.from("provider_services").delete().in("provider_id", providerIds);
    }

    // Delete reviews written by or about user's providers
    await adminClient.from("reviews").delete().eq("customer_id", userId);
    if (providerIds.length > 0) {
      await adminClient.from("reviews").delete().in("provider_id", providerIds);
    }

    // Nullify bookings references (archive, don't delete)
    // bookings.customer_id and bookings.provider_id are NOT NULL, so we skip nullifying
    // Instead we just proceed — the FK references service_providers.id not profiles.id

    // Delete service_providers
    if (providerIds.length > 0) {
      await adminClient.from("service_providers").delete().in("id", providerIds);
    }

    // Delete user_roles, system_logs, addresses
    await adminClient.from("user_roles").delete().eq("user_id", userId);
    await adminClient.from("system_logs").delete().eq("user_id", userId);
    await adminClient.from("addresses").delete().eq("user_id", userId);

    // Delete profile
    await adminClient.from("profiles").delete().eq("id", userId);

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId, false);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
