"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  GoogleQualityMode,
  STUDIO_PRESETS,
  StudioAspectRatio,
  StudioPresetId,
  StudioProvider,
  getStudioEstimatedCost,
  getStudioPreset,
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
  presetId: StudioPresetId;
  presetLabel: string;
  recipe: Record<string, string>;
  recipeSignature: string;
  shots: GeneratedShot[];
  completedCount: number;
};

type ReferenceItem = {
  id: string;
  name: string;
  preview: string;
  value: string;
  cloudinaryPublicId?: string;
  cloudinaryFolder?: string;
  source: "fallback" | "upload";
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

const aspectRatioOptions: StudioAspectRatio[] = [
  "4:5",
  "3:4",
  "1:1",
  "9:16",
  "16:9",
];

const SETTINGS_STORAGE_KEY = "robeanny-secret-studio-settings";
const LEGACY_NOTES_PATTERNS = [
  "ultra-professional studio shoot",
  "seamless luxury backdrop",
  "expensive commercial beauty finish",
  "premium styling",
  "clean luxury atmosphere",
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeLegacyStudioNotes(value: string) {
  const normalized = value.trim();

  if (!normalized) return "";

  const lowered = normalized.toLowerCase();
  const hasLegacyPhrase = LEGACY_NOTES_PATTERNS.some((pattern) =>
    lowered.includes(pattern)
  );

  return hasLegacyPhrase ? "" : normalized;
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
  availableProviders,
  fallbackReferences,
}: {
  initialUnlocked: boolean;
  availableProviders: StudioProvider[];
  fallbackReferences: string[];
}) {
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [unlockCode, setUnlockCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const [provider, setProvider] = useState<StudioProvider | "">(
    availableProviders.includes("google")
      ? "google"
      : availableProviders[0] || ""
  );
  const [presetId, setPresetId] = useState<StudioPresetId>("white_seamless");
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

  const [references, setReferences] = useState<ReferenceItem[]>(
    fallbackReferences.map((item, index) => ({
      id: `fallback-${index + 1}`,
      name: `Base ${index + 1}`,
      preview: item,
      value: item,
      source: "fallback",
    }))
  );

  const [liveAlbum, setLiveAlbum] = useState<GeneratedAlbum | null>(null);
  const [sessionAlbums, setSessionAlbums] = useState<GeneratedAlbum[]>([]);
  const [savedShots, setSavedShots] = useState<SavedStudioShot[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);

  const selectedPreset = useMemo(() => getStudioPreset(presetId), [presetId]);
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
  const effectiveReferenceLimit = provider === "google" ? 6 : 4;
  const effectiveReferences = references.slice(0, effectiveReferenceLimit);

  const providerDescription = useMemo(() => {
    if (provider === "google") {
      return "Google ahora corre en Pro Image por Vertex: prioriza realismo, anatomía y piel creíble usando varias referencias faciales. Aquí el costo ya no es la prioridad.";
    }

    if (provider === "openai") {
      return "OpenAI ahora usa una foto ancla para el álbum y menos referencias faciales para evitar drift. Suele arrancar más lento que Google, pero ya no está como simple relleno.";
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
        presetId: StudioPresetId;
        aspectRatio: StudioAspectRatio;
        albumSize: 4;
        faceLockStrong: boolean;
        googleQualityMode: GoogleQualityMode;
        notes: string;
      }>;

      if (saved.provider && availableProviders.includes(saved.provider)) {
        setProvider(saved.provider);
      }
      if (saved.presetId) setPresetId(saved.presetId);
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
        setNotes(sanitizeLegacyStudioNotes(saved.notes));
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
        presetId,
        aspectRatio,
        albumSize,
        faceLockStrong,
        googleQualityMode,
        notes,
      })
    );
  }, [
    provider,
    presetId,
    aspectRatio,
    albumSize,
    faceLockStrong,
    googleQualityMode,
    notes,
  ]);

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

      const response = await fetch("/api/ss/unlock", {
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
    await fetch("/api/ss/logout", { method: "POST" }).catch(() => null);
    setUnlocked(false);
    setSessionAlbums([]);
    setLiveAlbum(null);
    setError("");
    setProviderNote("");
  }

  async function handleReferenceUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    try {
      await ensureSecretStudioCloudinaryPreset();
      const referenceBatchFolder = `robeanny/references/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const cloudinary = await uploadStudioImageToCloudinary({
            file,
            filename: `reference-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
            tags: "robeanny,secret-studio,reference",
            folderOverride: referenceBatchFolder,
          });

          return {
            id: createId("upload"),
            name: file.name,
            preview: cloudinary.secureUrl,
            value: cloudinary.secureUrl,
            cloudinaryPublicId: cloudinary.publicId,
            cloudinaryFolder: cloudinary.folder,
            source: "upload" as const,
          };
        })
      );

      setReferences((current) => [...current, ...uploaded].slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pude cargar las referencias.");
    } finally {
      event.target.value = "";
    }
  }

  function removeReference(id: string) {
    setReferences((current) => current.filter((item) => item.id !== id));
  }

  async function handleGenerate() {
    if (!provider) {
      setError("Configura al menos un proveedor de IA en las variables de entorno.");
      return;
    }

    if (!references.length) {
      setError("Sube o conserva al menos una foto de referencia.");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(4);
      setGenerationStage("Preparando receta del álbum...");
      setError("");
      setProviderNote("");
      setShowFullPrompt(false);
      setLiveAlbum(null);
      await ensureSecretStudioCloudinaryPreset();

      const albumSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const excludedRecipeSignatures = sessionAlbums
        .slice(0, 4)
        .map((album) => album.recipeSignature);
      const recentRecipes = sessionAlbums.slice(0, 3).map((album) => album.recipe);

      const response = await fetch("/api/ss/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          presetId,
          direction: selectedPreset.label,
          aspectRatio,
          albumSize,
          faceLockStrong,
          googleQualityMode,
          notes,
          iteration,
          albumSeed,
          excludedRecipeSignatures,
          recentRecipes,
          references: effectiveReferences.map((item) => item.value),
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
              presetId: event.presetId,
              presetLabel: getStudioPreset(event.presetId).label,
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

      if (!completedSuccessfully) {
        throw new Error("La generación se cortó antes de completar el álbum.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "No pude generar el álbum.";

      setLiveAlbum(null);
      setGenerationProgress(0);
      setGenerationStage("");

      if (message.includes("504") || message.toLowerCase().includes("timeout")) {
        setError(
          "El álbum tardó demasiado. Ahora lo dejé en 4 fotos para hacerlo más estable; vuelve a intentar."
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

  if (!unlocked) {
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
              /ss Private Creative Lab
            </p>
            <h1 className="brand-display mt-3 text-[clamp(2.8rem,7vw,5.8rem)] leading-[0.9] text-[#fbf2e5]">
              Secret Studio
            </h1>
            <p className="mt-4 max-w-3xl text-[0.98rem] leading-7 text-[#f7efe4]/72">
              Ahora `/ss` trabaja con presets reales de sesión, progreso por foto y
              estimación de costo antes de disparar. Dentro del álbum se mantiene el mismo look;
              el siguiente álbum rehace la receta completa.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !availableProviders.length}
              className="luxury-button min-w-[220px] justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generando álbum..." : "Generar nuevo álbum"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="luxury-button-secondary min-w-[160px] justify-center border-white/20 bg-white/5 text-[#f7efe4] hover:border-[#f7efe4] hover:bg-[#f7efe4] hover:text-[#120f0d]"
            >
              Bloquear ruta
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                    Motor creativo
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                    {providerDescription}
                  </p>
                </div>
                <span className="rounded-full border border-[#d8bb8e]/30 px-3 py-1 text-[0.62rem] uppercase tracking-[0.26em] text-[#f4dfbf]">
                  Iteración {iteration + 1}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(["google", "openai"] as StudioProvider[]).map((item) => {
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
                          {item === "google" ? "Google Vertex AI" : "OpenAI GPT Image"}
                        </p>
                        {item === "openai" ? (
                          <span className="rounded-full border border-[#f2a7a7]/30 bg-[rgba(182,77,77,0.12)] px-2 py-1 text-[0.52rem] uppercase tracking-[0.24em] text-[#ffd2d2]">
                            Experimental
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#f7efe4]/68">
                        {enabled
                          ? item === "openai"
                            ? "Disponible, pero aquí lo dejo como opción secundaria."
                            : getStudioProviderLabel(item)
                          : item === "google"
                            ? "Falta `VERTEX_AI_PROJECT_ID` o `GOOGLE_CREDENTIALS_JSON`"
                            : "Falta `OPENAI_API_KEY`"}
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
                    El backend ya no usa modo económico. Google genera con el modelo Pro de imagen en Vertex para priorizar piel, anatomía y realismo.
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
              <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                Preset de sesión
              </p>
              <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                Estos presets ya no son decorativos. Cada uno obliga fondo, iluminación, pose base y dirección real en backend.
              </p>

              <div className="mt-4 grid gap-3">
                {STUDIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPresetId(preset.id)}
                    className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                      presetId === preset.id
                        ? "border-[#d8bb8e] bg-[rgba(216,187,142,0.14)]"
                        : "border-white/10 bg-white/4"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                        {preset.label}
                      </p>
                      {presetId === preset.id ? (
                        <span className="rounded-full border border-[#d8bb8e]/25 px-2 py-1 text-[0.54rem] uppercase tracking-[0.24em] text-[#fff2db]">
                          Activo
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#f7efe4]/68">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {aspectRatioOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAspectRatio(item)}
                    className={`rounded-full border px-3 py-2 text-[0.7rem] uppercase tracking-[0.22em] transition ${
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
                  En Google Pro Image dejo la generación real fijada a `3:4` para retrato vertical consistente.
                </p>
              ) : null}

              <div className="mt-3 rounded-full border border-[#d8bb8e] bg-[rgba(216,187,142,0.14)] px-4 py-3 text-center text-[0.72rem] uppercase tracking-[0.24em] text-[#fff2db]">
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
                    ? "Activo. Preserva rostro real, asimetrías y ojos café oscuro en ambos motores."
                    : "Desactivado. Da más libertad creativa, pero puede variar más la identidad."}
                </p>
              </button>

              <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/4 p-4">
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                  Base del preset
                </p>
                <p className="mt-3 text-sm leading-7 text-[#f7efe4]/66">
                  {selectedPreset.notes}
                </p>
              </div>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={5}
                placeholder="Notas extra opcionales. Ejemplo: same gold jewelry, cleaner hands, stronger jawline, softer smile..."
                className="mt-4 w-full rounded-[1.4rem] border border-white/10 bg-[#120f0d] px-4 py-4 text-[0.95rem] leading-7 text-[#f7efe4] outline-none"
              />

              <div className="mt-4 rounded-[1.4rem] border border-[#d8bb8e]/16 bg-[rgba(216,187,142,0.06)] p-4 text-sm leading-6 text-[#f7efe4]/62">
                El preset manda la estructura real del álbum. Tus notas extra solo refinan el resultado; ya no dependen de un dropdown “bonito” sin efecto real.
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                    Referencias
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                    {provider === "google"
                      ? "Con Google Pro Image puedes usar varias referencias limpias del rostro y cuerpo para fijar mejor la identidad."
                      : "Con OpenAI puedes usar hasta 4 referencias limpias del rostro y cuerpo para mantener la identidad estable."}
                  </p>
                  {references.length > effectiveReferenceLimit ? (
                    <p className="mt-2 text-xs leading-5 text-[#f0c98f]">
                      Hay {references.length} referencias cargadas, pero esta generación
                      usará solo las primeras {effectiveReferenceLimit}.
                    </p>
                  ) : null}
                </div>
                <label className="luxury-button-secondary cursor-pointer border-white/15 bg-white/5 px-4 py-3 text-[#f7efe4] hover:border-[#f7efe4] hover:bg-[#f7efe4] hover:text-[#120f0d]">
                  Subir fotos
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleReferenceUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {references.map((reference) => (
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
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[#fff1dc]">{reference.name}</p>
                        <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#f7efe4]/42">
                          {reference.source === "fallback" ? "Base" : "Upload"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReference(reference.id)}
                        className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
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
                    Cada clic crea un álbum completo. El progreso ahora es real: cada foto aparece apenas termina.
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
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                        <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                          Preset activo
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#f7efe4]/64">
                          {currentAlbum.presetLabel}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                        <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                          Receta activa
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(currentAlbum.recipe).map(([key, value]) => (
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
                          {currentAlbum.provider === "openai" ? " · experimental" : ""}
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
                      Elige un preset real, revisa el costo estimado, sube referencias y dispara el álbum. Las fotos irán apareciendo una por una mientras se generan.
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
                    Cada entrada es un álbum completo con una receta distinta.
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
                        <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                          {album.presetLabel}
                        </p>
                        <span className="text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/40">
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
