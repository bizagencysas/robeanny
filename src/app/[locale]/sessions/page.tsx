import type { Metadata } from "next";
import { unstable_setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n";
import SessionsStack from "./SessionsStack";

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
    title: "Sesiones Fotográficas",
    description: "Galería interactiva de sesiones fotográficas profesionales de Robeanny Bastardo Liconte en Medellín, Colombia.",
};

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function SessionsPage({ params }: Props) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return <SessionsStack />;
}
