"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  buildSecretStudioApiUrl,
  GoogleQualityMode,
  StudioAspectRatio,
  StudioProvider,
  getStudioEstimatedCost,
  getStudioProviderLabel,
} from "@/lib/secret-studio-shared";
import {
  SavedStudioShot,
  deleteStudioShot,
  listSavedStudioShots,
  saveStudioShot,
} from "@/lib/secret-studio-db";
import {
  ensureSecretStudioCloudinaryPreset,
  uploadStudioImageToCloudinary,
} from "@/lib/secret-studio-cloudinary";

type GeneratedShot = {
  id: string;
  imageUrl?: string;
  cloudinaryPublicId?: string;
  cloudinaryFolder?: string;
  prompt: string;
  provider: StudioProvider;
  providerLabel: string;
  aspectRatio: string;
  notes: string;
  recipe: Record<string, string>;
  status: "pending" | "ready";
};

type GeneratedAlbum = {
  id: string;
  createdAt: string;
  provider: StudioProvider;
  providerLabel: string;
  aspectRatio: string;
  notes: string;
  lookLabel: string;
  styleReferenceCount: number;
  recipe: Record<string, string>;
  recipeSignature: string;
  shots: GeneratedShot[];
  completedCount: number;
};

type StyleReferenceItem = {
  id: string;
  name: string;
  preview: string;
  value: string;
  cloudinaryPublicId?: string;
  cloudinaryFolder?: string;
};

