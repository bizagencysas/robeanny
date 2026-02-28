import Image from "next/image";
import { aboutImage, portfolioTeaser, sessionPhotos } from "@/lib/data";

export default function InstagramWidget() {
    // Combine 9 photos to make a 3x3 grid
    const gridPhotos = [...sessionPhotos.slice(0, 5), ...portfolioTeaser.slice(0, 4).map(p => p.src)];

    return (
        <div className="w-full h-full bg-black text-white flex flex-col font-sans relative overflow-hidden group/widget">
            {/* Header */}
            <div className="flex items-start p-4 md:p-6 border-b border-white/10 shrink-0">
                <a
                    href="https://www.instagram.com/robeannybl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden relative mr-4 md:mr-6 flex-shrink-0 p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
                >
                    <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-black">
                        <Image src={aboutImage} alt="Robeanny" fill className="object-cover" sizes="80px" />
                    </div>
                </a>
                <div className="flex-1 flex flex-col justify-center pt-1 md:pt-2">
                    <div className="flex items-center gap-4 mb-3 md:mb-4">
                        <a href="https://www.instagram.com/robeannybl" target="_blank" rel="noopener noreferrer" className="font-semibold text-base md:text-lg hover:text-white/80 transition-colors">
                            robeannybl
                        </a>
                        <a href="https://www.instagram.com/robeannybl" target="_blank" rel="noopener noreferrer" className="bg-[#0095f6] text-white text-xs md:text-sm font-semibold px-4 md:px-5 py-1.5 md:py-2 rounded-lg hover:bg-[#1877f2] transition-colors">
                            Follow
                        </a>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8 text-xs md:text-sm">
                        <div className="flex flex-col md:flex-row items-center md:gap-1"><span className="font-semibold">78</span> <span className="text-white/80 text-[10px] md:text-sm">posts</span></div>
                        <div className="flex flex-col md:flex-row items-center md:gap-1"><span className="font-semibold">324K</span> <span className="text-white/80 text-[10px] md:text-sm">followers</span></div>
                        <div className="flex flex-col md:flex-row items-center md:gap-1"><span className="font-semibold">145</span> <span className="text-white/80 text-[10px] md:text-sm">following</span></div>
                    </div>
                    <div className="mt-4 text-xs md:text-sm hidden md:block">
                        <p className="font-semibold mb-1">ROBEANNY</p>
                        <p className="text-white/80">Professional Model • Creator</p>
                        <p className="text-white/80">Medellín, Colombia 🇨🇴</p>
                        <a href="https://robeanny.com" target="_blank" rel="noopener noreferrer" className="text-[#e0f1ff] font-medium mt-1 inline-block hover:underline">robeanny.com</a>
                    </div>
                </div>
            </div>

            {/* Mobile Bio */}
            <div className="px-4 pb-4 pt-2 border-b border-white/10 text-xs md:hidden shrink-0">
                <p className="font-semibold mb-1">ROBEANNY</p>
                <p className="text-white/80">Professional Model • Creator</p>
                <p className="text-white/80">Medellín, Colombia 🇨🇴</p>
                <a href="https://robeanny.com" target="_blank" rel="noopener noreferrer" className="text-[#e0f1ff] font-medium mt-1 block hover:underline">robeanny.com</a>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide bg-black relative">
                <div className="grid grid-cols-3 gap-[2px]">
                    {gridPhotos.map((src, i) => (
                        <a key={i} href="https://www.instagram.com/robeannybl" target="_blank" rel="noopener noreferrer" className="relative aspect-square group block bg-white/5">
                            <Image src={src} alt="Instagram post" fill className="object-cover" sizes="33vw" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex items-center gap-4 text-white font-semibold text-sm">
                                    <span className="flex items-center gap-1.5"><svg aria-label="Like" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.174.98 1.514 1.117 1.514s.277-.34 1.117-1.514a4.21 4.21 0 0 1 3.675-1.941z"></path></svg> {Math.floor(Math.random() * 8) + 1}k</span>
                                    <span className="flex items-center gap-1.5"><svg aria-label="Comment" className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg> {Math.floor(Math.random() * 90) + 10}</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
                {/* Overlay gradient link */}
                <a href="https://www.instagram.com/robeannybl" target="_blank" rel="noopener noreferrer" className="absolute bottom-0 left-0 w-full pt-16 pb-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-center text-xs md:text-sm text-white font-semibold opacity-0 group-hover/widget:opacity-100 transition-opacity duration-500">
                    Ver en Instagram
                </a>
            </div>
        </div>
    )
}
