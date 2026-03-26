export type StudioProvider = "google" | "openai";
export type StudioAspectRatio = "1:1" | "3:4" | "4:5" | "9:16" | "16:9";
export type GoogleQualityMode = "premium" | "economy";
export type SecretStudioCreativePlan = {
  creativeDirection: string;
  wardrobe: string;
  albumPose: string;
  hair: string;
  lighting: string;
  location: string;
  lens: string;
  stylingNotes: string;
};
export type StudioPresetId =
  | "white_seamless"
  | "warm_beige"
  | "beauty_crop"
  | "full_body_catalogue"
  | "seated_studio"
  | "commercial_denim"
  | "sensual_editorial";
export type StudioPreset = {
  id: StudioPresetId;
  label: string;
  description: string;
  notes: string;
  plan: Partial<SecretStudioCreativePlan>;
};

export type StudioCostEstimate = {
  amountUsd: number;
  label: string;
  providerNote: string;
};

const DEFAULT_SECRET_STUDIO_REMOTE_API_BASE =
  process.env.NODE_ENV === "production" ? "https://robeanny.onrender.com" : "";

export const SECRET_STUDIO_PRIMARY_FACE_REFERENCES = [
  "/FotoPrueba1.JPG",
  "/FotoPrueba3.jpg",
];

export const SECRET_STUDIO_SECONDARY_FACE_REFERENCES = [
  "/FotoPrueba2.jpg",
  "/FotoPrueba4.jpg",
];

export const SECRET_STUDIO_BODY_SUPPORT_REFERENCES = [
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101023/2_ltpa5y.webp",
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101024/6_d2ejcx.webp",
];

export const SECRET_STUDIO_FALLBACK_REFERENCES = [
  ...SECRET_STUDIO_PRIMARY_FACE_REFERENCES,
  ...SECRET_STUDIO_SECONDARY_FACE_REFERENCES,
  ...SECRET_STUDIO_BODY_SUPPORT_REFERENCES,
];

