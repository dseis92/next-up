/**
 * Supabase client for middleware
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedRoutes = [
    "/discover",
    "/explore",
    "/saved",
    "/applications",
    "/activity",
    "/profile",
    "/ai",
    "/jobs",
    "/onboarding",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    // Redirect to login if accessing protected route without auth
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Check onboarding completion for authenticated users
  if (user) {
    // Exclude onboarding page itself and auth-related pages
    const excludeOnboardingCheck = [
      "/onboarding",
      "/login",
      "/signup",
      "/forgot-password",
      "/reset-password",
    ];

    const needsOnboardingCheck =
      !excludeOnboardingCheck.some((route) =>
        request.nextUrl.pathname.startsWith(route)
      ) && isProtectedRoute;

    if (needsOnboardingCheck) {
      // Check if onboarding is complete (may not exist for fresh users)
      const { data: onboarding } = await supabase
        .from("onboarding_progress")
        .select("completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!onboarding || !onboarding.completed) {
        // Redirect to onboarding if not completed
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    }

    // If user is logged in and tries to access auth pages, redirect to discover
    const authPages = ["/login", "/signup"];
    if (authPages.includes(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/discover";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
