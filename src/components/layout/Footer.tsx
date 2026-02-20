"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const footerNavKeys = [
    { href: "/", key: "home" },
    { href: "/portfolio", key: "portfolio" },
    { href: "/book", key: "book" },
    { href: "/sessions", key: "sessions" },
    { href: "/journal", key: "journal" },
    { href: "/contact", key: "contact" },
] as const;

const socialLinks = [
    { href: "https://www.instagram.com/robeannybl", label: "Instagram" },
    { href: "https://www.tiktok.com/@robeannybbl", label: "TikTok" },
    { href: "https://www.linkedin.com/in/robeanny/", label: "LinkedIn" },
    { href: "https://www.patreon.com/robeanny", label: "Patreon" },
];

export default function Footer() {
    const tNav = useTranslations("nav");
    const tFooter = useTranslations("footer");

    return (
        <footer className="w-full bg-black border-t border-white/10">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
                    <Link href="/" className="font-serif text-3xl tracking-[0.2em] text-white hover:opacity-70 transition-opacity">
                        ROBEANNY
                    </Link>
                    <nav className="flex flex-wrap gap-x-8 gap-y-3">
                        {footerNavKeys.map((link) => (
                            <Link key={link.href} href={link.href} className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/40 hover:text-white transition-colors">
                                {tNav(link.key)}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="w-full h-px bg-white/10 mb-12" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        {socialLinks.map((link) => (
                            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors">
                                {link.label}
                            </a>
                        ))}
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                        <a href="https://love.robeanny.com/" target="_blank" rel="noopener noreferrer" className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors">
                            {tFooter("support")}
                        </a>
                        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/20">
                            {tFooter("rights")}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
