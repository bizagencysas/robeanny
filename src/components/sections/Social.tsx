"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { personalData } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function Social() {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".social-card",
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 75%",
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section
            id="social"
            ref={containerRef}
            className="w-full bg-platinum/10 text-black py-24 md:py-40 px-6 lg:px-20 border-b border-black/10"
        >
            <div className="max-w-[1400px] mx-auto flex flex-col items-center">
                <h2 className="editorial-title text-4xl md:text-6xl text-center mb-16 relative inline-block">
                    THE <span className="italic font-light">DIGITAL</span> ARCHIVE
                    {/* Subtle underline accent */}
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-black"></span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 w-full">
                    {/* Instagram Embed Wrapper */}
                    <div className="social-card flex flex-col bg-white border border-black/5 p-4 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-shadow duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="editorial-body uppercase tracking-[0.2em] text-xs font-bold">Instagram</h3>
                            <a href={personalData.socials.instagram} target="_blank" rel="noopener noreferrer" className="editorial-body text-[10px] uppercase tracking-widest border-b border-black/20 hover:border-black transition-colors">Follow \ @robeannybl</a>
                        </div>
                        <div className="w-full flex justify-center bg-platinum/5 overflow-hidden rounded-md">
                            <iframe
                                src="https://www.instagram.com/robeannybl/embed"
                                width="100%"
                                height="600"
                                frameBorder="0"
                                scrolling="no"
                                allowTransparency={true}
                                className="max-w-[500px] bg-white border-none"
                            />
                        </div>
                    </div>

                    {/* TikTok Embed Wrapper */}
                    <div className="social-card flex flex-col bg-white border border-black/5 p-4 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-shadow duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="editorial-body uppercase tracking-[0.2em] text-xs font-bold">TikTok</h3>
                            <a href={personalData.socials.tiktok} target="_blank" rel="noopener noreferrer" className="editorial-body text-[10px] uppercase tracking-widest border-b border-black/20 hover:border-black transition-colors">Follow \ @robeannybbl</a>
                        </div>
                        <div className="w-full flex justify-center bg-platinum/5 overflow-hidden rounded-md">
                            <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@robeannybbl" data-unique-id="robeannybbl" data-embed-type="creator" style={{ maxWidth: '500px', minWidth: '288px' }}>
                                <section><a target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@robeannybbl?refer=creator_embed">@robeannybbl</a></section>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
