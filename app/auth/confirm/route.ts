import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as "invite" | "email" | "signup" | null

  if (token_hash && type) {
    // For self-signup email confirmation, redirect to /onboarding after verify.
    // For invite flow, redirect to /auth/set-password (existing behaviour).
    const isInvite = type === "invite"
    const successRedirect = isInvite
      ? `${origin}/auth/set-password`
      : `${origin}/onboarding`

    const response = NextResponse.redirect(successRedirect)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type === "signup" ? "email" : type })

    if (!error && data.user) {
      if (isInvite) {
        // Link member record if not yet linked (invite flow only)
        await supabase
          .from("members")
          .update({ user_id: data.user.id })
          .eq("email", data.user.email!)
          .is("user_id", null)
      }

      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=invalid_invite`)
}
