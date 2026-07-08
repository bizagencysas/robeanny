import { createHash, timingSafeEqual } from "crypto";
import { readdirSync } from "fs";
import path from "path";
import {
  SECRET_STUDIO_LEGACY_FACE_FALLBACK,
  StudioAspectRatio,
  StudioProvider,
  StudioStyleBrief,
  getStudioProviderLabel,
} from "@/lib/secret-studio-shared";

export const SECRET_STUDIO_COOKIE = "__robeanny_ss";
export const SECRET_STUDIO_DEFAULT_CODE = "ROBEANNYBASTARDO";
export { SECRET_STUDIO_LEGACY_FACE_FALLBACK, getStudioProviderLabel };
export type { StudioAspectRatio, StudioProvider, StudioStyleBrief };

/** Carpeta pública donde Robeanny coloca sus fotos NUEVAS de rostro (post-nariz). */
export const SECRET_STUDIO_IDENTITY_DIR = "robeanny-face";

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

const qualityRules = [
  "photorealistic",
  "light professional retouching while keeping natural skin texture",
  "accurate anatomy",
  "realistic hands and fingers",
  "no text or logos",
  "no watermark",
  "no extra people",
  "no distorted garments",
  "no duplicated limbs",
  "no uncanny eyes",
  "no plastic or waxy skin",
  "no CGI look",
  "no doll-like facial symmetry",
  "keep natural fabric folds and believable garment wrinkles",
];

/**
 * Direcciones de toma por defecto. Se usan cuando el planner no devuelve
 * direcciones propias (p. ej. sin referencias de estilo o si falla la visión).
 */
