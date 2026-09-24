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
