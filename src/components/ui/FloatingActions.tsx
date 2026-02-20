"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { personalData } from "@/lib/data";

export default function FloatingActions() {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 flex flex-col items-end gap-4 z-[90]">
            {/* WhatsApp Action Button */}
            <div
                className="relative flex items-center group"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <span
                    className={`absolute right-full mr-4 px-3 py-1.5 bg-black/80 backdrop-blur-md text-sm text-white rounded-md border border-white/10 shadow-lg whitespace-nowrap transition-all duration-300 pointer-events-none ${showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                >
                    Chatear (Booking)
                </span>

                <a
                    href={personalData.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-platinum flex items-center justify-center text-black hover:scale-110 hover:-rotate-6 transition-all shadow-[0_4_20px_rgba(255,255,255,0.3)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.5)]"
                    aria-label="Chat on WhatsApp"
                >
                    <MessageCircle size={28} className="fill-black" />
                </a>
            </div>
        </div>
    );
}
