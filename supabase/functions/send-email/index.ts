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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) throw new Error("BREVO_API_KEY not configured");

    // Verify caller is authenticated
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { to, subject, html, template, data } = await req.json();

    // Build email HTML from template or use provided html
    let emailHtml = html;
    if (!emailHtml && template) {
      emailHtml = buildTemplate(template, data || {});
    }
    if (!emailHtml) throw new Error("Either 'html' or 'template' is required");
    if (!to) throw new Error("'to' email is required");
    if (!subject) throw new Error("'subject' is required");

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Home Hero <onboarding@resend.dev>",
        to: Array.isArray(to) ? to : [to],
        subject,
        html: emailHtml,
      }),
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) {
      console.error("Resend error:", emailData);
      throw new Error(`Email send failed: ${JSON.stringify(emailData)}`);
    }

    return new Response(JSON.stringify({ success: true, id: emailData.id }), {
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

function buildTemplate(template: string, data: Record<string, string>): string {
  const wrap = (content: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1e3a5f; margin: 0;">Home Hero</h2>
      </div>
      ${content}
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
      <p style="font-size: 12px; color: #999; text-align: center;">
        This is an automated message from Home Hero. Please do not reply to this email.
      </p>
    </div>`;

  switch (template) {
    case "booking_confirmed":
      return wrap(`
        <p style="font-size: 16px; color: #333;">Dear ${data.customerName || "Customer"},</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          ✅ Your booking has been <strong>confirmed</strong>!
        </p>
        <div style="background: #f0f9f0; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 4px 0; font-size: 14px; color: #555;">📋 Service: <strong>${data.serviceName || "N/A"}</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #555;">👤 Provider: <strong>${data.providerName || "N/A"}</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #555;">📅 Date: <strong>${data.date || "N/A"}</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #555;">🕐 Time: <strong>${data.time || "N/A"}</strong></p>
        </div>
        <p style="font-size: 15px; color: #555;">Thank you for choosing Home Hero!</p>
        <p style="font-size: 15px; color: #333;">Best regards,<br/><strong>Home Hero Team</strong></p>`);

    case "booking_cancelled":
      return wrap(`
        <p style="font-size: 16px; color: #333;">Dear ${data.customerName || "Customer"},</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          Your booking for <strong>${data.serviceName || "the service"}</strong> on <strong>${data.date || "N/A"}</strong> has been <strong>cancelled</strong>.
        </p>
        <p style="font-size: 15px; color: #555;">If this was not intentional, please rebook through the app.</p>
        <p style="font-size: 15px; color: #333;">Best regards,<br/><strong>Home Hero Team</strong></p>`);

    case "booking_status_update":
      return wrap(`
        <p style="font-size: 16px; color: #333;">Dear ${data.customerName || "Customer"},</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          Your booking status has been updated to: <strong>${data.status || "N/A"}</strong>
        </p>
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 4px 0; font-size: 14px; color: #555;">📋 Service: <strong>${data.serviceName || "N/A"}</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #555;">📅 Date: <strong>${data.date || "N/A"}</strong></p>
        </div>
        <p style="font-size: 15px; color: #333;">Best regards,<br/><strong>Home Hero Team</strong></p>`);

    case "welcome":
      return wrap(`
        <p style="font-size: 16px; color: #333;">Dear ${data.name || "User"},</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          🎉 Welcome to <strong>Home Hero</strong>! We're excited to have you on board.
        </p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          Browse our wide range of home services and book your first appointment today.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://home-herohub.lovable.app"
             style="background-color: #F97316; color: white; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
            Explore Services
          </a>
        </div>
        <p style="font-size: 15px; color: #333;">Best regards,<br/><strong>Home Hero Team</strong></p>`);

    default:
      throw new Error(`Unknown template: ${template}`);
  }
}
