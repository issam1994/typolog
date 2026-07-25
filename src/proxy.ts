import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Pure routing decision for the admin auth gate. Returns the pathname to
 * redirect to, or null to let the request through.
 * - Unauthenticated users hitting a protected admin path go to the login page.
 * - Authenticated users hitting the login page go to the dashboard.
 */
export function decideRedirect(
  isAuthenticated: boolean,
  pathname: string,
): "/admin/login" | "/admin" | null {
  const isAdminLogin = pathname === "/admin/login";
  const isAdminPath = pathname.startsWith("/admin");

  if (!isAuthenticated && isAdminPath && !isAdminLogin) return "/admin/login";
  if (isAuthenticated && isAdminLogin) return "/admin";
  return null;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Must use getUser() not getSession() to validate JWT against Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const target = decideRedirect(!!user, request.nextUrl.pathname);
  if (target) {
    const url = request.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
