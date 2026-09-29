import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getAdminAccess } from "@/lib/admin-access"
import { getAdminPage } from "@/lib/backend-pages"
import { EditPageForm } from "./edit-page-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Edit Page",
}

export default async function EditAdminPage({ params }: PageProps) {
  const { accessToken, can } = await getAdminAccess()
  if (!can("settings.manage")) notFound()

  const resolvedParams = await params
  const id = parseInt(resolvedParams.id, 10)
  if (isNaN(id)) notFound()

  const page = await getAdminPage(accessToken, id)
  if (!page) notFound()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/pages"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back to pages</span>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Edit Page: {page.title}
          </h1>
          <p className="text-[15px] text-muted-foreground">
            /{page.slug}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <EditPageForm page={page} />
      </div>
    </div>
  )
}
