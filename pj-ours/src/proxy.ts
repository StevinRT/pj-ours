import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/sign-in") {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const { url, publishableKey } = getSupabasePublicEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    const redirectUrl = new URL("/admin/sign-in", request.url);
    redirectUrl.searchParams.set("next", pathname);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach(({ name, value, path, domain, expires, httpOnly, secure, sameSite }) => {
      redirectResponse.cookies.set({
        name,
        value,
        path,
        domain,
        expires,
        httpOnly,
        secure,
        sameSite,
      });
    });

    response.headers.forEach((value, key) => {
      if (key !== "location") {
        redirectResponse.headers.set(key, value);
      }
    });

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
