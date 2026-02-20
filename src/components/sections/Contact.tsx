"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
    const containerRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");

    useIsomorphicLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Cinematic letter tracking expansion on scroll reach
            gsap.fromTo(
                textRef.current,
                { letterSpacing: "-0.05em", opacity: 0.5 },
                {
                    letterSpacing: "0.2em",
                    opacity: 1,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                        end: "bottom bottom",
                        scrub: true,
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormState("submitting");
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) setFormState("success");
            else setFormState("error");
        } catch (error) {
            setFormState("error");
        }
    };

    return (
        <section
            id="contact"
            ref={containerRef}
            className="w-full bg-black min-h-screen py-24 md:py-40 flex flex-col items-center justify-center relative border-t border-white/5"
        >
            <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent opacity-30 pointer-events-none" />

            <div className="w-full max-w-7xl mx-auto px-6 flex flex-col items-center">

                <h2
                    ref={textRef}
                    className="text-5xl md:text-8xl lg:text-[10rem] font-serif font-light text-white mb-20 md:mb-32 text-center uppercase whitespace-nowrap overflow-hidden leading-none mix-blend-screen"
                >
                    Let's Talk
                </h2>

                <div className="w-full max-w-2xl relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-16">
                    {formState === "success" ? (
                        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                            <h3 className="text-2xl font-serif text-white tracking-widest uppercase">Mensaje Enviado</h3>
                            <p className="text-white/50 font-sans font-light">Estaré en contacto contigo muy pronto.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-12">
                            <div className="relative group">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    className="w-full bg-transparent border-b border-white/20 text-white font-serif text-xl md:text-2xl py-2 px-0 focus:outline-none focus:border-white transition-colors peer placeholder-transparent"
                                    placeholder="Name"
                                />
                                <label
                                    htmlFor="name"
                                    className="absolute left-0 top-3 text-white/50 font-sans text-sm tracking-widest uppercase transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-xs"
                                >
                                    Tu Nombre
                                </label>
                            </div>

                            <div className="relative group">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    className="w-full bg-transparent border-b border-white/20 text-white font-serif text-xl md:text-2xl py-2 px-0 focus:outline-none focus:border-white transition-colors peer placeholder-transparent"
                                    placeholder="Email"
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-0 top-3 text-white/50 font-sans text-sm tracking-widest uppercase transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-xs"
                                >
                                    Tu Correo
                                </label>
                            </div>

                            <div className="relative group mt-4">
                                <textarea
                                    name="message"
                                    id="message"
                                    required
                                    rows={4}
                                    className="w-full bg-transparent border-b border-white/20 text-white font-serif text-xl md:text-2xl py-2 px-0 resize-none focus:outline-none focus:border-white transition-colors peer placeholder-transparent"
                                    placeholder="Message"
                                />
                                <label
                                    htmlFor="message"
                                    className="absolute left-0 top-3 text-white/50 font-sans text-sm tracking-widest uppercase transition-all duration-300 peer-focus:-top-6 peer-focus:text-xs peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-xs"
                                >
                                    El Proyecto
                                </label>
                            </div>

                            {formState === "error" && (
                                <p className="text-red-400 text-sm font-sans tracking-widest uppercase text-center">
                                    Error. Intenta de nuevo o al WhatsApp.
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={formState === "submitting"}
                                className="group relative w-full border border-white py-6 mt-8 overflow-hidden hover:bg-white hover:text-black transition-colors duration-500 disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                                <span className="relative z-10 font-sans text-xs tracking-[0.3em] uppercase transition-colors duration-500 text-white group-hover:text-black font-bold">
                                    {formState === "submitting" ? "Enviando..." : "Enviar Mensaje"}
                                </span>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
