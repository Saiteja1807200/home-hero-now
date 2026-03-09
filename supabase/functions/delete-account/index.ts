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
    const providerIds = (providers || []).map((p: any) => p.id);

    // --- Delete personal data (keep bookings & conversations for platform records) ---

    // Delete messages sent by this user
    await adminClient.from("messages").delete().eq("sender_id", userId);

    // Delete reviews written by this user
    await adminClient.from("reviews").delete().eq("customer_id", userId);

    // Delete reviews about user's providers
    if (providerIds.length > 0) {
      await adminClient.from("reviews").delete().in("provider_id", providerIds);
    }

    // Delete provider_services for user's providers
    if (providerIds.length > 0) {
      await adminClient.from("provider_services").delete().in("provider_id", providerIds);
    }

    // Delete service_providers
    if (providerIds.length > 0) {
      await adminClient.from("service_providers").delete().in("id", providerIds);
    }

    // Delete user_roles, system_logs, addresses
    await adminClient.from("user_roles").delete().eq("user_id", userId);
    await adminClient.from("system_logs").delete().eq("user_id", userId);
    await adminClient.from("addresses").delete().eq("user_id", userId);

    // Clean up storage buckets
    const buckets = ["profile-photos", "portfolio-images", "verification-documents"];
    for (const bucket of buckets) {
      const { data: files } = await adminClient.storage.from(bucket).list(userId);
      if (files && files.length > 0) {
        const paths = files.map((f: any) => `${userId}/${f.name}`);
        await adminClient.storage.from(bucket).remove(paths);
      }
    }

    // Delete profile
    await adminClient.from("profiles").delete().eq("id", userId);

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId, false);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
