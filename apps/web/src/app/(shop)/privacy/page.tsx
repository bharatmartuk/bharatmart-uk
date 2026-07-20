export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Bharat Mart UK customers and merchants.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:px-8 lg:px-16">
      <h1 className="font-heading text-3xl font-semibold text-[#1e1b16]">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[#837561]">Last updated: 20 July 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-7 text-[#514534]">
        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">1. Who we are</h2>
          <p>
            Bharat Mart UK (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates an online marketplace that
            connects UK customers with verified Indian merchants. This policy explains how we collect, use,
            and protect your personal information when you use our website and related services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">2. Information we collect</h2>
          <p>We may collect:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account details such as name, email address, phone number, and password</li>
            <li>Delivery addresses and order history</li>
            <li>Payment-related information processed by our payment providers</li>
            <li>Device and usage data such as browser type, pages visited, and approximate location</li>
            <li>Messages you send us via email, WhatsApp, or support tickets</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">3. How we use your information</h2>
          <p>We use personal data to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Create and manage your account</li>
            <li>Process orders, deliveries, refunds, and customer support</li>
            <li>Communicate order updates and service messages</li>
            <li>Improve our marketplace, security, and fraud prevention</li>
            <li>Comply with legal and regulatory obligations</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">4. Sharing your information</h2>
          <p>
            We share information only where needed to run the marketplace — for example with merchants
            fulfilling your order, delivery partners, payment processors, and hosting providers. We do not
            sell your personal data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">5. Data retention & security</h2>
          <p>
            We keep personal data only as long as needed for the purposes above or as required by law. We
            use reasonable technical and organisational measures to protect your information, though no
            online service can guarantee absolute security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">6. Your rights</h2>
          <p>
            Depending on applicable UK/EU law, you may have rights to access, correct, delete, or restrict
            processing of your personal data, and to object to certain processing. To exercise these rights,
            contact us at{' '}
            <a className="font-semibold text-[#8a3a2a] hover:underline" href="mailto:info@bharatmart.uk">
              info@bharatmart.uk
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-[#1e1b16]">7. Contact</h2>
          <p>
            Questions about this policy? Email{' '}
            <a className="font-semibold text-[#8a3a2a] hover:underline" href="mailto:info@bharatmart.uk">
              info@bharatmart.uk
            </a>{' '}
            or message us on WhatsApp at +44 7901 241275.
          </p>
        </section>
      </div>
    </main>
  )
}
