import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as "invite" | "email" | null

  if (token_hash && type) {
    // Build the success redirect first so we can attach cookies to it.
    // We cannot use createClient() from supabase-server.ts here because that
    // helper's setAll() silently swallows writes (designed for Server Components
    // which are read-only). In a Route Handler we must write cookies directly
    // onto the response object.
    const response = NextResponse.redirect(`${origin}/auth/set-password`)

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

    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (!error && data.user) {
      // Link member record if not yet linked
      await supabase
        .from("members")
        .update({ user_id: data.user.id })
        .eq("email", data.user.email!)
        .is("user_id", null)

      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=invalid_invite`)
}
