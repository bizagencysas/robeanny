"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { personalData } from "@/lib/data";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className="absolute top-0 left-0 w-full z-50 pt-8 pl-8 mix-blend-difference"
        >
            <div className="w-full px-6 flex justify-between items-center pointer-events-none">
                {/* Logo */}
                <Link href="/" className="pointer-events-auto hover:opacity-70 transition-opacity">
                    <h1 className="editorial-title text-2xl md:text-3xl text-white tracking-widest uppercase">
                        {personalData.name.split(" ")[0]}
                    </h1>
                </Link>
            </div>
        </header>
    );
}
