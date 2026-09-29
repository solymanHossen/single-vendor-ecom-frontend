import type { Metadata } from "next"
import Link from "next/link"
import { Clock, Mail, MapPin, Phone, MessageCircle } from "lucide-react"
import { getStoreSettings } from "@/lib/backend-settings"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contact Support",
  description: "Get help with your orders or ask us any questions.",
}

export default async function ContactPage() {
  const settings = await getStoreSettings()
  const whatsapp = settings.whatsappNumber?.replace(/[^\d]/g, "")

  return (
    <div className="page-container py-12 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Contact Support
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We're here to help. Reach out to us through any of the channels below or open a support ticket for order-related issues.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Contact Information</h2>
              <ul className="space-y-4">
                {settings.supportPhone && (
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Phone Support</p>
                      <a href={`tel:${settings.supportPhone.replace(/[\s-]/g, "")}`} className="hover:text-primary hover:underline">
                        {settings.supportPhone}
                      </a>
                    </div>
                  </li>
                )}
                {whatsapp && (
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <MessageCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">WhatsApp</p>
                      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">
                        Message us on WhatsApp
                      </a>
                    </div>
                  </li>
                )}
                {settings.supportEmail && (
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Email Support</p>
                      <a href={`mailto:${settings.supportEmail}`} className="hover:text-primary hover:underline">
                        {settings.supportEmail}
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {(settings.storeAddress || settings.businessHours) && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-foreground">Store Details</h2>
                <ul className="space-y-4">
                  {settings.storeAddress && (
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Location</p>
                        <p>{settings.storeAddress}</p>
                      </div>
                    </li>
                  )}
                  {settings.businessHours && (
                    <li className="flex items-start gap-3 text-muted-foreground">
                      <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Business Hours</p>
                        <p>{settings.businessHours}</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold text-foreground">Order Issues?</h2>
              <p className="mb-6 text-muted-foreground">
                For the fastest resolution regarding an existing order, return request, or warranty claim, please open a support ticket from your account dashboard.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href="/dashboard/support/new">Open a Support Ticket</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