const defaultShotDirections = [
  "Opening hero frame: facing the camera with direct eye contact, waist-up or three-quarter crop, clean posture, strongest identity match.",
  "Different angle: three-quarter body turned slightly away with the head looking back over the shoulder, different crop than shot 1.",
  "Movement frame: walking mid-step or adjusting the outfit with visible body movement, full-body or knee-up crop, different silhouette.",
  "Close portrait: tight beauty crop from the chest up, soft head tilt, different expression, maximum facial detail.",
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

/**
 * Lee la carpeta `public/robeanny-face/` y devuelve las rutas públicas de las
 * fotos de identidad. Si está vacía, cae a las fotos viejas (nariz previa) y
 * marca `source: "legacy"` para que la UI avise.
 */
export function getRobeannyIdentityReferences(): {
  references: string[];
  source: "folder" | "legacy";
} {
  try {
    const dir = path.join(process.cwd(), "public", SECRET_STUDIO_IDENTITY_DIR);
    const files = readdirSync(dir)
      .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
      .sort((left, right) => left.localeCompare(right));

    if (files.length) {
      return {
        references: files.map((file) => `/${SECRET_STUDIO_IDENTITY_DIR}/${file}`),
        source: "folder",
      };
    }
  } catch {
    // La carpeta puede no existir todavía: caemos al fallback.
  }

  return {
    references: [...SECRET_STUDIO_LEGACY_FACE_FALLBACK],
    source: "legacy",
  };
}

export function getAvailableStudioProviders(): StudioProvider[] {
  const providers: StudioProvider[] = [];

  // OpenAI (GPT Image 2) es el motor principal: va primero para que sea el
  // proveedor por defecto cuando su API key está configurada.
  if (process.env.OPENAI_API_KEY) {
    providers.push("openai");
  }

  if (hasVertexAiConfiguration()) {
    providers.push("google");
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

export function getDefaultShotDirection(shotIndex: number) {
  return (
    defaultShotDirections[shotIndex] ||
    defaultShotDirections[defaultShotDirections.length - 1]
  );
}

/**
 * Normaliza el brief que devuelve el planner de estilo hacia un objeto seguro,
 * con exactamente `albumSize` direcciones de toma.
 */
export function normalizeStyleBrief(
  value: unknown,
  albumSize: number,
  fallbackNotes = ""
): StudioStyleBrief {
  const candidate =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  const asText = (raw: unknown, fallback: string) => {
    const text = typeof raw === "string" ? raw.trim() : "";
    return text || fallback;
  };

  const notesHint = fallbackNotes.trim();

  const rawShots = Array.isArray(candidate.shots)
    ? candidate.shots.filter((item): item is string => typeof item === "string")
    : [];

  const shots = Array.from({ length: albumSize }, (_, index) => {
    const provided = rawShots[index]?.trim();
    return provided || getDefaultShotDirection(index);
  });

  return {
    wardrobe: asText(
      candidate.wardrobe,
      notesHint || "the same outfit shown in the style references, reproduced faithfully"
    ),
    setDesign: asText(
      candidate.setDesign,
      "the same set, backdrop and location shown in the style references"
    ),
    lighting: asText(
      candidate.lighting,
      "the same lighting quality and direction shown in the style references"
    ),
    mood: asText(candidate.mood, "the same overall mood and energy as the style references"),
    colorPalette: asText(
      candidate.colorPalette,
      "the same color palette as the style references"
    ),
    styling: asText(
      candidate.styling,
      "the same hair, makeup and accessory styling as the style references"
    ),
    shots,
  };
}

function buildIdentityLock(faceLockStrong: boolean) {
  if (!faceLockStrong) {
    return "Keep her recognizable identity from the IDENTITY reference photos while allowing some creative freedom.";
  }

  return [
    "ABSOLUTE PRIORITY: facial identity preservation is the #1 constraint, above every styling or creative direction.",
    "This must be the exact same real woman shown in the IDENTITY reference photos — not a reinterpretation, lookalike, twin, or inspired-by version.",
    "Her face comes ENTIRELY from the IDENTITY reference photos. Reproduce her exact face shape, brow structure, eyelid shape, lip shape, smile line, cheek volume, jawline, chin, hairline and skin tone.",
    "Reproduce the exact shape of her NOSE as it appears in the IDENTITY reference photos — the nose bridge, nose tip and nostrils must match those photos. Do NOT use any generic, remembered or averaged nose, and never take the nose from the style references.",
    "Preserve subtle asymmetries and recognizable beauty details visible in the IDENTITY references. Do not beautify by changing ethnicity, age, eye shape, lip fullness, bone structure or facial proportions.",
    "Match her REAL body shape and proportions from the IDENTITY references — keep her actual figure and weight. Do NOT make her look heavier, curvier, thinner, taller or shorter than she is, and do not exaggerate any body part.",
    "She is in her early 20s and looks very young and baby-faced. Never age her: no wrinkles, no expression lines, no forehead lines, no crow's feet, no nasolabial folds, no hollow cheeks, no thinning lips.",
    "Her eyes must remain dark brown — never hazel, green, blue or gray.",
    "If you cannot match the identity exactly, err on the side of copying the face from the IDENTITY references more literally rather than less.",
  ].join(" ");
}

/**
 * Construye el prompt de una toma en modo "réplica de estilo":
 * la identidad sale de las fotos de Robeanny; el look sale del brief de estilo.
 */
export function buildSecretStudioPrompt({
  provider,
  faceLockStrong = true,
  brief,
  notes,
  aspectRatio,
  shotIndex = 0,
}: {
  provider: StudioProvider;
  faceLockStrong?: boolean;
  brief: StudioStyleBrief;
  notes: string;
  aspectRatio: StudioAspectRatio;
  shotIndex?: number;
}) {
  assertSafeCreativeNotes(notes);

  const shotDirection =
    brief.shots[shotIndex]?.trim() || getDefaultShotDirection(shotIndex);
  const identityLock = buildIdentityLock(faceLockStrong);
  const openAiIdentityLock =
    provider === "openai"
      ? "Use the IDENTITY reference image(s) as the primary face anchor. Identity accuracy is more important than styling creativity. When in doubt, copy her face — including her nose — more literally."
      : "";

  const prompt = [
    "Create a believable professional photograph of the SAME real adult woman shown in the IDENTITY reference photos.",
    "IDENTITY IS THE #1 PRIORITY. The output must be unmistakably, recognizably the same person from the IDENTITY references.",
    identityLock,
    openAiIdentityLock,
    "STYLE TARGET: faithfully reproduce the wardrobe, set, lighting, color, mood and overall composition of the STYLE reference images — but replace whoever appears in them with the woman from the IDENTITY references.",
    `Wardrobe to reproduce: ${brief.wardrobe}.`,
    `Set / location to reproduce: ${brief.setDesign}.`,
    `Lighting to reproduce: ${brief.lighting}.`,
    `Mood / vibe: ${brief.mood}.`,
    `Color palette: ${brief.colorPalette}.`,
    `Styling details (hair, makeup, accessories): ${brief.styling}.`,
    `This shot: ${shotDirection}.`,
    `Aspect ratio target: ${aspectRatio}.`,
    "Album continuity: keep the exact same wardrobe, hairstyle, makeup and set across all images in this album. Only the pose, framing, angle and expression may change from shot to shot.",
    "Never copy the FACE, nose or head identity from the STYLE references — those images are only for wardrobe, set, lighting, color and mood.",
    "Never copy the CLOTHING from the IDENTITY references — those images are only for her face and body identity.",
    "Prefer grounded realism: believable skin texture with visible pores, natural studio/scene shadows, realistic clothing construction and natural human anatomy.",
    "Sensual energy is allowed only when it stays fully clothed, non-explicit, editorial and tasteful. No nudity, no transparent garments, no explicit exposure.",
    "The final image must look like a real contemporary fashion photograph, fully clothed, youthful and commercially usable.",
    `Follow these quality rules: ${qualityRules.join(", ")}.`,
    notes ? `Extra creative notes from the user: ${notes.trim()}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    prompt,
    recipe: {
      wardrobe: brief.wardrobe,
      setDesign: brief.setDesign,
      lighting: brief.lighting,
      mood: brief.mood,
      colorPalette: brief.colorPalette,
      styling: brief.styling,
      shot: shotDirection,
      eyeColor: "dark brown",
      faceLock: faceLockStrong ? "strong" : "standard",
    },
  };
}
