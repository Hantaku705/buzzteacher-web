export function detectPlatform(
  url: string,
): "TikTok" | "YouTube" | "Instagram" | "X" | null {
  const lowUrl = url.toLowerCase();
  if (lowUrl.includes("tiktok.com")) return "TikTok";
  if (lowUrl.includes("youtube.com") || lowUrl.includes("youtu.be"))
    return "YouTube";
  if (lowUrl.includes("instagram.com")) return "Instagram";
  if (lowUrl.includes("twitter.com") || lowUrl.includes("x.com")) return "X";
  return null;
}

export function extractTikTokId(url: string): string | null {
  // Pattern 1: /video/1234567890 or /photo/1234567890
  const match = url.match(/\/(video|photo)\/(\d+)/);
  if (match) return match[2];

  // Pattern 2: 8+ digit number
  const idMatch = url.match(/(\d{8,})/);
  return idMatch ? idMatch[1] : null;
}

export function isTikTokProfileUrl(url: string): boolean {
  // Profile URL: https://www.tiktok.com/@username (without /video/ or /photo/)
  if (!url.toLowerCase().includes("tiktok.com")) return false;
  if (url.includes("/video/") || url.includes("/photo/")) return false;
  return /@[^/]+/.test(url);
}

export function extractTikTokUsername(url: string): string | null {
  // Extract @username from TikTok profile URL
  const match = url.match(/tiktok\.com\/@([^/?#]+)/i);
  return match ? match[1] : null;
}

export function extractYouTubeId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.replace(/^www\./, "").toLowerCase();

    // youtu.be format
    if (host === "youtu.be") {
      const match = urlObj.pathname.match(/^\/([A-Za-z0-9_-]{6,})/);
      return match ? match[1] : null;
    }

    // youtube.com format
    if (host.includes("youtube.com")) {
      // /watch?v=xxx
      if (urlObj.pathname === "/watch") {
        return urlObj.searchParams.get("v");
      }
      // /shorts/xxx, /embed/xxx, /live/xxx
      const match = urlObj.pathname.match(
        /^\/(shorts|embed|live)\/([A-Za-z0-9_-]{6,})/,
      );
      return match ? match[2] : null;
    }
  } catch {
    // Fallback: extract from query param
    const match = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/i);
    return match ? match[1] : null;
  }
  return null;
}

export function extractInstagramShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel)\/([^/?#]+)/i);
  return match ? match[1] : null;
}

export function extractXId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

export function extractVideoUrl(input: string): string | null {
  // URL pattern
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const matches = input.match(urlPattern);
  return matches ? matches[0] : null;
}
