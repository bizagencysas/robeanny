import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { GoogleAuth } from "google-auth-library";
import {
  GoogleQualityMode,
  StudioAspectRatio,
  StudioProvider,
  StudioStyleBrief,
} from "@/lib/secret-studio-shared";
import {
  SECRET_STUDIO_COOKIE,
  assertVertexAiConfiguration,
  assertSafeCreativeNotes,
  buildSecretStudioPrompt,
  createRecipeSignature,
  getAvailableStudioProviders,
  getRobeannyIdentityReferences,
  getVertexAiConfigurationError,
  getOpenAiImageSize,
  getStudioProviderLabel,
  getSecretStudioCorsHeaders,
  hasSecretStudioAccess,
  normalizeStyleBrief,
} from "@/lib/secret-studio";

export const runtime = "nodejs";
export const maxDuration = 300;

type GenerateBody = {
  provider?: StudioProvider;
  notes?: string;
  aspectRatio?: StudioAspectRatio;
  iteration?: number;
  albumSize?: number;
  faceLockStrong?: boolean;
  albumSeed?: string;
  recentRecipes?: Array<Record<string, string>>;
  googleQualityMode?: GoogleQualityMode;
  /** Referencias de estilo que sube el usuario: el look a reproducir. */
  styleReferences?: string[];
};

type PreparedReference = {
  mimeType: string;
  base64: string;
  filename: string;
};

type VertexSession = {
  projectId: string;
  location: string;
  auth: GoogleAuth;
};

type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  folder: string;
};

type VertexGoogleImageSize = "1K" | "2K" | "4K";

type StreamEvent =
  | {
    type: "meta";
    provider: StudioProvider;
    providerLabel: string;
    prompt: string;
    prompts: string[];
    recipe: Record<string, string>;
    recipeSignature: string;
    aspectRatio: StudioAspectRatio;
    iteration: number;
    albumSize: number;
    googleQualityMode: GoogleQualityMode | null;
    note: string | null;
    identitySource: "folder" | "legacy";
    styleReferenceCount: number;
  }
  | {
    type: "progress";
    completed: number;
    total: number;
    stage: string;
  }
  | {
    type: "image";
    index: number;
    imageUrl: string;
    cloudinaryPublicId?: string;
    cloudinaryFolder?: string;
    prompt: string;
    completed: number;
    total: number;
    stage: string;
  }
  | {
    type: "done";
    completed: number;
    total: number;
  }
  | {
    type: "error";
    error: string;
  };

const maxStyleReferencesByProvider: Record<StudioProvider, number> = {
  google: 3,
  openai: 4,
};

// Máximo de imágenes (identidad + ancla de álbum + estilo) por llamada al
// modelo de imagen. GPT Image 2 acepta hasta 16; mantenemos un tope sano para
// no disparar latencia/costo (importante por el timeout de Vercel) y para no
// promediar demasiado la identidad al mezclar muchas caras.
const maxImagesPerCall: Record<StudioProvider, number> = {
  google: 5,
  openai: 6,
};

// Modelo de imagen de OpenAI: por defecto el último estable (GPT Image 2 /
// "ChatGPT Images 2.0"). Configurable por si cambia el ID en el futuro.
const OPENAI_IMAGE_MODEL =
  process.env.SS_OPENAI_IMAGE_MODEL || "gpt-image-2";
// Alias de respaldo por si el ID fijo no está habilitado en la cuenta.
const OPENAI_IMAGE_MODEL_FALLBACK = "chatgpt-image-latest";
// Calidad de imagen. Default "high" (la que se ve bien). Si hubiera timeouts,
// se puede bajar a "medium" (más rápida) con SS_OPENAI_IMAGE_QUALITY=medium.
const OPENAI_IMAGE_QUALITY = (
  process.env.SS_OPENAI_IMAGE_QUALITY || "high"
).toLowerCase();
// Moderación menos restrictiva: evita falsos "sexual" en moda editorial vestida.
const OPENAI_MODERATION = (
  process.env.SS_OPENAI_MODERATION || "low"
).toLowerCase();

const VERTEX_GEMINI_MODEL =
  process.env.VERTEX_GEMINI_MODEL || "gemini-2.5-flash";
const VERTEX_GOOGLE_IMAGE_MODEL =
  process.env.VERTEX_GOOGLE_IMAGE_MODEL ||
  process.env.GOOGLE_PREMIUM_IMAGE_MODEL ||
  process.env.VERTEX_IMAGEN_MODEL ||
  "gemini-3-pro-image-preview";
const VERTEX_GOOGLE_IMAGE_LOCATION =
  process.env.VERTEX_GOOGLE_IMAGE_LOCATION || "global";
const VERTEX_GOOGLE_IMAGE_ASPECT_RATIO = "3:4";
const DEFAULT_CLOUDINARY_CLOUD_NAME = "dwpbbjp1d";
const DEFAULT_CLOUDINARY_UPLOAD_PRESET = "robeanny_unsigned";
const DEFAULT_CLOUDINARY_FOLDER = "robeanny";

let cachedVertexSession: VertexSession | null = null;
let cachedVertexSessionKey = "";
let cloudinaryPresetEnsured = false;

function isAspectRatio(value: string): value is StudioAspectRatio {
  return ["1:1", "3:4", "4:5", "9:16", "16:9"].includes(value);
}

function getVertexGoogleImageSize(): VertexGoogleImageSize {
  const configured = process.env.VERTEX_GOOGLE_IMAGE_SIZE?.trim().toUpperCase();

  if (configured === "1K" || configured === "2K" || configured === "4K") {
    return configured;
  }

  return "2K";
}

function getFileExtension(mimeType: string) {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  return "bin";
}

