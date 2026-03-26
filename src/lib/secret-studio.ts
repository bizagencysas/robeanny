import { createHash, timingSafeEqual } from "crypto";
import {
  SECRET_STUDIO_FALLBACK_REFERENCES,
  SecretStudioCreativePlan,
  StudioAspectRatio,
  StudioProvider,
  getStudioProviderLabel,
} from "@/lib/secret-studio-shared";

export const SECRET_STUDIO_COOKIE = "__robeanny_ss";
export const SECRET_STUDIO_DEFAULT_CODE = "ROBEANNYBASTARDO";
export { SECRET_STUDIO_FALLBACK_REFERENCES, getStudioProviderLabel };
export type { StudioAspectRatio, StudioProvider };
export type { SecretStudioCreativePlan };

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
  "same woman from the references in a grounded studio fashion portrait",
  "same woman from the references in a clean studio model portrait",
  "same woman from the references in a real beauty portrait session",
  "same woman from the references in a minimal studio fashion story",
  "same woman from the references in a modern catalogue portrait",
  "same woman from the references in a neutral daylight studio editorial",
  "same woman from the references in a soft contemporary studio frame",
  "same woman from the references in a refined lookbook realism",
  "same woman from the references in a high-fidelity studio model portrait",
];

const wardrobeIdeas = [
  "a fitted monochrome bodysuit with sharp heels and minimal jewelry",
  "a soft champagne slip dress with delicate gold jewelry and elegant sandals",
  "a crisp white tank with clean denim, a polished belt, and pointed heels",
  "a fitted espresso knit dress with clean modern accessories",
  "a sculpted mini dress with a sleek silhouette and long clean lines",
  "a refined bandeau top with a fluid matching skirt and elegant heels",
  "a minimalist ribbed set with a body-skimming top and fitted skirt",
  "a sleek after-dark satin set with understated styling",
  "a velvet evening dress with long clean lines and restrained jewelry",
  "a polished leather editorial look with sleek studio styling",
  "a silk slip-inspired look with elegant heels and minimal accessories",
  "a high-fashion studio look with a body-conscious silhouette and clean styling",
];

const poseIdeas = [
  "standing with one shoulder angled toward camera, confident posture, subtle movement in the hips",
  "seated on a clean studio cube with elegant posture and relaxed hands",
  "walking mid-step as if captured during a real studio session",
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
  "controlled studio softbox lighting with natural highlight rolloff and believable skin texture",
  "soft diffused studio lighting with clean facial highlights and realistic shadow falloff",
  "bright editorial daylight entering from one side",
  "cinematic golden-hour light with gentle contrast",
  "clean white seamless studio lighting with subtle but believable shadow definition",
  "warm interior studio lighting with restrained specular highlights",
  "beauty-dish lighting with realistic skin texture and precise facial definition",
  "moody but refined side lighting with accurate skin tones and natural contrast",
  "sunset rim light with balanced facial exposure",
];

const locationIdeas = [
  "a clean white seamless studio with subtle sculpted shadows",
  "a clean white cyc studio",
  "a refined beige editorial set with textured walls",
  "a bright contemporary penthouse interior",
  "a refined hotel-style interior with restrained styling",
  "a minimal concrete rooftop at blue hour",
  "a softly lit dressing room with restrained styling",
  "a sunlit Mediterranean-inspired terrace",
  "a polished neutral backdrop with subtle shadows",
];

const lensIdeas = [
  "captured like a real professional studio photograph with natural depth of field, crisp focus on the eyes, and believable lens behavior",
  "captured on an 85mm portrait lens with realistic depth of field",
  "captured on a 50mm fashion lens with crisp eyes and natural perspective",
  "captured on a 70mm editorial lens with restrained commercial sharpness",
  "captured like a high-end portrait session with detailed skin texture and believable optics",
];

