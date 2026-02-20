import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";

import CustomCursor from "@/components/ui/CustomCursor";
import LoadingScreen from "@/components/layout/LoadingScreen";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isEn = locale === "en";

    return {
        title: {
            default: isEn
                ? "Robeanny Bastardo Liconte | Professional Model Colombia — Portfolio, Booking & Sessions"
                : "Robeanny Bastardo Liconte | Modelo Profesional Colombia — Portfolio, Booking & Sesiones",
            template: isEn
                ? "%s | Robeanny Bastardo — Professional Model Colombia"
                : "%s | Robeanny Bastardo — Modelo Profesional Colombia",
        },
        description: isEn
            ? "Robeanny Bastardo Liconte — Professional model in Medellín, Colombia. Editorial portfolio, photo sessions, booking for commercial campaigns, runway, and fashion content. Available worldwide."
            : "Robeanny Bastardo Liconte — Modelo profesional en Medellín, Colombia. Portfolio editorial, sesiones fotográficas, booking para campañas comerciales, pasarela y contenido de moda. Disponible worldwide.",
        keywords: [
            "modelo profesional Medellín Colombia booking",
            "professional model Colombia booking",
            "Robeanny Bastardo modelo",
            "Robeanny Bastardo Liconte",
            "modelo editorial Colombia",
            "fashion model Colombia",
            "model booking Colombia",
            "sesión fotográfica profesional Medellín",
            "professional photo session Medellín",
            "modelo comercial Medellín",
            "portfolio modelo Colombia",
            "fashion photography Colombia",
        ].join(", "),
        authors: [{ name: "Robeanny Bastardo Liconte", url: "https://robeanny.com" }],
        creator: "Robeanny Bastardo Liconte",
        publisher: "Robeanny Bastardo Liconte",
        robots: {
            index: true, follow: true, nocache: false,
            googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
        },
        alternates: {
            canonical: `https://robeanny.com${locale === "en" ? "/en" : ""}`,
            languages: { "es": "https://robeanny.com", "en": "https://robeanny.com/en", "x-default": "https://robeanny.com" },
        },
        category: "Fashion & Modeling",
        openGraph: {
            type: "website",
            url: "https://robeanny.com",
            title: isEn ? "Robeanny Bastardo Liconte — Professional Model Colombia" : "Robeanny Bastardo Liconte — Modelo Profesional Colombia",
            description: isEn
                ? "Professional model in Medellín, Colombia. Editorial portfolio, booking for commercial campaigns, runway, and fashion content."
                : "Modelo profesional en Medellín, Colombia. Portfolio editorial, booking para campañas comerciales, pasarela y contenido de moda.",
            siteName: "Robeanny — Professional Model",
            locale: isEn ? "en_US" : "es_CO",
            alternateLocale: isEn ? ["es_CO"] : ["en_US"],
            images: [{
                url: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png",
                width: 1200, height: 630, alt: "Robeanny Bastardo Liconte", type: "image/png",
            }]
        },
        twitter: {
            card: "summary_large_image",
            title: isEn ? "Robeanny — Professional Model Colombia" : "Robeanny — Modelo Profesional Colombia",
            description: isEn ? "Professional model in Medellín. Portfolio, booking and photo sessions." : "Modelo profesional en Medellín. Portfolio, booking y sesiones fotográficas.",
            images: ["https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png"],
            creator: "@robeannybl",
        },
        other: {
            "geo.region": "CO-ANT", "geo.placename": "Medellín, Antioquia, Colombia",
            "geo.position": "6.1519;-75.5636", "ICBM": "6.1519, -75.5636",
            "content-language": locale, "distribution": "global", "revisit-after": "3 days",
            "apple-mobile-web-app-capable": "yes", "apple-mobile-web-app-title": "Robeanny",
        }
    };
}

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
        { media: "(prefers-color-scheme: light)", color: "#000000" },
    ],
    colorScheme: "dark",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    if (!locales.includes(locale as typeof locales[number])) {
        notFound();
    }

    const messages = await getMessages();

    // Schema.org
    const schemas = [
        {
            "@context": "https://schema.org", "@type": "Person", "@id": "https://robeanny.com/#person",
            "name": "Robeanny Bastardo Liconte", "alternateName": ["Robeanny", "Robeanny Bastardo"],
            "url": "https://robeanny.com",
            "image": { "@type": "ImageObject", "url": "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png", "width": 1200, "height": 630 },
            "sameAs": ["https://www.instagram.com/robeannybl", "https://www.tiktok.com/@robeannybbl", "https://www.linkedin.com/in/robeanny/", "https://www.patreon.com/robeanny", "https://robeanny.me"],
            "jobTitle": locale === "en" ? "Professional Model" : "Modelo Profesional",
            "description": locale === "en"
                ? "Professional commercial and editorial model in Medellín, Colombia."
                : "Modelo profesional comercial y editorial en Medellín, Colombia.",
            "email": "me@robeanny.com", "telephone": "+573004846270", "gender": "Female",
            "birthDate": "2000-10-09",
            "birthPlace": { "@type": "Place", "name": "Puerto Ordaz, Venezuela" },
            "nationality": { "@type": "Country", "name": "Venezuela" },
            "homeLocation": { "@type": "Place", "name": "Medellín, Colombia", "geo": { "@type": "GeoCoordinates", "latitude": 6.1519, "longitude": -75.5636 } },
            "height": { "@type": "QuantitativeValue", "value": 164, "unitCode": "CMT" },
        },
        {
            "@context": "https://schema.org", "@type": "WebSite", "@id": "https://robeanny.com/#website",
            "name": "Robeanny — Professional Model", "url": "https://robeanny.com",
            "inLanguage": ["es", "en"],
            "publisher": { "@id": "https://robeanny.com/#person" },
        },
        {
            "@context": "https://schema.org", "@type": "ImageGallery",
            "name": "Portfolio — Robeanny Bastardo", "url": "https://robeanny.com/portfolio",
            "numberOfItems": 43, "author": { "@id": "https://robeanny.com/#person" },
        },
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://robeanny.com" },
                { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": "https://robeanny.com/portfolio" },
                { "@type": "ListItem", "position": 3, "name": "Book", "item": "https://robeanny.com/book" },
                { "@type": "ListItem", "position": 4, "name": "Sessions", "item": "https://robeanny.com/sessions" },
                { "@type": "ListItem", "position": 5, "name": "Journal", "item": "https://robeanny.com/journal" },
                { "@type": "ListItem", "position": 6, "name": "Contact", "item": "https://robeanny.com/contact" },
            ]
        },
        {
            "@context": "https://schema.org", "@type": "ProfessionalService",
            "name": "Robeanny — Model Booking",
            "url": "https://robeanny.com/book",
            "provider": { "@id": "https://robeanny.com/#person" },
            "areaServed": [{ "@type": "Country", "name": "Colombia" }, { "@type": "Country", "name": "Venezuela" }],
            "serviceType": ["Editorial Modeling", "Commercial Modeling", "Runway", "Social Media Content"],
        },
    ];

    return (
        <NextIntlClientProvider messages={messages}>
            <div lang={locale}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
                />
                <link rel="dns-prefetch" href="https://res.cloudinary.com" />
                <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
                <SmoothScroll>
                    <CustomCursor />
                    <LoadingScreen />
                    <Navbar />
                    <main className="min-h-screen">
                        {children}
                    </main>
                    <Footer />
                    <WhatsAppButton />
                </SmoothScroll>
            </div>
        </NextIntlClientProvider>
    );
}
