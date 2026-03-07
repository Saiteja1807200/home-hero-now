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

    // Get provider info from request
    const { provider_user_id } = await req.json();
    if (!provider_user_id) throw new Error("provider_user_id is required");

    // Fetch provider's profile
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", provider_user_id)
      .single();

    if (profileError || !profile) throw new Error("Provider profile not found");

    const providerName = profile.full_name || "Provider";
    const results: { email?: string; sms?: string } = {};

    // Send email via Resend if email exists
    if (profile.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #F97316; margin: 0;">FixNow</h2>
          </div>
          <p style="font-size: 16px; color: #333;">Dear ${providerName},</p>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            We are pleased to inform you that your service provider account on <strong>FixNow</strong> has been successfully approved.
          </p>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            You can now start receiving service requests from customers in your selected coverage areas.
          </p>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            To begin managing your bookings and availability, please log in to your Provider Dashboard.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://id-preview--9716f769-1c11-4a22-83eb-d7051d29dc8f.lovable.app/provider-dashboard"
               style="background-color: #F97316; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Open Provider Dashboard
            </a>
          </div>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            If you have any questions or require assistance, feel free to contact our support team.
          </p>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Thank you for joining FixNow. We look forward to helping you connect with customers and grow your services.
          </p>
          <br/>
          <p style="font-size: 15px; color: #333;">Best regards,<br/><strong>FixNow Support Team</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message from FixNow. Please do not reply to this email.
          </p>
        </div>
      `;

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "FixNow <onboarding@resend.dev>",
          to: [profile.email],
          subject: "Provider Account Approved – FixNow",
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

    // Log the notification
    await adminClient.from("system_logs").insert({
      event_type: "provider_approval_notification",
      user_id: provider_user_id,
      details: { results, provider_name: providerName },
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
