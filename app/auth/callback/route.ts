/**
 * Supabase SSR Auth Callback Handler
 * Handles email confirmation and password recovery flows
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle error from Supabase
  if (error) {
    console.error("Auth callback error:", { error, errorDescription });
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // Exchange code for session
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Failed to exchange code for session:", exchangeError);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`
      );
    }

    // Determine safe redirect destination
    let redirectTo = "/onboarding";

    if (next) {
      // Validate next parameter to prevent open redirect
      // Only allow relative paths (internal application routes)
      if (next.startsWith("/") && !next.startsWith("//")) {
        redirectTo = next;
      } else {
        console.warn("Rejected unsafe redirect:", next);
      }
    }

    // Check if this is a password recovery flow
    // Password recovery links should go to /reset-password
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Check if this is a recovery session
      // Supabase sets user.aud to 'authenticated' for regular sessions
      // For recovery, we check the token type or redirect to reset-password
      // Since we can't reliably detect recovery type here, we rely on the redirectTo param
      // The forgot-password flow sets redirectTo=/reset-password
      if (next === "/reset-password") {
        redirectTo = "/reset-password";
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
  }

  // No code present - redirect to login
  console.warn("Auth callback called without code");
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
