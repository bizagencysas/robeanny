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
  | "commercial_denim";
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

export const SECRET_STUDIO_FALLBACK_REFERENCES = [
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101026/17_m0y8pz.webp",
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101026/15_grfi8j.webp",
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101025/14_kpcwtg.webp",
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101023/2_ltpa5y.webp",
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101024/6_d2ejcx.webp",
  "https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101030/28_b9o1sc.webp",
];

export const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: "white_seamless",
    label: "White Seamless",
    description: "Estudio blanco limpio, lujo comercial, sombras suaves.",
    notes:
      "Pristine white seamless studio, premium commercial lighting, elegant beauty finish, dark-brown eyes, clean luxury atmosphere.",
    plan: {
      creativeDirection: "pristine white seamless luxury studio campaign",
      location: "a pristine luxury white seamless studio with subtle sculpted shadows",
      lighting:
        "ultra-refined studio softbox lighting with perfect highlight rolloff and luxury skin rendering",
      lens:
        "captured on a top-tier medium-format studio setup with ultra-premium optics, immaculate dynamic range, and luxury campaign detail",
      stylingNotes:
        "clean luxury, seamless studio atmosphere, polished commercial beauty finish",
    },
  },
  {
    id: "warm_beige",
    label: "Warm Beige Studio",
    description: "Fondo beige cálido, editorial limpio, piel luminosa.",
    notes:
      "Warm beige studio, refined editorial portraiture, luminous skin, premium campaign feel, dark-brown eyes.",
    plan: {
      creativeDirection: "warm beige editorial campaign",
      location: "a refined beige editorial set with textured walls",
      lighting:
        "soft diffused studio lighting with elegant skin highlights",
      stylingNotes:
        "warm neutral palette, polished beauty finish, editorial softness",
    },
  },
  {
    id: "beauty_crop",
    label: "Beauty Close Crop",
    description: "Close-up potente de rostro, piel, ojos y pelo.",
    notes:
      "Beauty close crop, premium skin detail, expensive close-up portraiture, dark-brown eyes, controlled studio light.",
    plan: {
      creativeDirection: "high-end beauty editorial",
      albumPose: "close beauty crop with a soft head tilt and direct gaze",
      lighting:
        "beauty-dish lighting with premium magazine finish",
      lens:
        "captured on a medium-format style portrait setup with luxurious detail",
      stylingNotes:
        "expensive beauty crop, skin detail, elegant facial presence",
    },
  },
  {
    id: "full_body_catalogue",
    label: "Full-Body Catalogue",
    description: "Fotos de cuerpo completo, claras, útiles y comerciales.",
    notes:
      "Full-body catalogue clarity, clean commercial posing, premium fashion presentation, dark-brown eyes.",
    plan: {
      creativeDirection: "modern catalogue campaign",
      albumPose: "standing with one shoulder angled toward camera, confident posture, subtle movement in the hips",
      lighting:
        "clean white seamless studio lighting with subtle shadow definition",
      stylingNotes:
        "commercial catalogue clarity, full look visibility, clean structure",
    },
  },
  {
    id: "seated_studio",
    label: "Seated Studio",
    description: "Retratos sentados, elegantes, controlados y premium.",
    notes:
      "Seated studio portraits, refined posture, premium commercial elegance, dark-brown eyes.",
    plan: {
      creativeDirection: "minimal studio fashion story",
      albumPose: "seated on a clean studio cube with elegant posture and relaxed hands",
      location: "a premium white cyc studio",
      stylingNotes:
        "elegant seated portrait series, polished luxury posture, campaign restraint",
    },
  },
  {
    id: "commercial_denim",
    label: "Commercial Denim",
    description: "Tanque blanco y denim limpio, look comercial poderoso.",
    notes:
      "Commercial denim session, premium white tank, polished jeans styling, studio realism, dark-brown eyes.",
    plan: {
      creativeDirection: "high-end social campaign",
      wardrobe:
        "a crisp white tank with premium denim, a polished belt, and pointed heels",
      location: "a pristine luxury white seamless studio with subtle sculpted shadows",
      lighting:
        "soft diffused studio lighting with elegant skin highlights",
      stylingNotes:
        "premium denim commercial shoot, polished basics, clean campaign finish",
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
      googleQualityMode === "premium"
        ? "Estimado usando Google Premium en imagen nativa. Es el modo más caro, pero el más fuerte para identidad."
        : "Estimado usando Google Economy. Lo dejé barato, pero sigue siendo mucho más flojo que Premium.",
  };
}

const providerLabels: Record<StudioProvider, string> = {
  google: "Google Vertex AI",
  openai: "OpenAI GPT Image",
};

export function getStudioProviderLabel(provider: StudioProvider) {
  return providerLabels[provider];
}
