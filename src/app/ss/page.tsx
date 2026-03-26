import { cookies } from "next/headers";
import type { Metadata } from "next";
import SecretStudioClient from "./SecretStudioClient";
import {
  SECRET_STUDIO_COOKIE,
  SECRET_STUDIO_FALLBACK_REFERENCES,
  getAvailableStudioProviders,
  hasSecretStudioAccess,
  isSecretStudioAuthDisabled,
} from "@/lib/secret-studio";
import { isExternalSecretStudioApiEnabled } from "@/lib/secret-studio-shared";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secret Studio",
  description: "Ruta privada para generar sesiones editoriales con IA.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": 0,
      "max-image-preview": "none",
    },
  },
};

export default function SecretStudioPage() {
  const cookieStore = cookies();
  const externalApiEnabled = isExternalSecretStudioApiEnabled();
  const authDisabled = isSecretStudioAuthDisabled() || externalApiEnabled;
  const unlocked = hasSecretStudioAccess(
    cookieStore.get(SECRET_STUDIO_COOKIE)?.value
  );
  const availableProviders = getAvailableStudioProviders();
  const effectiveProviders =
    availableProviders.length > 0
      ? availableProviders
      : externalApiEnabled
        ? (["google"] as const)
        : availableProviders;

  return (
    <SecretStudioClient
      initialUnlocked={authDisabled || unlocked}
      authRequired={!authDisabled}
      availableProviders={[...effectiveProviders]}
      fallbackReferences={SECRET_STUDIO_FALLBACK_REFERENCES}
    />
  );
}
