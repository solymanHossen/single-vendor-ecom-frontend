import { Cormorant_Garamond, Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "@/components/ui/sonner"
import { CartProvider } from "@/components/cart/cart-provider"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { StoreSettingsProvider } from "@/components/store-settings-provider"
import { getStoreSettings } from "@/lib/backend-settings"
import { cn } from "@/lib/utils";

/** Title, description and favicon all come from the admin's store settings. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings()
  return {
    title: {
      default: settings.metaTitle ?? `${settings.storeName} — ${settings.tagline}`,
      // Pages set just their own name ("Checkout"); the store name follows.
      template: `%s · ${settings.storeName}`,
    },
    description:
      settings.metaDescription ??
      `Shop ${settings.storeName}: ${settings.tagline}. Cash on delivery across Bangladesh.`,
    // The only icon source: no app/favicon.ico, whose file-convention link
    // would be listed first and win in the browser over the admin's upload.
    // Each upload gets a new URL, so browsers never keep a stale cached icon.
    icons: (() => {
      const icon = settings.faviconUrl ?? settings.logoUrl ?? "/aura-logo.png"
      return { icon, shortcut: icon, apple: icon }
    })(),
  }
}

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getStoreSettings()
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, fontSerif.variable)}
    >
      <body>
        <StoreSettingsProvider settings={settings}>
        <SessionProvider>
          <ThemeProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  )
}
