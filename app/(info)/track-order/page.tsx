import type { Metadata } from "next"
import Link from "next/link"
import { PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Check the status of your recent orders.",
}

export default function TrackOrderPage() {
  return (
    <div className="page-container py-16 lg:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-primary/10 p-4">
          <PackageSearch className="size-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-4 mb-8 text-lg text-muted-foreground">
          To track the status of your order, view shipping updates, or download your invoice, please sign in and visit your orders dashboard.
        </p>
        
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard/orders">View My Orders</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Need Help?</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
