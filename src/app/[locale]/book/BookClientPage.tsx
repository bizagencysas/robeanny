"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";
import { budgetOptions, personalData } from "@/lib/data";

type Step = 1 | 2 | 3 | 4;
type FormState = "idle" | "submitting" | "success" | "error";

const typeKeys = ["editorial", "commercial", "runway", "social", "artistic", "other"] as const;

export default function BookPage() {
  const locale = useLocale();
  const t = useTranslations("book");
  const headerRef = useRef<HTMLDivElement>(null);
  const stepCounterRef = useRef<HTMLSpanElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [formState, setFormState] = useState<FormState>("idle");
  const [projectType, setProjectType] = useState("");
  const [references, setReferences] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    brand: "",
    date: "",
    location: "",
    description: "",
    budget: "",
  });

  const toLocalePath = useMemo(
    () => (href: string) => {
      if (locale === "en") return href === "/" ? "/en" : `/en${href}`;
      return href;
    },
    [locale]
  );

  // Header animation
  useEffect(() => {
    if (!headerRef.current) return;
    const children = headerRef.current.children;
    gsap.fromTo(
      children,
      { opacity: 0, y: 40, clipPath: "inset(100% 0 0 0)" },
      {
        opacity: 1,
        y: 0,
        clipPath: "inset(0% 0 0 0)",
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
        delay: 0.2,
      }
    );
  }, []);

  // Step counter animation
  useEffect(() => {
    if (stepCounterRef.current) {
      gsap.fromTo(
        stepCounterRef.current,
        { opacity: 0, y: 15, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(2)" }
      );
    }
  }, [step]);

  const handleSubmit = async () => {
    setFormState("submitting");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectType, ...formData, references }),
      });
      setFormState(res.ok ? "success" : "error");
    } catch {
      setFormState("error");
    }
  };

  if (formState === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl text-center"
        >
          <div className="luxury-panel p-10 md:p-14">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#c79a59]/30 text-2xl text-[#c79a59]">
                ✓
              </div>
            </div>
            <p className="label-kicker mb-5 justify-center">Booking Confirmed</p>
            <h2 className="brand-display text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.85] tracking-[0.05em] text-[#e8dcc8]">
              {t("thankYou")}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[0.85rem] leading-relaxed text-[#e8dcc8]/40">
              {t("thankYouMsg")}
            </p>
            <Link href={toLocalePath("/")} className="magnetic-btn luxury-button mt-10 inline-flex">
              {t("backHome")}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24 pt-28 md:pt-36">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(199,154,89,0.04), transparent 60%)", filter: "blur(120px)" }}
        />
      </div>

      <div className="page-shell relative z-10 max-w-[980px]">
        <div ref={headerRef}>
          <p className="label-kicker mb-5">Booking Direction</p>
          <h1 className="brand-display text-[clamp(3rem,9vw,7rem)] leading-[0.82] tracking-[0.04em] text-[#e8dcc8]">
            {t("pageTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-[0.85rem] leading-relaxed text-[#e8dcc8]/35">{t("subtitle")}</p>
        </div>

        {/* Step indicator with animated counter */}
        <div className="mt-10 flex items-center gap-5">
          <div className="grid flex-1 grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="h-[2px] bg-[#e8dcc8]/8 overflow-hidden">
                <div
                  className="h-full bg-[#c79a59] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: step >= s ? "100%" : "0%" }}
                />
              </div>
            ))}
          </div>
          <span
            ref={stepCounterRef}
            className="brand-display text-lg text-[#c79a59] tabular-nums"
          >
            0{step}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepContainer key="step-1" title={t("step1Title")}>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {typeKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setProjectType(key);
                      setStep(2);
                    }}
                    className={`group relative overflow-hidden rounded-xl border p-6 text-left transition-all duration-500 md:rounded-none md:p-7 ${
                      projectType === key
                        ? "border-[#c79a59]/50 bg-[#c79a59]/10 text-[#e8dcc8]"
                        : "border-[#e8dcc8]/8 text-[#e8dcc8]/40 hover:border-[#e8dcc8]/20 hover:text-[#e8dcc8]/70"
                    }`}
                  >
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c79a59]/5 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700" />
                    <span className="relative block text-[0.56rem] uppercase tracking-[0.3em]">
                      {t(`types.${key}`)}
                    </span>
                    <span className="relative block mt-3 text-[0.44rem] uppercase tracking-[0.25em] text-[#e8dcc8]/20">
                      {String(typeKeys.indexOf(key) + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {step === 2 && (
            <StepContainer key="step-2" title={t("step2Title")}>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldInput label={t("fields.name")} value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
                <FieldInput label={t("fields.email")} type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} required />
                <FieldInput label={t("fields.brand")} value={formData.brand} onChange={(v) => setFormData({ ...formData, brand: v })} />
                <FieldInput label={t("fields.location")} value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} />
                <FieldInput label={t("fields.date")} type="date" value={formData.date} onChange={(v) => setFormData({ ...formData, date: v })} />
                <FieldSelect label={t("fields.budget")} value={formData.budget} onChange={(v) => setFormData({ ...formData, budget: v })} options={budgetOptions} />
                <div className="md:col-span-2">
                  <FieldTextarea label={t("fields.description")} value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} />
                </div>
              </div>
              <WizardActions onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!formData.name || !formData.email} backLabel={t("back")} nextLabel={t("next")} />
            </StepContainer>
          )}

          {step === 3 && (
            <StepContainer key="step-3" title={t("step3Title")}>
              <FieldTextarea label={t("fields.references")} value={references} onChange={setReferences} rows={7} />
              <WizardActions onBack={() => setStep(2)} onNext={() => setStep(4)} backLabel={t("back")} nextLabel={t("next")} />
            </StepContainer>
          )}

          {step === 4 && (
            <StepContainer key="step-4" title={t("step4Title")}>
              <div className="space-y-0 divide-y divide-[#e8dcc8]/6">
                <SummaryRow label="Type" value={t(`types.${projectType || "other"}`)} />
                <SummaryRow label="Name" value={formData.name} />
                <SummaryRow label="Email" value={formData.email} />
                {formData.brand && <SummaryRow label="Brand" value={formData.brand} />}
                {formData.date && <SummaryRow label="Date" value={formData.date} />}
                {formData.location && <SummaryRow label="Location" value={formData.location} />}
                {formData.budget && <SummaryRow label="Budget" value={formData.budget} />}
              </div>

              {formState === "error" && (
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-red-400">
                  {t("error")} {personalData.email}
                </p>
              )}

              <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => setStep(3)} className="text-[0.56rem] uppercase tracking-[0.3em] text-[#e8dcc8]/30 transition-colors hover:text-[#e8dcc8]">
                  {t("back")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={formState === "submitting"}
                  className="magnetic-btn luxury-button disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {formState === "submitting" ? t("submitting") : t("submit")}
                </button>
              </div>
            </StepContainer>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepContainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mt-10"
    >
      <p className="mb-6 text-[0.56rem] uppercase tracking-[0.35em] text-[#e8dcc8]/25">{title}</p>
      {children}
    </motion.div>
  );
}

