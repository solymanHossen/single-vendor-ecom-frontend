import { Header } from "@/components/header"
import { Footer } from "@/components/storefront/footer"

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
      <Header activeTab="shop" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