function dataUrlToReference(dataUrl: string, filenameBase: string): PreparedReference {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);

  if (!match) {
    throw new Error("Una de las referencias no tiene un formato válido.");
  }

  const mimeType = match[1];
  const base64 = match[2];

  return {
    mimeType,
    base64,
    filename: `${filenameBase}.${getFileExtension(mimeType)}`,
  };
}

async function urlToReference(url: string, filenameBase: string): Promise<PreparedReference> {
  const resolvedUrl = toVertexCompatibleReferenceUrl(url);
  const response = await fetch(resolvedUrl);

  if (!response.ok) {
    throw new Error("No pude cargar una de las fotos de referencia.");
  }

  const arrayBuffer = await response.arrayBuffer();
  const mimeType = normalizeVertexReferenceMimeType(
    response.headers.get("content-type") || "image/jpeg"
  );

  return {
    mimeType,
    base64: Buffer.from(arrayBuffer).toString("base64"),
    filename: `${filenameBase}.${getFileExtension(mimeType)}`,
  };
}

async function publicFileToReference(
  publicPath: string,
  filenameBase: string
): Promise<PreparedReference> {
  const normalizedPath = publicPath.startsWith("/")
    ? publicPath.slice(1)
    : publicPath;
  const absolutePath = path.join(process.cwd(), "public", normalizedPath);
  const arrayBuffer = await readFile(absolutePath);
  const extension = path.extname(normalizedPath).toLowerCase();
  const mimeType =
    extension === ".png"
      ? "image/png"
      : extension === ".webp"
        ? "image/webp"
        : "image/jpeg";

  return {
    mimeType,
    base64: Buffer.from(arrayBuffer).toString("base64"),
    filename: `${filenameBase}.${getFileExtension(mimeType)}`,
  };
}

async function prepareReference(source: string, filenameBase: string) {
  if (source.startsWith("data:")) {
    return dataUrlToReference(source, filenameBase);
  }

  if (source.startsWith("http://") || source.startsWith("https://")) {
    return urlToReference(source, filenameBase);
  }

  if (source.startsWith("/")) {
    return publicFileToReference(source, filenameBase);
  }

  throw new Error("Solo se aceptan referencias en data URL, URL absoluta o rutas de `public/`.");
}

function getVertexSession() {
  const { projectId, location, credentials } = assertVertexAiConfiguration();
  const cacheKey = JSON.stringify([
    projectId,
    location,
    credentials.client_email,
    VERTEX_GEMINI_MODEL,
  ]);

  if (cachedVertexSession && cachedVertexSessionKey === cacheKey) {
    return cachedVertexSession;
  }

  const googleAuthOptions = {
    credentials,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  };

  cachedVertexSession = {
    projectId,
    location,
    auth: new GoogleAuth(googleAuthOptions),
  };
  cachedVertexSessionKey = cacheKey;

  return cachedVertexSession;
}

function normalizeVertexReferenceMimeType(mimeType: string) {
  if (mimeType.includes("png")) return "image/png";
  return "image/jpeg";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isVertexCapacityError(error: unknown) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes("resource exhausted") ||
    message.includes("too many requests") ||
    message.includes("429")
  );
}

function toVertexCompatibleReferenceUrl(url: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  if (url.includes("/image/upload/f_jpg")) {
    return url;
  }

  // Convierte a JPEG y LIMITA a 1280px: referencias más livianas = llamadas más
  // rápidas al modelo (menos payload) sin perder identidad/estilo relevante.
  return url.replace(
    "/image/upload/",
    "/image/upload/f_jpg,q_auto,w_1280,c_limit/"
  );
}

function createVertexSeed(...parts: Array<string | number>) {
  const hash = createHash("sha1").update(parts.join("|")).digest("hex");
  const raw = Number.parseInt(hash.slice(0, 8), 16);
  return raw % 2147483647;
}

async function getVertexAccessToken() {
  const { auth } = getVertexSession();
  const token = await auth.getAccessToken();

  if (!token) {
    throw new Error("No pude obtener un access token de Vertex AI.");
  }

  return token;
}

function getCloudinaryConfig() {
  return {
    cloudName:
      process.env.CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUDINARY_CLOUD_NAME,
    uploadPreset:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      DEFAULT_CLOUDINARY_UPLOAD_PRESET,
    folder:
      process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || DEFAULT_CLOUDINARY_FOLDER,
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  };
}

