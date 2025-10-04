import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Initialize Supabase with cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Retrieve user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  const protectedRoutes = ["/onboarding", "/voice"];
  const publicRoutes = ["/login", "/signup"];

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r));

  // 1️⃣ Not logged in → block protected routes
  if (!user && isProtected) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // 2️⃣ Logged in → restrict access to login/signup
  if (user && isPublic) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("has_onboarded")
      .eq("id", user.id)
      .maybeSingle();

    if (error) console.error("Profile lookup failed:", error.message);

    // User not verified yet
    if (!user.email_confirmed_at) {
      return res;
    }

    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = profile?.has_onboarded ? "/voice" : "/onboarding";
    return NextResponse.redirect(redirectUrl);
  }

  // 3️⃣ Logged in but not verified → block protected routes
  if (user && !user.email_confirmed_at && isProtected) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
