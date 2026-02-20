import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Metadata, Viewport } from "next";
import "../globals.css";

import LoadingScreen from "@/components/LoadingScreen";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import Particles from "@/components/Particles";
import Navbar from "@/components/Navbar";

// Fonts setup
const cormorantGaramond = Cormorant_Garamond({
    weight: ["300", "400", "500", "600", "700"],
    subsets: ["latin"],
    variable: "--font-cormorant",
});

const montserrat = Montserrat({
    weight: ["200", "300", "400", "500"],
    subsets: ["latin"],
    variable: "--font-montserrat",
});

export const metadata: Metadata = {
    title: "Robeanny Bastardo | Professional Model in Colombia | Portfolio & Booking",
    description: "Robeanny Bastardo Liconte has built a remarkable career in the modeling world. Based in Colombia.",
    manifest: "/manifest.json",
    icons: {
        icon: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761424406/android-chrome-512x512_kboc44.png",
        apple: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761424406/android-chrome-512x512_kboc44.png",
    },
    openGraph: {
        type: "profile",
        title: "Robeanny Bastardo | Professional Model",
        description: "Professional Model Portfolio in Colombia",
        url: "https://robeanny.com",
        siteName: "Robeanny",
        images: [
            {
                url: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png",
                width: 1200,
                height: 630,
                alt: "Robeanny Bastardo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
    },
    robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    alternates: {
        canonical: "https://robeanny.com",
    },
};

export const viewport: Viewport = {
    themeColor: "#0a0a0a",
};

import SmoothScroll from "@/components/SmoothScroll";

export default async function LocaleLayout({
    children,
    params: { locale },
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = await getMessages();

    return (
        <html lang={locale} className={`${cormorantGaramond.variable} ${montserrat.variable}`}>
            <body>
                <SmoothScroll>
                    <NextIntlClientProvider messages={messages}>
                        <LoadingScreen />
                        <CustomCursor />
                        <ScrollProgress />
                        <Particles />
                        <Navbar />
                        {children}
                    </NextIntlClientProvider>
                </SmoothScroll>
            </body>
        </html>
    );
}
