import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contacto",
    description: "Contacta a Robeanny Bastardo para colaboraciones, bookings y proyectos. Email, WhatsApp y formulario de contacto.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
