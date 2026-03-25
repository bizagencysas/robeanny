import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { GoogleAuth } from "google-auth-library";
import {
  GoogleQualityMode,
  StudioPresetId,
  getStudioPreset,
} from "@/lib/secret-studio-shared";
import {
  SECRET_STUDIO_COOKIE,
  SECRET_STUDIO_FALLBACK_REFERENCES,
  SecretStudioCreativePlan,
  StudioAspectRatio,
  StudioProvider,
  assertVertexAiConfiguration,
  assertSafeCreativeNotes,
  buildSecretStudioPrompt,
  createRecipeSignature,
  getAvailableStudioProviders,
  getOpenAiImageSize,
  getStudioProviderLabel,
  hasSecretStudioAccess,
} from "@/lib/secret-studio";

export const runtime = "nodejs";
export const maxDuration = 300;

type GenerateBody = {
  provider?: StudioProvider;
  presetId?: StudioPresetId;
  notes?: string;
  direction?: string;
  aspectRatio?: StudioAspectRatio;
  iteration?: number;
  albumSize?: number;
  faceLockStrong?: boolean;
  albumSeed?: string;
  excludedRecipeSignatures?: string[];
  recentRecipes?: Array<Record<string, string>>;
  googleQualityMode?: GoogleQualityMode;
  references?: string[];
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
      presetId: StudioPresetId;
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

const maxReferencesByProvider: Record<StudioProvider, number> = {
  google: 6,
  openai: 4,
};

const VERTEX_GEMINI_MODEL =
  process.env.VERTEX_GEMINI_MODEL || "gemini-2.5-flash";
const VERTEX_GOOGLE_IMAGE_MODEL =
  process.env.VERTEX_GOOGLE_IMAGE_MODEL ||
  process.env.VERTEX_IMAGEN_MODEL ||
  "gemini-3-pro-image-preview";
const VERTEX_GOOGLE_IMAGE_LOCATION =
  process.env.VERTEX_GOOGLE_IMAGE_LOCATION || "global";
const VERTEX_GOOGLE_IMAGE_ASPECT_RATIO = "3:4";
const VERTEX_GOOGLE_IMAGE_SIZE = "4K";
const DEFAULT_CLOUDINARY_CLOUD_NAME = "dwpbbjp1d";
const DEFAULT_CLOUDINARY_UPLOAD_PRESET = "robeanny_unsigned";
const DEFAULT_CLOUDINARY_FOLDER = "robeanny";

let cachedVertexSession: VertexSession | null = null;
let cachedVertexSessionKey = "";
let cloudinaryPresetEnsured = false;

function isAspectRatio(value: string): value is StudioAspectRatio {
  return ["1:1", "3:4", "4:5", "9:16", "16:9"].includes(value);
}

function isPresetId(value: string): value is StudioPresetId {
  return [
    "white_seamless",
    "warm_beige",
    "beauty_crop",
    "full_body_catalogue",
    "seated_studio",
    "commercial_denim",
    "sensual_editorial",
  ].includes(value);
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

async function prepareReference(source: string, index: number) {
  if (source.startsWith("data:")) {
    return dataUrlToReference(source, `reference-${index + 1}`);
  }

  if (source.startsWith("http://") || source.startsWith("https://")) {
    return urlToReference(source, `reference-${index + 1}`);
  }

  throw new Error("Solo se aceptan referencias en data URL o URL absoluta.");
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

function toVertexCompatibleReferenceUrl(url: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  if (url.includes("/image/upload/f_jpg")) {
    return url;
  }

  return url.replace("/image/upload/", "/image/upload/f_jpg,q_auto/");
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

async function generateWithOpenAi({
  prompt,
  aspectRatio,
  references,
}: {
  prompt: string;
  aspectRatio: StudioAspectRatio;
  references: PreparedReference[];
}) {
  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1.5",
      prompt,
      size: getOpenAiImageSize(aspectRatio),
      quality: "high",
      input_fidelity: "high",
      images: references.map((reference) => ({
        image_url: `data:${reference.mimeType};base64,${reference.base64}`,
      })),
    }),
  });

  const payload = await response.json().catch(() => null);

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

async function generateWithVertexGeminiImage({
  prompt,
  aspectRatio,
  references,
  seed,
  hasAlbumAnchor = false,
}: {
  prompt: string;
  aspectRatio: StudioAspectRatio;
  references: PreparedReference[];
  seed: number;
  hasAlbumAnchor?: boolean;
}) {
  const { projectId } = getVertexSession();
  const token = await getVertexAccessToken();
  const location = VERTEX_GOOGLE_IMAGE_LOCATION;
  const endpointHost =
    location === "global"
      ? "https://aiplatform.googleapis.com"
      : `https://${location}-aiplatform.googleapis.com`;
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
                "Generate a realistic studio fashion photograph.",
                "Treat facial identity preservation as a hard constraint.",
                "The woman must remain the exact same real adult woman shown in the references.",
                "Keep dark-brown eyes, real skin texture, believable pores, natural asymmetry, and non-waxy skin.",
                "Avoid CGI look, waxy skin, mannequin posture, distorted anatomy, extra fingers, extra limbs, generic beauty-face, and fake gradient backgrounds.",
                "Prefer grounded studio realism over stylized glamour.",
                hasAlbumAnchor
                  ? "The first attached image is the album anchor. Match its exact woman, wardrobe, hair, makeup, backdrop, and lighting direction."
                  : "Establish a clean, believable studio look that can be repeated across the full album.",
              ].join(" "),
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              ...references.map((reference) => ({
                inlineData: {
                  mimeType: reference.mimeType,
                  data: reference.base64,
                },
              })),
              {
                text: [
                  prompt,
                  hasAlbumAnchor
                    ? "Use the first attached image as the continuity anchor for this album and the remaining images as identity references."
                    : "Use all attached reference photos as the same real woman.",
                  "Preserve her exact face, skin tone, hairline, jawline, nose, lips, and dark-brown eyes.",
                  hasAlbumAnchor
                    ? "Match the same exact outfit pieces, same hair styling, same makeup, same studio set, and same light quality from the anchor image. Only change pose, crop, and expression."
                    : "Lock one single outfit, one single hair setup, one single makeup direction, and one single studio lighting setup for the whole album.",
                  "Create one single highly realistic studio photo with believable lighting, believable clothing construction, and natural human anatomy.",
                ].join(" "),
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          candidateCount: 1,
          temperature: 0.2,
          topP: 0.9,
          seed,
          imageConfig: {
            aspectRatio:
              aspectRatio === "3:4" ? aspectRatio : VERTEX_GOOGLE_IMAGE_ASPECT_RATIO,
            imageSize: VERTEX_GOOGLE_IMAGE_SIZE,
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

  const candidateParts = payload?.candidates?.[0]?.content?.parts;
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
    const raiReason =
      (messagePart as { text?: string } | null)?.text || payload?.error?.message;

    throw new Error(
      raiReason ||
        "Vertex AI respondió, pero no devolvió una imagen utilizable."
    );
  }

  return `data:${mimeType};base64,${base64}`;
}

function extractJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("El planner no devolvió JSON válido.");
  }

  return JSON.parse(text.slice(start, end + 1));
}

