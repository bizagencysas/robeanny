import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 86400; // Cache API response for 24 hours (ISR)

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

type ApiSource = "rapidapi" | "fallback";

type ApiResponse = {
  profile: InstagramProfile;
  source: ApiSource;
  reason?: string;
  diagnostics?: {
    endpoint: string;
    host: string;
    path: string;
    method: string;
    usernameParam: string;
    hasKey: boolean;
    attempts?: Array<{
      endpoint: string;
      host: string;
      path: string;
      method: string;
      usernameParam: string;
      status: number | "error" | "parse_error";
      reason?: string;
    }>;
  };
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
  recentMedia: [
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417111/IMG_8328_ihc0wa.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417110/IMG_8326_sicido.jpg",
    "https://res.cloudinary.com/dwpbbjp1d/image/upload/v1761417110/IMG_8198_vdr3e3.jpg",
  ],
  externalUrl: "https://www.instagram.com/robeannybl/",
  verified: false,
};

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
};

const firstUrlInList = (value: unknown) => {
  if (!Array.isArray(value)) return "";
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const url = firstString((item as Record<string, unknown>).url);
    if (url) return url;
  }
  return "";
};

const firstMediaUrl = (value: unknown) => {
  if (!value || typeof value !== "object") return "";
  const node = value as Record<string, unknown>;
  const imageVersions = node.image_versions2 as Record<string, unknown> | undefined;
  const candidates = imageVersions?.candidates as unknown;

  return firstString(
    node.display_url,
    node.thumbnail_src,
    node.image_url,
    node.media_url,
    node.url,
    firstUrlInList(candidates),
    firstUrlInList(node.image_versions),
    firstUrlInList(node.carousel_media)
  );
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const firstEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const collectMediaUrls = (candidate: Record<string, unknown>) => {
  const urls: string[] = [];
  const pushUrl = (value: unknown) => {
    const url = firstMediaUrl(value);
    if (url && /^https?:\/\//i.test(url) && !urls.includes(url)) {
      urls.push(url);
    }
  };

  const edges =
    (candidate.edge_owner_to_timeline_media as Record<string, unknown> | undefined)
      ?.edges as unknown[] | undefined;
  edges?.forEach((edge) => {
    if (!edge || typeof edge !== "object") return;
    const node = (edge as Record<string, unknown>).node ?? edge;
    pushUrl(node);
    const carousel = (node as Record<string, unknown>).carousel_media as unknown[] | undefined;
    carousel?.forEach((media) => pushUrl(media));
  });

  const items = candidate.items as unknown[] | undefined;
  items?.forEach((item) => {
    pushUrl(item);
    const carousel = (item as Record<string, unknown>).carousel_media as unknown[] | undefined;
    carousel?.forEach((media) => pushUrl(media));
  });

  const media = candidate.media as unknown[] | undefined;
  media?.forEach((item) => pushUrl(item));

  const posts = candidate.posts as unknown[] | undefined;
  posts?.forEach((item) => pushUrl(item));

  return urls.slice(0, 9);
};

const parseProfile = (payload: unknown, username: string): InstagramProfile | null => {
  const root = payload as Record<string, unknown> | null;
  if (!root) return null;

  const dataObj = root.data as Record<string, unknown> | undefined;
  const dataUser = dataObj?.user as Record<string, unknown> | undefined;

  const candidates = [
    root.result as Record<string, unknown> | undefined,
    dataUser,
    dataObj,
    root.user as Record<string, unknown> | undefined,
    (root.graphql as Record<string, unknown> | undefined)?.user,
    root,
  ].filter((candidate): candidate is Record<string, unknown> => Boolean(candidate));

  for (const candidate of candidates) {
    const edgeFollowedBy =
      (candidate.edge_followed_by as Record<string, unknown> | undefined)?.count;
    const edgeFollow = (candidate.edge_follow as Record<string, unknown> | undefined)?.count;
    const edgeMedia =
      (candidate.edge_owner_to_timeline_media as Record<string, unknown> | undefined)?.count;

    const detectedUsername = firstString(
      candidate.username,
      (candidate.user as Record<string, unknown> | undefined)?.username
    );
    const detectedFullName = firstString(
      candidate.full_name,
      candidate.fullName,
      candidate.name,
      (candidate.user as Record<string, unknown> | undefined)?.full_name
    );
    const detectedBio = firstString(
      candidate.biography,
      candidate.bio,
      candidate.biography_with_entities
    );
    const detectedProfilePic = firstString(
      candidate.profile_pic_url_hd,
      candidate.profilePicUrlHD,
      (candidate.hd_profile_pic_url_info as Record<string, unknown> | undefined)?.url,
      firstUrlInList(candidate.hd_profile_pic_versions),
      candidate.hd_profile_pic_url_info,
      candidate.profile_pic_url,
      firstUrlInList(candidate.profile_pic_versions),
      candidate.profilePicUrl
    );
    const detectedFollowers =
      toNumber(candidate.follower_count) ??
      toNumber(candidate.followers_count) ??
      toNumber(candidate.followers) ??
      toNumber(edgeFollowedBy);
    const detectedFollowing =
      toNumber(candidate.following_count) ??
      toNumber(candidate.followings_count) ??
      toNumber(candidate.following) ??
      toNumber(edgeFollow);
    const detectedPosts =
      toNumber(candidate.media_count) ??
      toNumber(candidate.posts_count) ??
      toNumber(candidate.posts) ??
      toNumber(edgeMedia);
    const detectedRecentMedia = collectMediaUrls(candidate);

    const hasRealSignal = Boolean(
      detectedUsername ||
        detectedFullName ||
        detectedBio ||
        detectedProfilePic ||
        detectedFollowers !== null ||
        detectedFollowing !== null ||
        detectedPosts !== null ||
        detectedRecentMedia.length > 0 ||
        firstString(candidate.id, candidate.pk)
    );

    if (!hasRealSignal) continue;

    return {
      username: detectedUsername || username,
      fullName: detectedFullName || detectedUsername || username,
      biography: detectedBio,
      profilePicUrl: detectedProfilePic || FALLBACK_PROFILE.profilePicUrl,
      followers: detectedFollowers,
      following: detectedFollowing,
      posts: detectedPosts,
      recentMedia: detectedRecentMedia,
      externalUrl:
        firstString(candidate.external_url, candidate.externalUrl) ||
        `https://www.instagram.com/${username}/`,
      verified: Boolean(candidate.is_verified ?? candidate.verified),
    };
  }

  return null;
};

const normalizeHost = (value?: string) => {
  if (!value) return { host: "", basePath: "" };

  const raw = value.trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    const basePath =
      parsed.pathname && parsed.pathname !== "/"
        ? `/${parsed.pathname.replace(/^\/+|\/+$/g, "")}`
        : "";

    return {
      host: parsed.host,
      basePath,
    };
  } catch {
    const noProtocol = raw.replace(/^https?:\/\//i, "");
    const [host, ...pathParts] = noProtocol.split("/");
    return {
      host: host || "",
      basePath: pathParts.length ? `/${pathParts.join("/").replace(/^\/+|\/+$/g, "")}` : "",
    };
  }
};

const normalizePath = (value: string) => {
  const clean = value.trim();
  if (!clean) return "";
  return `/${clean.replace(/^\/+|\/+$/g, "")}`;
};

const joinPaths = (...paths: string[]) => {
  const clean = paths
    .map((path) => normalizePath(path))
    .filter(Boolean)
    .join("");
  return clean || "/";
};

type RequestStrategy = {
  path: string;
  method: "GET" | "POST";
  usernameParam: string;
};

type AttemptLog = {
  endpoint: string;
  host: string;
  path: string;
  method: string;
  usernameParam: string;
  status: number | "error" | "parse_error";
  reason?: string;
};

const normalizeMethod = (value: string) => {
  return value.toUpperCase() === "POST" ? "POST" : "GET";
};

const mergeProfiles = (
  primary: InstagramProfile,
  enrichment: InstagramProfile | null
): InstagramProfile => {
  if (!enrichment) return primary;

  return {
    username: primary.username || enrichment.username,
    fullName: primary.fullName || enrichment.fullName,
    biography: primary.biography || enrichment.biography,
    profilePicUrl: enrichment.profilePicUrl || primary.profilePicUrl,
    followers: primary.followers ?? enrichment.followers,
    following: primary.following ?? enrichment.following,
    posts: primary.posts ?? enrichment.posts,
    recentMedia: primary.recentMedia.length ? primary.recentMedia : enrichment.recentMedia,
    externalUrl: primary.externalUrl || enrichment.externalUrl,
    verified: primary.verified || enrichment.verified,
  };
};

const collectMediaFromPayload = (payload: unknown) => {
  const root = payload as Record<string, unknown> | null;
  if (!root) return [];

  const urls: string[] = [];
  const addUrls = (list: string[]) => {
    list.forEach((url) => {
      if (url && !urls.includes(url)) urls.push(url);
    });
  };

  const candidateObjects = [
    root.result as Record<string, unknown> | undefined,
    root.data as Record<string, unknown> | undefined,
    root.user as Record<string, unknown> | undefined,
    root,
  ].filter((candidate): candidate is Record<string, unknown> => Boolean(candidate));

  candidateObjects.forEach((candidate) => addUrls(collectMediaUrls(candidate)));

  const candidateArrays = [
    root.items as unknown[] | undefined,
    root.posts as unknown[] | undefined,
    root.media as unknown[] | undefined,
    root.feed as unknown[] | undefined,
  ].filter((items): items is unknown[] => Array.isArray(items));

  candidateArrays.forEach((items) => {
    items.forEach((item) => {
      const mediaUrl = firstMediaUrl(item);
      if (mediaUrl && /^https?:\/\//i.test(mediaUrl) && !urls.includes(mediaUrl)) {
        urls.push(mediaUrl);
      }
    });
  });

  return urls.slice(0, 9);
};

export async function GET(request: NextRequest) {
  const debug = request.nextUrl.searchParams.get("debug") === "1";
  const requestedUsername = request.nextUrl.searchParams
    .get("username")
    ?.trim()
    .replace(/^@/, "");

  const username = requestedUsername || FALLBACK_PROFILE.username;
  const rapidApiKey = firstEnv(
    "RAPIDAPI_KEY",
    "RAPID_API_KEY",
    "NEXT_PUBLIC_RAPIDAPI_KEY",
    "NEXT_PUBLIC_RAPID_API_KEY"
  );
  const rapidApiHostRaw = firstEnv("RAPIDAPI_HOST", "RAPID_API_HOST");
  const rapidApiProfilePath = firstEnv("RAPIDAPI_PROFILE_PATH", "RAPID_API_PROFILE_PATH");
  const rapidApiProfileMethodRaw = firstEnv(
    "RAPIDAPI_PROFILE_METHOD",
    "RAPID_API_PROFILE_METHOD"
  );
  const rapidApiUsernameParam = firstEnv(
    "RAPIDAPI_USERNAME_PARAM",
    "RAPID_API_USERNAME_PARAM"
  );
  const rapidApiMediaPathRaw = firstEnv("RAPIDAPI_MEDIA_PATH", "RAPID_API_MEDIA_PATH");
  const rapidApiMediaMethodRaw = firstEnv("RAPIDAPI_MEDIA_METHOD", "RAPID_API_MEDIA_METHOD");
  const rapidApiMediaParamRaw = firstEnv("RAPIDAPI_MEDIA_PARAM", "RAPID_API_MEDIA_PARAM");

  const normalizedHost = normalizeHost(
    rapidApiHostRaw || "instagram-scraper-api2.p.rapidapi.com"
  );
  const rapidApiHost = normalizedHost.host || "instagram-scraper-api2.p.rapidapi.com";
  const isInstagram120 = /(^|\.)instagram120(\.|$)/i.test(rapidApiHost);
  const defaultPath = isInstagram120 ? "/api/instagram/profile" : "/v1/info";
  const defaultMethod: "GET" | "POST" = isInstagram120 ? "POST" : "GET";
  const endpointPath = joinPaths(normalizedHost.basePath, rapidApiProfilePath || defaultPath);
  const method = normalizeMethod(rapidApiProfileMethodRaw || defaultMethod);
  const usernameParam = rapidApiUsernameParam || (method === "POST" ? "username" : "username_or_id_or_url");
  const attempts: AttemptLog[] = [];

  const requestProfile = async (strategy: RequestStrategy) => {
    const endpoint = new URL(`https://${rapidApiHost}${strategy.path}`);
    const headers: Record<string, string> = {
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": rapidApiHost,
    };
    const init: RequestInit & { next: { revalidate: number } } = {
      method: strategy.method,
      headers,
      next: { revalidate: 900 },
    };

    if (strategy.method === "GET") {
      endpoint.searchParams.set(strategy.usernameParam, username);
    } else {
      headers["content-type"] = "application/json";
      init.body = JSON.stringify({ [strategy.usernameParam]: username });
    }

    try {
      const response = await fetch(endpoint.toString(), init);

      if (!response.ok) {
        let bodySnippet = "";
        try {
          bodySnippet = (await response.text()).slice(0, 250);
        } catch {
          bodySnippet = "";
        }
        const reason = debug
          ? `rapidapi_http_${response.status}${bodySnippet ? `:${bodySnippet}` : ""}`
          : `rapidapi_http_${response.status}`;

        attempts.push({
          endpoint: endpoint.toString(),
          host: rapidApiHost,
          path: strategy.path,
          method: strategy.method,
          usernameParam: strategy.usernameParam,
          status: response.status,
          reason,
        });

        return { profile: null as InstagramProfile | null, reason, status: response.status };
      }

      const payload = (await response.json()) as unknown;
      const profile = parseProfile(payload, username);

      if (!profile) {
        const topKeys =
          payload && typeof payload === "object"
            ? Object.keys(payload as Record<string, unknown>).slice(0, 8).join(",")
            : "non_object";
        const reason = `parse_failed:${topKeys}`;

        attempts.push({
          endpoint: endpoint.toString(),
          host: rapidApiHost,
          path: strategy.path,
          method: strategy.method,
          usernameParam: strategy.usernameParam,
          status: "parse_error",
          reason,
        });

        return { profile: null as InstagramProfile | null, reason, status: "parse_error" as const };
      }

      attempts.push({
        endpoint: endpoint.toString(),
        host: rapidApiHost,
        path: strategy.path,
        method: strategy.method,
        usernameParam: strategy.usernameParam,
        status: 200,
      });

      return { profile, reason: "", status: 200 as const };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown_error";
      attempts.push({
        endpoint: endpoint.toString(),
        host: rapidApiHost,
        path: strategy.path,
        method: strategy.method,
        usernameParam: strategy.usernameParam,
        status: "error",
        reason,
      });
      return { profile: null as InstagramProfile | null, reason, status: "error" as const };
    }
  };

  const requestMedia = async (strategy: RequestStrategy) => {
    const endpoint = new URL(`https://${rapidApiHost}${strategy.path}`);
    const headers: Record<string, string> = {
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": rapidApiHost,
    };
    const init: RequestInit & { next: { revalidate: number } } = {
      method: strategy.method,
      headers,
      next: { revalidate: 900 },
    };

    if (strategy.method === "GET") {
      endpoint.searchParams.set(strategy.usernameParam, username);
    } else {
      headers["content-type"] = "application/json";
      init.body = JSON.stringify({ [strategy.usernameParam]: username });
    }

    try {
      const response = await fetch(endpoint.toString(), init);

      if (!response.ok) {
        attempts.push({
          endpoint: endpoint.toString(),
          host: rapidApiHost,
          path: strategy.path,
          method: strategy.method,
          usernameParam: strategy.usernameParam,
          status: response.status,
          reason: `media_http_${response.status}`,
        });
        return [];
      }

      const payload = (await response.json()) as unknown;
      const mediaUrls = collectMediaFromPayload(payload);

      attempts.push({
        endpoint: endpoint.toString(),
        host: rapidApiHost,
        path: strategy.path,
        method: strategy.method,
        usernameParam: strategy.usernameParam,
        status: mediaUrls.length ? 200 : "parse_error",
        reason: mediaUrls.length ? undefined : "media_parse_failed",
      });

      return mediaUrls;
    } catch (error) {
      attempts.push({
        endpoint: endpoint.toString(),
        host: rapidApiHost,
        path: strategy.path,
        method: strategy.method,
        usernameParam: strategy.usernameParam,
        status: "error",
        reason: error instanceof Error ? error.message : "media_unknown_error",
      });
      return [];
    }
  };

  const requestInstagramWebProfile = async () => {
    const endpoint = new URL("https://i.instagram.com/api/v1/users/web_profile_info/");
    endpoint.searchParams.set("username", username);

    try {
      const response = await fetch(endpoint.toString(), {
        headers: {
          "x-ig-app-id": "936619743392459",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        next: { revalidate: 900 },
      });

      if (!response.ok) {
        attempts.push({
          endpoint: endpoint.toString(),
          host: "i.instagram.com",
          path: endpoint.pathname,
          method: "GET",
          usernameParam: "username",
          status: response.status,
          reason: `instagram_web_http_${response.status}`,
        });
        return null;
      }

      const payload = (await response.json()) as unknown;
      const profile = parseProfile(payload, username);

      attempts.push({
        endpoint: endpoint.toString(),
        host: "i.instagram.com",
        path: endpoint.pathname,
        method: "GET",
        usernameParam: "username",
        status: profile ? 200 : "parse_error",
        reason: profile ? undefined : "instagram_web_parse_failed",
      });

      return profile;
    } catch (error) {
      attempts.push({
        endpoint: endpoint.toString(),
        host: "i.instagram.com",
        path: endpoint.pathname,
        method: "GET",
        usernameParam: "username",
        status: "error",
        reason: error instanceof Error ? error.message : "instagram_web_unknown_error",
      });
      return null;
    }
  };

  const diagnostics = {
    endpoint: `https://${rapidApiHost}${endpointPath}`,
    host: rapidApiHost,
    path: endpointPath,
    method,
    usernameParam,
    hasKey: Boolean(rapidApiKey),
  };

  if (!rapidApiKey) {
    const webProfile = await requestInstagramWebProfile();
    const response: ApiResponse = {
      profile: webProfile ? mergeProfiles({ ...FALLBACK_PROFILE, username }, webProfile) : { ...FALLBACK_PROFILE, username },
      source: "fallback",
      reason: webProfile ? "instagram_web_profile_fallback" : "missing_rapidapi_key",
      diagnostics: debug ? diagnostics : undefined,
    };
    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  }

  try {
    const primaryStrategy: RequestStrategy = {
      path: endpointPath,
      method,
      usernameParam,
    };
    let primaryResult = await requestProfile(primaryStrategy);

    const hasCustomStrategy = Boolean(
      rapidApiProfilePath || rapidApiProfileMethodRaw || rapidApiUsernameParam
    );

    if (!primaryResult.profile && !hasCustomStrategy && primaryResult.status === 404) {
      const alternateMethod: "GET" | "POST" = primaryStrategy.method === "GET" ? "POST" : "GET";
      const alternatePath = joinPaths(
        normalizedHost.basePath,
        alternateMethod === "POST" ? "/api/instagram/profile" : "/v1/info"
      );
      const alternateParam =
        alternateMethod === "POST" ? "username" : "username_or_id_or_url";

      const alternateResult = await requestProfile({
        path: alternatePath,
        method: alternateMethod,
        usernameParam: alternateParam,
      });

      if (alternateResult.profile) {
        primaryResult = alternateResult;
      } else if (alternateResult.reason) {
        const joinedReason = `${primaryResult.reason};alt_attempt:${alternateResult.reason}`;
        primaryResult = { ...primaryResult, reason: joinedReason };
      }
    }

    if (!primaryResult.profile) throw new Error(primaryResult.reason || "rapidapi_request_failed");

    const profile = primaryResult.profile;
    let profileWithMedia = profile;
    const webProfile = await requestInstagramWebProfile();

    if (webProfile) {
      profileWithMedia = mergeProfiles(profileWithMedia, webProfile);
    }

    if (!profileWithMedia.recentMedia.length) {
      const mediaStrategies: RequestStrategy[] = [];

      if (rapidApiMediaPathRaw) {
        mediaStrategies.push({
          path: joinPaths(normalizedHost.basePath, rapidApiMediaPathRaw),
          method: normalizeMethod(rapidApiMediaMethodRaw || "GET"),
          usernameParam: rapidApiMediaParamRaw || "username",
        });
      } else if (isInstagram120) {
        mediaStrategies.push(
          {
            path: joinPaths(normalizedHost.basePath, "/api/instagram/posts"),
            method: "POST",
            usernameParam: "username",
          },
          {
            path: joinPaths(normalizedHost.basePath, "/api/instagram/posts"),
            method: "GET",
            usernameParam: "username",
          },
          {
            path: joinPaths(normalizedHost.basePath, "/api/instagram/feed"),
            method: "GET",
            usernameParam: "username",
          }
        );
      }

      for (const strategy of mediaStrategies) {
        const mediaUrls = await requestMedia(strategy);
        if (mediaUrls.length) {
          profileWithMedia = { ...profileWithMedia, recentMedia: mediaUrls };
          break;
        }
      }
    }

    const result: ApiResponse = {
      profile: profileWithMedia,
      source: "rapidapi",
      diagnostics: debug ? { ...diagnostics, attempts } : undefined,
    };
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch (error) {
    console.error("Instagram profile sync error:", error);
    const reason = error instanceof Error ? error.message : "unknown_error";
    const webProfile = await requestInstagramWebProfile();
    const response: ApiResponse = {
      profile: webProfile ? mergeProfiles({ ...FALLBACK_PROFILE, username }, webProfile) : { ...FALLBACK_PROFILE, username },
      source: "fallback",
      reason: reason.slice(0, 280),
      diagnostics: debug ? { ...diagnostics, attempts } : undefined,
    };
    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  }
}
