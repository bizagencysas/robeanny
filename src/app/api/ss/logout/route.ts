import { NextResponse } from "next/server";
import { SECRET_STUDIO_COOKIE } from "@/lib/secret-studio";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ success: true });

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
