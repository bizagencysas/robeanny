"use client";

import { useRef, useState, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
    const containerRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");

    useIsomorphicLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Very elegant reveal of the massive contact header
            gsap.fromTo(
                textRef.current,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.5,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
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
            className="w-full bg-[#fcfcfc] text-black min-h-screen py-24 md:py-32 flex flex-col items-center justify-center relative border-t border-black/5"
        >
            <div className="w-full max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                {/* Left - Massive Typographic Statement */}
                <div className="flex flex-col">
                    <h2
                        ref={textRef}
                        className="editorial-title text-6xl md:text-8xl lg:text-[7rem] text-black mb-8 leading-[0.9]"
                    >
                        LET'S <br />
                        <span className="italic font-light">CREATE</span> <br />
                        ART.
                    </h2>
                    <p className="editorial-body text-sm tracking-[0.2em] uppercase text-black/60 max-w-sm">
                        Available for editorial, commercial, and runway booking worldwide.
                    </p>
                    <div className="h-[1px] w-full max-w-[200px] bg-black mt-12 mb-8"></div>
                    <p className="font-serif text-2xl">robeanny@robeanny.me</p>
                    <p className="font-serif text-2xl">+57 300 4846270</p>
                </div>

                {/* Right - Stark Editorial Form */}
                <div className="w-full bg-white border border-black p-8 md:p-16 shadow-[20px_20px_0px_rgba(0,0,0,0.05)]">
                    {formState === "success" ? (
                        <div className="text-center space-y-4 animate-in fade-in duration-700 py-12">
                            <h3 className="editorial-title text-4xl text-black">Delivered.</h3>
                            <p className="editorial-body text-black/60">I will review your brief and get back to you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                            <div className="relative group">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    className="w-full bg-transparent border-b border-black/20 text-black font-serif text-xl md:text-2xl py-3 px-0 focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                                    placeholder="Name"
                                />
                                <label
                                    htmlFor="name"
                                    className="absolute left-0 top-3 text-black/40 font-sans text-xs tracking-widest uppercase transition-all duration-300 peer-focus:-top-6 peer-focus:text-[10px] peer-focus:text-black peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black"
                                >
                                    Full Name
                                </label>
                            </div>

                            <div className="relative group">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    className="w-full bg-transparent border-b border-black/20 text-black font-serif text-xl md:text-2xl py-3 px-0 focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                                    placeholder="Email"
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-0 top-3 text-black/40 font-sans text-xs tracking-widest uppercase transition-all duration-300 peer-focus:-top-6 peer-focus:text-[10px] peer-focus:text-black peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black"
                                >
                                    Email Address
                                </label>
                            </div>

                            <div className="relative group mt-2">
                                <textarea
                                    name="message"
                                    id="message"
                                    required
                                    rows={4}
                                    className="w-full bg-transparent border-b border-black/20 text-black font-serif text-xl md:text-2xl py-3 px-0 resize-none focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                                    placeholder="Message"
                                />
                                <label
                                    htmlFor="message"
                                    className="absolute left-0 top-3 text-black/40 font-sans text-xs tracking-widest uppercase transition-all duration-300 peer-focus:-top-6 peer-focus:text-[10px] peer-focus:text-black peer-not-placeholder-shown:-top-6 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black"
                                >
                                    Project Details
                                </label>
                            </div>

                            {formState === "error" && (
                                <p className="text-red-500 text-xs font-sans tracking-widest uppercase">
                                    Submission failed. Direct email preferred.
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={formState === "submitting"}
                                className="group relative w-full border border-black bg-black py-6 mt-6 overflow-hidden hover:bg-white transition-colors duration-500 disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                                <span className="relative z-10 font-sans text-[10px] tracking-[0.3em] uppercase transition-colors duration-500 text-white group-hover:text-black font-bold">
                                    {formState === "submitting" ? "Sending Details..." : "Submit Inquiry"}
                                </span>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
