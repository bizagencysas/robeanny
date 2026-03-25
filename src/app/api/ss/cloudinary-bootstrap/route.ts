import { NextRequest, NextResponse } from "next/server";
import {
  SECRET_STUDIO_COOKIE,
  hasSecretStudioAccess,
} from "@/lib/secret-studio";

export const runtime = "nodejs";

const DEFAULT_CLOUD_NAME = "dwpbbjp1d";
const DEFAULT_UPLOAD_PRESET = "robeanny_unsigned";
const DEFAULT_FOLDER = "robeanny";

export async function POST(request: NextRequest) {
  const session = request.cookies.get(SECRET_STUDIO_COOKIE)?.value;

  if (!hasSecretStudioAccess(session)) {
    return NextResponse.json(
      { error: "Primero desbloquea la ruta privada." },
      { status: 401 }
    );
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || DEFAULT_UPLOAD_PRESET;
  const folder =
    process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || DEFAULT_FOLDER;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Faltan `CLOUDINARY_API_KEY` o `CLOUDINARY_API_SECRET` en el entorno.",
      },
      { status: 400 }
    );
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const body = new URLSearchParams({
    name: uploadPreset,
    unsigned: "true",
    folder,
    asset_folder: folder,
    use_filename: "true",
    unique_filename: "true",
    overwrite: "false",
    disallow_public_id: "false",
    tags: "robeanny,secret-studio",
    allowed_formats: "png,jpg,jpeg,webp,avif",
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload_presets`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || "";
    const normalized = message.toLowerCase();

    if (
      normalized.includes("already exists") ||
      normalized.includes("existing") ||
      normalized.includes("already been taken") ||
      normalized.includes("name has already been taken") ||
      normalized.includes("taken")
    ) {
      return NextResponse.json({
        success: true,
        cloudName,
        uploadPreset,
        folder,
        existed: true,
      });
    }

    return NextResponse.json(
      {
        error:
          message ||
          "Cloudinary no permitió crear el upload preset unsigned.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    cloudName,
    uploadPreset,
    folder,
    existed: false,
  });
}
