import type { Metadata } from "next";

// This layout provides metadata for the portfolio page
export const metadata: Metadata = {
    title: "Portfolio",
    description: "Portfolio completo de Robeanny Bastardo Liconte. Sesiones editoriales, campañas comerciales y fotografía de moda profesional en Colombia.",
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