export const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: "white_seamless",
    label: "White Seamless",
    description: "Estudio blanco limpio, sombras suaves, look editorial real.",
    notes:
      "Same woman from the references in a clean white seamless studio, neutral studio light, natural skin texture, dark-brown eyes, no corporate portrait vibe.",
    plan: {
      creativeDirection: "same woman from the references on a clean white seamless studio set",
      wardrobe:
        "a youthful model-test studio look with soft feminine lines, believable styling, and explicitly no officewear or executive portrait energy",
      location: "a clean white seamless studio with subtle sculpted shadows",
      lighting:
        "neutral studio softbox lighting with natural highlight rolloff, believable skin texture, and no headshot-corporate polish",
      lens:
        "captured like a real professional studio photograph with natural depth of field and believable lens behavior",
      stylingNotes:
        "clean studio atmosphere, young model-test energy, restrained retouching, never executive-portrait styling",
    },
  },
  {
    id: "warm_beige",
    label: "Warm Beige Studio",
    description: "Fondo beige cálido, editorial limpio, piel luminosa.",
    notes:
      "Same woman from the references in a warm beige studio, luminous skin, dark-brown eyes, grounded youthful editorial realism.",
    plan: {
      creativeDirection: "same woman from the references in a warm beige editorial portrait",
      wardrobe:
        "a soft body-skimming studio look with youthful editorial styling and restrained accessories",
      location: "a refined beige editorial set with textured walls",
      lighting:
        "soft diffused studio lighting with elegant skin highlights and believable shadow falloff",
      stylingNotes:
        "warm neutral palette, editorial softness, youthful beauty realism",
    },
  },
  {
    id: "beauty_crop",
    label: "Beauty Close Crop",
    description: "Close-up potente de rostro, piel, ojos y pelo.",
    notes:
      "Same woman from the references in a beauty close crop, detailed skin texture, dark-brown eyes, controlled studio light.",
    plan: {
      creativeDirection: "same woman from the references in a beauty editorial portrait",
      wardrobe:
        "a clean beauty-studio top with minimal distraction, refined neckline, and model-test styling",
      albumPose: "close beauty crop with a soft head tilt and direct gaze",
      lighting:
        "beauty-dish lighting with realistic skin texture and precise facial definition",
      lens:
        "captured like a high-end portrait session with detailed skin texture and believable optics",
      stylingNotes:
        "close beauty crop, skin detail, elegant facial presence",
    },
  },
  {
    id: "full_body_catalogue",
    label: "Full-Body Catalogue",
    description: "Fotos de cuerpo completo, claras, útiles y comerciales.",
    notes:
      "Same woman from the references in a full-body studio frame, dark-brown eyes, clean full-look visibility, no corporate posing.",
    plan: {
      creativeDirection: "same woman from the references in a full-body studio fashion frame",
      wardrobe:
        "a fitted editorial studio look with long clean lines, believable fashion styling, and no officewear energy",
      albumPose: "standing with one shoulder angled toward camera, confident posture, subtle movement in the hips",
      lighting:
        "clean white seamless studio lighting with subtle but believable shadow definition",
      stylingNotes:
        "commercial catalogue clarity, full look visibility, clean structure",
    },
  },
  {
    id: "seated_studio",
    label: "Seated Studio",
    description: "Retratos sentados, elegantes y controlados.",
    notes:
      "Same woman from the references in seated studio portraits, dark-brown eyes, refined posture, grounded youthful realism.",
    plan: {
      creativeDirection: "same woman from the references in a minimal seated studio fashion story",
      wardrobe:
        "a body-skimming seated studio look with elegant structure and a strong feminine silhouette",
      albumPose: "seated on a clean studio cube with elegant posture and relaxed hands",
      location: "a clean white cyc studio",
      stylingNotes:
        "elegant seated portrait series, polished posture, restrained studio styling",
    },
  },
  {
    id: "commercial_denim",
    label: "Commercial Denim",
    description: "Tanque blanco y denim limpio, look comercial poderoso.",
    notes:
      "Same woman from the references in a white tank and denim studio session, dark-brown eyes, youthful studio realism.",
    plan: {
      creativeDirection: "same woman from the references in a denim studio portrait",
      wardrobe:
        "a crisp white tank with clean denim, a polished belt, and pointed heels",
      location: "a clean white seamless studio with subtle sculpted shadows",
      lighting:
        "soft diffused studio lighting with elegant skin highlights and believable shadow falloff",
      stylingNotes:
        "clean denim studio shoot, polished basics, restrained finish",
    },
  },
  {
    id: "sensual_editorial",
    label: "Sensual Editorial",
    description:
      "Sesión de estudio más sensual y fashion, siempre no explícita y totalmente vestida.",
    notes:
      "Same woman from the references in a sensual studio editorial, dark-brown eyes, strong feminine silhouette, fully clothed, non-explicit, youthful and believable.",
    plan: {
      creativeDirection: "same woman from the references in a sensual studio editorial",
      wardrobe:
        "an opaque black bodysuit or a body-skimming editorial look with a sharp blazer, sleek boots, and refined accessories",
      albumPose:
        "confident studio pose with elongated legs, elegant posture, and restrained sensual energy",
      location: "a clean studio set with soft warm neutrals and minimal distractions",
      lighting:
        "controlled studio light with smooth shadow shaping, realistic skin texture, and confident editorial definition",
      stylingNotes:
        "sensual editorial styling, model-test confidence, no nudity, no transparency, no explicit exposure",
    },
  },
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

export function getStudioPreset(presetId: StudioPresetId) {
  return STUDIO_PRESETS.find((preset) => preset.id === presetId) || STUDIO_PRESETS[0];
}

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
        "Estimado para GPT Image 1.5 en calidad alta. No incluye casi nada del planner, pero ese costo suele ser menor que el render de imagen.",
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
