import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, RotateCcw, Wallet } from "lucide-react"
import { Logo } from "@/components/brand/logo"

const STORE_PHOTO =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&w=1400&q=80"

const PROMISES = [
  { icon: BadgeCheck, text: "100% authentic products with official warranty" },
  { icon: Wallet, text: "Cash on delivery across all 64 districts" },
  { icon: RotateCcw, text: "7-day easy returns with free pickup" },
] as const

/**
 * Split-screen auth layout: the form on the left (always focused and
 * readable), a calm brand panel on the right that disappears on small
 * screens so phones get a clean, full-width form.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-xl focus:outline-none"
          >
            <Logo size="sm" framed={false} />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              AURA
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to store
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground lg:justify-between">
          <span>© {new Date().getFullYear()} AURA</span>
          <span>
            Need help?{" "}
            <Link
              href="/contact"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Contact support
            </Link>
          </span>
        </footer>
      </div>

      <aside className="relative hidden p-4 lg:block" aria-hidden="true">
        <div className="relative h-full overflow-hidden rounded-[2rem] bg-muted">
          <Image
            src={STORE_PHOTO}
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 space-y-6 p-12 text-white xl:p-16">
            <h2 className="max-w-md text-4xl leading-tight font-semibold tracking-tight xl:text-5xl">
              Everything you love, delivered to your door.
            </h2>
            <ul className="space-y-3">
              {PROMISES.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 text-base text-white/90"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                    <Icon className="size-4.5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  )
}
