import Layout from "../components/Layout";
import Breadcrumbs from "../components/Breadcrumbs";

export default function Privacy() {
  return (
    <Layout title="Privacy Policy" description="Privacy Policy for Evergreen Cottages — how we collect, use, and protect your information.">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
        <h1 className="text-3xl md:text-4xl font-serif text-ocean-500 mb-8">Privacy Policy</h1>
        <p className="text-sand-400 text-sm mb-8">Last updated: April 8, 2026</p>

        <div className="prose prose-sand max-w-none text-sand-600 text-sm leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">1. Who We Are</h2>
            <p>Evergreen Cottages is operated by Precision Management. We manage 17 vacation rental properties at 3801 Mobile Highway, Pensacola, FL 32505. Our website is evergreencottages.com.</p>
            <p>For privacy questions, contact us at hello@staywithprecision.com or call (510) 822-7060.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">2. Information We Collect</h2>
            <p>We collect information you provide directly when you:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Book a property:</strong> Name, email address, phone number, billing address, and payment information (processed securely by Stripe)</li>
              <li><strong>Contact us:</strong> Name, email, and message content</li>
              <li><strong>Purchase a gift card:</strong> Sender name, recipient name, and optional message</li>
              <li><strong>Purchase add-on services:</strong> Name and payment information</li>
            </ul>
            <p className="mt-3">We also automatically collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Browser data:</strong> Pages visited, time on site, and referring URL</li>
              <li><strong>Device data:</strong> Browser type, operating system, and screen size</li>
              <li><strong>Cookies:</strong> We use essential cookies for site functionality and analytics cookies to understand site usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process your bookings and payments</li>
              <li>Send booking confirmations, check-in instructions, and door codes</li>
              <li>Respond to your questions and support requests</li>
              <li>Improve our website and services</li>
              <li>Send promotional offers (only with your consent — you can opt out anytime)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">4. Payment Processing</h2>
            <p>All payments are processed by <strong>Stripe</strong>, a PCI-DSS Level 1 certified payment processor. We never store your credit card number, CVV, or full card details on our servers. Stripe&apos;s privacy policy is available at stripe.com/privacy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">5. How We Share Your Information</h2>
            <p>We share your information only when necessary:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Hostaway:</strong> Our property management system — to create and manage your reservation</li>
              <li><strong>Stripe:</strong> To process your payment securely</li>
              <li><strong>Service providers:</strong> For services you purchase (e.g., airport shuttle)</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">6. Data Retention</h2>
            <p>We retain your booking data for the duration of your stay plus 7 days (for check-in codes and stay information). Contact form messages are retained for up to 12 months. Payment records are retained as required by tax and accounting regulations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request we correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request we delete your personal data</li>
              <li><strong>Opt-out:</strong> Opt out of marketing communications at any time</li>
            </ul>
            <p className="mt-3"><strong>California residents (CCPA):</strong> You have the right to know what personal information we collect and to request its deletion. We do not sell personal information. To exercise your rights, contact us at hello@staywithprecision.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">8. Cookies</h2>
            <p>We use the following types of cookies:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Essential cookies:</strong> Required for the website to function (e.g., session management)</li>
              <li><strong>Preference cookies:</strong> Remember your favorites and recently viewed properties</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site (e.g., Google Analytics)</li>
            </ul>
            <p className="mt-3">You can control cookies through your browser settings. Disabling cookies may affect site functionality.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">9. Security</h2>
            <p>We protect your information using industry-standard security measures including HTTPS encryption, secure payment processing via Stripe, Content Security Policy headers, and access controls. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">10. Children&apos;s Privacy</h2>
            <p>Our website is not directed to children under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Your continued use of the website after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">12. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or your personal data:</p>
            <ul className="list-none space-y-1 mt-2">
              <li><strong>Email:</strong> hello@staywithprecision.com</li>
              <li><strong>Phone:</strong> (510) 822-7060</li>
              <li><strong>Address:</strong> 3801 Mobile Highway, Pensacola, FL 32505</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}
