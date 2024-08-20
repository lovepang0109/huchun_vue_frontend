import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const protectedPaths = [
  "/assessment",
  "/home",
  "/onboarding",
  "/take-test",
  "/course",
  "/testseries",
  "/classroom",
]

let webConfig: any

export async function getWebConfig() {
  const res = await fetch(`${process.env.NEXT_INTERNAL_API || process.env.NEXT_PUBLIC_API}/api/v1/settings/webConfig`,
    {
      headers: { instancekey: 'perfectice-web-server' },
    })

  return res.json()
};

export async function middleware(request: NextRequest, _next: NextFetchEvent) {
  if (!webConfig) {
    webConfig = await getWebConfig()
  }

  let instanceKey = ""
  let hostname = request.headers.get('host')
  if (process.env.NODE_ENV != 'development') {
    if (!webConfig.sites || !webConfig.sites.find(s => s.domain == hostname)) {
      return NextResponse.json({ msg: "Unsupported Domain " + hostname }, { status: 404 })
    }

    let config = webConfig.sites.find(s => s.domain == hostname)
    instanceKey = config.instanceKey
  } else {
    instanceKey = process.env.NEXT_PUBLIC_INSTANCE_KEY || ""
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('instancekey', instanceKey)
  requestHeaders.set("x-url", request.nextUrl.pathname);

  if (protectedPaths.find(p => request.nextUrl.pathname.startsWith(p))) {
    await withAuth(request as NextRequestWithAuth, _next)

    if (request.nextUrl.pathname != "/onboarding") {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      // if user logged in
      if (token && token.userRole && token.userInfo) {
        if (
          ["teacher", "student", "mentor"].indexOf(token.userRole) > -1 &&
          !token.userInfo.onboarding
        ) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }

        if (!token.userInfo.emailVerified) {
          if (request.nextUrl.pathname != "/confirmRegister") {
            const response = await fetch(
              `${process.env.NEXT_INTERNAL_API || process.env.NEXT_PUBLIC_API}/api/v1/settings/getWhiteLabel`,
              {
                method: "GET",
                headers: { instanceKey: instanceKey },
              }
            );
            const settings = await response.json();
            if (settings.features.accountVerification) {
              return NextResponse.redirect(
                new URL("/confirmRegister", request.url)
              );
            }
          }
        }
      } else {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders,
    },
  })
}

export const config = {
  // matcher: [
  //   "/assessment/:path*",
  //   "/home/:path*",
  //   "/onboarding/:path*",
  //   "/take-test/:path*",
  //   "/course/:path*",
  //   "/testseries/:path*",
  //   "/classroom/:path*",
  // ],
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!uploads|download|_next/static|_next/image|favicon.ico).*)',
  ],
};
