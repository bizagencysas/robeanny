import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

import CustomCursor from "@/components/ui/CustomCursor";
import LoadingScreen from "@/components/layout/LoadingScreen";
import SmoothScroll from "@/components/layout/SmoothScroll";

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

export const metadata: Metadata = {
  title: "Robeanny Bastardo | Modelo Profesional en Colombia | Portfolio & Booking",
  description: "Robeanny Bastardo Liconte - Modelo profesional colombiana especializada en sesiones comerciales, editoriales y campañas de moda. Portfolio completo y contacto para bookings.",
  keywords: "modelo profesional, Robeanny Bastardo, modelo comercial, modelo editorial, fashion model, content creator, influencer moda, sesiones fotográficas, pasarela, modelo Colombia, modelo Venezuela, modelo España, modelo Latinoamérica, booking modelo, portfolio modelo, modelo Medellín, modelo Sabaneta, modelo Antioquia, modelo latina, modelo emergente, fashion photography Colombia, booking model Colombia, professional model portfolio",
  authors: [{ name: "Robeanny Bastardo Liconte" }],
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  alternates: {
    canonical: "https://robeanny.me",
  },
  openGraph: {
    type: "website",
    url: "https://robeanny.me",
    title: "Robeanny - Modelo Profesional",
    description: "Modelo profesional comercial y editorial. Disponible para sesiones fotográficas, campañas y proyectos creativos.",
    siteName: "Robeanny",
    locale: "es_CO",
    images: [
      {
        url: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png",
        width: 1200,
        height: 630,
        alt: "Robeanny - Modelo Profesional",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Robeanny - Modelo Profesional",
    description: "Modelo profesional. Disponible para sesiones comerciales y editoriales.",
    images: ["https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png"],
  },
  other: {
    "geo.region": "CO-ANT",
    "geo.placename": "Medellín, Sabaneta",
    "geo.position": "6.1519;-75.5636",
    "ICBM": "6.1519, -75.5636",
  }
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Schema
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Robeanny Bastardo Liconte",
      "alternateName": "Robeanny",
      "url": "https://robeanny.me",
      "image": "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761421297/F60474B0-B2D3-4D05-99FC-C1CA8C1C8372_kdyq7e.png",
      "sameAs": [
        "https://www.instagram.com/robeannybl",
        "https://www.tiktok.com/@robeannybbl",
        "https://www.linkedin.com/in/robeanny/",
        "https://www.patreon.com/robeanny"
      ],
      "jobTitle": "Modelo Profesional",
      "worksFor": {
        "@type": "Organization",
        "name": "Independent"
      },
      "birthDate": "2000-10-09",
      "birthPlace": {
        "@type": "Place",
        "name": "Puerto Ordaz, Venezuela"
      },
      "homeLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Sabaneta",
          "addressRegion": "Antioquia",
          "addressCountry": "CO"
        }
      },
      "workLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Medellín",
          "addressRegion": "Antioquia",
          "addressCountry": "CO"
        }
      },
      "description": "Modelo profesional comercial y editorial en Medellín, Colombia. Especializada en moda, fotografía y contenido creativo.",
      "knowsAbout": ["Modelaje Comercial", "Modelaje Editorial", "Fotografía de Moda", "Content Creation", "Fashion", "Alta Costura"],
      "nationality": {
        "@type": "Country",
        "name": "Venezuela"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Robeanny - Portfolio Profesional",
      "url": "https://robeanny.me",
      "description": "Portfolio profesional y sitio de booking de Robeanny Bastardo Liconte, modelo profesional en Colombia.",
      "inLanguage": ["es", "en"],
      "author": {
        "@type": "Person",
        "name": "Robeanny Bastardo Liconte"
      }
    }
  ];

  return (
    <html lang="es" className={`${cormorantGaramond.variable} ${montserrat.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SmoothScroll>
          <CustomCursor />
          <LoadingScreen />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