const framingIdeas = [
  "full-body frame with elegant posture and clean negative space",
  "three-quarter portrait emphasizing silhouette and styling",
  "waist-up fashion portrait with direct editorial presence",
  "beauty close-up centered on face, hair, and makeup",
  "seated composition with full outfit clearly visible",
  "walking fashion frame with movement in fabric and hair",
  "side profile editorial crop with strong jawline and posture",
  "over-the-shoulder portrait with grounded studio energy",
];

const expressionIdeas = [
  "soft confident gaze",
  "subtle half-smile",
  "serious editorial expression",
  "fresh luminous beauty expression",
  "playful but refined attitude",
  "calm poised confidence",
  "quiet confident energy",
  "magazine-cover presence",
];

const polishRules = [
  "photorealistic",
  "light professional retouching while keeping natural skin texture",
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
  "no CGI look",
  "no doll-like facial symmetry",
  "no mannequin pose",
  "no overly smooth gradient background",
  "keep natural fabric folds and believable garment wrinkles",
  "NEVER dress her as a businesswoman, executive, office worker, marketing professional, or corporate woman",
  "NEVER put her in a black blazer, suit jacket, structured blazer, business suit, or officewear of any kind",
  "NEVER create a LinkedIn headshot, corporate portrait, graduation photo, or business-casual look",
];

const stylingNotesIdeas = [
  "clean studio set, restrained retouching, believable beauty finish, polished but real commercial result",
  "refined jewelry, clean manicure, polished studio realism",
  "minimalist styling, clean silhouette, grounded catalogue energy",
  "soft glam makeup, restrained accessories, modern editorial realism",
  "sleek fashion styling, restrained palette, believable beauty detail",
  "high-end commercial styling with real fabric texture and crisp finish",
  "editorial sophistication, elegant textures, and believable studio realism",
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
  if (isSecretStudioAuthDisabled()) return true;
  if (!rawCookieValue) return false;

  const expected = createSecretStudioSessionToken();
  const incoming = Buffer.from(rawCookieValue);
  const target = Buffer.from(expected);

  return incoming.length === target.length && timingSafeEqual(incoming, target);
}

export function isSecretStudioCodeValid(candidate: string) {
  if (isSecretStudioAuthDisabled()) return true;
  return candidate.trim() === getSecretStudioCode();
}

export function isSecretStudioAuthDisabled() {
  return (
    process.env.SS_DISABLE_AUTH === "true" || process.env.RENDER === "true"
  );
}

export function getSecretStudioCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "*";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

export function getAvailableStudioProviders(): StudioProvider[] {
  const providers: StudioProvider[] = [];

  if (hasVertexAiConfiguration()) {
    providers.push("google");
  }

  if (process.env.OPENAI_API_KEY) {
    providers.push("openai");
  }

  return providers;
}

export function getVertexAiProjectId() {
  return (
    process.env.VERTEX_AI_PROJECT_ID?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.GCLOUD_PROJECT?.trim() ||
    "perfect-crow-450723-i3"
  );
}

export function getVertexAiLocation() {
  return (
    process.env.VERTEX_AI_LOCATION?.trim() ||
    process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
    "us-central1"
  );
}

export function getGoogleCredentialsJson() {
  return process.env.GOOGLE_CREDENTIALS_JSON?.trim() || "";
}

type GoogleServiceAccountCredentials = Record<string, string> & {
  client_email: string;
  private_key: string;
};

function normalizeGoogleCredentialsCandidate(raw: string) {
  const trimmed = raw.trim();

  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function validateGoogleCredentialsShape(
  parsed: unknown
): GoogleServiceAccountCredentials {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("missing-fields");
  }

  const record = parsed as Record<string, string>;

  if (!record.client_email || !record.private_key) {
    throw new Error("missing-fields");
  }

  return {
    ...record,
    client_email: record.client_email,
    private_key: record.private_key.replace(/\\n/g, "\n"),
  };
}

