"use client";

import { buildSecretStudioApiUrl } from "@/lib/secret-studio-shared";

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  folder: string;
};

const DEFAULT_CLOUD_NAME = "dwpbbjp1d";
const DEFAULT_UPLOAD_PRESET = "robeanny_unsigned";
const DEFAULT_FOLDER = "robeanny";

export function getSecretStudioCloudinaryConfig() {
  return {
    cloudName:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD_NAME,
    uploadPreset:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || DEFAULT_UPLOAD_PRESET,
    folder:
      process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || DEFAULT_FOLDER,
  };
}

export async function ensureSecretStudioCloudinaryPreset() {
  const response = await fetch(buildSecretStudioApiUrl("/api/ss/cloudinary-bootstrap"), {
    method: "POST",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        "No se pudo preparar Cloudinary para las subidas del Secret Studio."
    );
  }

  return payload;
}

export async function uploadStudioImageToCloudinary({
  file,
  filename,
  tags = "robeanny,secret-studio",
  folderOverride,
}: {
  file: string | File;
  filename: string;
  tags?: string;
  folderOverride?: string;
}): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset, folder } = getSecretStudioCloudinaryConfig();
  const targetFolder = folderOverride || folder;
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", targetFolder);
  formData.append("tags", tags);
  formData.append("public_id", filename);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        "Cloudinary no aceptó la subida unsigned del Secret Studio."
    );
  }

  return {
    publicId: payload.public_id,
    secureUrl: payload.secure_url,
    folder: payload.folder || targetFolder,
  };
}
