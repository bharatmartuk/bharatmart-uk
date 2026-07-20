export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for using the Bharat Mart UK marketplace.',
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-8 lg:px-16">
      <h1 className="font-heading text-3xl font-semibold text-[#1e1b16]">Terms of Service</h1>
      <p className="mt-2 text-sm text-[#837561]">Last updated: 20 July 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-7 text-[#514534]">
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">1. Agreement</h2>
          <p>
            By accessing or using Bharat Mart UK, you agree to these Terms of Service. If you do not agree,
            please do not use the marketplace.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">2. Our role</h2>
          <p>
            Bharat Mart UK is a multi-merchant marketplace. Products are sold by independent merchants. We
            provide the platform, payment facilitation, and support tools, but merchants are responsible for
            product descriptions, stock, fulfilment quality, and applicable product compliance unless stated
            otherwise.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">3. Accounts</h2>
          <p>
            You must provide accurate information when creating an account and keep your login details
            secure. You are responsible for activity under your account. We may suspend accounts that misuse
            the platform or breach these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">4. Orders & payments</h2>
          <p>
            Placing an order is an offer to purchase from the relevant merchant(s). Prices are shown in GBP
            and include applicable taxes where indicated. Payment is collected through our payment partners.
            An order may be cancelled if stock is unavailable, payment fails, or fraud checks require it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">5. Delivery</h2>
          <p>
            Delivery times and coverage depend on the merchant and your postcode. Estimated delivery windows
            are indicative only. Risk in goods passes according to the fulfilment arrangements shown at
            checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">6. Returns & refunds</h2>
          <p>
            Return eligibility follows UK consumer law and each merchant&apos;s stated policy for the product
            type (including perishable or handmade foods, where special rules may apply). Contact support or
            the merchant promptly if there is an issue with your order.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">7. Acceptable use</h2>
          <p>
            You must not misuse the site, attempt unauthorised access, scrape content at scale, post false
            reviews, or use the platform for unlawful activity. Merchants must only list authentic products
            they are authorised to sell.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">8. Liability</h2>
          <p>
            To the fullest extent permitted by law, Bharat Mart UK is not liable for indirect or
            consequential losses. Nothing in these terms limits liability that cannot be excluded under UK
            law, including for death or personal injury caused by negligence, or for fraud.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">9. Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the marketplace after changes are
            posted means you accept the updated terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">10. Contact</h2>
          <p>
            For questions about these terms, email{' '}
            <a className="font-semibold text-[#8a3a2a] hover:underline" href="mailto:info@bharatmart.uk">
              info@bharatmart.uk
            </a>{' '}
            or WhatsApp +44 7901 241275.
          </p>
        </section>
      </div>
    </main>
  )
}
