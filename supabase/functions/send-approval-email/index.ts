import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

interface RequestBody {
  email: string
  name: string
  cellName: string
  type: "join_cell" | "start_cell"
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    })
  }

  try {
    const { email, name, cellName, type }: RequestBody = await req.json()

    const subject =
      type === "join_cell"
        ? `You're now a member of ${cellName}`
        : `Your cell proposal has been approved — ${cellName}`

    const body =
      type === "join_cell"
        ? `Hi ${name},

Your request to join ${cellName} on Neoulo Trust has been approved by your cell lead.

You can now sign in to the platform to view your cell dashboard, track contributions, and monitor your farm.

Sign in at: ${Deno.env.get("NEXT_PUBLIC_APP_URL") ?? "https://neoulo.trust"}

Welcome to the cooperative.

— The Neoulo Trust Team`
        : `Hi ${name},

Great news! Your proposal to start ${cellName} on Neoulo Trust has been approved by the Neoulo admin team.

Your cell has been created and you are now its lead. Sign in to your lead dashboard to get started — you can invite members, open a RIN, and begin the cooperative journey.

Sign in at: ${Deno.env.get("NEXT_PUBLIC_APP_URL") ?? "https://neoulo.trust"}

— The Neoulo Trust Team`

    // Use Supabase's service role to send email via admin auth API
    // In production, replace with Resend or SendGrid by reading env vars
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Supabase does not have a built-in "send arbitrary email" endpoint.
    // We use the admin.generateLink approach with a dummy invite so Supabase's
    // SMTP relay sends the message. For a production deployment, swap this
    // out for an HTTP call to Resend / SendGrid / Postmark.
    //
    // For MVP we log the email content so it can be reviewed in Edge Function logs.
    console.log("APPROVAL EMAIL")
    console.log(`To: ${email}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body:\n${body}`)

    // Attempt to use Supabase admin to send a custom recovery-style email if SMTP is configured
    const { error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { data: { _neoulo_notification: subject } },
    })

    if (error) {
      // Non-fatal: log but don't fail the parent action
      console.warn("Could not send email via Supabase SMTP:", error.message)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("send-approval-email error:", err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
