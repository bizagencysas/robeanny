"use client";

import { useState } from "react";
import { personalData } from "@/lib/data";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
    const [formState, setFormState] = useState<FormState>("idle");
    const [formData, setFormData] = useState({
        name: "", email: "", subject: "", message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        <div className="w-full bg-black text-white min-h-screen pt-24 md:pt-32 pb-24">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
                <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-16">Contact</h1>

                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                    {/* Left — Info */}
                    <div className="w-full lg:w-5/12 flex flex-col gap-8">
                        <h2 className="font-serif text-3xl md:text-4xl font-light italic">
                            Let&apos;s Work Together
                        </h2>

                        <div className="flex flex-col gap-6 mt-4">
                            <ContactItem label="Email" value={personalData.email} href={`mailto:${personalData.email}`} />
                            <ContactItem label="WhatsApp" value={personalData.whatsappDisplay} href={personalData.whatsappLink} />
                            <ContactItem label="Instagram" value="@robeannybl" href={personalData.socials.instagram} />
                            <ContactItem label="Location" value="Medellín, Colombia" />
                        </div>

                        <p className="editorial-body text-sm text-white/40 mt-4">
                            For booking inquiries, visit the{" "}
                            <a href="/book" className="text-white/60 hover:text-white underline underline-offset-4 transition-colors">Book page →</a>
                        </p>

                        {/* Support Links */}
                        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
                            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/30 mb-2">Support</p>
                            <a href="https://love.robeanny.com/" target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-white/50 hover:text-white transition-colors">
                                ♡ Invítame un Café
                            </a>
                            <a href={personalData.socials.patreon} target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-white/50 hover:text-white transition-colors">
                                Patreon
                            </a>
                            <a href={personalData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-white/50 hover:text-white transition-colors">
                                LinkedIn
                            </a>
                        </div>
                    </div>

                    {/* Right — Form */}
                    <div className="w-full lg:w-7/12">
                        {formState === "success" ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-24">
                                <h3 className="font-serif text-4xl font-light mb-4">¡Mensaje enviado!</h3>
                                <p className="editorial-body text-sm text-white/50">Te responderé pronto.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nombre"
                                    required
                                    className="w-full bg-transparent border-b border-white/20 text-white font-serif text-lg py-4 focus:outline-none focus:border-white transition-colors placeholder-white/20"
                                />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Email"
                                    required
                                    className="w-full bg-transparent border-b border-white/20 text-white font-serif text-lg py-4 focus:outline-none focus:border-white transition-colors placeholder-white/20"
                                />
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-transparent border-b border-white/20 text-white font-serif text-lg py-4 focus:outline-none focus:border-white transition-colors appearance-none"
                                >
                                    <option value="" className="bg-black">Asunto</option>
                                    <option value="Colaboración" className="bg-black">Colaboración</option>
                                    <option value="Booking" className="bg-black">Booking</option>
                                    <option value="Prensa" className="bg-black">Prensa</option>
                                    <option value="Otro" className="bg-black">Otro</option>
                                </select>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={5}
                                    placeholder="Mensaje"
                                    required
                                    className="w-full bg-transparent border-b border-white/20 text-white font-serif text-lg py-4 resize-none focus:outline-none focus:border-white transition-colors placeholder-white/20"
                                />

                                {formState === "error" && (
                                    <p className="text-red-400 text-xs font-sans">Error al enviar. Intenta contactar directamente a {personalData.email}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={formState === "submitting"}
                                    className="font-sans text-[10px] tracking-[0.3em] uppercase bg-white text-black px-10 py-5 hover:bg-white/90 transition-all disabled:opacity-50 w-fit"
                                >
                                    {formState === "submitting" ? "Enviando..." : "Send Message →"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContactItem({ label, value, href }: { label: string; value: string; href?: string }) {
    return (
        <div className="flex flex-col">
            <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/30 mb-1">{label}</span>
            {href ? (
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="font-serif text-lg text-white/80 hover:text-white transition-colors">
                    {value}
                </a>
            ) : (
                <span className="font-serif text-lg text-white/80">{value}</span>
            )}
        </div>
    );
}
