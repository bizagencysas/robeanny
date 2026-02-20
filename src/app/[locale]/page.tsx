import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Portfolio from "@/components/sections/Portfolio";
import Sessions from "@/components/sections/Sessions";
import Social from "@/components/sections/Social";
import Support from "@/components/sections/Support";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Robeanny Bastardo Liconte",
        "alternateName": "Robeanny",
        "url": "https://robeanny.com",
        "image": "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png",
        "sameAs": [
            "https://www.instagram.com/robeannybl",
            "https://www.tiktok.com/@robeannybbl",
            "https://www.linkedin.com/in/robeanny/",
            "https://www.patreon.com/robeanny"
        ],
        "jobTitle": "Professional Model",
        "birthDate": "2000-10-09",
        "birthPlace": "Puerto Ordaz, Venezuela",
        "homeLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Sabaneta",
                "addressRegion": "Antioquia",
                "addressCountry": "CO"
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="w-full relative overflow-x-hidden">
                <Hero />
                <About />
                <Portfolio />
                <Sessions />
                <Social />
                <Support />
                <Contact />
                <Footer />
            </main>
        </>
    );
}
