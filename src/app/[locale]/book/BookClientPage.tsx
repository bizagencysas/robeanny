"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { budgetOptions, personalData } from "@/lib/data";

type Step = 1 | 2 | 3 | 4;
type FormState = "idle" | "submitting" | "success" | "error";

const typeKeys = ["editorial", "commercial", "runway", "social", "artistic", "other"] as const;
const typeEmojis: Record<string, string> = {
  editorial: "📸",
  commercial: "🛍️",
  runway: "👗",
  social: "📱",
  artistic: "🎨",
  other: "💼",
};

export default function BookPage() {
  const locale = useLocale();
  const t = useTranslations("book");

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
    () =>
      (href: string) => {
        if (locale === "en") return href === "/" ? "/en" : `/en${href}`;
        return href;
      },
    [locale]
  );

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
      <div className="dark-stage flex min-h-screen items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl border border-[#efe9de]/16 bg-[rgba(17,15,13,0.56)] p-8 text-center md:p-12"
        >
          <p className="label-kicker mb-5 justify-center">Booking Confirmed</p>
          <h2 className="brand-display text-[clamp(2.3rem,7vw,5.2rem)] leading-[0.88] tracking-[0.07em] text-[#efe9de]">
            {t("thankYou")}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[#efe9de]/64 md:text-base">
            {t("thankYouMsg")}
          </p>
          <Link href={toLocalePath("/")} className="mt-8 inline-flex border border-[#efe9de]/35 px-6 py-3 text-[0.64rem] uppercase tracking-[0.28em] text-[#efe9de] transition-colors hover:bg-[#efe9de] hover:text-[#171513]">
            {t("backHome")}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-24 md:pt-32">
      <div className="page-shell max-w-[980px]">
        <div className="luxury-panel border-black/10 p-5 md:border-0 md:bg-transparent md:p-0">
          <p className="label-kicker mb-5">Booking Direction</p>
          <h1 className="brand-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.88] tracking-[0.05em] text-[#171513]">
            {t("pageTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#171513]/62 md:text-base">{t("subtitle")}</p>
        </div>

        <div className="mt-10 grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="h-1 bg-black/12">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: step >= s ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepContainer key="step-1" title={t("step1Title")}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {typeKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setProjectType(key);
                      setStep(2);
                    }}
                    className={`group border p-6 text-left transition-all ${
                      projectType === key
                        ? "border-black bg-black text-[#f8f3ea]"
                        : "border-black/15 bg-white/50 hover:border-black/35"
                    }`}
                  >
                    <span className="mb-3 block text-2xl">{typeEmojis[key]}</span>
                    <span className="text-[0.64rem] uppercase tracking-[0.28em]">
                      {t(`types.${key}`)}
                    </span>
                  </button>
                ))}
              </div>
            </StepContainer>
          )}

          {step === 2 && (
            <StepContainer key="step-2" title={t("step2Title")}>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldInput
                  label={t("fields.name")}
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  required
                />
                <FieldInput
                  label={t("fields.email")}
                  type="email"
                  value={formData.email}
                  onChange={(v) => setFormData({ ...formData, email: v })}
                  required
                />
                <FieldInput
                  label={t("fields.brand")}
                  value={formData.brand}
                  onChange={(v) => setFormData({ ...formData, brand: v })}
                />
                <FieldInput
                  label={t("fields.location")}
                  value={formData.location}
                  onChange={(v) => setFormData({ ...formData, location: v })}
                />
                <FieldInput
                  label={t("fields.date")}
                  type="date"
                  value={formData.date}
                  onChange={(v) => setFormData({ ...formData, date: v })}
                />
                <FieldSelect
                  label={t("fields.budget")}
                  value={formData.budget}
                  onChange={(v) => setFormData({ ...formData, budget: v })}
                  options={budgetOptions}
                />
                <div className="md:col-span-2">
                  <FieldTextarea
                    label={t("fields.description")}
                    value={formData.description}
                    onChange={(v) => setFormData({ ...formData, description: v })}
                  />
                </div>
              </div>

              <WizardActions
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                nextDisabled={!formData.name || !formData.email}
                backLabel={t("back")}
                nextLabel={t("next")}
              />
            </StepContainer>
          )}

          {step === 3 && (
            <StepContainer key="step-3" title={t("step3Title")}>
              <FieldTextarea
                label={t("fields.references")}
                value={references}
                onChange={setReferences}
                rows={7}
              />

              <WizardActions
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
                backLabel={t("back")}
                nextLabel={t("next")}
              />
            </StepContainer>
          )}

          {step === 4 && (
            <StepContainer key="step-4" title={t("step4Title")}>
              <div className="border border-black/14 bg-white/55 p-5 md:p-6">
                <SummaryRow label="Type" value={t(`types.${projectType || "other"}`)} />
                <SummaryRow label="Name" value={formData.name} />
                <SummaryRow label="Email" value={formData.email} />
                {formData.brand && <SummaryRow label="Brand" value={formData.brand} />}
                {formData.date && <SummaryRow label="Date" value={formData.date} />}
                {formData.location && <SummaryRow label="Location" value={formData.location} />}
                {formData.budget && <SummaryRow label="Budget" value={formData.budget} />}
              </div>

              {formState === "error" && (
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-red-600">
                  {t("error")} {personalData.email}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="text-[0.64rem] uppercase tracking-[0.3em] text-[#171513]/55 transition-colors hover:text-[#171513]"
                >
                  {t("back")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={formState === "submitting"}
                  className="border border-black bg-black px-7 py-3 text-[0.64rem] uppercase tracking-[0.28em] text-[#f8f3ea] transition-colors hover:bg-transparent hover:text-[#171513] disabled:cursor-not-allowed disabled:opacity-45"
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

function StepContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mt-9 border border-black/14 bg-[rgba(255,255,255,0.56)] p-5 md:p-8"
    >
      <p className="mb-6 text-[0.64rem] uppercase tracking-[0.3em] text-[#171513]/52">{title}</p>
      {children}
    </motion.div>
  );
}

function WizardActions({
  onBack,
  onNext,
  backLabel,
  nextLabel,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  backLabel: string;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={onBack}
        className="text-[0.64rem] uppercase tracking-[0.3em] text-[#171513]/55 transition-colors hover:text-[#171513]"
      >
        {backLabel}
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="border border-black px-7 py-3 text-[0.64rem] uppercase tracking-[0.28em] text-[#171513] transition-colors hover:bg-black hover:text-[#f8f3ea] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function FieldInput({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/48">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="rounded-[1rem] md:rounded-none border border-black/18 bg-white/70 px-4 py-3 text-sm text-[#171513] outline-none transition-colors focus:border-black/45"
      />
    </label>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/48">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[1rem] md:rounded-none border border-black/18 bg-white/70 px-4 py-3 text-sm text-[#171513] outline-none transition-colors focus:border-black/45"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/48">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="resize-none rounded-[1rem] md:rounded-none border border-black/18 bg-white/70 px-4 py-3 text-sm text-[#171513] outline-none transition-colors focus:border-black/45"
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-black/10 py-3 md:flex-row md:items-center md:justify-between">
      <span className="text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/50">{label}</span>
      <span className="text-sm text-[#171513]/82">{value}</span>
    </div>
  );
}
