import { createHash, timingSafeEqual } from "crypto";
import {
  SECRET_STUDIO_FALLBACK_REFERENCES,
  StudioAspectRatio,
  StudioProvider,
  getStudioProviderLabel,
} from "@/lib/secret-studio-shared";

export const SECRET_STUDIO_COOKIE = "__robeanny_ss";
export const SECRET_STUDIO_DEFAULT_CODE = "ROBEANNYBASTARDO";
export { SECRET_STUDIO_FALLBACK_REFERENCES, getStudioProviderLabel };
export type { StudioAspectRatio, StudioProvider };

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

const disallowedPromptTerms = [
  "desnuda",
  "desnudo",
  "nude",
  "nudity",
  "topless",
  "bottomless",
  "porn",
  "porno",
  "nsfw",
  "genitals",
  "fetish",
  "explicit sex",
  "sexo explícito",
  "cameltoe",
  "see-through lingerie",
  "transparent lingerie",
  "labios genitales",
];

const creativeDirections = [
  "ultra-premium luxury studio campaign",
  "luxury campaign portrait",
  "clean beauty editorial",
  "minimal studio fashion story",
  "modern catalogue campaign",
  "sunlit resort editorial",
  "cinematic rooftop fashion frame",
  "soft neutral lookbook",
  "high-end social campaign",
];

const wardrobeIdeas = [
  "a structured ivory blazer over a silk camisole with tailored wide-leg trousers",
  "a monochrome black fashion set with a fitted turtleneck bodysuit and sharp heels",
  "a soft champagne slip dress with minimalist gold jewelry and elegant sandals",
  "a crisp white tank with premium denim, a polished belt, and pointed heels",
  "a fitted espresso knit dress with clean modern accessories",
  "a chic oversized shirt with sculpted shorts and refined knee-high boots",
  "a minimalist cream set with a ribbed top and fluid trousers",
  "a sleek after-dark look with a satin blazer and refined fashion styling",
];

const poseIdeas = [
  "standing with one shoulder angled toward camera, confident posture, subtle movement in the hips",
  "seated on a clean studio cube with elegant posture and relaxed hands",
  "walking mid-step as if captured during a fashion campaign",
  "close beauty crop with a soft head tilt and direct gaze",
  "leaning lightly against a textured wall with effortless confidence",
  "three-quarter pose emphasizing long lines and graceful posture",
  "editorial floor pose that remains tasteful, elegant, and fully clothed",
  "natural candid pose adjusting the jacket while looking past the lens",
];

const hairIdeas = [
  "soft polished waves with clean volume",
  "a sleek straight blowout with healthy shine",
  "a refined high ponytail with face-framing strands",
  "glossy loose curls with movement",
  "a sculpted bun with delicate tendrils",
  "a brushed-back editorial wet-look finish",
  "an elevated half-up style with soft texture",
  "smooth side-parted glamour hair",
];

const lightingIdeas = [
  "ultra-refined studio softbox lighting with perfect highlight rolloff and luxury skin rendering",
  "soft diffused studio lighting with elegant skin highlights",
  "bright editorial daylight entering from one side",
  "cinematic golden-hour light with gentle contrast",
  "clean white seamless studio lighting with subtle shadow definition",
  "warm luxury interior lighting with polished specular highlights",
  "beauty-dish lighting with premium magazine finish",
  "moody but refined side lighting with accurate skin tones",
  "sunset rim light with balanced facial exposure",
];

const locationIdeas = [
  "a pristine luxury white seamless studio with subtle sculpted shadows",
  "a premium white cyc studio",
  "a refined beige editorial set with textured walls",
  "a bright contemporary penthouse interior",
  "a luxury hotel suite with restrained styling",
  "a minimal concrete rooftop at blue hour",
  "a softly lit dressing room with fashion campaign styling",
  "a sunlit Mediterranean-inspired terrace",
  "a polished neutral backdrop with subtle shadows",
];

const lensIdeas = [
  "captured on a top-tier medium-format studio setup with ultra-premium optics, immaculate dynamic range, and luxury campaign detail",
  "captured on an 85mm portrait lens with realistic depth of field",
  "captured on a 50mm fashion lens with crisp eyes and natural perspective",
  "captured on a 70mm editorial lens with premium magazine sharpness",
  "captured on a medium-format style portrait setup with luxurious detail",
];

const framingIdeas = [
  "full-body frame with elegant posture and clean negative space",
  "three-quarter portrait emphasizing silhouette and styling",
  "waist-up fashion portrait with direct editorial presence",
  "beauty close-up centered on face, hair, and makeup",
  "seated composition with full outfit clearly visible",
  "walking fashion frame with movement in fabric and hair",
  "side profile editorial crop with strong jawline and posture",
  "over-the-shoulder portrait with luxury campaign energy",
];

