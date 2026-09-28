/**
 * One set of image-upload rules, enforced twice: in the browser (instant,
 * friendly toast, no wasted upload) and again in the server action (the
 * real boundary — the browser check can be bypassed).
 *
 * Keep every limit below SERVER_ACTION_BODY_LIMIT in next.config.mjs, and
 * below the API's STORAGE_MAX_FILE_SIZE_MB (10 MB).
 */

const MB = 1024 * 1024

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const IMAGE_ACCEPT = IMAGE_TYPES.join(",")
export const IMAGE_TYPES_LABEL = "JPG, PNG or WebP"

export const UPLOAD_LIMITS = {
  logo: 2 * MB,
  avatar: 2 * MB,
  product: 5 * MB,
  banner: 5 * MB,
  /** Photos attached to support requests. */
  attachment: 5 * MB,
} as const

export type UploadKind = keyof typeof UPLOAD_LIMITS

export function formatBytes(bytes: number): string {
  // "2 MB", "3.4 MB" — no trailing ".0".
  if (bytes >= MB) return `${Number((bytes / MB).toFixed(1))} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export interface UploadProblem {
  title: string
  description: string
}

/** Null when the file is fine; otherwise a toast-ready explanation. */
export function checkImage(
  file: { name: string; type: string; size: number },
  kind: UploadKind
): UploadProblem | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return {
      title: "Unsupported file",
      description: `${file.name} isn't an image we can use. Choose a ${IMAGE_TYPES_LABEL} file.`,
    }
  }
  if (file.size === 0) {
    return { title: "Empty file", description: `${file.name} is empty. Choose another image.` }
  }
  const limit = UPLOAD_LIMITS[kind]
  if (file.size > limit) {
    return {
      title: "Image too large",
      description: `${file.name} is ${formatBytes(file.size)} — the limit is ${formatBytes(limit)}. Compress or resize it, then try again.`,
    }
  }
  return null
}
