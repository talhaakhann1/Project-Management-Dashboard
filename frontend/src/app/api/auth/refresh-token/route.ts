import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function POST(request: NextRequest) {
  const backendResponse = await fetch(
    `${BACKEND_URL}/api/auth/refresh-token`,
    {
      method: "POST",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    },
  );

  const data = await backendResponse.json();

  const response = NextResponse.json(data, {
    status: backendResponse.status,
  });

  const cookies = backendResponse.headers.getSetCookie();

  cookies.forEach((cookie) => {
    response.headers.append("Set-Cookie", cookie);
  });

  return response;
}
