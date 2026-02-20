"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function LanguageToggle() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const switchLocale = (newLocale: string) => {
        if (newLocale === locale) return;

        // Set cookie for next-intl
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
        localStorage.setItem("locale", newLocale);

        // Swap the locale in the pathname
        const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
        router.replace(newPath || `/${newLocale}`);
    };

    if (!mounted) return null;

    return (
        <div className="flex items-center space-x-2 text-sm font-sans tracking-widest font-light">
            <button
                onClick={() => switchLocale("es")}
                className={`transition-colors duration-300 hover:text-white ${locale === "es" ? "text-white" : "text-white/30"
                    }`}
            >
                ES
            </button>
            <span className="text-white/20">|</span>
            <button
                onClick={() => switchLocale("en")}
                className={`transition-colors duration-300 hover:text-white ${locale === "en" ? "text-white" : "text-white/30"
                    }`}
            >
                EN
            </button>
        </div>
    );
}
