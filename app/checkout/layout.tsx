import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { Logo } from "@/components/brand/logo"

export const metadata: Metadata = { title: "Checkout · AURA" }

/**
 * Checkout drops the storefront navigation: fewer ways out, one clear job.
 */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b border-border/70 bg-background">
        <div className="page-container flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label="AURA home">
            <Logo size="xs" framed={false} />
          </Link>
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Lock className="size-4" aria-hidden="true" />
            Secure checkout
          </p>
          <Link
            href="/products"
            className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <ArrowLeft className="size-4" />
            Continue shopping
          </Link>
        </div>
      </header>
      <main className="page-container py-8 lg:py-12">{children}</main>
    </div>
  )
}
