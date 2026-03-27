"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * Custom dark-themed TikTok profile card.
 * TikTok's official embed doesn't support dark mode, so we build our own.
 * No API needed — uses static data + Cloudinary-hosted thumbnails.
 */

const TIKTOK_PROFILE = {
  username: "robeannybbl",
  displayName: "Robeanny",
  followers: "33.8K",
  following: "128",
  likes: "366.9K",
  bio: "✨Welcome✨",
  profilePic:
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417060/C331D4C7-A330-46C8-AB87-E451F1B4C119_il9n9f.jpg",
  url: "https://www.tiktok.com/@robeannybbl",
  videos: [
    { views: "110.1K", thumbnail: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417111/IMG_8328_ihc0wa.jpg" },
    { views: "24.6K", thumbnail: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417110/IMG_8326_sicido.jpg" },
    { views: "529", thumbnail: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417110/IMG_8198_vdr3e3.jpg" },
    { views: "449", thumbnail: "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417059/4A7B7C7A-3996-4840-BA95-3F048815B38E_q0axou.jpg" },
  ],
};

export default function TikTokWidget() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0f0d0b] text-[#efe5d5]">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(199,154,89,0.2),rgba(199,154,89,0)_42%)]" />

      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-[#efe5d5]/14 px-5 py-4 md:p-5">
          <p className="text-[0.56rem] uppercase tracking-[0.3em] text-[#efe5d5]/58">
            TikTok Profile
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
          <div>
            {/* Profile info */}
            <div className="mb-5 flex items-center gap-4">
              <img
                src={TIKTOK_PROFILE.profilePic}
                alt={TIKTOK_PROFILE.displayName}
                className="h-16 w-16 rounded-full border border-[#efe5d5]/25 object-cover md:h-20 md:w-20"
                loading="lazy"
              />
              <div>
                <p className="text-base font-semibold text-[#efe5d5] md:text-lg">
                  {TIKTOK_PROFILE.username}
                </p>
                <p className="text-xs text-[#efe5d5]/62 md:text-sm">
                  {TIKTOK_PROFILE.displayName}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Following" value={TIKTOK_PROFILE.following} />
              <StatCard label="Followers" value={TIKTOK_PROFILE.followers} />
              <StatCard label="Likes" value={TIKTOK_PROFILE.likes} />
            </div>

            {/* Bio */}
            <p className="mt-5 text-sm leading-relaxed text-[#efe5d5]/72">
              {TIKTOK_PROFILE.bio}
            </p>

            {/* Video thumbnails */}
            <div className="mt-5 grid grid-cols-4 gap-1.5">
              {TIKTOK_PROFILE.videos.map((video, index) => (
                <a
                  key={index}
                  href={TIKTOK_PROFILE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-[9/16] overflow-hidden border border-[#efe5d5]/12 bg-[#11100f]"
                  aria-label={`Ver TikTok ${index + 1}`}
                >
                  <img
                    src={video.thumbnail}
                    alt={`TikTok video ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                  {/* Play icon + views */}
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                    <svg className="h-2.5 w-2.5 text-white/90" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-[0.5rem] font-medium text-white/90">{video.views}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <a
              href={TIKTOK_PROFILE.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 border border-[#efe5d5]/34 px-4 py-3 text-[0.62rem] uppercase tracking-[0.28em] text-[#efe5d5] transition-colors hover:border-[#efe5d5] hover:bg-[#efe5d5] hover:text-[#13110f]"
            >
              Ver perfil
              <span>↗</span>
            </a>
            <p className="mt-3 text-center text-[0.56rem] uppercase tracking-[0.24em] text-[#efe5d5]/46">
              @{TIKTOK_PROFILE.username}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#efe5d5]/16 bg-[#15120f]/62 px-3 py-3 text-center">
      <p className="text-[0.56rem] uppercase tracking-[0.26em] text-[#efe5d5]/48">{label}</p>
      <p className="mt-1 text-sm text-[#efe5d5] md:text-base">{value}</p>
    </div>
  );
}