type GenerateStreamEvent =
  | {
      type: "meta";
      provider: StudioProvider;
      providerLabel: string;
      prompt: string;
      prompts: string[];
      recipe: Record<string, string>;
      recipeSignature: string;
      aspectRatio: string;
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

const aspectRatioOptions: StudioAspectRatio[] = [
  "4:5",
  "3:4",
  "1:1",
  "9:16",
  "16:9",
];

const SETTINGS_STORAGE_KEY = "robeanny-secret-studio-settings";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function shortLook(recipe: Record<string, string>) {
  const wardrobe = recipe?.wardrobe?.trim();
  if (!wardrobe) return "Estilo libre";
  return wardrobe.length > 60 ? `${wardrobe.slice(0, 60).trim()}...` : wardrobe;
}

function downloadImage(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function isJsonResponse(response: Response) {
  return response.headers.get("content-type")?.includes("application/json");
}

export default function SecretStudioClient({
  initialUnlocked,
  authRequired,
  availableProviders,
  identityReferences,
  identitySource,
}: {
  initialUnlocked: boolean;
  authRequired: boolean;
  availableProviders: StudioProvider[];
  identityReferences: string[];
  identitySource: "folder" | "legacy";
}) {
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [unlockCode, setUnlockCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const [provider, setProvider] = useState<StudioProvider | "">(
    availableProviders.includes("openai")
      ? "openai"
      : availableProviders[0] || ""
  );
  const [aspectRatio, setAspectRatio] = useState<StudioAspectRatio>("4:5");
  const [albumSize] = useState<4>(4);
  const [faceLockStrong, setFaceLockStrong] = useState(true);
  const [googleQualityMode, setGoogleQualityMode] =
    useState<GoogleQualityMode>("premium");
  const [notes, setNotes] = useState("");
  const [iteration, setIteration] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState("");
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [error, setError] = useState("");
  const [providerNote, setProviderNote] = useState("");
  const [identityWarning, setIdentityWarning] = useState(
    identitySource === "legacy"
  );

  const [styleReferences, setStyleReferences] = useState<StyleReferenceItem[]>(
    []
  );

  const [liveAlbum, setLiveAlbum] = useState<GeneratedAlbum | null>(null);
  const [sessionAlbums, setSessionAlbums] = useState<GeneratedAlbum[]>([]);
  const [savedShots, setSavedShots] = useState<SavedStudioShot[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);

  const currentAlbum = liveAlbum || sessionAlbums[0] || null;
  const basePrompt = currentAlbum?.shots[0]?.prompt || "";
  const isPromptLong = basePrompt.length > 280;
  const promptPreview =
    isPromptLong && !showFullPrompt
      ? `${basePrompt.slice(0, 280).trim()}...`
      : basePrompt;
  const estimatedCost = provider
    ? getStudioEstimatedCost({
        provider,
        albumSize,
        aspectRatio,
        googleQualityMode,
      })
    : null;
  const styleReferenceLimit = provider === "openai" ? 4 : 3;
  const effectiveStyleReferences = styleReferences.slice(0, styleReferenceLimit);

  const providerDescription = useMemo(() => {
    if (provider === "openai") {
      return "OpenAI GPT Image 2 (ChatGPT Images 2.0) es el cerebro y el creador: razona sobre tus referencias de estilo y recrea ese look con el rostro y el cuerpo reales de Robeanny.";
    }

    if (provider === "google") {
      return "Google Vertex (Gemini 3 Pro Image) queda como alternativa. Bueno para realismo de piel, pero el motor principal ahora es OpenAI.";
    }

    return "";
  }, [provider]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as Partial<{
        provider: StudioProvider;
        aspectRatio: StudioAspectRatio;
        faceLockStrong: boolean;
        googleQualityMode: GoogleQualityMode;
        notes: string;
      }>;

      if (saved.provider && availableProviders.includes(saved.provider)) {
        setProvider(saved.provider);
      }
      if (saved.aspectRatio) setAspectRatio(saved.aspectRatio);
      if (typeof saved.faceLockStrong === "boolean") {
        setFaceLockStrong(saved.faceLockStrong);
      }
      if (
        saved.googleQualityMode &&
        ["premium", "economy"].includes(saved.googleQualityMode)
      ) {
        setGoogleQualityMode(saved.googleQualityMode);
      }
      if (typeof saved.notes === "string") {
        setNotes(saved.notes);
      }
    } catch {
      return;
    }
  }, [availableProviders]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        provider,
        aspectRatio,
        faceLockStrong,
        googleQualityMode,
        notes,
      })
    );
  }, [provider, aspectRatio, faceLockStrong, googleQualityMode, notes]);

  async function refreshSavedShots() {
    try {
      setSavedLoading(true);
      const items = await listSavedStudioShots();
      setSavedShots(items);
    } catch {
      setSavedShots([]);
    } finally {
      setSavedLoading(false);
    }
  }

  useEffect(() => {
    refreshSavedShots();
  }, []);

  async function handleUnlock() {
    try {
      setUnlocking(true);
      setUnlockError("");

      const response = await fetch(buildSecretStudioApiUrl("/api/ss/unlock"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: unlockCode }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "No pude desbloquear la ruta.");
      }

      setUnlocked(true);
      setUnlockCode("");
    } catch (err) {
      setUnlockError(err instanceof Error ? err.message : "Código incorrecto.");
    } finally {
      setUnlocking(false);
    }
  }

  async function handleLogout() {
    if (authRequired) {
      await fetch(buildSecretStudioApiUrl("/api/ss/logout"), {
        method: "POST",
      }).catch(() => null);
    }
    setUnlocked(false);
    setSessionAlbums([]);
    setLiveAlbum(null);
    setError("");
    setProviderNote("");
  }

  async function handleStyleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    try {
      await ensureSecretStudioCloudinaryPreset();
      const batchFolder = `robeanny/style-references/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const cloudinary = await uploadStudioImageToCloudinary({
            file,
            filename: `style-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
            tags: "robeanny,secret-studio,style-reference",
            folderOverride: batchFolder,
          });

          return {
            id: createId("style"),
            name: file.name,
            preview: cloudinary.secureUrl,
            value: cloudinary.secureUrl,
            cloudinaryPublicId: cloudinary.publicId,
            cloudinaryFolder: cloudinary.folder,
          };
        })
      );

      setStyleReferences((current) => [...current, ...uploaded].slice(0, 8));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pude cargar las referencias de estilo."
      );
    } finally {
      event.target.value = "";
    }
  }

  function removeStyleReference(id: string) {
    setStyleReferences((current) => current.filter((item) => item.id !== id));
  }

  async function handleGenerate() {
    if (!provider) {
      setError("Configura al menos un proveedor de IA en las variables de entorno.");
      return;
    }

    if (!effectiveStyleReferences.length && !notes.trim()) {
      setError(
        "Sube al menos una referencia de estilo (el look que quieres) o escribe una nota de dirección."
      );
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(4);
      setGenerationStage("Leyendo tus referencias de estilo...");
      setError("");
      setProviderNote("");
      setShowFullPrompt(false);
      setLiveAlbum(null);
      await ensureSecretStudioCloudinaryPreset();

      const albumSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const recentRecipes = sessionAlbums.slice(0, 3).map((album) => album.recipe);

      const response = await fetch(buildSecretStudioApiUrl("/api/ss/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          aspectRatio,
          albumSize,
          faceLockStrong,
          googleQualityMode,
          notes,
          iteration,
          albumSeed,
          recentRecipes,
          styleReferences: effectiveStyleReferences.map((item) => item.value),
        }),
      });

      if (!response.ok) {
        const payload = isJsonResponse(response)
          ? await response.json().catch(() => null)
          : null;
        throw new Error(payload?.error || "No se pudo generar.");
      }

      if (!response.body) {
        throw new Error("El servidor respondió sin stream de progreso.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedAlbum: GeneratedAlbum | null = null;
      let completedSuccessfully = false;

      const syncLiveAlbum = () => {
        if (!streamedAlbum) return;

        setLiveAlbum({
          ...streamedAlbum,
          shots: streamedAlbum.shots.map((shot) => ({ ...shot })),
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const event = JSON.parse(trimmed) as GenerateStreamEvent;

          if (event.type === "meta") {
            streamedAlbum = {
              id: createId("album"),
              createdAt: new Date().toISOString(),
              provider: event.provider,
              providerLabel: event.providerLabel,
              aspectRatio: event.aspectRatio,
              notes,
              lookLabel: shortLook(event.recipe),
              styleReferenceCount: event.styleReferenceCount,
              recipe: event.recipe,
              recipeSignature: event.recipeSignature,
              completedCount: 0,
              shots: Array.from({ length: event.albumSize }, (_, index) => ({
                id: createId(`shot-${index + 1}`),
                imageUrl: undefined,
                prompt: event.prompts[index] || event.prompt,
                provider: event.provider,
                providerLabel: event.providerLabel,
                aspectRatio: event.aspectRatio,
                notes,
                recipe: event.recipe,
                status: "pending",
              })),
            };
            setProviderNote(event.note || "");
            setIdentityWarning(event.identitySource === "legacy");
            syncLiveAlbum();
            continue;
          }

          if (event.type === "progress") {
            const ratio = event.total ? event.completed / event.total : 0;
            setGenerationProgress(Math.max(6, Math.round(ratio * 100)));
            setGenerationStage(event.stage);
            continue;
          }

          if (event.type === "image") {
            if (streamedAlbum) {
              const shot = streamedAlbum.shots[event.index];

              if (shot) {
                streamedAlbum.shots[event.index] = {
                  ...shot,
                  prompt: event.prompt,
                  imageUrl: event.imageUrl,
                  cloudinaryPublicId: event.cloudinaryPublicId,
                  cloudinaryFolder: event.cloudinaryFolder,
                  status: "ready",
                };
                streamedAlbum.completedCount = event.completed;
                syncLiveAlbum();
              }
            }

            const ratio = event.total ? event.completed / event.total : 0;
            setGenerationProgress(Math.max(10, Math.round(ratio * 100)));
            setGenerationStage(event.stage);
            continue;
          }

          if (event.type === "done") {
            completedSuccessfully = true;
            setGenerationProgress(100);
            setGenerationStage("Álbum listo.");

            if (streamedAlbum) {
              const finalAlbum: GeneratedAlbum = {
                ...streamedAlbum,
                completedCount: event.completed,
                shots: streamedAlbum.shots.filter(
                  (shot): shot is GeneratedShot =>
                    shot.status === "ready" && Boolean(shot.imageUrl)
                ),
              };

              setSessionAlbums((current) => [finalAlbum, ...current].slice(0, 6));
              setLiveAlbum(null);
            }

            setIteration((value) => value + 1);
            continue;
          }

          if (event.type === "error") {
            throw new Error(event.error);
          }
        }
      }

      if (!completedSuccessfully && streamedAlbum) {
        const readyShots = streamedAlbum.shots.filter(
          (shot): shot is GeneratedShot =>
            shot.status === "ready" && Boolean(shot.imageUrl)
        );

        if (readyShots.length > 0) {
          const partialAlbum: GeneratedAlbum = {
            ...streamedAlbum,
            completedCount: readyShots.length,
            shots: readyShots,
          };

          setSessionAlbums((current) => [partialAlbum, ...current].slice(0, 6));
          setLiveAlbum(null);
          setIteration((value) => value + 1);
          setGenerationProgress(100);
          setGenerationStage("Álbum parcial guardado.");
          setError(
            `Se cortó la conexión, pero se rescataron ${readyShots.length} de ${streamedAlbum.shots.length} fotos.`
          );
          return;
        }

        throw new Error("La generación se cortó antes de completar el álbum.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "No pude generar el álbum.";

      setLiveAlbum(null);
      setGenerationProgress(0);
      setGenerationStage("");

      if (message.includes("504") || message.toLowerCase().includes("timeout")) {
        setError(
          "El álbum tardó demasiado. Está en 4 fotos para hacerlo más estable; vuelve a intentar."
        );
      } else {
        setError(message);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveCurrent(shot: GeneratedShot) {
    if (!shot.imageUrl) return;

    try {
      await saveStudioShot({
        id: shot.id,
        createdAt: new Date().toISOString(),
        provider: shot.provider,
        providerLabel: shot.providerLabel,
        prompt: shot.prompt,
        notes: shot.notes,
        aspectRatio: shot.aspectRatio,
        imageUrl: shot.imageUrl,
        storage: "cloudinary",
        cloudinaryPublicId: shot.cloudinaryPublicId,
        cloudinaryFolder: shot.cloudinaryFolder,
        recipe: shot.recipe,
      });

      await refreshSavedShots();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pude guardar la foto en Cloudinary."
      );
    }
  }

  async function handleSaveAlbum(album: GeneratedAlbum) {
    try {
      for (const shot of album.shots) {
        if (!shot.imageUrl) continue;

        await saveStudioShot({
          id: `${album.id}-${shot.id}`,
          createdAt: new Date().toISOString(),
          provider: shot.provider,
          providerLabel: shot.providerLabel,
          prompt: shot.prompt,
          notes: shot.notes,
          aspectRatio: shot.aspectRatio,
          imageUrl: shot.imageUrl,
          storage: "cloudinary",
          cloudinaryPublicId: shot.cloudinaryPublicId,
          cloudinaryFolder: shot.cloudinaryFolder,
          recipe: shot.recipe,
        });
      }

      await refreshSavedShots();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pude guardar el álbum en Cloudinary."
      );
    }
  }

  function removeSessionAlbum(id: string) {
    setSessionAlbums((current) => current.filter((album) => album.id !== id));

    if (liveAlbum?.id === id) {
      setLiveAlbum(null);
    }
  }

  async function handleDeleteSaved(id: string) {
    try {
      await deleteStudioShot(id);
      await refreshSavedShots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pude borrar la foto guardada.");
    }
  }

  if (authRequired && !unlocked) {
    return (
      <div className="min-h-screen bg-[#090807] px-5 py-10 text-[#f5ecdd]">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(28,22,17,0.92),rgba(11,9,8,0.96))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <p className="mb-4 text-[0.72rem] uppercase tracking-[0.34em] text-[#d8bb8e]">
              Ruta Privada
            </p>
            <h1 className="brand-display text-[clamp(2.8rem,8vw,5rem)] leading-[0.9] text-[#fbf2e5]">
              Secret Studio
            </h1>
            <p className="mt-4 max-w-lg text-[1rem] leading-7 text-[#f5ecdd]/70">
              Desbloquea `/ss` con tu código especial. La ruta queda fuera de indexación,
              y el contenido solo se activa cuando la cookie privada está válida.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
              <label className="mb-3 block text-[0.68rem] uppercase tracking-[0.28em] text-[#f5ecdd]/45">
                Código de acceso
              </label>
              <input
                type="password"
                value={unlockCode}
                onChange={(event) => setUnlockCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !unlocking) {
                    handleUnlock();
                  }
                }}
                placeholder="Escribe el código especial"
                className="w-full rounded-2xl border border-white/10 bg-[#120f0d] px-4 py-3 text-[0.96rem] text-[#f7efe4] outline-none transition focus:border-[#cda46b]"
              />
              {unlockError ? (
                <p className="mt-3 text-sm text-[#f2a7a7]">{unlockError}</p>
              ) : null}
              <button
                type="button"
                onClick={handleUnlock}
                disabled={unlocking}
                className="luxury-button mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {unlocking ? "Desbloqueando..." : "Entrar a Secret Studio"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,174,106,0.24),rgba(217,174,106,0)_28%),linear-gradient(180deg,#090807_0%,#120f0c_48%,#17120e_100%)] px-5 py-6 text-[#f7efe4] md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[rgba(20,16,13,0.76)] p-6 backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-[#d8bb8e]">
              /ss Private Creative Studio
            </p>
            <h1 className="brand-display mt-3 text-[clamp(2.8rem,7vw,5.8rem)] leading-[0.9] text-[#fbf2e5]">
              Secret Studio
            </h1>
            <p className="mt-4 max-w-3xl text-[0.98rem] leading-7 text-[#f7efe4]/72">
              Sube las <strong className="text-[#fff2db]">referencias de estilo</strong> del look que quieres
              y el estudio las recrea con el rostro y el cuerpo reales de Robeanny.
              Cada álbum mantiene el mismo look; el siguiente parte de nuevas referencias.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !availableProviders.length}
              className="luxury-button min-w-[220px] justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generando álbum..." : "Generar álbum"}
            </button>
            {authRequired ? (
              <button
                type="button"
                onClick={handleLogout}
                className="luxury-button-secondary min-w-[160px] justify-center border-white/20 bg-white/5 text-[#f7efe4] hover:border-[#f7efe4] hover:bg-[#f7efe4] hover:text-[#120f0d]"
              >
                Bloquear ruta
              </button>
            ) : null}
          </div>
        </div>

        {identityWarning ? (
          <div className="rounded-[1.4rem] border border-[#f2a7a7]/30 bg-[rgba(182,77,77,0.12)] px-5 py-4 text-sm leading-6 text-[#ffd2d2]">
            Todavía se está usando el rostro <strong>viejo</strong> (nariz previa). Agrega las fotos nuevas
            del rostro en la carpeta <code>public/robeanny-face/</code> para re-anclar la identidad.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                    Cerebro y creador
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                    {providerDescription}
                  </p>
                </div>
                <span className="rounded-full border border-[#d8bb8e]/30 px-3 py-1 text-[0.62rem] uppercase tracking-[0.26em] text-[#f4dfbf]">
                  Álbum {iteration + 1}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(["openai", "google"] as StudioProvider[]).map((item) => {
                  const enabled = availableProviders.includes(item);
                  const selected = provider === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={!enabled}
                      onClick={() => setProvider(item)}
                      className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
                        selected
                          ? "border-[#d8bb8e] bg-[rgba(216,187,142,0.12)]"
                          : "border-white/10 bg-white/4"
                      } ${enabled ? "" : "cursor-not-allowed opacity-40"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[0.66rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                          {item === "openai" ? "OpenAI · GPT Image 2" : "Google Vertex AI"}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-1 text-[0.52rem] uppercase tracking-[0.24em] ${
                            item === "openai"
                              ? "border-[#d8bb8e]/40 bg-[rgba(216,187,142,0.16)] text-[#fff2db]"
                              : "border-white/15 text-[#f7efe4]/55"
                          }`}
                        >
                          {item === "openai" ? "Principal" : "Alternativa"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#f7efe4]/68">
                        {enabled
                          ? item === "openai"
                            ? "El mejor creador de imágenes ahora mismo."
                            : getStudioProviderLabel(item)
                          : item === "openai"
                            ? "Falta `OPENAI_API_KEY`"
                            : "Falta `VERTEX_AI_PROJECT_ID` o `GOOGLE_CREDENTIALS_JSON`"}
                      </p>
                    </button>
                  );
                })}
              </div>

              {provider === "google" ? (
                <div className="mt-3 rounded-[1.2rem] border border-[#d8bb8e]/22 bg-[rgba(216,187,142,0.08)] px-4 py-4">
                  <p className="text-[0.66rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                    Google Pro Image
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/68">
                    Genera con el modelo Pro de imagen en Vertex y fija el retrato a `3:4`. Úsalo si quieres comparar contra OpenAI.
                  </p>
                </div>
              ) : null}

              {estimatedCost ? (
                <div className="mt-4 rounded-[1.4rem] border border-[#d8bb8e]/18 bg-[rgba(216,187,142,0.08)] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                        Costo estimado
                      </p>
                      <p className="mt-1 text-[1.1rem] text-[#fff2db]">
                        {estimatedCost.label} por álbum
                      </p>
                    </div>
                    <span className="rounded-full border border-[#d8bb8e]/25 px-3 py-1 text-[0.58rem] uppercase tracking-[0.24em] text-[#f4dfbf]">
                      {albumSize} fotos
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#f7efe4]/64">
                    {estimatedCost.providerNote}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                    Referencias de estilo
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                    Sube fotos del <strong className="text-[#fff2db]">look</strong> que quieres (ropa, set, luz, vibra).
                    El motor lo recrea con la cara de Robeanny. No copia la cara de estas fotos.
                  </p>
                  {styleReferences.length > styleReferenceLimit ? (
                    <p className="mt-2 text-xs leading-5 text-[#f0c98f]">
                      Hay {styleReferences.length} referencias cargadas; esta generación
                      usará solo las primeras {styleReferenceLimit}.
                    </p>
                  ) : null}
                </div>
                <label className="luxury-button-secondary cursor-pointer border-white/15 bg-white/5 px-4 py-3 text-[#f7efe4] hover:border-[#f7efe4] hover:bg-[#f7efe4] hover:text-[#120f0d]">
                  Subir look
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleStyleUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {styleReferences.length ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {styleReferences.map((reference) => (
                    <div
                      key={reference.id}
                      className="overflow-hidden rounded-[1.3rem] border border-white/10 bg-white/4"
                    >
                      <div className="relative aspect-[4/5]">
                        <Image
                          src={reference.preview}
                          alt={reference.name}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 1280px) 50vw, 220px"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 px-3 py-3">
                        <p className="min-w-0 truncate text-sm text-[#fff1dc]">
                          {reference.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeStyleReference(reference.id)}
                          className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.4rem] border border-dashed border-white/12 bg-white/3 px-4 py-8 text-center text-sm leading-6 text-[#f7efe4]/58">
                  Sin referencias todavía. Sube varias fotos del look, o describe el look en las notas de abajo.
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-6">
              <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                Rostro base de Robeanny
              </p>
              <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                {identityWarning
                  ? "Usando fotos viejas (nariz previa). Cambia la carpeta `public/robeanny-face/` para re-anclar."
                  : "De aquí sale su cara, nariz y cuerpo. Para cambiarlo, edita la carpeta `public/robeanny-face/`."}
              </p>

              {identityReferences.length ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {identityReferences.slice(0, 6).map((reference, index) => (
                    <div
                      key={reference}
                      className="relative aspect-[4/5] overflow-hidden rounded-[1rem] border border-white/10 bg-white/4"
                    >
                      <Image
                        src={reference}
                        alt={`Rostro base ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="120px"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.2rem] border border-dashed border-white/12 bg-white/3 px-4 py-6 text-center text-sm text-[#f7efe4]/58">
                  Carpeta vacía. Agrega fotos del rostro en `public/robeanny-face/`.
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-6">
              <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                Ajustes
              </p>

              <p className="mt-4 text-[0.6rem] uppercase tracking-[0.24em] text-[#f7efe4]/45">
                Formato
              </p>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {aspectRatioOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAspectRatio(item)}
                    className={`rounded-full border px-2 py-2 text-[0.66rem] uppercase tracking-[0.14em] transition ${
                      aspectRatio === item
                        ? "border-[#d8bb8e] bg-[rgba(216,187,142,0.14)] text-[#fff2db]"
                        : "border-white/10 text-[#f7efe4]/58"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {provider === "google" ? (
                <p className="mt-3 text-sm leading-6 text-[#f7efe4]/56">
                  En Google Pro Image la generación real queda fijada a `3:4`.
                </p>
              ) : null}

              <div className="mt-4 rounded-full border border-[#d8bb8e] bg-[rgba(216,187,142,0.14)] px-4 py-3 text-center text-[0.72rem] uppercase tracking-[0.24em] text-[#fff2db]">
                4 fotos por álbum
              </div>

              <button
                type="button"
                onClick={() => setFaceLockStrong((value) => !value)}
                className={`mt-3 w-full rounded-[1.2rem] border px-4 py-3 text-left transition ${
                  faceLockStrong
                    ? "border-[#d8bb8e] bg-[rgba(216,187,142,0.14)]"
                    : "border-white/10 bg-white/4"
                }`}
              >
                <p className="text-[0.66rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                  Face Lock Strong
                </p>
                <p className="mt-2 text-sm leading-6 text-[#f7efe4]/68">
                  {faceLockStrong
                    ? "Activo. Prioriza el rostro real, la nariz nueva, el cuerpo real y ojos café oscuro."
                    : "Desactivado. Más libertad creativa, pero puede variar más la identidad."}
                </p>
              </button>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={5}
                placeholder="Notas de dirección opcionales. Ejemplo: vestido negro satinado, terraza al atardecer, luz cálida, joyería dorada mínima..."
                className="mt-4 w-full rounded-[1.4rem] border border-white/10 bg-[#120f0d] px-4 py-4 text-[0.95rem] leading-7 text-[#f7efe4] outline-none"
              />

              <div className="mt-4 rounded-[1.4rem] border border-[#d8bb8e]/16 bg-[rgba(216,187,142,0.06)] p-4 text-sm leading-6 text-[#f7efe4]/62">
                Las referencias mandan el look. Tus notas lo refinan o, si no subes referencias, definen el look por texto.
              </div>
            </section>
          </aside>

          <main className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-4 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                    Álbum actual
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                    Cada clic crea un álbum completo. Las fotos aparecen apenas terminan.
                  </p>
                </div>
                {currentAlbum && !isGenerating ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleSaveAlbum(currentAlbum)}
                      className="luxury-button-secondary border-white/15 bg-white/5 px-4 py-3 text-[#f7efe4] hover:border-[#f7efe4] hover:bg-[#f7efe4] hover:text-[#120f0d]"
                    >
                      Guardar álbum
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSessionAlbum(currentAlbum.id)}
                      className="luxury-button-secondary border-white/15 bg-white/5 px-4 py-3 text-[#f7efe4] hover:border-[#f7efe4] hover:bg-[#f7efe4] hover:text-[#120f0d]"
                    >
                      Borrar álbum
                    </button>
                  </div>
                ) : null}
              </div>

              {isGenerating ? (
                <div className="mt-5 rounded-[1.5rem] border border-[#d8bb8e]/18 bg-[rgba(216,187,142,0.08)] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                      Generando en vivo
                    </p>
                    <span className="text-[0.68rem] uppercase tracking-[0.22em] text-[#fff2db]">
                      {generationProgress}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#d8bb8e,#fff1dc)] transition-all duration-500"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#f7efe4]/68">
                    {generationStage || "Preparando el álbum..."}
                  </p>
                </div>
              ) : null}

              {error ? (
                <div className="mt-5 rounded-[1.3rem] border border-[#f2a7a7]/30 bg-[rgba(182,77,77,0.12)] px-4 py-4 text-sm text-[#ffd2d2]">
                  {error}
                </div>
              ) : null}

              {providerNote ? (
                <div className="mt-5 rounded-[1.3rem] border border-[#d8bb8e]/20 bg-[rgba(216,187,142,0.08)] px-4 py-4 text-sm text-[#f7efe4]/72">
                  {providerNote}
                </div>
              ) : null}

              <div className="mt-6">
                {currentAlbum ? (
                  <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
                    <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {currentAlbum.shots.map((shot, index) => (
                        <article
                          key={shot.id}
                          className="h-fit self-start overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/4"
                        >
                          <div className="relative aspect-[4/5]">
                            {shot.imageUrl ? (
                              <Image
                                src={shot.imageUrl}
                                alt={`Album shot ${index + 1}`}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="(max-width: 1280px) 100vw, 420px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
                                <div className="text-center">
                                  <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                                    Renderizando
                                  </p>
                                  <p className="mt-3 text-sm text-[#f7efe4]/54">
                                    Foto {index + 1} de {currentAlbum.shots.length}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 px-4 py-4">
                            <button
                              type="button"
                              disabled={!shot.imageUrl}
                              onClick={() => handleSaveCurrent(shot)}
                              className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              disabled={!shot.imageUrl}
                              onClick={() =>
                                shot.imageUrl
                                  ? downloadImage(
                                      shot.imageUrl,
                                      `robeanny-album-${index + 1}-${Date.now()}.png`
                                    )
                                  : null
                              }
                              className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Descargar
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                        <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                          Álbum
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#f7efe4]/72">
                          {currentAlbum.completedCount}/{currentAlbum.shots.length} fotos listas
                          {currentAlbum.styleReferenceCount
                            ? ` · ${currentAlbum.styleReferenceCount} ref. de estilo`
                            : " · look por notas"}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                        <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                          Look detectado
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(currentAlbum.recipe)
                            .filter(([key]) =>
                              [
                                "wardrobe",
                                "setDesign",
                                "lighting",
                                "mood",
                                "colorPalette",
                                "styling",
                              ].includes(key)
                            )
                            .map(([key, value]) => (
                              <span
                                key={key}
                                className="rounded-full border border-white/10 px-3 py-2 text-[0.67rem] leading-5 text-[#f7efe4]/70"
                              >
                                {value}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                        <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                          Motor
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#f7efe4]/64">
                          {currentAlbum.providerLabel}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                        <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                          Prompt base
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#f7efe4]/64">
                          {promptPreview}
                        </p>
                        {isPromptLong ? (
                          <button
                            type="button"
                            onClick={() => setShowFullPrompt((value) => !value)}
                            className="mt-3 rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                          >
                            {showFullPrompt ? "Ver menos" : "Ver más"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.8rem] border border-dashed border-white/12 bg-white/3 px-6 py-14 text-center">
                    <p className="brand-display text-[2.2rem] text-[#fbf2e5]">
                      Lista para el siguiente álbum
                    </p>
                    <p className="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-7 text-[#f7efe4]/60">
                      Sube las referencias del look que quieres, ajusta el formato y dispara el álbum.
                      Las fotos irán apareciendo una por una mientras se generan.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                    Historial de esta sesión
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                    Cada entrada es un álbum completo con su propio look.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.24em] text-[#f7efe4]/54">
                  {sessionAlbums.length} álbumes
                </span>
              </div>

              <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {sessionAlbums.map((album) => (
                  <article
                    key={album.id}
                    className="h-fit self-start overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/4"
                  >
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={album.shots[0]?.imageUrl || ""}
                        alt="Generated album cover"
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 1536px) 50vw, 400px"
                      />
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-[0.62rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                          {album.lookLabel}
                        </p>
                        <span className="shrink-0 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/40">
                          {album.shots.length} fotos
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveAlbum(album)}
                          className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                        >
                          Guardar álbum
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSessionAlbum(album.id)}
                          className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                        >
                          Borrar álbum
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                    Guardadas
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                    Estas fotos quedan registradas localmente y, si Cloudinary está listo, se guardan en la carpeta `robeanny`.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={refreshSavedShots}
                  className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.24em] text-[#f7efe4]/58 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                >
                  Refrescar
                </button>
              </div>

              {savedLoading ? (
                <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-8 text-center text-sm text-[#f7efe4]/58">
                  Cargando fotos guardadas...
                </div>
              ) : savedShots.length ? (
                <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {savedShots.map((shot) => (
                    <article
                      key={shot.id}
                      className="h-fit self-start overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/4"
                    >
                      <div className="relative aspect-[4/5]">
                        <Image
                          src={shot.imageUrl}
                          alt="Saved secret studio shot"
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 1536px) 50vw, 400px"
                        />
                      </div>
                      <div className="space-y-3 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                            {shot.providerLabel}
                          </p>
                          <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/40">
                            {shot.aspectRatio}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              downloadImage(shot.imageUrl, `robeanny-saved-${Date.now()}.png`)
                            }
                            className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                          >
                            Descargar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSaved(shot.id)}
                            className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-4 py-8 text-center text-sm text-[#f7efe4]/58">
                  Aún no hay fotos guardadas localmente.
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
