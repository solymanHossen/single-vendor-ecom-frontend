"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { updatePageAction } from "@/actions/pages.actions"
import type { PageData } from "@/lib/backend-pages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function EditPageForm({ page }: { page: PageData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(page.title)
  const [content, setContent] = useState(page.content)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updatePageAction(page.id, { title, content })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Page updated successfully")
        router.refresh()
        router.push("/admin/pages")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Page Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <p className="text-[13px] text-muted-foreground">
          This is the main heading displayed at the top of the page.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Page Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="min-h-[400px] resize-y font-mono text-sm leading-relaxed"
        />
        <p className="text-[13px] text-muted-foreground">
          Write your page content here. Line breaks and spacing will be preserved exactly as you type them.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="px-6"
          onClick={() => router.push("/admin/pages")}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" size="lg" className="px-8" disabled={isPending}>
          <Save className="mr-2 size-5" />
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
