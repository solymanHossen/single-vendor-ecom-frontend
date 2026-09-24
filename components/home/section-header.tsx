import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LinkPending } from "@/components/catalog/link-pending"

interface SectionHeaderProps {
  title: string
  description?: string
  action?: { label: string; href: string }
}

/** One heading pattern for every home-page section, so the page reads as a system. */
export function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="text-base text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 text-[15px] font-medium text-foreground underline-offset-4 hover:underline"
        >
          {action.label}
          <LinkPending className="size-4">
            <ArrowRight className="size-4" />
          </LinkPending>
        </Link>
      )}
    </div>
  )
}
