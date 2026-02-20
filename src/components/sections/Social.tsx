"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Social() {
    const t = useTranslations("social");

    return (
        <section id="social" className="py-24 md:py-32 bg-black w-full min-h-screen flex flex-col items-center justify-center">
            <div className="container mx-auto px-6 max-w-6xl">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-serif text-white tracking-[0.2em] uppercase text-center mb-16"
                >
                    {t("title")}
                </motion.h2>

                <div className="flex flex-col md:flex-row gap-12 w-full justify-center">
                    {/* TikTok Embed */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="w-full md:w-1/2 flex justify-center bg-near-black p-4 rounded-xl border border-white/5"
                    >
                        <blockquote
                            className="tiktok-embed"
                            cite="https://www.tiktok.com/@robeannybbl"
                            data-unique-id="robeannybbl"
                            data-embed-type="creator"
                            style={{ maxWidth: "780px", minWidth: "288px" }}
                        >
                            <section>
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://www.tiktok.com/@robeannybbl?refer=creator_embed"
                                >
                                    @robeannybbl
                                </a>
                            </section>
                        </blockquote>
                    </motion.div>

                    {/* Instagram Embed */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="w-full md:w-1/2 flex justify-center bg-near-black p-4 rounded-xl border border-white/5 overflow-hidden"
                    >
                        <iframe
                            src="https://www.instagram.com/robeannybl/embed"
                            width="400"
                            height="480"
                            className="border-none overflow-hidden max-w-full"
                            scrolling="no"
                            allowTransparency={true}
                            allow="encrypted-media"
                        ></iframe>
                    </motion.div>
                </div>
            </div>

            {/* TikTok script needs to be loaded */}
            <script async src="https://www.tiktok.com/embed.js"></script>
        </section>
    );
}
