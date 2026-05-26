import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Password reset links carry type=recovery — send to the set-password page
  if (type === "recovery" || next === "set-password") {
    return NextResponse.redirect(`${origin}/auth/reset`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
