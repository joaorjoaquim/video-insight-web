export type VideoPlatform = "youtube" | "vimeo" | "twitter" | "instagram" | "unknown";

export interface VideoMetadata {
  platform: VideoPlatform;
  url: string;
  title: string;
  duration?: string;
  thumbnail?: string;
  channel?: string;
  author?: string;
  publishedAt?: string;
}

// --- YouTube ---
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getYouTubeMetadata(url: string): Promise<VideoMetadata | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    platform: "youtube",
    url,
    title: data.title,
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    channel: data.author_name,
  };
}

// --- Vimeo ---
function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

async function getVimeoMetadata(url: string): Promise<VideoMetadata | null> {
  const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
  const res = await fetch(oembedUrl);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    platform: "vimeo",
    url,
    title: data.title,
    thumbnail: data.thumbnail_url,
    channel: data.author_name,
    duration: data.duration ? `${Math.floor(data.duration/60)}:${String(data.duration%60).padStart(2,"0")}` : undefined,
  };
}

// --- Twitter ---
function isTwitterUrl(url: string) {
  return /twitter\.com\/.+\/status\//.test(url);
}

async function getTwitterMetadata(url: string): Promise<VideoMetadata | null> {
  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
  const res = await fetch(oembedUrl);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    platform: "twitter",
    url,
    title: data.title || "Twitter Post",
    thumbnail: undefined, // Twitter oEmbed não retorna thumbnail
    channel: data.author_name,
  };
}

// --- Instagram ---
function isInstagramUrl(url: string) {
  return /instagram\.com\//.test(url);
}

async function getInstagramMetadata(url: string): Promise<VideoMetadata | null> {
  const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
  const res = await fetch(oembedUrl);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    platform: "instagram",
    url,
    title: data.title || "Instagram Post",
    thumbnail: data.thumbnail_url,
    channel: data.author_name,
  };
}

// --- Detect Platform ---
export function detectPlatform(url: string): VideoPlatform {
  if (extractYouTubeId(url)) return "youtube";
  if (extractVimeoId(url)) return "vimeo";
  if (isTwitterUrl(url)) return "twitter";
  if (isInstagramUrl(url)) return "instagram";
  return "unknown";
}

// --- Main Entrypoint ---
export async function getVideoMetadata(url: string): Promise<VideoMetadata | null> {
  const platform = detectPlatform(url);
  if (platform === "youtube") return getYouTubeMetadata(url);
  if (platform === "vimeo") return getVimeoMetadata(url);
  if (platform === "twitter") return getTwitterMetadata(url);
  if (platform === "instagram") return getInstagramMetadata(url);
  return null;
}

export function isValidVideoUrl(url: string): boolean {
  return detectPlatform(url) !== "unknown";
} 