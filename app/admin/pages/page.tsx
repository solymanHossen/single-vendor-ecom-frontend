import type { Metadata } from "next"
import Link from "next/link"
import { PencilLine, FileText } from "lucide-react"
import { getAdminAccess } from "@/lib/admin-access"
import { getAdminPages } from "@/lib/backend-pages"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Manage Pages",
}

export default async function AdminPagesList() {
  const { accessToken, can } = await getAdminAccess()
  if (!can("settings.manage")) return null

  const pages = await getAdminPages(accessToken)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Static Pages
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Manage the content for your store's information pages.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-6 py-4 font-medium text-muted-foreground">Page Title</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Slug</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Last Updated</th>
              <th className="px-6 py-4 text-right font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y text-foreground">
            {pages.map((page) => (
              <tr key={page.id} className="transition-colors hover:bg-muted/30">
                <td className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="size-4 text-primary" />
                    </div>
                    {page.title}
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">/{page.slug}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {new Date(page.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/pages/${page.id}`}>
                      <PencilLine className="mr-2 size-4" />
                      Edit
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No pages found. Seed the database to create them.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
