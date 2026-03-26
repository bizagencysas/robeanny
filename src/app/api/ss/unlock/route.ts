import { NextResponse } from "next/server";
import {
  SECRET_STUDIO_COOKIE,
  createSecretStudioSessionToken,
  getSecretStudioCorsHeaders,
  isSecretStudioCodeValid,
  isSecretStudioAuthDisabled,
} from "@/lib/secret-studio";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getSecretStudioCorsHeaders(request),
  });
}

export async function POST(request: Request) {
  if (isSecretStudioAuthDisabled()) {
    return NextResponse.json(
      { success: true, authDisabled: true },
      { headers: getSecretStudioCorsHeaders(request) }
    );
  }

  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";

  if (!isSecretStudioCodeValid(code)) {
    return NextResponse.json(
      { success: false, error: "Código incorrecto." },
      { status: 401, headers: getSecretStudioCorsHeaders(request) }
    );
  }

  const response = NextResponse.json(
    { success: true },
    { headers: getSecretStudioCorsHeaders(request) }
  );

  response.cookies.set({
    name: SECRET_STUDIO_COOKIE,
    value: createSecretStudioSessionToken(),
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  return response;
}
