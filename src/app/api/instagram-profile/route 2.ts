import { NextRequest, NextResponse } from "next/server";

type InstagramProfile = {
  username: string;
  fullName: string;
  biography: string;
  profilePicUrl: string;
  followers: number | null;
  following: number | null;
  posts: number | null;
  externalUrl: string;
  verified: boolean;
};

const FALLBACK_PROFILE: InstagramProfile = {
  username: "robeannybl",
  fullName: "Robeanny",
  biography: "Professional model · Medellin, Colombia",
  profilePicUrl:
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417060/C331D4C7-A330-46C8-AB87-E451F1B4C119_il9n9f.jpg",
  followers: null,
  following: null,
  posts: null,
  externalUrl: "https://www.instagram.com/robeannybl/",
  verified: false,
};

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseProfile = (payload: unknown, username: string): InstagramProfile | null => {
  const root = payload as Record<string, unknown> | null;
  if (!root) return null;

  const candidate =
    (root.data as Record<string, unknown> | undefined)?.user ||
    (root.data as Record<string, unknown> | undefined) ||
    (root.user as Record<string, unknown> | undefined) ||
    root;

  if (!candidate || typeof candidate !== "object") return null;

  const edgeFollowedBy =
    (candidate.edge_followed_by as Record<string, unknown> | undefined)?.count;
  const edgeFollow = (candidate.edge_follow as Record<string, unknown> | undefined)?.count;
  const edgeMedia =
    (candidate.edge_owner_to_timeline_media as Record<string, unknown> | undefined)?.count;

  const parsed: InstagramProfile = {
    username:
      firstString(
        candidate.username,
        (candidate.user as Record<string, unknown> | undefined)?.username
      ) || username,
    fullName:
      firstString(
        candidate.full_name,
        candidate.fullName,
        candidate.name,
        (candidate.user as Record<string, unknown> | undefined)?.full_name
      ) || "Robeanny",
    biography:
      firstString(candidate.biography, candidate.bio, candidate.biography_with_entities) ||
      FALLBACK_PROFILE.biography,
    profilePicUrl:
      firstString(
        candidate.profile_pic_url_hd,
        candidate.hd_profile_pic_url_info,
        candidate.profile_pic_url,
        candidate.profilePicUrl
      ) || FALLBACK_PROFILE.profilePicUrl,
    followers:
      toNumber(candidate.follower_count) ??
      toNumber(candidate.followers_count) ??
      toNumber(candidate.followers) ??
      toNumber(edgeFollowedBy),
    following:
      toNumber(candidate.following_count) ??
      toNumber(candidate.followings_count) ??
      toNumber(candidate.following) ??
      toNumber(edgeFollow),
    posts:
      toNumber(candidate.media_count) ??
      toNumber(candidate.posts_count) ??
      toNumber(candidate.posts) ??
      toNumber(edgeMedia),
    externalUrl:
      firstString(candidate.external_url, candidate.externalUrl) ||
      `https://www.instagram.com/${username}/`,
    verified: Boolean(candidate.is_verified),
  };

  return parsed.username ? parsed : null;
};

export async function GET(request: NextRequest) {
  const requestedUsername = request.nextUrl.searchParams
    .get("username")
    ?.trim()
    .replace(/^@/, "");

  const username = requestedUsername || FALLBACK_PROFILE.username;
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST || "instagram-scraper-api2.p.rapidapi.com";

  if (!rapidApiKey) {
    return NextResponse.json({ profile: { ...FALLBACK_PROFILE, username }, source: "fallback" });
  }

  const endpoint = new URL(`https://${rapidApiHost}/v1/info`);
  endpoint.searchParams.set("username_or_id_or_url", username);

  try {
    const response = await fetch(endpoint.toString(), {
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": rapidApiHost,
      },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error(`RapidAPI request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    const profile = parseProfile(payload, username);

    if (!profile) {
      throw new Error("Unable to parse Instagram profile from RapidAPI response");
    }

    return NextResponse.json({ profile, source: "rapidapi" });
  } catch (error) {
    console.error("Instagram profile sync error:", error);
    return NextResponse.json({ profile: { ...FALLBACK_PROFILE, username }, source: "fallback" });
  }
}
