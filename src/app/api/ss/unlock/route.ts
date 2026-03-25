import { NextResponse } from "next/server";
import {
  SECRET_STUDIO_COOKIE,
  createSecretStudioSessionToken,
  isSecretStudioCodeValid,
} from "@/lib/secret-studio";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";

  if (!isSecretStudioCodeValid(code)) {
    return NextResponse.json(
      { success: false, error: "Código incorrecto." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });

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
