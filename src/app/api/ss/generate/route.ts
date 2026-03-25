import { NextRequest, NextResponse } from "next/server";
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
  google: 4,
  openai: 4,
};

const VERTEX_GEMINI_MODEL =
  process.env.VERTEX_GEMINI_MODEL || "gemini-2.5-flash";
const VERTEX_IMAGEN_MODEL =
  process.env.VERTEX_IMAGEN_MODEL || "imagen-3.0-capability-001";
const VERTEX_IMAGEN_ASPECT_RATIO = "3:4";
const VERTEX_IMAGEN_GUIDANCE_SCALE = 60;

let cachedVertexSession: VertexSession | null = null;
let cachedVertexSessionKey = "";

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
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("No pude cargar una de las fotos de referencia.");
  }

  const arrayBuffer = await response.arrayBuffer();
  const mimeType = response.headers.get("content-type") || "image/jpeg";

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

async function getVertexAccessToken() {
  const { auth } = getVertexSession();
  const token = await auth.getAccessToken();

  if (!token) {
    throw new Error("No pude obtener un access token de Vertex AI.");
  }

  return token;
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

async function generateWithVertexImagen({
  prompt,
  aspectRatio,
  googleQualityMode,
  references,
}: {
  prompt: string;
  aspectRatio: StudioAspectRatio;
  googleQualityMode: GoogleQualityMode;
  references: PreparedReference[];
}) {
  const { projectId, location } = getVertexSession();
  const token = await getVertexAccessToken();
  const response = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${VERTEX_IMAGEN_MODEL}:predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: [
              prompt,
              "Use subject reference [1] as the exact facial identity anchor.",
              "Keep the same adult woman recognizable across every shot.",
              "Prioritize studio-grade photorealism, premium skin detail, and dark-brown eyes.",
            ].join(" "),
            referenceImages: references.map((reference) => ({
              referenceType: "REFERENCE_TYPE_SUBJECT",
              referenceId: 1,
              subjectDescription:
                "the exact adult woman from the provided references with dark-brown eyes",
              referenceImage: {
                bytesBase64Encoded: reference.base64,
              },
            })),
          },
        ],
        parameters: {
          sampleCount: 1,
          sampleImageSize: googleQualityMode === "premium" ? "2K" : "1K",
          aspectRatio:
            aspectRatio === "3:4" ? aspectRatio : VERTEX_IMAGEN_ASPECT_RATIO,
          personGeneration: "allow_all",
          guidanceScale: VERTEX_IMAGEN_GUIDANCE_SCALE,
          enhancePrompt: true,
          includeRaiReason: true,
          includeSafetyAttributes: true,
          safetySetting: "block_only_high",
          addWatermark: false,
        },
      }),
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      "Vertex AI no pudo generar la imagen en este momento.";
    throw new Error(message);
  }

  const prediction = payload?.predictions?.[0];
  const base64 =
    prediction?.bytesBase64Encoded ||
    prediction?.image?.bytesBase64Encoded ||
    prediction?.bytesBase64;

  if (!base64) {
    const raiReason =
      prediction?.raiFilteredReason ||
      prediction?.raiFilterReason ||
      payload?.error?.message;

    throw new Error(
      raiReason ||
        "Vertex AI respondió, pero no devolvió una imagen utilizable."
    );
  }

  return `data:image/png;base64,${base64}`;
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
    "Keep it premium, commercial, elegant, wearable, and fully clothed.",
    "The same woman must remain recognizable, with dark-brown eyes.",
    "Strong preference: polished professional studio imagery, seamless clean backdrop, luxury campaign lighting, expensive commercial beauty finish, world-class medium-format feel.",
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
    : 6;
  const albumSize = Math.min(Math.max(requestedAlbumSize, 6), 8);
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

    const uniqueReferences = Array.from(
      new Set(
        incomingReferences.length
          ? incomingReferences
          : SECRET_STUDIO_FALLBACK_REFERENCES
      )
    ).sort((left, right) => {
      const leftPriority = left.startsWith("data:") ? 0 : 1;
      const rightPriority = right.startsWith("data:") ? 0 : 1;

      return leftPriority - rightPriority;
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
            ? googleQualityMode === "premium"
              ? "Google Vertex Premium usa Imagen 3 capability en 2K con referencias faciales, guidance alto y autenticación por Vertex AI."
              : "Google Vertex Economy usa el mismo flujo de Vertex AI pero en 1K para ahorrar costo."
            : "OpenAI queda marcado como experimental: tarda más y aquí sigue siendo menos fiel para realismo que Google Premium.",
        presetId,
      });

      send({
        type: "progress",
        completed: 0,
        total: albumSize,
        stage: "Receta lista. Empezando a renderizar el álbum...",
      });

      let completed = 0;

      const images = await runWithConcurrency(
        prompts.map((item, index) => async () => {
          const imageUrl =
            requestedProvider === "google"
              ? await generateWithVertexImagen({
                  prompt: item.prompt,
                  aspectRatio: effectiveAspectRatio,
                  googleQualityMode,
                  references: preparedReferences,
                })
              : await generateWithOpenAi({
                  prompt: item.prompt,
                  aspectRatio: effectiveAspectRatio,
                  references: preparedReferences,
                });

          return {
            index,
            imageUrl,
            prompt: item.prompt,
          };
        }),
        requestedProvider === "openai" ? 3 : 2,
        (result) => {
          completed += 1;
          send({
            type: "image",
            index: result.index,
            imageUrl: result.imageUrl,
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
