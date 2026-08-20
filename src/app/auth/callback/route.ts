import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", requestUrl.origin)
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_callback_failed", requestUrl.origin)
    );
  }

  // Fetch user session to determine role from profiles table
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "investor") {
      return NextResponse.redirect(
        new URL("/investor/dashboard", requestUrl.origin)
      );
    } else if (profile?.role === "startup") {
      return NextResponse.redirect(
        new URL("/startup/dashboard", requestUrl.origin)
      );
    } else if (profile?.role === "admin") {
      return NextResponse.redirect(
        new URL("/admin/dashboard", requestUrl.origin)
      );
    }
  }

  // Fallback if role is not yet defined in profiles table
  return NextResponse.redirect(
    new URL("/dashboard", requestUrl.origin)
  );
}