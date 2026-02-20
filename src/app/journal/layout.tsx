import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Journal",
    description: "Blog de moda, detrás de cámaras y tips de modelaje por Robeanny Bastardo Liconte.",
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
