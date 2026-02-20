"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { budgetOptions, personalData } from "@/lib/data";

type Step = 1 | 2 | 3 | 4;
type FormState = "idle" | "submitting" | "success" | "error";

const typeKeys = ["editorial", "commercial", "runway", "social", "artistic", "other"] as const;
const typeEmojis: Record<string, string> = { editorial: "📸", commercial: "🛍️", runway: "👗", social: "📱", artistic: "🎨", other: "💼" };

export default function BookPage() {
    const [step, setStep] = useState<Step>(1);
    const [formState, setFormState] = useState<FormState>("idle");
    const [projectType, setProjectType] = useState("");
    const [formData, setFormData] = useState({ name: "", email: "", brand: "", date: "", location: "", description: "", budget: "" });
    const [references, setReferences] = useState("");
    const t = useTranslations("book");

    const handleSubmit = async () => {
        setFormState("submitting");
        try {
            const res = await fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectType, ...formData, references }) });
            setFormState(res.ok ? "success" : "error");
        } catch { setFormState("error"); }
    };

    if (formState === "success") {
        return (
            <div className="w-full bg-black text-white min-h-screen flex items-center justify-center px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
                    <h2 className="font-serif text-5xl md:text-6xl font-light mb-6">{t("thankYou")}</h2>
                    <p className="editorial-body text-lg text-white/60 mb-8">{t("thankYouMsg")}</p>
                    <a href="/" className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors">{t("backHome")}</a>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full bg-black text-white min-h-screen pt-24 md:pt-32 pb-24">
            <div className="max-w-[800px] mx-auto px-6 md:px-12">
                <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-4">{t("pageTitle")}</h1>
                <p className="editorial-body text-sm text-white/50 mb-12">{t("subtitle")}</p>
                <div className="flex items-center gap-2 mb-16">
                    {[1, 2, 3, 4].map((s) => (<div key={s} className={`h-[2px] flex-1 transition-colors duration-500 ${s <= step ? "bg-white" : "bg-white/10"}`} />))}
                </div>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <StepWrapper key="step1">
                            <p className="font-sans text-xs tracking-[0.3em] uppercase text-white/40 mb-8">{t("step1Title")}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {typeKeys.map((key) => (
                                    <button key={key} onClick={() => { setProjectType(key); setStep(2); }} className={`border border-white/10 p-6 text-center hover:border-white/40 hover:bg-white/5 transition-all duration-300 group ${projectType === key ? "border-white bg-white/5" : ""}`}>
                                        <span className="text-2xl mb-3 block">{typeEmojis[key]}</span>
                                        <span className="font-sans text-[10px] tracking-widest uppercase text-white/60 group-hover:text-white transition-colors">{t(`types.${key}`)}</span>
                                    </button>
                                ))}
                            </div>
                        </StepWrapper>
                    )}
                    {step === 2 && (
                        <StepWrapper key="step2">
                            <p className="font-sans text-xs tracking-[0.3em] uppercase text-white/40 mb-8">{t("step2Title")}</p>
                            <div className="flex flex-col gap-6">
                                <Input label={t("fields.name")} value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
                                <Input label={t("fields.email")} type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} required />
                                <Input label={t("fields.brand")} value={formData.brand} onChange={(v) => setFormData({ ...formData, brand: v })} />
                                <Input label={t("fields.date")} type="date" value={formData.date} onChange={(v) => setFormData({ ...formData, date: v })} />
                                <Input label={t("fields.location")} value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} />
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder={t("fields.description")} className="w-full bg-transparent border-b border-white/20 text-white font-serif text-lg py-3 px-0 resize-none focus:outline-none focus:border-white transition-colors placeholder-white/20" />
                                <select value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="w-full bg-transparent border-b border-white/20 text-white font-serif text-lg py-3 px-0 focus:outline-none focus:border-white transition-colors appearance-none">
                                    <option value="" className="bg-black">{t("fields.budget")}</option>
                                    {budgetOptions.map((opt) => (<option key={opt} value={opt} className="bg-black">{opt}</option>))}
                                </select>
                            </div>
                            <div className="flex justify-between mt-12">
                                <button onClick={() => setStep(1)} className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors">{t("back")}</button>
                                <button onClick={() => setStep(3)} disabled={!formData.name || !formData.email} className="font-sans text-[10px] tracking-[0.3em] uppercase border border-white px-8 py-3 hover:bg-white hover:text-black transition-all disabled:opacity-20">{t("next")}</button>
                            </div>
                        </StepWrapper>
                    )}
                    {step === 3 && (
                        <StepWrapper key="step3">
                            <p className="font-sans text-xs tracking-[0.3em] uppercase text-white/40 mb-8">{t("step3Title")}</p>
                            <textarea value={references} onChange={(e) => setReferences(e.target.value)} rows={6} placeholder={t("fields.references")} className="w-full bg-transparent border border-white/10 text-white font-sans text-sm p-6 resize-none focus:outline-none focus:border-white/30 transition-colors placeholder-white/20" />
                            <div className="flex justify-between mt-12">
                                <button onClick={() => setStep(2)} className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors">{t("back")}</button>
                                <button onClick={() => setStep(4)} className="font-sans text-[10px] tracking-[0.3em] uppercase border border-white px-8 py-3 hover:bg-white hover:text-black transition-all">{t("next")}</button>
                            </div>
                        </StepWrapper>
                    )}
                    {step === 4 && (
                        <StepWrapper key="step4">
                            <p className="font-sans text-xs tracking-[0.3em] uppercase text-white/40 mb-8">{t("step4Title")}</p>
                            <div className="border border-white/10 p-8 flex flex-col gap-4 mb-8">
                                <SummaryRow label="Type" value={t(`types.${projectType || "other"}`)} />
                                <SummaryRow label="Name" value={formData.name} />
                                <SummaryRow label="Email" value={formData.email} />
                                {formData.brand && <SummaryRow label="Brand" value={formData.brand} />}
                                {formData.date && <SummaryRow label="Date" value={formData.date} />}
                                {formData.location && <SummaryRow label="Location" value={formData.location} />}
                                {formData.budget && <SummaryRow label="Budget" value={formData.budget} />}
                            </div>
                            {formState === "error" && <p className="text-red-400 text-xs font-sans tracking-widest uppercase mb-4">{t("error")} {personalData.email}</p>}
                            <div className="flex justify-between">
                                <button onClick={() => setStep(3)} className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors">{t("back")}</button>
                                <button onClick={handleSubmit} disabled={formState === "submitting"} className="font-sans text-[10px] tracking-[0.3em] uppercase bg-white text-black px-10 py-4 hover:bg-white/90 transition-all disabled:opacity-50">
                                    {formState === "submitting" ? t("submitting") : t("submit")}
                                </button>
                            </div>
                        </StepWrapper>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StepWrapper({ children }: { children: React.ReactNode }) {
    return (<motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>);
}

function Input({ label, type = "text", value, onChange, required }: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
    return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} required={required} className="w-full bg-transparent border-b border-white/20 text-white font-serif text-lg py-3 px-0 focus:outline-none focus:border-white transition-colors placeholder-white/20" />;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (<div className="flex flex-col md:flex-row md:justify-between gap-1 py-2 border-b border-white/5"><span className="font-sans text-[10px] tracking-widest uppercase text-white/40">{label}</span><span className="font-serif text-base text-white/80 md:text-right max-w-[60%]">{value}</span></div>);
}
