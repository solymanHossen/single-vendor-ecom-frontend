import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "Learn about our 7-day easy return and exchange policy.",
}

export default function ReturnsPage() {
  return (
    <div className="page-container py-12 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <RefreshCcw className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Returns & Exchanges
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We offer a hassle-free 7-day return policy to ensure you are completely satisfied with your purchase.
          </p>
        </div>

        <div className="space-y-8 rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <div>
            <h2 className="mb-3 text-xl font-semibold text-foreground">How to Return an Item</h2>
            <ol className="list-decimal space-y-3 pl-5 text-muted-foreground marker:text-foreground/70 marker:font-medium">
              <li>Sign in to your account and go to your Orders dashboard.</li>
              <li>Select the order containing the item you wish to return.</li>
              <li>Click the "Request Return" button and provide a reason for the return.</li>
              <li>Once approved, you will receive instructions on how to ship the item back to us.</li>
            </ol>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-foreground">Return Conditions</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground marker:text-foreground/50">
              <li>Items must be returned within 7 days of the delivery date.</li>
              <li>Items must be unused, in their original packaging, with all tags attached.</li>
              <li>Electronics and appliances must not be opened or tampered with unless defective.</li>
              <li>Clearance or sale items may be final sale and not eligible for return.</li>
            </ul>
          </div>

          <div className="rounded-xl bg-muted/40 p-5">
            <h3 className="mb-2 font-medium text-foreground">Ready to start a return?</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              You can initiate your return process directly from your order history.
            </p>
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <Link href="/dashboard/orders" className="group">
                Go to My Orders
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
