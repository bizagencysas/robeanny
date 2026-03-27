"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

type InstagramProfile = {
  username: string;
  fullName: string;
  biography: string;
  profilePicUrl: string;
  followers: number | null;
  following: number | null;
  posts: number | null;
  recentMedia: string[];
  externalUrl: string;
  verified: boolean;
};

type ApiResponse = {
  profile?: InstagramProfile;
  source?: "rapidapi" | "fallback";
  reason?: string;
};

const FALLBACK_MEDIA = [
  "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417111/IMG_8328_ihc0wa.jpg",
  "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417110/IMG_8326_sicido.jpg",
  "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417110/IMG_8198_vdr3e3.jpg",
];

const DEFAULT_PROFILE: InstagramProfile = {
  username: "robeannybl",
  fullName: "Robeanny",
  biography: "",
  profilePicUrl:
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417060/C331D4C7-A330-46C8-AB87-E451F1B4C119_il9n9f.jpg",
  followers: null,
  following: null,
  posts: null,
  recentMedia: FALLBACK_MEDIA,
  externalUrl: "https://www.instagram.com/robeannybl/",
  verified: false,
};

const compact = (value: number | null) => {
  if (value === null) return "--";
  return new Intl.NumberFormat("es-CO", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

const toAssetProxy = (url: string) =>
  `/api/instagram-asset?url=${encodeURIComponent(url)}`;

const avatarCandidates = (profile: InstagramProfile) => {
  const unique = new Set<string>();
  [profile.profilePicUrl, DEFAULT_PROFILE.profilePicUrl].forEach((url) => {
    if (typeof url === "string" && url.trim()) unique.add(url.trim());
  });
  return Array.from(unique).map((url) => toAssetProxy(url));
};

export default function InstagramWidget() {
  const [profile, setProfile] = useState<InstagramProfile>(DEFAULT_PROFILE);
  const [source, setSource] = useState<"rapidapi" | "fallback">("fallback");
  const [loading, setLoading] = useState(true);
  const [avatarIndex, setAvatarIndex] = useState(0);

  const avatars = avatarCandidates(profile);
  const currentAvatar = avatars[avatarIndex] || toAssetProxy(DEFAULT_PROFILE.profilePicUrl);

  // Ensure we always have media — use fallback photos if API returns none
  const rawMedia = profile.recentMedia.length > 0 ? profile.recentMedia : FALLBACK_MEDIA;
  const recentMedia = rawMedia.slice(0, 3).map((url) => toAssetProxy(url));

  useEffect(() => {
    setAvatarIndex(0);
  }, [profile.profilePicUrl, profile.username]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/instagram-profile?username=robeannybl", {
          signal: controller.signal,
          next: { revalidate: 86400 }, // Cache for 24h — avoid calling RapidAPI on every page load
        } as RequestInit);
        const data = (await response.json()) as ApiResponse;

        if (data.profile) {
          setProfile(data.profile);
          setSource(data.source || "fallback");

          if (
            data.source === "fallback" &&
            data.reason &&
            process.env.NODE_ENV !== "production"
          ) {
            console.warn("Instagram widget fallback reason:", data.reason);
          }
        }
      } catch {
        setSource("fallback");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => controller.abort();
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0f0d0b] text-[#efe5d5]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(199,154,89,0.25),rgba(199,154,89,0)_42%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="border-b border-[#efe5d5]/14 px-5 py-4 md:p-5">
          <p className="text-[0.56rem] uppercase tracking-[0.3em] text-[#efe5d5]/58">
            Instagram Live Profile
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
          <div>
            <div className="mb-5 flex items-center gap-4">
              <img
                src={currentAvatar}
                alt={profile.fullName}
                className="h-16 w-16 rounded-full border border-[#efe5d5]/25 object-cover md:h-20 md:w-20"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => {
                  setAvatarIndex((current) => {
                    const next = current + 1;
                    return next < avatars.length ? next : current;
                  });
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-[#efe5d5] md:text-lg">{profile.username}</p>
                  {profile.verified ? (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#3b82f6] text-[0.5rem] font-bold text-white">
                      ✓
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-[#efe5d5]/62 md:text-sm">{profile.fullName}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Posts" value={loading ? "..." : compact(profile.posts)} />
              <StatCard label="Followers" value={loading ? "..." : compact(profile.followers)} />
              <StatCard label="Following" value={loading ? "..." : compact(profile.following)} />
            </div>

            <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-[#efe5d5]/72">
              {profile.biography || "Biografia no disponible en este momento."}
            </p>

            {/* Feed gallery — always shows 3 photos */}
            <div className="mt-5 grid grid-cols-3 gap-1.5">
              {recentMedia.map((mediaUrl, index) => (
                <a
                  key={mediaUrl}
                  href={profile.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden border border-[#efe5d5]/12 bg-[#11100f]"
                  aria-label={`Abrir Instagram post ${index + 1}`}
                >
                  <img
                    src={mediaUrl}
                    alt={`${profile.username} post ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      const img = event.currentTarget;
                      const fallback = toAssetProxy(FALLBACK_MEDIA[index] || FALLBACK_MEDIA[0]);
                      if (img.src !== fallback) img.src = fallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <a
              href={profile.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 border border-[#efe5d5]/34 px-4 py-3 text-[0.62rem] uppercase tracking-[0.28em] text-[#efe5d5] transition-colors hover:border-[#efe5d5] hover:bg-[#efe5d5] hover:text-[#13110f]"
            >
              Ver perfil
              <span>↗</span>
            </a>
            <p className="mt-3 text-center text-[0.56rem] uppercase tracking-[0.24em] text-[#efe5d5]/46">
              {source === "rapidapi" ? "Synced via RapidAPI" : "Using fallback data"}
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
