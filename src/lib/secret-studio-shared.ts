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
  "/FotoPrueba3.jpg",
  "/FotoPrueba1.JPG",
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
      "MUST be the exact same woman from the references — not a different person, not a lookalike. She is in her 20s but looks very young and youthful, baby-faced. Dark-brown eyes. Blonde hair with warm honey highlights. Clean white seamless studio, neutral studio light, natural skin texture. Never age her past mid-20s. No corporate portrait vibe. No businesswoman styling.",
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
      "MUST be the exact same woman from the references — not a different person, not a lookalike. She is in her 20s but looks very young and youthful, baby-faced. Dark-brown eyes. Blonde hair with warm honey highlights. Warm beige studio, luminous skin, grounded youthful editorial realism. Never age her past mid-20s. No corporate styling.",
    plan: {
      creativeDirection: "same woman from the references in a warm beige editorial portrait",
      wardrobe:
        "a soft body-skimming studio look with trendy Gen-Z cool casual fashion and cute youth accessories",
      location: "a warm beige studio set with textured walls",
      lighting:
        "soft diffused studio lighting with clean skin highlights and believable shadow falloff",
      stylingNotes:
        "warm neutral palette, youthful softness, fresh beauty realism, young and casual — never elegant or refined",
    },
  },
  {
    id: "beauty_crop",
    label: "Beauty Close Crop",
    description: "Close-up potente de rostro, piel, ojos y pelo.",
    notes:
      "MUST be the exact same woman from the references — not a different person, not a lookalike. She is in her 20s but looks very young and youthful, baby-faced. Dark-brown eyes. Blonde hair with warm honey highlights. Beauty close crop, detailed skin texture, controlled studio light. Never age her past mid-20s. Her face must match the references exactly.",
    plan: {
      creativeDirection: "same woman from the references in a beauty editorial portrait",
      wardrobe:
        "a clean beauty-studio top with minimal distraction, simple neckline, and model-test styling",
      albumPose: "close beauty crop with a soft head tilt and direct gaze",
      lighting:
        "beauty-dish lighting with realistic skin texture and precise facial definition",
      lens:
        "captured like a high-end portrait session with detailed skin texture and believable optics",
      stylingNotes:
        "close beauty crop, skin detail, fresh youthful facial presence — never elegant or refined",
    },
  },
  {
    id: "full_body_catalogue",
    label: "Full-Body Catalogue",
    description: "Fotos de cuerpo completo, claras, útiles y comerciales.",
    notes:
      "MUST be the exact same woman from the references — not a different person, not a lookalike. She is in her 20s but looks very young and youthful, baby-faced. Dark-brown eyes. Blonde hair with warm honey highlights. Full-body studio frame, clean full-look visibility. Never age her past mid-20s. No corporate posing. No businesswoman wardrobe.",
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
    description: "Retratos sentados, frescos y controlados.",
    notes:
      "MUST be the exact same woman from the references — not a different person, not a lookalike. She is in her 20s but looks very young and youthful, baby-faced. Dark-brown eyes. Blonde hair with warm honey highlights. Seated studio portraits, relaxed youthful posture, grounded youthful realism. Never age her past mid-20s. No corporate styling.",
    plan: {
      creativeDirection: "same woman from the references in a minimal seated studio fashion story",
      wardrobe:
        "a body-skimming seated studio look with cool structure and a strong feminine silhouette",
      albumPose: "seated on a clean studio cube with relaxed youthful posture and relaxed hands",
      location: "a clean white cyc studio",
      stylingNotes:
        "cool seated portrait series, natural youthful posture, restrained studio styling — never elegant or refined",
    },
  },
  {
    id: "commercial_denim",
    label: "Commercial Denim",
    description: "Tanque blanco y denim limpio, look comercial poderoso.",
    notes:
      "MUST be the exact same woman from the references — not a different person, not a lookalike. She is in her 20s but looks very young and youthful, baby-faced. Dark-brown eyes. Blonde hair with warm honey highlights. White tank and denim studio session, youthful studio realism. Never age her past mid-20s. No corporate wardrobe.",
    plan: {
      creativeDirection: "same woman from the references in a denim studio portrait",
      wardrobe:
        "a crisp white tank with clean denim and casual cool heels or sneakers",
      location: "a clean white seamless studio with subtle sculpted shadows",
      lighting:
        "soft diffused studio lighting with clean skin highlights and believable shadow falloff",
      stylingNotes:
        "clean denim studio shoot, casual trendy basics, restrained finish — never elegant or polished",
    },
  },
  {
    id: "sensual_editorial",
    label: "Sensual Editorial",
    description:
      "Sesión de estudio más sensual y fashion, siempre no explícita y totalmente vestida.",
    notes:
      "MUST be the exact same woman from the references — not a different person, not a lookalike. She is in her 20s but looks very young and youthful, baby-faced. Dark-brown eyes. Blonde hair with warm honey highlights. Sensual studio editorial, strong feminine silhouette, fully clothed, non-explicit, youthful and believable. Never age her past mid-20s. No businesswoman styling.",
    plan: {
      creativeDirection: "same woman from the references in a sensual studio editorial",
      wardrobe:
        "an opaque black bodysuit or a body-skimming look with sleek boots and cool accessories, never a blazer or suit jacket",
      albumPose:
        "confident studio pose with elongated legs, natural youthful posture, and restrained sensual energy",
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
