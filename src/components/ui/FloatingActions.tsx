"use client";

import { useState, useEffect } from "react";
import { Music, Pause, Play, MessageCircle } from "lucide-react";
import { personalData } from "@/lib/data";

export default function FloatingActions() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        // We create the audio instance only on the client side
        const bgAudio = new Audio("/audio/ambient.mp3"); // Ensure you place an ambient.mp3 in public/audio later
        bgAudio.loop = true;
        bgAudio.volume = 0.12;
        setAudio(bgAudio);

        return () => {
            bgAudio.pause();
            bgAudio.src = "";
        };
    }, []);

    const toggleAudio = () => {
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(err => console.log("Audio autoplay blocked", err));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 flex flex-col items-end gap-4 z-[90]">
            {/* Audio Ambient Toggle */}
            <button
                onClick={toggleAudio}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:scale-110 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] group"
                aria-label="Toggle ambient music"
            >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span className="absolute right-full mr-4 px-3 py-1 bg-black/80 backdrop-blur-md text-xs tracking-widest uppercase rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {isPlaying ? "Pause Ambient" : "Play Ambient"}
                </span>
            </button>

            {/* WhatsApp Action Button */}
            <div
                className="relative flex items-center group"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <span
                    className={`absolute right-full mr-4 px-3 py-1.5 bg-black/80 backdrop-blur-md text-sm text-white rounded-md border border-white/10 shadow-lg whitespace-nowrap transition-all duration-300 pointer-events-none ${showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                >
                    Chatea conmigo
                </span>

                <a
                    href={personalData.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-platinum flex items-center justify-center text-black hover:scale-110 hover:-rotate-6 transition-all shadow-[0_4_20px_rgba(255,255,255,0.3)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.5)]"
                    aria-label="Chat on WhatsApp"
                >
                    {/* Custom WhatsApp outline or generic message icon */}
                    <MessageCircle size={28} className="fill-black" />
                </a>
            </div>
        </div>
    );
}
