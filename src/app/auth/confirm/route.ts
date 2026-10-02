import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Target of Supabase email links (signup confirmation, password recovery).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const supabase = await createClient();

  const ok = tokenHash && type
    ? !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error
    : code
      ? !(await supabase.auth.exchangeCodeForSession(code)).error
      : false;

  const fallback = type === "recovery" ? "/account/password" : "/pair";
  const destination = ok ? safeNext(searchParams.get("next")) ?? fallback : "/login?error=link";
  return NextResponse.redirect(new URL(destination, origin));
}

// Only allow same-site relative paths.
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}
