export type StudioProvider = "google" | "openai";
export type StudioAspectRatio = "1:1" | "3:4" | "4:5" | "9:16" | "16:9";
export type GoogleQualityMode = "premium" | "economy";

/**
 * El estudio ahora se guía por REFERENCIAS DE ESTILO que sube el usuario.
 * El "brief" es lo que el motor extrae de esas referencias (o de las notas):
 * qué look reproducir. Nunca describe el rostro; el rostro sale de las fotos
 * de identidad de Robeanny.
 */
export type StudioStyleBrief = {
  wardrobe: string;
  setDesign: string;
  lighting: string;
  mood: string;
  colorPalette: string;
  styling: string;
  /** Una dirección por foto (pose / encuadre / ángulo / expresión). */
  shots: string[];
};

export type StudioCostEstimate = {
  amountUsd: number;
  label: string;
  providerNote: string;
};

// Mismo origen por defecto: el frontend llama a su propia API (/api/ss/*).
// En Vercel eso significa la API de Vercel (código nuevo + su OPENAI_API_KEY).
// Para apuntar a un backend externo, define NEXT_PUBLIC_SS_API_BASE.
const DEFAULT_SECRET_STUDIO_REMOTE_API_BASE = "";

/**
 * Fotos viejas (pre-operación). Solo se usan como fallback si la carpeta
 * `public/robeanny-face/` todavía está vacía. Ver `getRobeannyIdentityReferences`.
 */
export const SECRET_STUDIO_LEGACY_FACE_FALLBACK = [
  "/FotoPrueba3.jpg",
  "/FotoPrueba1.JPG",
  "/FotoPrueba2.jpg",
  "/FotoPrueba4.jpg",
];

const openAiImagePriceByAspectRatio: Record<StudioAspectRatio, number> = {
  "1:1": 0.133,
  "3:4": 0.2,
  "4:5": 0.2,
  "9:16": 0.2,
  "16:9": 0.2,
};

const googleImagePriceByMode: Record<GoogleQualityMode, number> = {
  premium: 0.134,
  economy: 0.039,
};

export function getStudioEstimatedCost({
  provider,
  albumSize,
  aspectRatio,
  googleQualityMode,
}: {
  provider: StudioProvider;
  albumSize: number;
  aspectRatio: StudioAspectRatio;
  googleQualityMode: GoogleQualityMode;
}): StudioCostEstimate {
  if (provider === "openai") {
    const amountUsd = Number((openAiImagePriceByAspectRatio[aspectRatio] * albumSize).toFixed(2));

    return {
      amountUsd,
      label: `~US$${amountUsd.toFixed(2)}`,
      providerNote:
        "Estimado aproximado para GPT Image 2 en calidad alta. El costo real depende del tamaño y del número de referencias enviadas.",
    };
  }

  const amountUsd = Number((googleImagePriceByMode[googleQualityMode] * albumSize).toFixed(2));

  return {
    amountUsd,
    label: `~US$${amountUsd.toFixed(2)}`,
    providerNote:
      "Estimado provisional para la generación de Google en modo Pro Image dentro de Vertex. La prioridad aquí es calidad, no ahorro.",
  };
}

const providerLabels: Record<StudioProvider, string> = {
  google: "Google Vertex AI",
  openai: "OpenAI GPT Image",
};

export function getStudioProviderLabel(provider: StudioProvider) {
  return providerLabels[provider];
}

export function getSecretStudioApiBase() {
  return (
    process.env.NEXT_PUBLIC_SS_API_BASE?.trim().replace(/\/$/, "") ||
    DEFAULT_SECRET_STUDIO_REMOTE_API_BASE
  );
}

export function isExternalSecretStudioApiEnabled() {
  return Boolean(getSecretStudioApiBase());
}

export function buildSecretStudioApiUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const base = getSecretStudioApiBase();

  return base ? `${base}${normalizedPath}` : normalizedPath;
}
