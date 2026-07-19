import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  const token=request.cookies.get('accessToken')?.value;
  
  const url = request.nextUrl;
  if (
    token &&
    (url.pathname == "sign-in" ||
      url.pathname == "sign-up" ||
      url.pathname == "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/",
  ],
};