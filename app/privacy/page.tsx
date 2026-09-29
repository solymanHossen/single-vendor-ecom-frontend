import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <div className="page-container py-12 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Your privacy is critically important to us. This Privacy Policy explains how we collect, use, and share information about you when you use our website.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This may include your name, email address, phone number, shipping address, and payment information.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to process transactions, send you order confirmations, provide customer support, and communicate with you about products, services, and promotions.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Data Security</h2>
          <p>
            We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access. However, no security system is impenetrable, and we cannot guarantee the absolute security of our systems.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our Support Page.
          </p>
        </div>
      </div>
    </div>
  )
}
