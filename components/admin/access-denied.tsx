import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Shown in place of an admin page the viewer's role doesn't include. */
export function AccessDenied({
  area,
  ownerOnly = false,
}: {
  /** e.g. "orders", "store settings" */
  area: string
  ownerOnly?: boolean
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <Lock className="size-7 text-muted-foreground" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          You don&apos;t have access to {area}
        </h1>
        <p className="text-[15px] text-muted-foreground">
          {ownerOnly
            ? "Only the store's super admin can open this area."
            : "Your staff role doesn't include this. Ask the store's super admin if you need it."}
        </p>
      </div>
      <Button asChild variant="outline" className="h-11 rounded-xl px-5">
        <Link href="/admin">
          <ArrowLeft className="size-4" />
          Back to overview
        </Link>
      </Button>
    </div>
  )
}