function normalizeCreativePlan(
  value: unknown
): Partial<SecretStudioCreativePlan> | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;

  return {
    creativeDirection:
      typeof candidate.creativeDirection === "string"
        ? candidate.creativeDirection
        : undefined,
    wardrobe:
      typeof candidate.wardrobe === "string" ? candidate.wardrobe : undefined,
    albumPose:
      typeof candidate.albumPose === "string" ? candidate.albumPose : undefined,
    hair: typeof candidate.hair === "string" ? candidate.hair : undefined,
    lighting:
      typeof candidate.lighting === "string" ? candidate.lighting : undefined,
    location:
      typeof candidate.location === "string" ? candidate.location : undefined,
    lens: typeof candidate.lens === "string" ? candidate.lens : undefined,
    stylingNotes:
      typeof candidate.stylingNotes === "string"
        ? candidate.stylingNotes
        : undefined,
  };
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

async function generateCreativePlan({
  provider,
  direction,
  presetDescription,
  notes,
  aspectRatio,
  faceLockStrong,
  albumSeed,
  attempt,
  recentRecipes,
}: {
  provider: StudioProvider;
  direction: string;
  presetDescription: string;
  notes: string;
  aspectRatio: StudioAspectRatio;
  faceLockStrong: boolean;
  albumSeed: string;
  attempt: number;
  recentRecipes: Array<Record<string, string>>;
}) {
  const plannerPrompt = [
    "Create a distinct fashion album recipe for a real adult female model based on photo references.",
    "Return JSON only with these keys: creativeDirection, wardrobe, albumPose, hair, lighting, location, lens, stylingNotes.",
    "Make the album feel meaningfully different from the recent recipes while staying inside the preset direction.",
    "Keep it grounded, commercial, elegant, wearable, and fully clothed.",
    "The same woman must remain recognizable, with dark-brown eyes.",
    "Strong preference: polished studio imagery, clean backdrop, believable lighting, real skin texture, and natural human anatomy.",
    `Freshness token: ${albumSeed}-${attempt}.`,
    `Requested preset direction: ${direction}.`,
    `Preset description: ${presetDescription}.`,
    `Aspect ratio: ${aspectRatio}.`,
    `Face lock strong: ${faceLockStrong ? "yes" : "no"}.`,
    notes ? `User notes: ${notes}.` : "",
    recentRecipes.length
      ? `Avoid repeating these recent album recipes: ${JSON.stringify(
          recentRecipes
        )}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.SS_OPENAI_PROMPT_MODEL || "gpt-5-pro",
          reasoning: {
            effort: "high",
          },
          input: plannerPrompt,
        }),
      });

      const payload = await response.json().catch(() => null);
      const text =
        payload?.output_text ||
        payload?.output?.flatMap(
          (item: { content?: Array<{ text?: string }> }) => item.content || []
        )
          ?.map((item: { text?: string }) => item.text || "")
          .join("") ||
        "";

      if (response.ok && text) {
        return normalizeCreativePlan(extractJsonObject(text));
      }
    }

    if (provider === "google") {
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
                parts: [{ text: plannerPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.8,
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
        return normalizeCreativePlan(extractJsonObject(text));
      }
    }
  } catch {
    return null;
  }

  return null;
}

function streamHeaders() {
  return {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

function createStreamResponse(
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

  return new Response(stream, { headers: streamHeaders() });
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get(SECRET_STUDIO_COOKIE)?.value;

  if (!hasSecretStudioAccess(session)) {
    return NextResponse.json(
      { error: "Primero desbloquea la ruta privada." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as GenerateBody | null;

  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const availableProviders = getAvailableStudioProviders();
  const requestedProvider = body.provider || availableProviders[0];

  if (!requestedProvider || !availableProviders.includes(requestedProvider)) {
    return NextResponse.json(
      {
        error:
          "No hay proveedor configurado todavía. Agrega `VERTEX_AI_PROJECT_ID`, `GOOGLE_CREDENTIALS_JSON` u `OPENAI_API_KEY` en el entorno.",
      },
      { status: 400 }
    );
  }

  const presetId =
    typeof body.presetId === "string" && isPresetId(body.presetId)
      ? body.presetId
      : "white_seamless";
  const preset = getStudioPreset(presetId);
  const userNotes = typeof body.notes === "string" ? body.notes.trim() : "";
  const notes = [preset.notes, userNotes].filter(Boolean).join(" ");
  const direction =
    typeof body.direction === "string" && body.direction.trim()
      ? body.direction.trim()
      : preset.label;
  const rawAspectRatio =
    typeof body.aspectRatio === "string" ? body.aspectRatio : "";
  const aspectRatio = isAspectRatio(rawAspectRatio)
    ? rawAspectRatio
    : "4:5";
  const effectiveAspectRatio: StudioAspectRatio =
    requestedProvider === "google" ? "3:4" : aspectRatio;
  const iteration = Number.isFinite(body.iteration) ? Number(body.iteration) : 0;
  const requestedAlbumSize = Number.isFinite(body.albumSize)
    ? Number(body.albumSize)
    : 4;
  const albumSize = 4;
  const faceLockStrong = body.faceLockStrong !== false;
  const googleQualityMode =
    body.googleQualityMode === "economy" ? "economy" : "premium";
  const albumSeed =
    typeof body.albumSeed === "string" && body.albumSeed.trim()
      ? body.albumSeed.trim()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const excludedRecipeSignatures = Array.isArray(body.excludedRecipeSignatures)
    ? body.excludedRecipeSignatures.filter(
        (item): item is string => typeof item === "string" && item.length > 0
      )
    : [];
  const recentRecipes = Array.isArray(body.recentRecipes)
    ? body.recentRecipes.filter(
        (item): item is Record<string, string> =>
          !!item && typeof item === "object" && !Array.isArray(item)
      )
    : [];
  const incomingReferences = Array.isArray(body.references)
    ? body.references.filter((item): item is string => typeof item === "string")
    : [];

  try {
    assertSafeCreativeNotes(notes);

    const fallbackReferenceSet = new Set(SECRET_STUDIO_FALLBACK_REFERENCES);
    const uniqueReferences = Array.from(
      new Set(
        incomingReferences.length
          ? incomingReferences
          : SECRET_STUDIO_FALLBACK_REFERENCES
      )
    ).sort((left, right) => {
      const getPriority = (value: string) => {
        if (value.startsWith("data:")) return 0;
        if (!fallbackReferenceSet.has(value)) return 1;
        return 2;
      };

      return getPriority(left) - getPriority(right);
    });

    const uploadedReferences = uniqueReferences.filter((reference) =>
      reference.startsWith("data:")
    );
    const references =
      (uploadedReferences.length ? uploadedReferences : uniqueReferences).slice(
        0,
        maxReferencesByProvider[requestedProvider]
      );

    if (!references.length) {
      throw new Error("Sube al menos una foto de referencia para arrancar.");
    }

    const preparedReferences = await Promise.all(
      references.map((reference, index) => prepareReference(reference, index))
    );
    const albumFolder = `${getCloudinaryConfig().folder}/albums/${albumSeed}`;

    let prompts: Array<ReturnType<typeof buildSecretStudioPrompt>> = [];
    let recipeSignature = "";

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const creativePlan = await generateCreativePlan({
        provider: requestedProvider,
        direction,
        presetDescription: preset.description,
        notes,
        aspectRatio: effectiveAspectRatio,
        faceLockStrong,
        albumSeed,
        attempt,
        recentRecipes,
      });

      const mergedPlan = {
        ...(creativePlan || {}),
        ...preset.plan,
      };

      const candidatePrompts = Array.from({ length: albumSize }, (_, shotIndex) =>
        buildSecretStudioPrompt({
          provider: requestedProvider,
          faceLockStrong,
          plan: mergedPlan,
          notes,
          direction,
          aspectRatio: effectiveAspectRatio,
          iteration,
          albumSeed,
          variantOffset: attempt,
          shotIndex,
        })
      );

      const candidateSignature = createRecipeSignature(
        candidatePrompts[0]?.recipe || {}
      );

      prompts = candidatePrompts;
      recipeSignature = candidateSignature;

      if (!excludedRecipeSignatures.includes(candidateSignature)) {
        break;
      }
    }

    return createStreamResponse(async (send) => {
      await ensureCloudinaryPresetServer();

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
        note:
          requestedProvider === "google"
            ? "Google Vertex usa Gemini 3 Pro Image con referencias múltiples y foco total en realismo facial."
            : "OpenAI queda marcado como experimental: tarda más y aquí sigue siendo menos fiel para realismo que Google Pro Image.",
        presetId,
      });

      send({
        type: "progress",
        completed: 0,
        total: albumSize,
        stage: "Receta lista. Empezando a renderizar el álbum...",
      });

      let completed = 0;
      const images =
        requestedProvider === "google"
          ? await (async () => {
              const googleBaseReferences = preparedReferences.slice(
                0,
                Math.min(preparedReferences.length, 2)
              );
              const results: Array<{
                index: number;
                imageUrl: string;
                cloudinaryPublicId: string;
                cloudinaryFolder: string;
                prompt: string;
              }> = [];
              const firstPrompt = prompts[0];
              const firstDataUrl = await generateWithVertexGeminiImage({
                prompt: firstPrompt.prompt,
                aspectRatio: effectiveAspectRatio,
                references: googleBaseReferences,
                seed: createVertexSeed(albumSeed, firstPrompt.prompt, 0),
                hasAlbumAnchor: false,
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
                  const activeReferences = [albumAnchorReference, ...googleBaseReferences].slice(
                    0,
                    3
                  );
                  const generatedDataUrl = await generateWithVertexGeminiImage({
                    prompt: item.prompt,
                    aspectRatio: effectiveAspectRatio,
                    references: activeReferences,
                    seed: createVertexSeed(albumSeed, item.prompt, index),
                    hasAlbumAnchor: true,
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
                }),
                2,
                (result) => {
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

              return [firstResult, ...remainingResults].sort(
                (left, right) => left.index - right.index
              );
            })()
          : await runWithConcurrency(
              prompts.map((item, index) => async () => {
                const generatedDataUrl = await generateWithOpenAi({
                  prompt: item.prompt,
                  aspectRatio: effectiveAspectRatio,
                  references: preparedReferences,
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
              }),
              3,
              (result) => {
                completed += 1;
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

      if (!images.length) {
        throw new Error("No pude completar el álbum en esta generación.");
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

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