const expressionIdeas = [
  "soft confident gaze",
  "subtle half-smile",
  "serious editorial expression",
  "fresh luminous beauty expression",
  "playful but refined attitude",
  "calm poised confidence",
  "elevated campaign energy",
  "magazine-cover presence",
];

const polishRules = [
  "photorealistic",
  "premium retouching while keeping natural skin texture",
  "accurate anatomy",
  "realistic hands and fingers",
  "tasteful editorial styling",
  "no text or logos",
  "no watermark",
  "no extra people",
  "no distorted garments",
  "no duplicated limbs",
  "no uncanny eyes",
  "no plastic skin",
];

const stylingNotesIdeas = [
  "seamless studio set, luxury beauty retouching, elite commercial polish, expensive campaign finish",
  "premium gold jewelry, refined manicure, polished campaign finish",
  "minimalist styling, clean silhouette, luxury catalogue energy",
  "soft glam makeup, elevated accessories, modern editorial polish",
  "sleek fashion styling, restrained palette, premium beauty detail",
  "high-end commercial styling, wearable luxury, crisp finish",
  "editorial sophistication, elegant textures, confident campaign energy",
];

const openAiSizeByAspectRatio: Record<StudioAspectRatio, "1024x1024" | "1024x1536" | "1536x1024"> = {
  "1:1": "1024x1024",
  "3:4": "1024x1536",
  "4:5": "1024x1536",
  "9:16": "1024x1536",
  "16:9": "1536x1024",
};

export function getSecretStudioCode() {
  return process.env.SS_ACCESS_CODE?.trim() || SECRET_STUDIO_DEFAULT_CODE;
}

function getSecretStudioSessionSecret() {
  return process.env.SS_ACCESS_SESSION_SECRET?.trim() || `${getSecretStudioCode()}::robeanny-secret-studio`;
}

export function createSecretStudioSessionToken() {
  return createHash("sha256")
    .update(`access::${getSecretStudioSessionSecret()}`)
    .digest("hex");
}

export function hasSecretStudioAccess(rawCookieValue?: string) {
  if (!rawCookieValue) return false;

  const expected = createSecretStudioSessionToken();
  const incoming = Buffer.from(rawCookieValue);
  const target = Buffer.from(expected);

  return incoming.length === target.length && timingSafeEqual(incoming, target);
}

export function isSecretStudioCodeValid(candidate: string) {
  return candidate.trim() === getSecretStudioCode();
}

export function getAvailableStudioProviders(): StudioProvider[] {
  const providers: StudioProvider[] = [];

  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY) {
    providers.push("google");
  }

  if (process.env.OPENAI_API_KEY) {
    providers.push("openai");
  }

  return providers;
}

export function getGoogleApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
}

export function getOpenAiImageSize(aspectRatio: StudioAspectRatio) {
  return openAiSizeByAspectRatio[aspectRatio];
}

export function createRecipeSignature(recipe: Record<string, string>) {
  return createHash("sha1")
    .update(JSON.stringify(recipe))
    .digest("hex");
}

export function assertSafeCreativeNotes(notes: string) {
  const normalized = notes.toLowerCase();
  const match = disallowedPromptTerms.find((term) => normalized.includes(term));

  if (match) {
    throw new Error(
      "Solo se permiten sesiones editoriales y fashion para adultos con consentimiento. Quité solicitudes explícitas o de desnudo para mantener el flujo seguro."
    );
  }
}

function pickVariant(options: string[], offset: number) {
  return options[((offset % options.length) + options.length) % options.length];
}

