import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify calling user is admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin role required");

    const { provider_user_id, status = "approved" } = await req.json();
    if (!provider_user_id) throw new Error("provider_user_id is required");
    if (!["approved", "rejected"].includes(status)) throw new Error("Invalid status");

    // Fetch provider's profile
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", provider_user_id)
      .single();

    if (profileError || !profile) throw new Error("Provider profile not found");

    // Fetch provider's service categories and coverage info
    const { data: providerData } = await adminClient
      .from("service_providers")
      .select("coverage_area, coverage_area_km, city")
      .eq("user_id", provider_user_id)
      .single();

    const { data: providerRecord } = await adminClient
      .from("service_providers")
      .select("id")
      .eq("user_id", provider_user_id)
      .single();

    let categoryNames = "";
    if (providerRecord) {
      const { data: services } = await adminClient
        .from("provider_services")
        .select("category_id, service_categories(name)")
        .eq("provider_id", providerRecord.id);
      if (services?.length) {
        categoryNames = services.map((s: any) => s.service_categories?.name).filter(Boolean).join(", ");
      }
    }

    const providerName = profile.full_name || "Provider";
    const coverageArea = providerData?.coverage_area || "N/A";
    const coverageKm = providerData?.coverage_area_km || "N/A";
    const city = providerData?.city || "N/A";
    const results: { email?: string } = {};

    if (profile.email) {
      const isApproved = status === "approved";

      const subject = isApproved
        ? "Congratulations! Your Provider Account is Approved – Home Hero"
        : "Application Update – Home Hero";

      const emailHtml = isApproved
        ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e3a5f; margin: 0;">Home Hero</h2>
          </div>
          <p style="font-size: 16px; color: #333;">Dear ${providerName},</p>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            🎉 <strong>Congratulations!</strong> We are pleased to inform you that your service provider account on <strong>Home Hero</strong> has been <strong>approved</strong>.
          </p>
          <div style="background: #f0f9f0; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #333;"><strong>Your Account Details:</strong></p>
            ${categoryNames ? `<p style="margin: 4px 0; font-size: 14px; color: #555;">📋 Service Category: <strong>${categoryNames}</strong></p>` : ""}
            <p style="margin: 4px 0; font-size: 14px; color: #555;">📍 City: <strong>${city}</strong></p>
            <p style="margin: 4px 0; font-size: 14px; color: #555;">🗺️ Coverage Area: <strong>${coverageArea}</strong> (${coverageKm} km radius)</p>
          </div>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            You can now start receiving service requests from customers in your selected coverage areas. Log in to your Provider Dashboard to manage your bookings, availability, and profile.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://id-preview--9716f769-1c11-4a22-83eb-d7051d29dc8f.lovable.app/provider-dashboard"
               style="background-color: #F97316; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
              Open Provider Dashboard
            </a>
          </div>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            If you have any questions or require assistance, feel free to contact our support team.
          </p>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Thank you for joining Home Hero. We look forward to helping you connect with customers and grow your services.
          </p>
          <br/>
          <p style="font-size: 15px; color: #333;">Best regards,<br/><strong>Home Hero Support Team</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message from Home Hero. Please do not reply to this email.
          </p>
        </div>`
        : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e3a5f; margin: 0;">Home Hero</h2>
          </div>
          <p style="font-size: 16px; color: #333;">Dear ${providerName},</p>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Thank you for your interest in becoming a service provider on <strong>Home Hero</strong>. After careful review, we regret to inform you that your application has not been approved at this time.
          </p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #555;">
              This decision may be due to incomplete profile information, coverage area limitations, or other factors. We encourage you to review and update your profile, then re-apply.
            </p>
          </div>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            <strong>What you can do next:</strong>
          </p>
          <ul style="font-size: 14px; color: #555; line-height: 1.8;">
            <li>Review and complete your profile information</li>
            <li>Ensure your service area and experience details are accurate</li>
            <li>Submit a new application when you're ready</li>
          </ul>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            If you believe this was an error or have questions, please don't hesitate to reach out to our support team. We're here to help you succeed.
          </p>
          <br/>
          <p style="font-size: 15px; color: #333;">Best regards,<br/><strong>Home Hero Support Team</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message from Home Hero. Please do not reply to this email.
          </p>
        </div>`;

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Home Hero <onboarding@resend.dev>",
          to: [profile.email],
          subject,
          html: emailHtml,
        }),
      });

      const emailData = await emailRes.json();
      if (!emailRes.ok) {
        console.error("Resend error:", emailData);
        results.email = `Failed: ${JSON.stringify(emailData)}`;
      } else {
        results.email = "sent";
      }
    }

    await adminClient.from("system_logs").insert({
      event_type: `provider_${status}_notification`,
      user_id: provider_user_id,
      details: { results, provider_name: providerName, status },
    });

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
