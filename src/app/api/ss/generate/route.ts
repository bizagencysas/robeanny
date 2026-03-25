import { NextRequest, NextResponse } from "next/server";
import {
  SECRET_STUDIO_COOKIE,
  SECRET_STUDIO_FALLBACK_REFERENCES,
  StudioAspectRatio,
  StudioProvider,
  assertSafeCreativeNotes,
  buildSecretStudioPrompt,
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
  const incomingReferences = Array.isArray(body.references)
    ? body.references.filter((item): item is string => typeof item === "string")
    : [];

  try {
    assertSafeCreativeNotes(notes);

    const references = Array.from(
      new Set(
        incomingReferences.length
          ? incomingReferences
          : SECRET_STUDIO_FALLBACK_REFERENCES
      )
    ).slice(0, maxReferencesByProvider[requestedProvider]);

    if (!references.length) {
      throw new Error("Sube al menos una foto de referencia para arrancar.");
    }

    const preparedReferences = await Promise.all(
      references.map((reference, index) => prepareReference(reference, index))
    );

    const { prompt, recipe } = buildSecretStudioPrompt({
      notes,
      direction,
      aspectRatio,
      iteration,
    });

    const result =
      requestedProvider === "google"
        ? await generateWithGoogle({
            prompt,
            aspectRatio,
            references: preparedReferences,
          })
        : await generateWithOpenAi({
            prompt,
            aspectRatio,
            references: preparedReferences,
          });

    return NextResponse.json({
      success: true,
      provider: requestedProvider,
      providerLabel: getStudioProviderLabel(requestedProvider),
      prompt,
      recipe,
      aspectRatio,
      iteration,
      images: result.images,
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
