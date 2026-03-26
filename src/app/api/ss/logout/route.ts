import { NextResponse } from "next/server";
import {
  SECRET_STUDIO_COOKIE,
  getSecretStudioCorsHeaders,
} from "@/lib/secret-studio";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getSecretStudioCorsHeaders(request),
  });
}

export async function POST(request: Request) {
  const response = NextResponse.json(
    { success: true },
    { headers: getSecretStudioCorsHeaders(request) }
  );

  response.cookies.set({
    name: SECRET_STUDIO_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}
