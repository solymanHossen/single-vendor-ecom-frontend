import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPage } from "@/lib/backend-pages"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const page = await getPage(resolvedParams.slug)
  
  if (!page) {
    return {
      title: "Page Not Found",
    }
  }

  return {
    title: page.title,
    description: `Read the ${page.title} for our store.`,
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params
  const page = await getPage(resolvedParams.slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="page-container py-12 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {page.title}
        </h1>
        {/* We use whitespace-pre-wrap to respect newlines from the simple text CMS */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {page.content}
        </div>
      </div>
    </div>
  )
}