export function parseGoogleCredentialsJson() {
  const raw = getGoogleCredentialsJson();

  if (!raw) {
    throw new Error(
      "Falta `GOOGLE_CREDENTIALS_JSON` con el JSON completo de la cuenta de servicio para Vertex AI."
    );
  }

  try {
    return validateGoogleCredentialsShape(JSON.parse(raw));
  } catch { }

  const normalized = normalizeGoogleCredentialsCandidate(raw);

  try {
    return validateGoogleCredentialsShape(JSON.parse(normalized));
  } catch { }

  try {
    const decoded = Buffer.from(normalized, "base64").toString("utf8");
    return validateGoogleCredentialsShape(JSON.parse(decoded));
  } catch { }

  throw new Error(
    "`GOOGLE_CREDENTIALS_JSON` no contiene un JSON válido de cuenta de servicio. Pégalo como JSON completo, sin envolverlo en comillas extra. Si quieres, también acepto el JSON codificado en base64."
  );
}

export function getVertexAiConfigurationError() {
  const credentialsJson = getGoogleCredentialsJson();

  if (!credentialsJson) {
    return "Falta `GOOGLE_CREDENTIALS_JSON` con el JSON completo de la cuenta de servicio para Vertex AI.";
  }

  try {
    parseGoogleCredentialsJson();
    return null;
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "La configuración de Vertex AI no es válida.";
  }
}

export function hasVertexAiConfiguration() {
  const projectId = getVertexAiProjectId();
  const credentialsJson = getGoogleCredentialsJson();

  if (!projectId || !credentialsJson) {
    return false;
  }

  try {
    parseGoogleCredentialsJson();
    return true;
  } catch {
    return false;
  }
}