async function ensureCloudinaryPresetServer() {
  if (cloudinaryPresetEnsured) return;

  const { cloudName, uploadPreset, folder, apiKey, apiSecret } =
    getCloudinaryConfig();

  if (!apiKey || !apiSecret) {
    cloudinaryPresetEnsured = true;
    return;
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const body = new URLSearchParams({
    name: uploadPreset,
    unsigned: "true",
    folder,
    asset_folder: folder,
    use_filename: "true",
    unique_filename: "true",
    overwrite: "false",
    disallow_public_id: "false",
    tags: "robeanny,secret-studio",
    allowed_formats: "png,jpg,jpeg,webp,avif",
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload_presets`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error?.message || payload?.message || "";
    const normalized = message.toLowerCase();

    if (
      !normalized.includes("already exists") &&
      !normalized.includes("existing") &&
      !normalized.includes("already been taken") &&
      !normalized.includes("name has already been taken") &&
      !normalized.includes("taken")
    ) {
      throw new Error(
        message ||
        "Cloudinary no permitió preparar el upload preset unsigned."
      );
    }
  }

  cloudinaryPresetEnsured = true;
}

async function uploadGeneratedImageToCloudinary({
  file,
  filename,
  tags = "robeanny,secret-studio,generated",
  folderOverride,
}: {
  file: string;
  filename: string;
  tags?: string;
  folderOverride?: string;
}): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset, folder } = getCloudinaryConfig();
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
      "Cloudinary no aceptó la imagen generada del Secret Studio."
    );
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    folder: payload.folder || targetFolder,
  };
}

/**
 * Ensambla las referencias que se envían al modelo de imagen: primero las
 * anclas de identidad (rostro), luego las de estilo (look). `identityCount`
 * le dice al modelo cuántas de las primeras imágenes son identidad.
 */
type ReferenceBundle = {
  references: PreparedReference[];
  identityCount: number;
  hasAlbumAnchor: boolean;
};

async function generateWithOpenAi({
  prompt,
  aspectRatio,
  bundle,
}: {
  prompt: string;
  aspectRatio: StudioAspectRatio;
  bundle: ReferenceBundle;
}) {
  const { references, identityCount, hasAlbumAnchor } = bundle;
  const bucketNote = hasAlbumAnchor
    ? `The first ${identityCount} image(s) are IDENTITY references of the real woman: image 1 is her FACE (copy it exactly, including her nose); any other identity image shows her REAL BODY and proportions — match her actual figure and body shape, do NOT make her heavier, curvier, thinner or taller than she is. The next image is the previous album frame — match its exact outfit, hair, makeup and set. Any remaining images are STYLE references (wardrobe/set/lighting/mood only) — never copy their faces or bodies.`
    : `The first ${identityCount} image(s) are IDENTITY references of the real woman: image 1 is her FACE (copy it exactly, including her nose); any other identity image shows her REAL BODY and proportions — match her actual figure and body shape, do NOT make her heavier, curvier, thinner or taller than she is. The remaining images are STYLE references: copy their wardrobe, set, lighting, color and mood, but never their faces or bodies.`;

  // GPT Image 2 procesa cada entrada en alta fidelidad y NO acepta
  // `input_fidelity`; los gpt-image-1.x sí. Lo incluimos solo en ese caso.
  const isGptImage2 =
    OPENAI_IMAGE_MODEL.startsWith("gpt-image-2") ||
    OPENAI_IMAGE_MODEL === OPENAI_IMAGE_MODEL_FALLBACK;

  const callOpenAi = async (model: string) => {
    const body: Record<string, unknown> = {
      model,
      prompt: [prompt, bucketNote].join(" "),
      size: getOpenAiImageSize(aspectRatio),
      quality: OPENAI_IMAGE_QUALITY,
      moderation: OPENAI_MODERATION,
      output_format: "jpeg",
      output_compression: 90,
      images: references.map((reference) => ({
        image_url: `data:${reference.mimeType};base64,${reference.base64}`,
      })),
    };

    if (!isGptImage2) {
      body.input_fidelity = "high";
    }

    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    return { res, payload: await res.json().catch(() => null) };
  };

  const isInvalidModelError = (payload: { error?: { message?: string; code?: string } } | null) => {
    const message = (payload?.error?.message || "").toLowerCase();
    const code = (payload?.error?.code || "").toLowerCase();
    return (
      code.includes("model") ||
      message.includes("model") ||
      message.includes("does not exist") ||
      message.includes("not found") ||
      message.includes("unknown")
    );
  };

  let { res: response, payload } = await callOpenAi(OPENAI_IMAGE_MODEL);

  // Si el ID fijo no está habilitado en la cuenta, reintenta con el alias.
  if (
    !response.ok &&
    OPENAI_IMAGE_MODEL !== OPENAI_IMAGE_MODEL_FALLBACK &&
    isInvalidModelError(payload)
  ) {
    ({ res: response, payload } = await callOpenAi(OPENAI_IMAGE_MODEL_FALLBACK));
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      "OpenAI no pudo generar la imagen en este momento.";
    throw new Error(message);
  }

  const image = payload?.data?.[0];

  if (image?.b64_json) {
    return `data:image/png;base64,${image.b64_json}`;
  }

  if (image?.url) {
    const remote = await fetch(image.url);

    if (!remote.ok) {
      throw new Error("OpenAI devolvió una URL, pero no pude descargarla.");
    }

    const mimeType = remote.headers.get("content-type") || "image/png";
    const arrayBuffer = await remote.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return `data:${mimeType};base64,${base64}`;
  }

  throw new Error("OpenAI respondió sin imagen utilizable.");
}

async function generateWithOpenAiWithRetry(
  params: {
    prompt: string;
    aspectRatio: StudioAspectRatio;
    bundle: ReferenceBundle;
  },
  attempts = 2,
  deadlineAt?: number
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await generateWithOpenAi(params);
    } catch (error) {
      lastError = error;

      if (attempt < attempts - 1) {
        const waitMs = Math.min(
          6000,
          1200 * 2 ** attempt + Math.floor(Math.random() * 500)
        );
        // No reintentar si ya no queda tiempo antes del límite de la función.
        if (deadlineAt && Date.now() + waitMs > deadlineAt) break;
        await sleep(waitMs);
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("OpenAI no pudo generar la imagen en este momento.");
}

async function generateWithVertexGeminiImage({
  prompt,
  aspectRatio,
  bundle,
  seed,
}: {
  prompt: string;
  aspectRatio: StudioAspectRatio;
  bundle: ReferenceBundle;
  seed: number;
}) {
  const { references, identityCount, hasAlbumAnchor } = bundle;
  const { projectId } = getVertexSession();
  const token = await getVertexAccessToken();
  const location = VERTEX_GOOGLE_IMAGE_LOCATION;
  const imageSize = getVertexGoogleImageSize();
  const endpointHost =
    location === "global"
      ? "https://aiplatform.googleapis.com"
      : `https://${location}-aiplatform.googleapis.com`;
  const bucketNote = hasAlbumAnchor
    ? `The first ${identityCount} attached image(s) are IDENTITY references of the real woman: image 1 is her FACE (her face, including her nose, comes from it above all others); any other identity image shows her REAL BODY and proportions — match her actual figure, do NOT make her heavier, curvier, thinner or taller. The next attached image is the previous album frame: match its exact outfit, hair, makeup, set and lighting. Any remaining images are STYLE references (wardrobe/set/mood only).`
    : `The first ${identityCount} attached image(s) are IDENTITY references of the real woman: image 1 is her FACE (her face, including her nose, comes only from it); any other identity image shows her REAL BODY and proportions — match her actual figure, do NOT make her heavier, curvier, thinner or taller. Any remaining images are STYLE references: copy their wardrobe, set, lighting, color and mood, but never their faces, bodies or identity.`;

  const response = await fetch(
    `${endpointHost}/v1/projects/${projectId}/locations/${location}/publishers/google/models/${VERTEX_GOOGLE_IMAGE_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: [
                "Generate a realistic fashion photograph.",
                "ABSOLUTE RULE: facial identity preservation is the #1 non-negotiable constraint, above all creative direction.",
                "The woman in the output MUST be the exact same real adult woman shown in the FACE IDENTITY reference images — not a lookalike, not a similar model, not an inspired-by version, not a twin, not a blend.",
                "Her face is her face. Reproduce it exactly from the identity references. Do not reinterpret, generalize, soften, sharpen, age, rejuvenate or blend her facial features.",
                "Reproduce the exact shape of her NOSE (bridge, tip, nostrils) as it appears in the FACE IDENTITY references. Do NOT use any generic, remembered or averaged nose. Never take the nose from the style references.",
                "She is in her early 20s and looks very young and baby-faced. Never age her: no wrinkles, no expression lines, no forehead lines, no crow's feet, no nasolabial folds, no hollow cheeks.",
                "Keep dark-brown eyes in every frame — never hazel, green, blue or gray.",
                "Keep her hair color, length and texture consistent with the identity references (or with the hairstyle described in the prompt); do not invent a different hair color.",
                "Preserve real skin texture, believable pores, natural facial asymmetry and non-waxy skin.",
                "Match her REAL body shape and proportions from the identity references — keep her actual figure and weight. Do NOT make her look heavier, curvier, thinner, taller or shorter than she is, and do not exaggerate any body part.",
                "STYLE references are ONLY for wardrobe, set, location, lighting, color and mood — copy that look faithfully, but never copy their faces, bodies, noses or identity.",
                "Never copy clothing from the FACE IDENTITY references; never copy the face from the STYLE references.",
                "If there is any conflict between creative direction and identity fidelity, identity fidelity ALWAYS wins.",
                "Avoid CGI look, waxy skin, mannequin posture, distorted anatomy, extra fingers, extra limbs and fake gradient backgrounds.",
                "Prefer grounded realism over stylized glamour.",
                bucketNote,
              ].join(" "),
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  prompt,
                  bucketNote,
                  "CRITICAL IDENTITY RULE: the output face must be a faithful match to the IDENTITY reference(s). Maintain exact facial geometry, nose shape, lip shape, brow arch, eyelid shape, jawline, chin and cheek volume.",
                  "Match her real body shape and proportions from the identity references — do not make her heavier, curvier, thinner, taller or shorter than she really is.",
                  "Do not blend, average or generalize her face. If in doubt, copy her face — including her nose — more literally.",
                  "Do not create a different woman who merely looks similar. This must be recognizably, unmistakably the same person.",
                  hasAlbumAnchor
                    ? "Match the exact outfit, hair, makeup, set and lighting from the previous album frame. Only change pose, crop, angle and expression."
                    : "Lock one single outfit, one single hair setup, one makeup direction and one lighting setup for the whole album, reproduced from the style references.",
                  "Create one single highly realistic photo with believable lighting, believable clothing construction and natural human anatomy.",
                ].join(" "),
              },
              ...references.map((reference) => ({
                inlineData: {
                  mimeType: reference.mimeType,
                  data: reference.base64,
                },
              })),
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          candidateCount: 1,
          temperature: 0.1,
          topP: 0.5,
          seed,
          imageConfig: {
            aspectRatio:
              aspectRatio === "3:4" ? aspectRatio : VERTEX_GOOGLE_IMAGE_ASPECT_RATIO,
            imageSize,
            personGeneration: "allow_all",
            imageOutputOptions: {
              mimeType: "image/jpeg",
            },
          },
        },
        safetySettings: [
          {
            method: "PROBABILITY",
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
      }),
    }
  );

  const raw = await response.text();
  let payload: Record<string, unknown> | null = null;

  if (raw) {
    try {
      payload = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      (payload?.error as { message?: string } | undefined)?.message ||
      (payload?.message as string | undefined) ||
      raw ||
      `Vertex AI devolvió ${response.status}.`;
    throw new Error(message);
  }

  const candidates = Array.isArray((payload as { candidates?: unknown } | null)?.candidates)
    ? ((payload as { candidates?: Array<Record<string, unknown>> }).candidates ?? [])
    : [];
  const candidateParts = Array.isArray(candidates[0]?.content)
    ? null
    : ((candidates[0]?.content as { parts?: unknown } | undefined)?.parts ?? null);
  const imagePart = Array.isArray(candidateParts)
    ? candidateParts.find(
      (part: Record<string, unknown>) =>
        typeof part?.inlineData === "object" &&
        !!(part.inlineData as Record<string, unknown>)?.data
    )
    : null;
  const inlineData =
    (imagePart as { inlineData?: { data?: string; mimeType?: string } } | null)
      ?.inlineData || null;
  const base64 = inlineData?.data;
  const mimeType = inlineData?.mimeType || "image/jpeg";

  if (!base64) {
    const messagePart = Array.isArray(candidateParts)
      ? candidateParts.find(
        (part: Record<string, unknown>) => typeof part?.text === "string"
      )
      : null;
    const payloadError =
      (payload as { error?: { message?: string } } | null)?.error?.message || null;
    const raiReason =
      (messagePart as { text?: string } | null)?.text || payloadError;

    throw new Error(
      raiReason ||
      "Vertex AI respondió, pero no devolvió una imagen utilizable."
    );
  }

  return `data:${mimeType};base64,${base64}`;
}

async function generateWithVertexGeminiImageWithRetry({
  prompt,
  aspectRatio,
  bundle,
  seed,
  attempts = 2,
}: {
  prompt: string;
  aspectRatio: StudioAspectRatio;
  bundle: ReferenceBundle;
  seed: number;
  attempts?: number;
}) {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await generateWithVertexGeminiImage({
        prompt,
        aspectRatio,
        bundle,
        seed: createVertexSeed(`${seed}-${attempt}`, prompt, attempt),
      });
    } catch (error) {
      lastError = error;

      if (attempt < attempts - 1 && isVertexCapacityError(error)) {
        const waitMs = Math.min(
          12000,
          2500 * 2 ** attempt + Math.floor(Math.random() * 700)
        );
        await sleep(waitMs);
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Vertex AI no pudo generar la imagen en este momento.");
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("El planner no devolvió JSON válido.");
  }

  return JSON.parse(text.slice(start, end + 1));
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
  onResolved?: (result: T, index: number) => void
) {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const result = await tasks[currentIndex]();
      results[currentIndex] = result;
      onResolved?.(result, currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())
  );

  return results;
}

/**
 * Planner de ESTILO: mira las referencias de estilo (con Gemini visión cuando
 * el proveedor es Google) y devuelve un brief del look a reproducir. Nunca
 * describe el rostro. Si no hay visión disponible o falla, cae a un brief
 * derivado de las notas del usuario.
 */
async function analyzeStyleReferences({
  provider,
  styleReferences,
  notes,
  albumSize,
  albumSeed,
  recentRecipes,
}: {
  provider: StudioProvider;
  styleReferences: PreparedReference[];
  notes: string;
  albumSize: number;
  albumSeed: string;
  recentRecipes: Array<Record<string, string>>;
}): Promise<StudioStyleBrief> {
  const fallback = () => normalizeStyleBrief({}, albumSize, notes);

  if (provider !== "google" || !styleReferences.length) {
    return fallback();
  }

  const plannerPrompt = [
    "You are the art director of a private fashion photo studio.",
    "Look ONLY at the attached STYLE reference images (and the user notes) and describe the exact look to reproduce for a photo album of one specific, already-known female model.",
    "Return JSON ONLY with these keys: wardrobe, setDesign, lighting, mood, colorPalette, styling, shots.",
    "wardrobe: the garments, cut, fabric and colors seen in the references. setDesign: the location/backdrop/set. lighting: the lighting quality and direction. mood: the overall vibe. colorPalette: the dominant colors. styling: the hair, makeup and accessory styling.",
    "Describe all of that EXACTLY as seen in the style references. Do NOT describe the person's face, nose, ethnicity, age or identity — only the look, clothes, scene and vibe.",
    `shots: an array of EXACTLY ${albumSize} short shot directions (pose / crop / angle / expression). Keep wardrobe/set/lighting/mood identical across all shots; vary only pose, crop, angle and expression.`,
    "If the references show several different looks, pick the single strongest coherent look and stay consistent.",
    notes ? `User notes: ${notes}.` : "",
    recentRecipes.length
      ? `Try to vary the poses/shots versus these recent albums: ${JSON.stringify(recentRecipes)}.`
      : "",
    `Freshness token: ${albumSeed}.`,
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const { projectId, location } = getVertexSession();
    const token = await getVertexAccessToken();
    const response = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${VERTEX_GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: plannerPrompt },
                ...styleReferences.map((reference) => ({
                  inlineData: {
                    mimeType: reference.mimeType,
                    data: reference.base64,
                  },
                })),
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            responseMimeType: "application/json",
            maxOutputTokens: 2048,
          },
        }),
      }
    );
    const payload = await response.json().catch(() => null);
    const text =
      payload?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("") || "";

    if (response.ok && text) {
      return normalizeStyleBrief(extractJsonObject(text), albumSize, notes);
    }
  } catch {
    return fallback();
  }

  return fallback();
}

function streamHeaders(request: Request) {
  return {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    ...getSecretStudioCorsHeaders(request),
  };
}

function createStreamResponse(
  request: Request,
  executor: (send: (event: StreamEvent) => void) => Promise<void>
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = (event: StreamEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        await executor(send);
      } catch (error) {
        send({
          type: "error",
          error:
            error instanceof Error ? error.message : "No se pudo generar el álbum.",
        });
      } finally {
        if (!closed) {
          closed = true;
          controller.close();
        }
      }
    },
  });

  return new Response(stream, { headers: streamHeaders(request) });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getSecretStudioCorsHeaders(request),
  });
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get(SECRET_STUDIO_COOKIE)?.value;

  if (!hasSecretStudioAccess(session)) {
    return NextResponse.json(
      { error: "Primero desbloquea la ruta privada." },
      { status: 401, headers: getSecretStudioCorsHeaders(request) }
    );
  }

  const body = (await request.json().catch(() => null)) as GenerateBody | null;

  if (!body) {
    return NextResponse.json(
      { error: "Solicitud inválida." },
      { status: 400, headers: getSecretStudioCorsHeaders(request) }
    );
  }

  const availableProviders = getAvailableStudioProviders();
  const requestedProvider = body.provider || availableProviders[0];

  if (!requestedProvider || !availableProviders.includes(requestedProvider)) {
    const providerSpecificError =
      requestedProvider === "google"
        ? getVertexAiConfigurationError()
        : requestedProvider === "openai" && !process.env.OPENAI_API_KEY
          ? "Falta `OPENAI_API_KEY` para usar OpenAI GPT Image."
          : null;

    return NextResponse.json(
      {
        error:
          providerSpecificError ||
          "No hay proveedor configurado todavía. Agrega `VERTEX_AI_PROJECT_ID`, `GOOGLE_CREDENTIALS_JSON` u `OPENAI_API_KEY` en el entorno.",
      },
      { status: 400, headers: getSecretStudioCorsHeaders(request) }
    );
  }

  const userNotes = typeof body.notes === "string" ? body.notes.trim() : "";
  const rawAspectRatio =
    typeof body.aspectRatio === "string" ? body.aspectRatio : "";
  const aspectRatio = isAspectRatio(rawAspectRatio) ? rawAspectRatio : "4:5";
  const effectiveAspectRatio: StudioAspectRatio =
    requestedProvider === "google" ? "3:4" : aspectRatio;
  const iteration = Number.isFinite(body.iteration) ? Number(body.iteration) : 0;
  const albumSize = 4;
  const faceLockStrong = body.faceLockStrong !== false;
  const googleQualityMode =
    body.googleQualityMode === "economy" ? "economy" : "premium";
  const albumSeed =
    typeof body.albumSeed === "string" && body.albumSeed.trim()
      ? body.albumSeed.trim()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const recentRecipes = Array.isArray(body.recentRecipes)
    ? body.recentRecipes.filter(
      (item): item is Record<string, string> =>
        !!item && typeof item === "object" && !Array.isArray(item)
    )
    : [];
  const incomingStyleReferences = Array.isArray(body.styleReferences)
    ? body.styleReferences.filter(
      (item): item is string => typeof item === "string" && item.length > 0
    )
    : [];

  try {
    assertSafeCreativeNotes(userNotes);

    if (!incomingStyleReferences.length && !userNotes) {
      throw new Error(
        "Sube al menos una referencia de imagen (el look que quieres) o escribe una nota de dirección."
      );
    }

    // 1) Identidad de Robeanny (rostro + cuerpo) desde la carpeta pública.
    // Usamos SOLO las 2 primeras (01 rostro, 02 cuerpo): pocas y consistentes
    // dan mejor identidad. Mezclar muchas caras distintas la promedia y cambia.
    const identity = getRobeannyIdentityReferences();
    const identityReferences = Array.from(new Set(identity.references)).slice(0, 2);

    // 2) Referencias de estilo (el look) que subió el usuario.
    const styleSources = Array.from(new Set(incomingStyleReferences)).slice(
      0,
      maxStyleReferencesByProvider[requestedProvider]
    );

    const [preparedIdentity, preparedStyle] = await Promise.all([
      Promise.all(
        identityReferences.map((reference, index) =>
          prepareReference(reference, `identity-${index + 1}`)
        )
      ),
      Promise.all(
        styleSources.map((reference, index) =>
          prepareReference(reference, `style-${index + 1}`)
        )
      ),
    ]);

    if (!preparedIdentity.length) {
      throw new Error(
        "No encontré fotos de identidad de Robeanny. Agrega imágenes en `public/robeanny-face/`."
      );
    }

    const albumFolder = `${getCloudinaryConfig().folder}/albums/${albumSeed}`;

    // 3) Brief de estilo a partir de las referencias (o de las notas).
    const styleBrief = await analyzeStyleReferences({
      provider: requestedProvider,
      styleReferences: preparedStyle,
      notes: userNotes,
      albumSize,
      albumSeed,
      recentRecipes,
    });

    const prompts = Array.from({ length: albumSize }, (_, shotIndex) =>
      buildSecretStudioPrompt({
        provider: requestedProvider,
        faceLockStrong,
        brief: styleBrief,
        notes: userNotes,
        aspectRatio: effectiveAspectRatio,
        shotIndex,
      })
    );
    const recipeSignature = createRecipeSignature(prompts[0]?.recipe || {});

    // Anclas de identidad (rostro + cuerpo real) y de estilo para el modelo.
    // Las primeras fotos de la carpeta son: 01 rostro, 02 cuerpo, 03 ángulo.
    // Usamos varias (no solo la cara) para que respete su cuerpo real.
    const perCallCap = maxImagesPerCall[requestedProvider];
    // Solo 2 anclas de identidad: 01 rostro (ancla facial) + 02 cuerpo.
    const identityAnchors = preparedIdentity.slice(0, 2);
    const styleAnchors = preparedStyle.slice(0, 3);

    const buildFirstBundle = (): ReferenceBundle => {
      const references = [...identityAnchors, ...styleAnchors].slice(0, perCallCap);
      return {
        references,
        identityCount: Math.min(identityAnchors.length, references.length),
        hasAlbumAnchor: false,
      };
    };

    const buildFollowupBundle = (
      albumAnchor: PreparedReference
    ): ReferenceBundle => {
      // Mantiene rostro + cuerpo en cada toma, más el frame ancla de continuidad.
      const references = [...identityAnchors, albumAnchor, ...styleAnchors].slice(
        0,
        perCallCap
      );
      return {
        references,
        identityCount: identityAnchors.length,
        hasAlbumAnchor: true,
      };
    };

    return createStreamResponse(request, async (send) => {
      await ensureCloudinaryPresetServer();

      const identityNote =
        identity.source === "legacy"
          ? "OJO: todavía estás usando las fotos VIEJAS del rostro (nariz previa). Agrega las nuevas en `public/robeanny-face/` para re-anclar la nariz."
          : `Rostro anclado desde public/${"robeanny-face"} (${preparedIdentity.length} foto${preparedIdentity.length === 1 ? "" : "s"}).`;
      const styleNote = preparedStyle.length
        ? `Reproduciendo el look de ${preparedStyle.length} referencia${preparedStyle.length === 1 ? "" : "s"} de estilo.`
        : "Sin referencias de estilo: el look sale solo de tus notas.";

      send({
        type: "meta",
        provider: requestedProvider,
        providerLabel: getStudioProviderLabel(requestedProvider),
        prompt: prompts[0]?.prompt || "",
        prompts: prompts.map((item) => item.prompt),
        recipe: prompts[0]?.recipe || {},
        recipeSignature,
        aspectRatio: effectiveAspectRatio,
        iteration,
        albumSize,
        googleQualityMode:
          requestedProvider === "google" ? googleQualityMode : null,
        note: `${identityNote} ${styleNote}`,
        identitySource: identity.source,
        styleReferenceCount: preparedStyle.length,
      });

      send({
        type: "progress",
        completed: 0,
        total: albumSize,
        stage: "Brief de estilo listo. Empezando a renderizar el álbum...",
      });

      let completed = 0;
      const images =
        requestedProvider === "google"
          ? await (async () => {
            const results: Array<{
              index: number;
              imageUrl: string;
              cloudinaryPublicId: string;
              cloudinaryFolder: string;
              prompt: string;
            }> = [];
            const firstPrompt = prompts[0];
            const firstDataUrl = await generateWithVertexGeminiImageWithRetry({
              prompt: firstPrompt.prompt,
              aspectRatio: effectiveAspectRatio,
              bundle: buildFirstBundle(),
              seed: createVertexSeed(albumSeed, firstPrompt.prompt, 0),
            });
            const albumAnchorReference = dataUrlToReference(
              firstDataUrl,
              "album-anchor"
            );
            const firstUploaded = await uploadGeneratedImageToCloudinary({
              file: firstDataUrl,
              filename: `shot-1-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
              folderOverride: albumFolder,
            });

            completed += 1;
            const firstResult = {
              index: 0,
              imageUrl: firstUploaded.secureUrl,
              cloudinaryPublicId: firstUploaded.publicId,
              cloudinaryFolder: firstUploaded.folder,
              prompt: firstPrompt.prompt,
            };
            results.push(firstResult);
            send({
              type: "image",
              index: firstResult.index,
              imageUrl: firstResult.imageUrl,
              cloudinaryPublicId: firstResult.cloudinaryPublicId,
              cloudinaryFolder: firstResult.cloudinaryFolder,
              prompt: firstResult.prompt,
              completed,
              total: albumSize,
              stage: `Foto ${completed} de ${albumSize} lista.`,
            });

            const remainingResults = await runWithConcurrency(
              prompts.slice(1).map((item, offset) => async () => {
                const index = offset + 1;

                try {
                  const generatedDataUrl = await generateWithVertexGeminiImageWithRetry({
                    prompt: item.prompt,
                    aspectRatio: effectiveAspectRatio,
                    bundle: buildFollowupBundle(albumAnchorReference),
                    seed: createVertexSeed(albumSeed, item.prompt, index),
                  });

                  const uploaded = await uploadGeneratedImageToCloudinary({
                    file: generatedDataUrl,
                    filename: `shot-${index + 1}-${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2, 8)}`,
                    folderOverride: albumFolder,
                  });

                  return {
                    index,
                    imageUrl: uploaded.secureUrl,
                    cloudinaryPublicId: uploaded.publicId,
                    cloudinaryFolder: uploaded.folder,
                    prompt: item.prompt,
                  };
                } catch {
                  return null;
                }
              }),
              2,
              (result) => {
                if (!result) return;
                completed += 1;
                results.push(result);
                send({
                  type: "image",
                  index: result.index,
                  imageUrl: result.imageUrl,
                  cloudinaryPublicId: result.cloudinaryPublicId,
                  cloudinaryFolder: result.cloudinaryFolder,
                  prompt: result.prompt,
                  completed,
                  total: albumSize,
                  stage: `Foto ${completed} de ${albumSize} lista.`,
                });
              }
            );

            const missingShots = prompts
              .slice(1)
              .map((item, offset) => ({
                item,
                index: offset + 1,
              }))
              .filter((_, offset) => !remainingResults[offset]);

            for (const missingShot of missingShots) {
              try {
                const generatedDataUrl = await generateWithVertexGeminiImageWithRetry({
                  prompt: missingShot.item.prompt,
                  aspectRatio: effectiveAspectRatio,
                  bundle: buildFollowupBundle(albumAnchorReference),
                  seed: createVertexSeed(
                    `${albumSeed}-recovery`,
                    missingShot.item.prompt,
                    missingShot.index
                  ),
                  attempts: 3,
                });

                const uploaded = await uploadGeneratedImageToCloudinary({
                  file: generatedDataUrl,
                  filename: `shot-${missingShot.index + 1}-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
                  folderOverride: albumFolder,
                });

                const rescuedResult = {
                  index: missingShot.index,
                  imageUrl: uploaded.secureUrl,
                  cloudinaryPublicId: uploaded.publicId,
                  cloudinaryFolder: uploaded.folder,
                  prompt: missingShot.item.prompt,
                };

                completed += 1;
                results.push(rescuedResult);
                send({
                  type: "image",
                  index: rescuedResult.index,
                  imageUrl: rescuedResult.imageUrl,
                  cloudinaryPublicId: rescuedResult.cloudinaryPublicId,
                  cloudinaryFolder: rescuedResult.cloudinaryFolder,
                  prompt: rescuedResult.prompt,
                  completed,
                  total: albumSize,
                  stage: `Foto ${completed} de ${albumSize} lista.`,
                });
              } catch {
                // Dejamos el álbum parcial si ni el rescate funciona.
              }
            }

            return results.sort(
              (left, right) => left!.index - right!.index
            ) as typeof results;
          })()
          : await (async () => {
            const results: Array<{
              index: number;
              imageUrl: string;
              cloudinaryPublicId: string;
              cloudinaryFolder: string;
              prompt: string;
            }> = [];
            // Límite interno (250s) < 300s de Vercel: al acercarnos, dejamos de
            // reintentar/rescatar y devolvemos lo que haya. Así nunca da 0 fotos.
            const deadlineAt = Date.now() + 250000;
            const firstPrompt = prompts[0];
            const firstDataUrl = await generateWithOpenAiWithRetry(
              {
                prompt: firstPrompt.prompt,
                aspectRatio: effectiveAspectRatio,
                bundle: buildFirstBundle(),
              },
              2,
              deadlineAt
            );
            const albumAnchorReference = dataUrlToReference(
              firstDataUrl,
              "openai-album-anchor"
            );
            const firstUploaded = await uploadGeneratedImageToCloudinary({
              file: firstDataUrl,
              filename: `shot-1-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
              folderOverride: albumFolder,
            });

            completed += 1;
            const firstResult = {
              index: 0,
              imageUrl: firstUploaded.secureUrl,
              cloudinaryPublicId: firstUploaded.publicId,
              cloudinaryFolder: firstUploaded.folder,
              prompt: firstPrompt.prompt,
            };
            results.push(firstResult);

            send({
              type: "image",
              index: firstResult.index,
              imageUrl: firstResult.imageUrl,
              cloudinaryPublicId: firstResult.cloudinaryPublicId,
              cloudinaryFolder: firstResult.cloudinaryFolder,
              prompt: firstResult.prompt,
              completed,
              total: albumSize,
              stage: `Foto ${completed} de ${albumSize} lista.`,
            });

            const remainingResults = await runWithConcurrency(
              prompts.slice(1).map((item, offset) => async () => {
                const index = offset + 1;

                try {
                  const generatedDataUrl = await generateWithOpenAiWithRetry(
                    {
                      prompt: item.prompt,
                      aspectRatio: effectiveAspectRatio,
                      bundle: buildFollowupBundle(albumAnchorReference),
                    },
                    2,
                    deadlineAt
                  );
                  const uploaded = await uploadGeneratedImageToCloudinary({
                    file: generatedDataUrl,
                    filename: `shot-${index + 1}-${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2, 8)}`,
                    folderOverride: albumFolder,
                  });

                  return {
                    index,
                    imageUrl: uploaded.secureUrl,
                    cloudinaryPublicId: uploaded.publicId,
                    cloudinaryFolder: uploaded.folder,
                    prompt: item.prompt,
                  };
                } catch {
                  return null;
                }
              }),
              2,
              (result) => {
                if (!result) return;
                completed += 1;
                results.push(result);
                send({
                  type: "image",
                  index: result.index,
                  imageUrl: result.imageUrl,
                  cloudinaryPublicId: result.cloudinaryPublicId,
                  cloudinaryFolder: result.cloudinaryFolder,
                  prompt: result.prompt,
                  completed,
                  total: albumSize,
                  stage: `Foto ${completed} de ${albumSize} lista.`,
                });
              }
            );

            // Rescate: reintenta en serie las tomas que fallaron, para no
            // terminar en 3/4 cuando una llamada falla de forma transitoria.
            const missingShots = prompts
              .slice(1)
              .map((item, offset) => ({ item, index: offset + 1 }))
              .filter((_, offset) => !remainingResults[offset]);

            for (const missingShot of missingShots) {
              // Si ya casi no queda tiempo, no arriesgamos el timeout: cerramos
              // con las fotos que sí salieron.
              if (Date.now() > deadlineAt) break;
              try {
                const generatedDataUrl = await generateWithOpenAiWithRetry(
                  {
                    prompt: missingShot.item.prompt,
                    aspectRatio: effectiveAspectRatio,
                    bundle: buildFollowupBundle(albumAnchorReference),
                  },
                  2,
                  deadlineAt
                );
                const uploaded = await uploadGeneratedImageToCloudinary({
                  file: generatedDataUrl,
                  filename: `shot-${missingShot.index + 1}-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
                  folderOverride: albumFolder,
                });

                const rescuedResult = {
                  index: missingShot.index,
                  imageUrl: uploaded.secureUrl,
                  cloudinaryPublicId: uploaded.publicId,
                  cloudinaryFolder: uploaded.folder,
                  prompt: missingShot.item.prompt,
                };

                completed += 1;
                results.push(rescuedResult);
                send({
                  type: "image",
                  index: rescuedResult.index,
                  imageUrl: rescuedResult.imageUrl,
                  cloudinaryPublicId: rescuedResult.cloudinaryPublicId,
                  cloudinaryFolder: rescuedResult.cloudinaryFolder,
                  prompt: rescuedResult.prompt,
                  completed,
                  total: albumSize,
                  stage: `Foto ${completed} de ${albumSize} lista.`,
                });
              } catch {
                // Dejamos el álbum parcial si ni el rescate funciona.
              }
            }

            return results.sort(
              (left, right) => left!.index - right!.index
            ) as typeof results;
          })();

      if (!images.length) {
        throw new Error("No pude completar el álbum en esta generación.");
      }

      // Álbum parcial (menos de 4) NO es error: entregamos lo que salió para no
      // descartar fotos ya generadas. Solo 0 fotos se considera fallo.
      if (images.length < albumSize) {
        send({
          type: "progress",
          completed: images.length,
          total: albumSize,
          stage: `Álbum parcial: ${images.length} de ${albumSize} fotos.`,
        });
      }

      send({
        type: "done",
        completed: images.length,
        total: albumSize,
      });
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo generar la foto.";

    return NextResponse.json(
      { error: message },
      { status: 400, headers: getSecretStudioCorsHeaders(request) }
    );
  }
}
