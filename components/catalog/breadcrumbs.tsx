import * as React from "react"
import Link from "next/link"
import { Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

export interface Crumb {
  label: string
  href?: string
}

/**
 * Storefront breadcrumb built on shadcn/ui's Breadcrumb primitives. The
 * first crumb renders as a home icon; on small screens the middle crumbs
 * collapse into "…" so long trails never wrap onto two lines.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[]
  className?: string
}) {
  const lastIndex = items.length - 1

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="flex-nowrap gap-2 text-[15px] sm:gap-2.5">
        {items.map((item, index) => {
          const isFirst = index === 0
          const isLast = index === lastIndex
          // Middle crumbs are hidden on mobile; the ellipsis stands in for them.
          const isMiddle = !isFirst && !isLast && index !== lastIndex - 1
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {index === 1 && items.length > 3 && (
                <>
                  <BreadcrumbItem className="sm:hidden">
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="sm:hidden [&>svg]:size-4" />
                </>
              )}
              <BreadcrumbItem
                className={cn(
                  "shrink-0",
                  isMiddle && "hidden sm:inline-flex",
                  isLast && "min-w-0 shrink"
                )}
              >
                {isLast || !item.href ? (
                  <BreadcrumbPage className="truncate font-medium text-foreground">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "rounded-md text-muted-foreground transition-colors hover:text-foreground",
                        isFirst && "flex items-center"
                      )}
                    >
                      {isFirst ? (
                        <>
                          <Home className="size-4.5" aria-hidden="true" />
                          <span className="sr-only">{item.label}</span>
                        </>
                      ) : (
                        item.label
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator
                  className={cn(
                    "text-muted-foreground/60 [&>svg]:size-4",
                    isMiddle && "hidden sm:block"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
