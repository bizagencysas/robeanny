"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { personalData } from "@/lib/data";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslations("contact");

  const [formState, setFormState] = useState<FormState>("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const toLocalePath = useMemo(
    () =>
      (href: string) => {
        if (locale === "en") return href === "/" ? "/en" : `/en${href}`;
        return href;
      },
    [locale]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormState("submitting");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setFormState(res.ok ? "success" : "error");
    } catch {
      setFormState("error");
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-24 md:pt-32">
      <div className="page-shell">
        <div className="luxury-panel border-black/10 p-5 md:border-0 md:bg-transparent md:p-0">
          <p className="label-kicker mb-5">Direct Contact</p>
          <h1 className="brand-display text-[clamp(2.4rem,7vw,6rem)] leading-[0.88] tracking-[0.05em] text-[#171513]">
            {t("pageTitle")}
          </h1>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="luxury-panel h-fit p-6 md:p-8">
            <h2 className="brand-display text-[clamp(1.7rem,4vw,3rem)] leading-[0.9] text-[#171513]">
              {t("workTogether")}
            </h2>

            <div className="mt-8 space-y-5">
              <ContactItem label="Email" value={personalData.email} href={`mailto:${personalData.email}`} />
              <ContactItem label="WhatsApp" value={personalData.whatsappDisplay} href={personalData.whatsappLink} />
              <ContactItem label="Instagram" value="@robeannybl" href={personalData.socials.instagram} />
              <ContactItem label={t("location")} value={personalData.workCity} />
            </div>

            <div className="mt-8 border-t border-black/12 pt-6">
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[#171513]/52">{t("bookingNote")}</p>
              <Link
                href={toLocalePath("/book")}
                className="mt-3 inline-flex border border-black/20 px-4 py-2 text-[0.62rem] uppercase tracking-[0.28em] text-[#171513]/76 transition-colors hover:border-black hover:text-[#171513]"
              >
                {t("bookPage")}
              </Link>
            </div>

            <div className="mt-8 border-t border-black/12 pt-6">
              <p className="mb-3 text-[0.62rem] uppercase tracking-[0.28em] text-[#171513]/52">{t("support")}</p>
              <div className="flex flex-col gap-2.5 text-sm text-[#171513]/72">
                <a href="https://love.robeanny.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#171513]">{t("coffee")}</a>
                <a href={personalData.socials.patreon} target="_blank" rel="noopener noreferrer" className="hover:text-[#171513]">Patreon</a>
                <a href={personalData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#171513]">LinkedIn</a>
              </div>
            </div>
          </aside>

          <section className="luxury-panel p-6 md:p-8">
            {formState === "success" ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <h3 className="brand-display text-[clamp(2rem,5vw,3.6rem)] leading-[0.9] text-[#171513]">{t("success")}</h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-[#171513]/62 md:text-base">{t("successMsg")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <FieldInput
                  label={t("fields.name")}
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  required
                />
                <FieldInput
                  label={t("fields.email")}
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData({ ...formData, email: value })}
                  required
                />

                <label className="flex flex-col gap-2">
                  <span className="text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/48">{t("fields.subject")}</span>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="rounded-[1rem] md:rounded-none border border-black/18 bg-white/70 px-4 py-3 text-sm text-[#171513] outline-none transition-colors focus:border-black/45"
                  >
                    <option value="">{t("subjects.placeholder")}</option>
                    <option value="Collaboration">{t("subjects.collab")}</option>
                    <option value="Booking">{t("subjects.booking")}</option>
                    <option value="Press">{t("subjects.press")}</option>
                    <option value="Other">{t("subjects.other")}</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/48">{t("fields.message")}</span>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={7}
                    required
                    className="resize-none rounded-[1rem] md:rounded-none border border-black/18 bg-white/70 px-4 py-3 text-sm text-[#171513] outline-none transition-colors focus:border-black/45"
                  />
                </label>

                {formState === "error" && (
                  <p className="text-xs uppercase tracking-[0.2em] text-red-600">
                    {t("error")} {personalData.email}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="border border-black bg-black px-7 py-3 text-[0.64rem] uppercase tracking-[0.28em] text-[#f8f3ea] transition-colors hover:bg-transparent hover:text-[#171513] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {formState === "submitting" ? t("submitting") : t("fields.send")}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
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

function ContactItem({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.58rem] uppercase tracking-[0.3em] text-[#171513]/45">{label}</span>
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="text-sm text-[#171513]/84 transition-colors hover:text-[#171513] md:text-base"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm text-[#171513]/84 md:text-base">{value}</span>
      )}
    </div>
  );
}
