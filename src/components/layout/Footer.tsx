import Link from "next/link";

const footerLinks = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/book", label: "Book" },
    { href: "/sessions", label: "Sessions" },
    { href: "/journal", label: "Journal" },
    { href: "/contact", label: "Contact" },
];

const socialLinks = [
    { href: "https://www.instagram.com/robeannybl", label: "Instagram" },
    { href: "https://www.tiktok.com/@robeannybbl", label: "TikTok" },
    { href: "https://www.linkedin.com/in/robeanny/", label: "LinkedIn" },
    { href: "https://www.patreon.com/robeanny", label: "Patreon" },
];

export default function Footer() {
    return (
        <footer className="w-full bg-black border-t border-white/10">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24">
                {/* Top — Logo + Links */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
                    {/* Logo */}
                    <Link href="/" className="font-serif text-3xl tracking-[0.2em] text-white hover:opacity-70 transition-opacity">
                        ROBEANNY
                    </Link>

                    {/* Page Links */}
                    <nav className="flex flex-wrap gap-x-8 gap-y-3">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/40 hover:text-white transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-white/10 mb-12" />

                {/* Bottom — Socials + Copyright + Support */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    {/* Socials */}
                    <div className="flex items-center gap-6">
                        {socialLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Copyright + Support */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                        <a
                            href="https://love.robeanny.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors"
                        >
                            Support My Work ♡
                        </a>
                        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/20">
                            © 2025 Robeanny Bastardo Liconte. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
