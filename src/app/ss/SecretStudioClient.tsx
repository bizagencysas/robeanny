"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  StudioAspectRatio,
  StudioProvider,
  getStudioProviderLabel,
} from "@/lib/secret-studio-shared";
import {
  SavedStudioShot,
  deleteStudioShot,
  listSavedStudioShots,
  saveStudioShot,
} from "@/lib/secret-studio-db";

type GeneratedShot = {
  id: string;
  imageUrl: string;
  prompt: string;
  provider: StudioProvider;
  providerLabel: string;
  aspectRatio: string;
  notes: string;
  recipe: Record<string, string>;
};

type ReferenceItem = {
  id: string;
  name: string;
  preview: string;
  value: string;
  source: "fallback" | "upload";
};

type GenerateResponse = {
  success: true;
  provider: StudioProvider;
  providerLabel: string;
  prompt: string;
  recipe: Record<string, string>;
  aspectRatio: string;
  iteration: number;
  images: string[];
  note: string | null;
};

const directionOptions = [
  "Editorial glam",
  "Studio clean",
  "Luxury campaign",
  "Beauty close-up",
  "Rooftop cinematic",
  "Resort chic",
  "Street luxury",
  "Catalogue premium",
];

const aspectRatioOptions: StudioAspectRatio[] = [
  "4:5",
  "3:4",
  "1:1",
  "9:16",
  "16:9",
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer una de las fotos."));
    reader.readAsDataURL(file);
  });
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
    availableProviders[0] || ""
  );
  const [direction, setDirection] = useState(directionOptions[0]);
  const [aspectRatio, setAspectRatio] = useState<StudioAspectRatio>("4:5");
  const [notes, setNotes] = useState(
    "High-end fashion, editorial polish, natural beauty, premium styling."
  );
  const [iteration, setIteration] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const [sessionShots, setSessionShots] = useState<GeneratedShot[]>([]);
  const [savedShots, setSavedShots] = useState<SavedStudioShot[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);

  const currentShot = sessionShots[0] || null;

  const providerDescription = useMemo(() => {
    if (provider === "google") {
      return "Nano Banana 2 suele ser excelente para iterar rápido con referencias y variaciones visuales.";
    }

    if (provider === "openai") {
      return "OpenAI GPT Image suele dar una salida muy fina para editorial y retrato premium.";
    }

    return "";
  }, [provider]);

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
    setSessionShots([]);
    setError("");
    setProviderNote("");
  }

  async function handleReferenceUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const dataUrl = await fileToDataUrl(file);

          return {
            id: createId("upload"),
            name: file.name,
            preview: dataUrl,
            value: dataUrl,
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
      setError("");
      setProviderNote("");

      const response = await fetch("/api/ss/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          direction,
          aspectRatio,
          notes,
          iteration,
          references: references.map((item) => item.value),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | GenerateResponse
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("success" in payload)) {
        throw new Error(payload && "error" in payload ? payload.error || "No se pudo generar." : "No se pudo generar.");
      }

      const createdAt = new Date().toISOString();
      const newShots = payload.images.map((imageUrl) => ({
        id: createId("shot"),
        imageUrl,
        prompt: payload.prompt,
        provider: payload.provider,
        providerLabel: payload.providerLabel,
        aspectRatio: payload.aspectRatio,
        notes,
        recipe: payload.recipe,
        createdAt,
      }));

      setSessionShots((current) => [...newShots, ...current].slice(0, 12));
      setIteration((value) => value + 1);
      setProviderNote(payload.note || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pude generar la foto.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveCurrent(shot: GeneratedShot) {
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
        recipe: shot.recipe,
      });

      await refreshSavedShots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pude guardar la foto.");
    }
  }

  function removeSessionShot(id: string) {
    setSessionShots((current) => current.filter((shot) => shot.id !== id));
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

            <div className="mt-6 grid gap-3 text-sm text-[#f5ecdd]/62 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-[0.64rem] uppercase tracking-[0.26em] text-[#d8bb8e]">
                  Motores
                </p>
                <p className="mt-2 leading-6">
                  OpenAI GPT Image y Nano Banana 2 listos para referencias y variaciones consecutivas.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-[0.64rem] uppercase tracking-[0.26em] text-[#d8bb8e]">
                  Privacidad
                </p>
                <p className="mt-2 leading-6">
                  `noindex`, cookie privada y guardado local en tu navegador para que no quede expuesto.
                </p>
              </div>
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
              Genera nuevas sesiones editoriales a partir de referencias reales de Robeanny:
              cambio progresivo de styling, poses, cabello, encuadres y dirección creativa.
              El flujo está limitado a moda, beauty y retrato profesional para adulto con consentimiento.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !availableProviders.length}
              className="luxury-button min-w-[220px] justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generando..." : "Generar siguiente sesión"}
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

        <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
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

                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={!enabled}
                      onClick={() => setProvider(item)}
                      className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
                        provider === item
                          ? "border-[#d8bb8e] bg-[rgba(216,187,142,0.12)]"
                          : "border-white/10 bg-white/4"
                      } ${enabled ? "" : "cursor-not-allowed opacity-40"}`}
                    >
                      <p className="text-[0.66rem] uppercase tracking-[0.24em] text-[#d8bb8e]">
                        {item === "google" ? "Nano Banana 2" : "OpenAI GPT Image"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#f7efe4]/68">
                        {enabled
                          ? getStudioProviderLabel(item)
                          : item === "google"
                            ? "Falta `GEMINI_API_KEY` o `GOOGLE_AI_API_KEY`"
                            : "Falta `OPENAI_API_KEY`"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-6">
              <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                Dirección creativa
              </p>
              <div className="mt-4 grid gap-3">
                <select
                  value={direction}
                  onChange={(event) => setDirection(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-[#120f0d] px-4 py-3 text-[#f7efe4] outline-none"
                >
                  {directionOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-3 gap-2">
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

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={6}
                  placeholder="Ejemplo: luxury fashion, warm skin tones, polished waves, soft confidence, campaign feel..."
                  className="rounded-[1.4rem] border border-white/10 bg-[#120f0d] px-4 py-4 text-[0.95rem] leading-7 text-[#f7efe4] outline-none"
                />

                <div className="rounded-[1.4rem] border border-[#d8bb8e]/16 bg-[rgba(216,187,142,0.06)] p-4 text-sm leading-6 text-[#f7efe4]/62">
                  Evito desnudos o pedidos explícitos para mantener el flujo editorial, usable y seguro.
                  A cambio, empujo fuerte en fashion, beauty, campaign, lookbook y retrato premium.
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-[rgba(18,14,11,0.78)] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                    Referencias
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                    Usa 3 a 5 fotos limpias del rostro y cuerpo para mantener la identidad estable.
                  </p>
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
                    Resultado actual
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                    Cada generación cambia la receta automáticamente para no repetir el mismo shooting.
                  </p>
                </div>
                {currentShot ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleSaveCurrent(currentShot)}
                      className="luxury-button-secondary border-white/15 bg-white/5 px-4 py-3 text-[#f7efe4] hover:border-[#f7efe4] hover:bg-[#f7efe4] hover:text-[#120f0d]"
                    >
                      Guardar local
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadImage(currentShot.imageUrl, `robeanny-session-${Date.now()}.png`)
                      }
                      className="luxury-button-secondary border-white/15 bg-white/5 px-4 py-3 text-[#f7efe4] hover:border-[#f7efe4] hover:bg-[#f7efe4] hover:text-[#120f0d]"
                    >
                      Descargar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSessionShot(currentShot.id)}
                      className="luxury-button-secondary border-white/15 bg-white/5 px-4 py-3 text-[#f7efe4] hover:border-[#f7efe4] hover:bg-[#f7efe4] hover:text-[#120f0d]"
                    >
                      Borrar
                    </button>
                  </div>
                ) : null}
              </div>

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
                {currentShot ? (
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
                    <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/20">
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={currentShot.imageUrl}
                          alt="Generated editorial photo"
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 1280px) 100vw, 900px"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                        <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                          Motor
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#f7efe4]/72">
                          {currentShot.providerLabel}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-4">
                        <p className="text-[0.64rem] uppercase tracking-[0.28em] text-[#d8bb8e]">
                          Receta activa
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(currentShot.recipe).map(([key, value]) => (
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
                          Prompt final
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#f7efe4]/64">
                          {currentShot.prompt}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.8rem] border border-dashed border-white/12 bg-white/3 px-6 py-14 text-center">
                    <p className="brand-display text-[2.2rem] text-[#fbf2e5]">
                      Lista para el siguiente shooting
                    </p>
                    <p className="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-7 text-[#f7efe4]/60">
                      Sube referencias, elige motor, presiona generar y el sistema irá cambiando el styling de forma consecutiva sin repetir exactamente la misma receta.
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
                    Puedes seguir generando y borrar resultados que no te gusten sin guardar nada.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.24em] text-[#f7efe4]/54">
                  {sessionShots.length} resultados
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {sessionShots.map((shot) => (
                  <article
                    key={shot.id}
                    className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/4"
                  >
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={shot.imageUrl}
                        alt="Generated session shot"
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
                          onClick={() => handleSaveCurrent(shot)}
                          className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadImage(shot.imageUrl, `robeanny-session-${Date.now()}.png`)
                          }
                          className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                        >
                          Descargar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSessionShot(shot.id)}
                          className="rounded-full border border-white/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#f7efe4]/60 transition hover:border-[#f7efe4] hover:text-[#f7efe4]"
                        >
                          Borrar
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
                    Guardadas en este navegador
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7efe4]/62">
                    Estas fotos viven en IndexedDB local, no en un storage público del sitio.
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
                <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {savedShots.map((shot) => (
                    <article
                      key={shot.id}
                      className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/4"
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
