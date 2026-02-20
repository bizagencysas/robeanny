import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${cormorantGaramond.variable} ${montserrat.variable} antialiased`} suppressHydrationWarning>
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}
