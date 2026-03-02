import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as "invite" | "email" | null

  if (token_hash && type) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (!error && data.user) {
      // Link member record if not yet linked
      await supabase
        .from("members")
        .update({ user_id: data.user.id })
        .eq("email", data.user.email!)
        .is("user_id", null)

      return NextResponse.redirect(`${origin}/auth/set-password`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=invalid_invite`)
}
