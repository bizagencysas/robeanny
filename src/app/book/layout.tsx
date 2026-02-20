import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Book a Session",
    description: "Solicita una sesión fotográfica o colaboración con Robeanny Bastardo. Disponible para editoriales, campañas comerciales, pasarela y contenido.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
