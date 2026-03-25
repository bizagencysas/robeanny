import { NextRequest, NextResponse } from "next/server";
import {
  SECRET_STUDIO_COOKIE,
  SECRET_STUDIO_FALLBACK_REFERENCES,
  SecretStudioCreativePlan,
  StudioAspectRatio,
  StudioProvider,
  assertSafeCreativeNotes,
  buildSecretStudioPrompt,
  createRecipeSignature,
  getAvailableStudioProviders,
  getGoogleApiKey,
  getOpenAiImageSize,
  getStudioProviderLabel,
  hasSecretStudioAccess,
} from "@/lib/secret-studio";

export const runtime = "nodejs";

type GenerateBody = {
  provider?: StudioProvider;
  notes?: string;
  direction?: string;
  aspectRatio?: StudioAspectRatio;
  iteration?: number;
  albumSize?: number;
  faceLockStrong?: boolean;
  albumSeed?: string;
  excludedRecipeSignatures?: string[];
  recentRecipes?: Array<Record<string, string>>;
  references?: string[];
};

type PreparedReference = {
  mimeType: string;
  base64: string;
  filename: string;
};

const maxReferencesByProvider: Record<StudioProvider, number> = {
  google: 5,
  openai: 4,
};

function isAspectRatio(value: string): value is StudioAspectRatio {
  return ["1:1", "3:4", "4:5", "9:16", "16:9"].includes(value);
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
    return {
      images: [`data:image/png;base64,${image.b64_json}`],
    };
  }

  if (image?.url) {
    const remote = await fetch(image.url);

    if (!remote.ok) {
      throw new Error("OpenAI devolvió una URL, pero no pude descargarla.");
    }

    const mimeType = remote.headers.get("content-type") || "image/png";
    const arrayBuffer = await remote.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return {
      images: [`data:${mimeType};base64,${base64}`],
    };
  }

  throw new Error("OpenAI respondió sin imagen utilizable.");
}

async function generateWithGoogle({
  prompt,
  aspectRatio,
  references,
}: {
  prompt: string;
  aspectRatio: StudioAspectRatio;
  references: PreparedReference[];
}) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": getGoogleApiKey(),
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              ...references.map((reference) => ({
                inline_data: {
                  mime_type: reference.mimeType,
                  data: reference.base64,
                },
              })),
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio,
            imageSize: "2K",
          },
        },
      }),
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      "Google Nano Banana 2 no pudo generar la imagen en este momento.";
    throw new Error(message);
  }

  const parts =
    payload?.candidates?.flatMap(
      (candidate: { content?: { parts?: Array<Record<string, unknown>> } }) =>
        candidate.content?.parts || []
    ) || [];

  const images = parts
    .map((part: Record<string, unknown>) => {
      const inlineData =
        (part.inlineData as { mimeType?: string; data?: string } | undefined) ||
        (part.inline_data as { mime_type?: string; data?: string } | undefined);

      if (!inlineData?.data) return null;

      return `data:${inlineData.mimeType || inlineData.mime_type || "image/png"};base64,${inlineData.data}`;
    })
    .filter(Boolean) as string[];

  if (!images.length) {
    const textFallback = parts
      .map((part: Record<string, unknown>) =>
        typeof part.text === "string" ? part.text : ""
      )
      .filter(Boolean)
      .join(" ");

    throw new Error(
      textFallback || "Google respondió, pero no devolvió una imagen utilizable."
    );
  }

  return {
    images,
  };
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

async function generateCreativePlan({
  provider,
  direction,
  notes,
  aspectRatio,
  faceLockStrong,
  albumSeed,
  attempt,
  recentRecipes,
}: {
  provider: StudioProvider;
  direction: string;
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
    "Make the album feel meaningfully different from the recent recipes.",
    "Keep it premium, commercial, elegant, wearable, and fully clothed.",
    "The same woman must remain recognizable, with dark-brown eyes.",
    "Strong preference: polished professional studio imagery, seamless clean backdrop, luxury campaign lighting, expensive commercial beauty finish, world-class medium-format feel.",
    `Freshness token: ${albumSeed}-${attempt}.`,
    `Requested direction: ${direction}.`,
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
          model: process.env.SS_OPENAI_PROMPT_MODEL || "gpt-4.1-mini",
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

    if (provider === "google" && getGoogleApiKey()) {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": getGoogleApiKey(),
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: plannerPrompt }] }],
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
          "No hay proveedor configurado todavía. Agrega `GEMINI_API_KEY` o `OPENAI_API_KEY` en el entorno.",
      },
      { status: 400 }
    );
  }

  const notes = typeof body.notes === "string" ? body.notes : "";
  const direction =
    typeof body.direction === "string" && body.direction.trim()
      ? body.direction.trim()
      : "editorial fashion";
  const aspectRatio = isAspectRatio(body.aspectRatio || "")
    ? body.aspectRatio
    : "4:5";
  const iteration = Number.isFinite(body.iteration) ? Number(body.iteration) : 0;
  const requestedAlbumSize = Number.isFinite(body.albumSize)
    ? Number(body.albumSize)
    : 6;
  const albumSize = Math.min(Math.max(requestedAlbumSize, 6), 8);
  const faceLockStrong = body.faceLockStrong !== false;
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
        notes,
        aspectRatio,
        faceLockStrong,
        albumSeed,
        attempt,
        recentRecipes,
      });

      const candidatePrompts = Array.from({ length: albumSize }, (_, shotIndex) =>
        buildSecretStudioPrompt({
          provider: requestedProvider,
          faceLockStrong,
          plan: creativePlan || undefined,
          notes,
          direction,
          aspectRatio,
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

    const images: string[] = [];

    for (const item of prompts) {
      const result =
        requestedProvider === "google"
          ? await generateWithGoogle({
              prompt: item.prompt,
              aspectRatio,
              references: preparedReferences,
            })
          : await generateWithOpenAi({
              prompt: item.prompt,
              aspectRatio,
              references: preparedReferences,
            });

      if (result.images[0]) {
        images.push(result.images[0]);
      }
    }

    if (!images.length) {
      throw new Error("No pude completar el álbum en esta generación.");
    }

    return NextResponse.json({
      success: true,
      provider: requestedProvider,
      providerLabel: getStudioProviderLabel(requestedProvider),
      prompt: prompts[0]?.prompt || "",
      prompts: prompts.map((item) => item.prompt),
      recipe: prompts[0]?.recipe || {},
      recipeSignature,
      aspectRatio,
      iteration,
      albumSize,
      images,
      note:
        requestedProvider === "google"
          ? "Nano Banana 2 puede incluir SynthID watermark según la política actual de Google."
          : null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo generar la foto.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
