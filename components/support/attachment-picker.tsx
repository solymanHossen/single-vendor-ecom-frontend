"use client"

import * as React from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { uploadTicketAttachmentAction } from "@/actions/ticket.actions"
import { MAX_ATTACHMENTS } from "@/lib/backend-tickets"
import { checkImage, IMAGE_ACCEPT } from "@/lib/upload-rules"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Pending {
  key: string
  preview: string
  url: string | null
}

type UploadAction = (formData: FormData) => Promise<{ url: string } | { error: string }>

/** Uploads photos as soon as they're picked (or pasted); the form only sends URLs. */
export function useAttachments({
  upload = uploadTicketAttachmentAction,
  max = MAX_ATTACHMENTS,
  initial = [],
}: { upload?: UploadAction; max?: number; initial?: string[] } = {}) {
  const [items, setItems] = React.useState<Pending[]>(() =>
    initial.map((url) => ({ key: url, preview: url, url }))
  )
  const uploading = items.some((item) => item.url === null)
  const urls = items.flatMap((item) => (item.url ? [item.url] : []))

  const add = React.useCallback(
    (files: Iterable<File>) => {
      const room = max - items.length
      const picked = [...files]
      if (picked.length > room) {
        toast.warning(`Up to ${max} photos`, {
          description: room > 0 ? `Only the first ${room} were added.` : "Remove one to add another.",
        })
      }
      for (const file of picked.slice(0, Math.max(0, room))) {
        const problem = checkImage(file, "attachment")
        if (problem) {
          toast.error(problem.title, { description: problem.description })
          continue
        }
        const key = crypto.randomUUID()
        const preview = URL.createObjectURL(file)
        setItems((prev) => [...prev, { key, preview, url: null }])
        const formData = new FormData()
        formData.append("file", file)
        void upload(formData).then((result) => {
          if ("error" in result) {
            toast.error("Couldn't attach photo", { description: result.error })
            setItems((prev) => prev.filter((item) => item.key !== key))
            URL.revokeObjectURL(preview)
            return
          }
          setItems((prev) => prev.map((item) => (item.key === key ? { ...item, url: result.url } : item)))
        })
      }
    },
    [items.length, max, upload]
  )

  const remove = (key: string) =>
    setItems((prev) => {
      const gone = prev.find((item) => item.key === key)
      if (gone?.preview.startsWith("blob:")) URL.revokeObjectURL(gone.preview)
      return prev.filter((item) => item.key !== key)
    })

  const clear = () =>
    setItems((prev) => {
      prev.forEach((item) => item.preview.startsWith("blob:") && URL.revokeObjectURL(item.preview))
      return []
    })

  /** Paste a screenshot straight into the message box. */
  const onPaste = (event: React.ClipboardEvent) => {
    const files = [...event.clipboardData.files].filter((file) => file.type.startsWith("image/"))
    if (files.length > 0) {
      event.preventDefault()
      add(files)
    }
  }

  return { items, urls, uploading, add, remove, clear, onPaste, full: items.length >= max }
}

export type Attachments = ReturnType<typeof useAttachments>

export function AttachButton({ attachments, className }: { attachments: Attachments; className?: string }) {
  const input = React.useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files) attachments.add(event.target.files)
          event.target.value = ""
        }}
      />
      <Button
        type="button"
        variant="ghost"
        className={cn("h-10 rounded-xl text-muted-foreground", className)}
        disabled={attachments.full}
        onClick={() => input.current?.click()}
      >
        <ImagePlus className="size-4" />
        <span className="hidden sm:inline">Add photos</span>
      </Button>
    </>
  )
}

export function AttachmentTray({ attachments }: { attachments: Attachments }) {
  if (attachments.items.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Attached photos">
      {attachments.items.map((item) => (
        <li key={item.key} className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
          <img
            src={item.preview}
            alt=""
            className={cn("size-16 rounded-xl border border-border/70 object-cover", item.url === null && "opacity-50")}
          />
          {item.url === null && (
            <Loader2 className="absolute inset-0 m-auto size-5 animate-spin text-foreground" aria-label="Uploading" />
          )}
          <button
            type="button"
            onClick={() => attachments.remove(item.key)}
            aria-label="Remove photo"
            className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow-sm"
          >
            <X className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  )
}