export function assertVertexAiConfiguration() {
  const projectId = getVertexAiProjectId();
  const location = getVertexAiLocation();
  const credentials = parseGoogleCredentialsJson();

  return {
    projectId,
    location,
    credentials,
  };
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

function getAlbumSlotInstruction(shotIndex: number) {
  const slotInstructions = [
    "Shot 1 of 4: opening hero frame. Standing pose facing the camera with direct eye contact, waist-up or three-quarter crop, clean posture, and the strongest identity match.",
    "Shot 2 of 4: clearly different angle. Three-quarter body turned away from the camera with the head looking back over the shoulder, different crop than shot 1.",
    "Shot 3 of 4: movement frame. Walking mid-step or adjusting clothing with visible body movement, full-body or knee-up crop, different silhouette from earlier shots.",
    "Shot 4 of 4: close portrait. Tight beauty crop from chest up or face-only close-up, soft head tilt, different expression from earlier shots, maximum facial detail.",
    "Bonus shot: unique variation unlike any earlier image. Choose a novel body line, unusual crop, or asymmetric composition.",
  ];

  return slotInstructions[shotIndex] || slotInstructions[slotInstructions.length - 1];
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
  const albumSlotInstruction = getAlbumSlotInstruction(shotIndex);
  const identityLockInstructions = faceLockStrong
    ? [
      "ABSOLUTE PRIORITY: Facial identity preservation is the #1 constraint, above all creative or styling direction.",
      "Treat facial identity preservation as the top priority.",
      "This must be the exact same real woman from the references, not a reinterpretation or inspired-by version.",
      "Preserve her exact face shape, brow structure, eyelid shape, nose bridge, nose tip, lip shape, smile line, cheek volume, jawline, chin, hairline, and skin tone.",
      "Preserve subtle asymmetries and recognizable beauty details visible in the references.",
      "Do not beautify by changing ethnicity, age, eye shape, lip fullness, bone structure, or facial proportions.",
      "Match the same apparent age visible in the references and keep her clearly young-adult. Never age her up, mature her features, or add older facial lines.",
      "Preserve youthful cheek fullness, smooth under-eyes, soft facial contours, and the exact same feminine facial balance from the references.",
      "Maintain exact facial geometry and lip shape from the high-resolution reference.",
      "Do not enlarge the lips, do not create filler-like lips, and do not increase lip volume beyond what is visible in the references.",
      "Do not sharpen, hollow, or age the cheeks, jawline, mouth area, or under-eyes.",
      "Do not average, blend, or generalize identity across references. The primary face anchor defines who she is.",
      "If you cannot match the identity exactly, err on the side of copying the face more literally rather than less.",
      "Her eyes must remain dark brown, never hazel, green, blue, or gray.",
      "Maintain dark-brown irises consistently across every image in the album.",
    ].join(" ")
    : "";
  const openAiIdentityLock =
    provider === "openai"
      ? [
        "Use the first reference image as the primary face identity anchor and treat the remaining references as support for angle and consistency.",
        "Identity accuracy is MORE IMPORTANT than styling creativity. When in doubt, copy the face more literally.",
        "This must be the exact same real woman from the references, not a lookalike, twin, or inspired-by version.",
        "Do not change her face shape, eyes, nose, lips, smile line, brow structure, cheek volume, jawline, hairline, or skin tone.",
        "Preserve recognizable beauty details and subtle asymmetries whenever visible in the references.",
        "Keep the face highly faithful across all images in the album even when pose, framing, or camera angle changes.",
        "If any creative instruction conflicts with facial identity, always prioritize the face from the reference.",
      ].join(" ")
      : "";

  const prompt = [
    "Create a believable professional studio fashion photo of the same adult woman shown in the reference images.",
    "IDENTITY IS THE #1 PRIORITY. The output must be unmistakably, recognizably the same person from the references.",
    "Preserve her exact identity, facial structure, skin tone, body proportions, smile, and beauty details so she remains unmistakably the same person.",
    identityLockInstructions,
    openAiIdentityLock,
    "Visual target: a real studio photograph by a top commercial photographer, not CGI, not synthetic, not beauty-filtered, and not overly airbrushed.",
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
    albumSlotInstruction,
    "Eye color must be dark brown.",
    "Use grounded realism over stylized glamour.",
    "Keep facial proportions natural, skin pores visible, studio shadows believable, and clothing construction realistic.",
    "Keep the lips at their exact natural volume from the references. No lip filler effect, no inflated mouth shape, no overlined-lip look.",
    "Keep the face young-adult, soft, and faithful to the references. No mature beauty campaign face and no executive portrait face.",
    "Avoid generic AI fashion look, waxy skin, over-designed wardrobe, fake facial symmetry, and synthetic background gradients.",
    "Only the pose, framing, expression, and camera crop may change from shot to shot. Do not change haircut, hair styling, wardrobe, set concept, or beauty styling within the album.",
    "Every photo in the album must be recognizably different from the others in pose, angle, crop, and gesture. Never duplicate a previous frame.",
    "Prefer a polished studio environment, clean seamless backdrop, controlled shadows, restrained contrast, crisp facial detail, and realistic beauty finish.",
    "The final image must look like a real contemporary editorial photoshoot, fully clothed, tasteful, elegant, and commercially usable.",
    "Keep the styling elevated but believable. Add natural micro-details in skin, hair, fabric texture, seams, folds, and lighting falloff.",
    "Avoid corporate wardrobe, officewear, business-casual styling, graduation-photo energy, or LinkedIn portrait vibes unless the user explicitly asks for that.",
    "HARD NEGATIVE: She is NOT a businesswoman, NOT a marketing executive, NOT a corporate professional, NOT an office worker. She is a young fashion model in an editorial session.",
    "NEVER dress her in a black blazer, suit jacket, structured blazer, pencil skirt, button-down shirt, business suit, or any executive/office wardrobe.",
    "NEVER create imagery that looks like a corporate headshot, LinkedIn photo, real estate agent portrait, or business-team photo.",
    "If the wardrobe or pose starts to look corporate, office-like, or executive, change it to something youthful, fashion-editorial, and model-test instead.",
    "Favor model-test energy, high-fashion editorial restraint, long clean lines, strong feminine silhouette, and modern studio styling.",
    "Sensual energy is allowed only when it remains fully clothed, non-explicit, editorial, and tasteful. No nudity, no transparent garments, no explicit exposure.",
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
