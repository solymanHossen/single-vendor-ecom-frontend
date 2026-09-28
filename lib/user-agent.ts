/** "Chrome on Windows" from a User-Agent string. Good enough for a sessions list. */
export function describeDevice(userAgent: string | null): { label: string; mobile: boolean } {
  if (!userAgent || userAgent === "unknown") return { label: "Unknown device", mobile: false }
  const ua = userAgent

  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /SamsungBrowser/.test(ua) ? "Samsung Internet"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : /^curl\//.test(ua) ? "curl"
    : /^node$|node-fetch|undici/.test(ua) ? "Server"
    : null

  const os =
    /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
    : /Windows/.test(ua) ? "Windows"
    : /Mac OS X|Macintosh/.test(ua) ? "macOS"
    : /CrOS/.test(ua) ? "ChromeOS"
    : /Linux/.test(ua) ? "Linux"
    : null

  const mobile = /Mobile|iPhone|Android/.test(ua)
  if (browser && os) return { label: `${browser} on ${os}`, mobile }
  if (browser) return { label: browser === "Server" ? "API client" : browser, mobile }
  return { label: ua.slice(0, 40), mobile }
}
