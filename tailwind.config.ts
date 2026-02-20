import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                black: "var(--black)",
                "near-black": "var(--near-black)",
                "dark-gray": "var(--dark-gray)",
                platinum: "var(--platinum)",
                white: "var(--white)",
                accent: "var(--accent)",
                "accent-subtle": "var(--accent-subtle)",
            },
            fontFamily: {
                serif: ["var(--font-cormorant)"],
                sans: ["var(--font-montserrat)"],
            },
        },
    },
    plugins: [],
};
export default config;
