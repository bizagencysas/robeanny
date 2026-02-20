"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations("footer");

    return (
        <footer className="w-full bg-black py-16 flex flex-col items-center justify-center border-t border-white/5">
            <div className="container mx-auto px-6 max-w-4xl text-center">
                <h2 className="text-xl md:text-2xl font-serif tracking-[0.3em] font-light text-white uppercase mb-8">
                    ROBEANNY
                </h2>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12">
                    <a href="#about" className="font-sans text-xs tracking-widest text-platinum/50 hover:text-accent transition-colors uppercase">About</a>
                    <a href="#portfolio" className="font-sans text-xs tracking-widest text-platinum/50 hover:text-accent transition-colors uppercase">Portfolio</a>
                    <a href="#sessions" className="font-sans text-xs tracking-widest text-platinum/50 hover:text-accent transition-colors uppercase">Sessions</a>
                    <a href="#social" className="font-sans text-xs tracking-widest text-platinum/50 hover:text-accent transition-colors uppercase">Social</a>
                    <a href="#support" className="font-sans text-xs tracking-widest text-platinum/50 hover:text-accent transition-colors uppercase">Support</a>
                </div>

                <div className="flex flex-col space-y-2">
                    <p className="font-sans text-xs font-light text-white/30 tracking-widest">
                        © 2025 Robeanny Bastardo Liconte. {t("rights")}
                    </p>
                    <p className="font-sans text-[10px] font-light text-white/20 tracking-widest uppercase">
                        Made with <span className="text-red-900 mx-1">♥</span> in Medellín
                    </p>
                </div>
            </div>
        </footer>
    );
}