function hashText(text: string) {
  return Array.from(text).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function normalizePlanValue(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

export function buildSecretStudioPrompt({
  provider,
  faceLockStrong = true,
  plan,
  notes,
  direction,
  aspectRatio,
  iteration,
  albumSeed = "",
  variantOffset = 0,
  shotIndex = 0,
}: {
  provider: StudioProvider;
  faceLockStrong?: boolean;
  plan?: Partial<SecretStudioCreativePlan>;
  notes: string;
  direction: string;
  aspectRatio: StudioAspectRatio;
  iteration: number;
  albumSeed?: string;
  variantOffset?: number;
  shotIndex?: number;
}) {
  assertSafeCreativeNotes(notes);

  const baseOffset =
    hashText(`${provider}|${direction}|${notes}|${aspectRatio}|${albumSeed}`) +
    iteration * 97 +
    variantOffset * 211;
  const creativeDirection = normalizePlanValue(
    plan?.creativeDirection,
    pickVariant(creativeDirections, baseOffset)
  );
  const wardrobe = normalizePlanValue(
    plan?.wardrobe,
    pickVariant(wardrobeIdeas, baseOffset + 1)
  );
  const basePose = normalizePlanValue(
    plan?.albumPose,
    pickVariant(poseIdeas, baseOffset + 2)
  );
  const hair = normalizePlanValue(
    plan?.hair,
    pickVariant(hairIdeas, baseOffset + 3)
  );
  const lighting = normalizePlanValue(
    plan?.lighting,
    pickVariant(lightingIdeas, baseOffset + 4)
  );
  const location = normalizePlanValue(
    plan?.location,
    pickVariant(locationIdeas, baseOffset + 5)
  );
  const baseLens = normalizePlanValue(
    plan?.lens,
    pickVariant(lensIdeas, baseOffset + 6)
  );
  const stylingNotes = normalizePlanValue(
    plan?.stylingNotes,
    pickVariant(stylingNotesIdeas, baseOffset + 7)
  );
  const framing = pickVariant(framingIdeas, baseOffset + shotIndex);
  const expression = pickVariant(expressionIdeas, baseOffset + shotIndex + 2);
  const shotPose = pickVariant(poseIdeas, baseOffset + 2 + shotIndex);
  const shotLens =
    shotIndex % 2 === 0
      ? baseLens
      : pickVariant(lensIdeas, baseOffset + 6 + shotIndex);
  const identityLockInstructions = faceLockStrong
    ? [
        "Treat facial identity preservation as the top priority.",
        "This must be the exact same real woman from the references, not a reinterpretation or inspired-by version.",
        "Preserve her exact face shape, brow structure, eyelid shape, nose bridge, nose tip, lip shape, smile line, cheek volume, jawline, chin, hairline, and skin tone.",
        "Preserve subtle asymmetries and recognizable beauty details visible in the references.",
        "Do not beautify by changing ethnicity, age, eye shape, lip fullness, bone structure, or facial proportions.",
        "Her eyes must remain dark brown, never hazel, green, blue, or gray.",
        "Maintain dark-brown irises consistently across every image in the album.",
      ].join(" ")
    : "";
  const openAiIdentityLock =
    provider === "openai"
      ? [
          "Use the first reference image as the primary face identity anchor and treat the remaining references as support for angle and consistency.",
          "Identity accuracy is more important than styling creativity.",
          "This must be the exact same real woman from the references, not a lookalike, twin, or inspired-by version.",
          "Do not change her face shape, eyes, nose, lips, smile line, brow structure, cheek volume, jawline, hairline, or skin tone.",
          "Preserve recognizable beauty details and subtle asymmetries whenever visible in the references.",
          "Keep the face highly faithful across all images in the album even when pose, framing, or camera angle changes.",
        ].join(" ")
      : "";

  const prompt = [
    "Create a premium professional fashion photo of the same adult woman shown in the reference images.",
    "Preserve her exact identity, facial structure, skin tone, body proportions, smile, and beauty details so she remains unmistakably the same person.",
    identityLockInstructions,
    openAiIdentityLock,
    "Visual target: an ultra-professional studio photoshoot with elite commercial polish, as if captured on an extraordinary world-class medium-format fashion setup.",
    `Creative direction: ${creativeDirection}.`,
    `Wardrobe: ${wardrobe}.`,
    `Album continuity rule: keep the exact same wardrobe, same outfit pieces, same accessories, same makeup direction, and same hairstyle across every image in this album.`,
    `Hair continuity rule: keep the exact same hair color, hair length, parting, texture, and styling across every image in this album.`,
    `Pose: ${shotPose}.`,
    `Hair styling: ${hair}.`,
    `Lighting: ${lighting}.`,
    `Location: ${location}.`,
    `Camera: ${shotLens}.`,
    `Styling notes: ${stylingNotes}.`,
    `Framing: ${framing}.`,
    `Expression: ${expression}.`,
    `Aspect ratio target: ${aspectRatio}.`,
    "Eye color must be dark brown.",
    "Only the pose, framing, expression, and camera crop may change from shot to shot. Do not change haircut, hair styling, wardrobe, set concept, or beauty styling within the album.",
    "Prefer a polished studio environment, seamless premium backdrop, controlled shadows, elegant contrast, crisp facial detail, and expensive commercial beauty finish.",
    "The final image must look like a real luxury editorial photoshoot, fully clothed, tasteful, elegant, and commercially usable.",
    "Keep the styling elevated, photorealistic, and current. Add natural micro-details in skin, hair, fabric texture, and lighting falloff.",
    `Follow these quality rules: ${polishRules.join(", ")}.`,
    notes ? `Extra creative notes from the user: ${notes.trim()}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    prompt,
    recipe: {
      creativeDirection,
      wardrobe,
      pose: shotPose,
      albumPose: basePose,
      hair,
      lighting,
      location,
      lens: baseLens,
      stylingNotes,
      framing,
      expression,
      eyeColor: "dark brown",
      faceLock: faceLockStrong ? "strong" : "standard",
    },
  };
}