function WizardActions({ onBack, onNext, backLabel, nextLabel, nextDisabled }: { onBack: () => void; onNext: () => void; backLabel: string; nextLabel: string; nextDisabled?: boolean }) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
      <button onClick={onBack} className="text-[0.56rem] uppercase tracking-[0.3em] text-[#e8dcc8]/30 transition-colors hover:text-[#e8dcc8]">{backLabel}</button>
      <button onClick={onNext} disabled={nextDisabled} className="magnetic-btn luxury-button-secondary disabled:cursor-not-allowed disabled:opacity-25">{nextLabel}</button>
    </div>
  );
}

function FieldInput({ label, type = "text", value, onChange, required }: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/25">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="rounded-xl md:rounded-none border border-[#e8dcc8]/8 bg-transparent px-4 py-3.5 text-sm text-[#e8dcc8] outline-none transition-all focus:border-[#c79a59]/40 focus:shadow-[0_0_20px_rgba(199,154,89,0.05)] placeholder:text-[#e8dcc8]/15"
      />
    </label>
  );
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/25">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl md:rounded-none border border-[#e8dcc8]/8 bg-transparent px-4 py-3.5 text-sm text-[#e8dcc8] outline-none transition-all focus:border-[#c79a59]/40"
      >
        <option value="" className="bg-black">{label}</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-black">{option}</option>
        ))}
      </select>
    </label>
  );
}

function FieldTextarea({ label, value, onChange, rows = 5 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/25">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="resize-none rounded-xl md:rounded-none border border-[#e8dcc8]/8 bg-transparent px-4 py-3.5 text-sm text-[#e8dcc8] outline-none transition-all focus:border-[#c79a59]/40 focus:shadow-[0_0_20px_rgba(199,154,89,0.05)]"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 md:flex-row md:items-center md:justify-between">
      <span className="text-[0.48rem] uppercase tracking-[0.35em] text-[#e8dcc8]/25">{label}</span>
      <span className="text-sm text-[#e8dcc8]/60">{value}</span>
    </div>
  );
}
