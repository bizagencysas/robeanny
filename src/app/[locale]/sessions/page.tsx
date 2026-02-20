import type { Metadata } from "next";
import SessionsStack from "./SessionsStack";

export const metadata: Metadata = {
    title: "Sesiones Fotográficas",
    description: "Galería interactiva de sesiones fotográficas profesionales de Robeanny Bastardo Liconte en Medellín, Colombia.",
};

export default function SessionsPage() {
    return <SessionsStack />;
}
