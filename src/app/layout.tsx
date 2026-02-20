import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

import CustomCursor from "@/components/ui/CustomCursor";
import LoadingScreen from "@/components/layout/LoadingScreen";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// ═══════════════════════════════════════════════════════
// MASSIVE SEO — The kind that makes Google say "OH!"
// ═══════════════════════════════════════════════════════
export const metadata: Metadata = {
  // ── Title Template ──
  title: {
    default: "Robeanny Bastardo Liconte | Modelo Profesional Colombia — Portfolio, Booking & Sesiones",
    template: "%s | Robeanny Bastardo — Modelo Profesional Colombia",
  },

  // ── Description — Max 155 char, keyword-dense, compelling ──
  description: "Robeanny Bastardo Liconte — Modelo profesional en Medellín, Colombia. Portfolio editorial, sesiones fotográficas, booking para campañas comerciales, pasarela y contenido de moda. Disponible worldwide.",

  // ── Keywords — Long-tail first, then broad ──
  keywords: [
    // Long-tail (high-intent, low-competition)
    "modelo profesional Medellín Colombia booking",
    "sesión fotográfica profesional Medellín",
    "modelo editorial booking Colombia",
    "modelo comercial para campaña publicitaria Colombia",
    "contratar modelo profesional Medellín",
    "modelo para pasarela Colombia",
    "modelo contenido redes sociales Colombia",
    "fotografia de moda Medellín modelo",
    "book modelo profesional colombiana",
    "modelo venezolana en Colombia",
    // Medium-tail
    "Robeanny Bastardo modelo",
    "Robeanny Bastardo Liconte",
    "modelo profesional Colombia",
    "modelo editorial Colombia",
    "modelo comercial Medellín",
    "modelo fashion Colombia",
    "modelo latina profesional",
    "portfolio modelo Colombia",
    "sesiones fotográficas modelo",
    "booking modelo latinoamérica",
    // Broad (for context signals)
    "fashion model",
    "professional model",
    "model portfolio",
    "model booking",
    "fashion photography Colombia",
    "content creator moda",
    "influencer moda Colombia",
    "modelo Instagram TikTok Colombia",
  ].join(", "),

  // ── Authors ──
  authors: [{ name: "Robeanny Bastardo Liconte", url: "https://robeanny.com" }],
  creator: "Robeanny Bastardo Liconte",
  publisher: "Robeanny Bastardo Liconte",

  // ── Robots — Aggressive indexing ──
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Canonical + Alternates (DUAL DOMAIN) ──
  alternates: {
    canonical: "https://robeanny.com",
    languages: {
      "es-CO": "https://robeanny.com",
      "es": "https://robeanny.com",
      "en": "https://robeanny.com",
      "x-default": "https://robeanny.com",
    },
  },

  // ── Verification (add IDs when available) ──
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },

  // ── Category ──
  category: "Fashion & Modeling",

  // ── Open Graph — Rich previews everywhere ──
  openGraph: {
    type: "website",
    url: "https://robeanny.com",
    title: "Robeanny Bastardo Liconte — Modelo Profesional Colombia",
    description: "Modelo profesional en Medellín, Colombia. Portfolio editorial, booking para campañas comerciales, pasarela y contenido de moda.",
    siteName: "Robeanny — Professional Model",
    locale: "es_CO",
    alternateLocale: ["en_US", "es_ES"],
    images: [
      {
        url: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png",
        width: 1200,
        height: 630,
        alt: "Robeanny Bastardo Liconte — Modelo Profesional Colombia",
        type: "image/png",
      }
    ]
  },

  // ── Twitter/X Cards ──
  twitter: {
    card: "summary_large_image",
    title: "Robeanny Bastardo Liconte — Modelo Profesional Colombia",
    description: "Modelo profesional en Medellín. Portfolio, booking y sesiones fotográficas.",
    images: ["https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png"],
    creator: "@robeannybl",
  },

  // ── Other Meta ──
  other: {
    // Geo tags for local SEO
    "geo.region": "CO-ANT",
    "geo.placename": "Medellín, Antioquia, Colombia",
    "geo.position": "6.1519;-75.5636",
    "ICBM": "6.1519, -75.5636",
    "place:location:latitude": "6.1519",
    "place:location:longitude": "-75.5636",
    // Content language signals
    "content-language": "es, en",
    // Distribution
    "distribution": "global",
    "rating": "general",
    "revisit-after": "3 days",
    // Apple
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "Robeanny",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    // Format detection
    "format-detection": "telephone=no",
  }
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ── Schema.org JSON-LD — Comprehensive structured data ──
  const schemas = [
    // 1. Person — The main entity
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://robeanny.com/#person",
      "name": "Robeanny Bastardo Liconte",
      "alternateName": ["Robeanny", "Robeanny Bastardo", "Robeanny BL"],
      "url": "https://robeanny.com",
      "image": {
        "@type": "ImageObject",
        "url": "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png",
        "width": 1200,
        "height": 630,
      },
      "sameAs": [
        "https://www.instagram.com/robeannybl",
        "https://www.tiktok.com/@robeannybbl",
        "https://www.linkedin.com/in/robeanny/",
        "https://www.patreon.com/robeanny",
        "https://robeanny.me",
        "https://robeanny.com"
      ],
      "jobTitle": "Modelo Profesional",
      "description": "Modelo profesional comercial y editorial en Medellín, Colombia. Especializada en sesiones fotográficas editoriales, campañas publicitarias, pasarela y contenido de moda.",
      "knowsAbout": ["Modelaje Comercial", "Modelaje Editorial", "Fotografía de Moda", "Pasarela", "Content Creation", "Fashion", "Alta Costura", "UGC", "Social Media"],
      "worksFor": { "@type": "Organization", "name": "Independent / Freelance" },
      "birthDate": "2000-10-09",
      "birthPlace": { "@type": "Place", "name": "Puerto Ordaz, Venezuela" },
      "nationality": { "@type": "Country", "name": "Venezuela" },
      "homeLocation": {
        "@type": "Place",
        "name": "Medellín, Antioquia, Colombia",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Sabaneta",
          "addressRegion": "Antioquia",
          "addressCountry": "CO"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 6.1519,
          "longitude": -75.5636
        }
      },
      "email": "me@robeanny.com",
      "telephone": "+573004846270",
      "gender": "Female",
      "height": { "@type": "QuantitativeValue", "value": 164, "unitCode": "CMT" },
    },

    // 2. WebSite — For sitelinks in Google
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://robeanny.com/#website",
      "name": "Robeanny — Modelo Profesional Colombia",
      "alternateName": "Robeanny Bastardo Portfolio",
      "url": "https://robeanny.com",
      "description": "Plataforma digital de marca personal de Robeanny Bastardo Liconte. Portfolio, booking, sesiones y blog de moda.",
      "inLanguage": ["es", "en"],
      "publisher": { "@id": "https://robeanny.com/#person" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://robeanny.com/portfolio"
        },
        "query-input": "required name=search_term_string"
      }
    },

    // 3. ImageGallery — Portfolio signals
    {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Portfolio Profesional de Robeanny Bastardo",
      "description": "Colección completa de fotografías profesionales: sesiones editoriales, campañas comerciales y moda.",
      "url": "https://robeanny.com/portfolio",
      "numberOfItems": 43,
      "author": { "@id": "https://robeanny.com/#person" },
    },

    // 4. BreadcrumbList — Navigation signals
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://robeanny.com" },
        { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": "https://robeanny.com/portfolio" },
        { "@type": "ListItem", "position": 3, "name": "Book", "item": "https://robeanny.com/book" },
        { "@type": "ListItem", "position": 4, "name": "Sessions", "item": "https://robeanny.com/sessions" },
        { "@type": "ListItem", "position": 5, "name": "Journal", "item": "https://robeanny.com/journal" },
        { "@type": "ListItem", "position": 6, "name": "Contact", "item": "https://robeanny.com/contact" },
      ]
    },

    // 5. ProfessionalService — For "contratar modelo" searches
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Robeanny — Modelo Profesional para Booking",
      "description": "Servicio de modelaje profesional para sesiones fotográficas, campañas publicitarias, pasarela, contenido para redes sociales y proyectos artísticos.",
      "url": "https://robeanny.com/book",
      "provider": { "@id": "https://robeanny.com/#person" },
      "areaServed": [
        { "@type": "Country", "name": "Colombia" },
        { "@type": "Country", "name": "Venezuela" },
        { "@type": "Country", "name": "España" },
      ],
      "serviceType": ["Modelaje Editorial", "Modelaje Comercial", "Pasarela", "Contenido para Redes", "UGC"],
      "priceRange": "$$",
    },

    // 6. FAQPage — For FAQ rich results (Google LOVES these)
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Cómo puedo contratar a Robeanny para una sesión fotográfica?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Puedes solicitar un booking directamente desde la página de Book en robeanny.com/book. Completa el formulario con los detalles de tu proyecto y recibirás respuesta en 24-48 horas."
          }
        },
        {
          "@type": "Question",
          "name": "¿En qué ciudades está disponible Robeanny para modelaje?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Robeanny está basada en Medellín, Colombia, pero está disponible para proyectos en cualquier ciudad del mundo. Contáctala para discutir disponibilidad y logística."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué tipo de sesiones fotográficas realiza Robeanny?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Robeanny realiza sesiones editoriales, campañas comerciales, pasarela/runway, contenido para redes sociales, proyectos artísticos y colaboraciones de moda."
          }
        }
      ]
    }
  ];

  return (
    <html lang="es" className={`${cormorantGaramond.variable} ${montserrat.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />

        {/* Resource Hints */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.instagram.com" />
        <link rel="dns-prefetch" href="https://www.tiktok.com" />

        {/* Dual Domain — Tell Google both domains are the same site */}
        <link rel="canonical" href="https://robeanny.com" />
        <link rel="alternate" href="https://robeanny.me" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="512x512" href="https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761424406/android-chrome-512x512_kboc44.png" />

        {/* Analytics Placeholders — Add IDs when ready */}
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`} />
            <script dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA4_ID}');`
            }} />
          </>
        )}
      </head>
      <body className="bg-black text-white">
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
      </body>
    </html>
  );
}
