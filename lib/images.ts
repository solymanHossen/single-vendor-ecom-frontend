// Mirrors images.remotePatterns in next.config.mjs. next/image throws at
// render time for any host not listed there, so admin-supplied URLs on other
// hosts are rendered unoptimized instead of crashing the component tree.
const OPTIMIZABLE_HOSTS = new Set(["images.unsplash.com", "localhost"])

export function isOptimizableImage(url: string): boolean {
  try {
    return OPTIMIZABLE_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

/**
 * Re-requests an Unsplash photo at the size it is actually displayed.
 * Category icons are stored as 200px thumbnails; upscaling those into large
 * menu tiles would look soft. Non-Unsplash URLs are returned unchanged.
 */
export function sizedImage(url: string, width: number, height?: number): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname !== "images.unsplash.com") return url
    parsed.searchParams.set("w", String(width))
    if (height) {
      parsed.searchParams.set("h", String(height))
      parsed.searchParams.set("fit", "crop")
    } else {
      parsed.searchParams.delete("h")
    }
    return parsed.toString()
  } catch {
    return url
  }
}
