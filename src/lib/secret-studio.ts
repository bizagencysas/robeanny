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
  "captured on an 85mm portrait lens with realistic depth of field",
  "captured on a 50mm fashion lens with crisp eyes and natural perspective",
  "captured on a 70mm editorial lens with premium magazine sharpness",
  "captured on a medium-format style portrait setup with luxurious detail",
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

export function buildSecretStudioPrompt({
  notes,
  direction,
  aspectRatio,
  iteration,
}: {
  notes: string;
  direction: string;
  aspectRatio: StudioAspectRatio;
  iteration: number;
}) {
  assertSafeCreativeNotes(notes);

  const baseOffset = hashText(`${direction}|${notes}`) + iteration * 7;
  const creativeDirection = pickVariant(creativeDirections, baseOffset);
  const wardrobe = pickVariant(wardrobeIdeas, baseOffset + 1);
  const pose = pickVariant(poseIdeas, baseOffset + 2);
  const hair = pickVariant(hairIdeas, baseOffset + 3);
  const lighting = pickVariant(lightingIdeas, baseOffset + 4);
  const location = pickVariant(locationIdeas, baseOffset + 5);
  const lens = pickVariant(lensIdeas, baseOffset + 6);

  const prompt = [
    "Create a premium professional fashion photo of the same adult woman shown in the reference images.",
    "Preserve her exact identity, facial structure, skin tone, body proportions, smile, and beauty details so she remains unmistakably the same person.",
    `Creative direction: ${creativeDirection}.`,
    `Wardrobe: ${wardrobe}.`,
    `Pose: ${pose}.`,
    `Hair styling: ${hair}.`,
    `Lighting: ${lighting}.`,
    `Location: ${location}.`,
    `Camera: ${lens}.`,
    `Aspect ratio target: ${aspectRatio}.`,
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
      pose,
      hair,
      lighting,
      location,
      lens,
    },
  };
}
