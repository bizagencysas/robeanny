import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const firstEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const allowedHost = (hostname: string, rapidApiHost: string) => {
  const host = hostname.toLowerCase();
  if (rapidApiHost && host === rapidApiHost.toLowerCase()) return true;

  return (
    host.endsWith(".p.rapidapi.com") ||
    host.endsWith(".cdninstagram.com") ||
    host.endsWith(".fbcdn.net") ||
    host.endsWith(".instagram.com") ||
    host.endsWith(".cloudinary.com") ||
    host === "unavatar.io"
  );
};

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return new NextResponse("Invalid protocol", { status: 400 });
  }

  const rapidApiHost = firstEnv("RAPIDAPI_HOST", "RAPID_API_HOST").replace(
    /^https?:\/\//i,
    ""
  ).replace(/\/.*$/, "");

  if (!allowedHost(target.hostname, rapidApiHost)) {
    return new NextResponse("Host not allowed", { status: 403 });
  }

  const headers: Record<string, string> = {
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  };

  if (target.hostname.endsWith(".p.rapidapi.com")) {
    const rapidApiKey = firstEnv("RAPIDAPI_KEY", "RAPID_API_KEY");
    if (!rapidApiKey) {
      return new NextResponse("Missing RAPIDAPI_KEY", { status: 500 });
    }
    headers["x-rapidapi-key"] = rapidApiKey;
    headers["x-rapidapi-host"] = target.hostname;
  }

  try {
    const response = await fetch(target.toString(), {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return new NextResponse("Asset fetch failed", { status: 404 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse("Asset proxy error", { status: 502 });
  }
}
