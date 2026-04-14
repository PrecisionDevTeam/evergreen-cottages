import Layout from "../components/Layout";
import Breadcrumbs from "../components/Breadcrumbs";

export default function Terms() {
  return (
    <Layout title="Terms of Service" description="Terms of Service for booking vacation rentals at Evergreen Cottages, Pensacola, FL.">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <Breadcrumbs items={[{ label: "Terms of Service" }]} />
        <h1 className="text-3xl md:text-4xl font-serif text-ocean-500 mb-8">Terms of Service</h1>
        <p className="text-sand-400 text-sm mb-8">Last updated: April 8, 2026</p>

        <div className="prose prose-sand max-w-none text-sand-600 text-sm leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using evergreencottages.com (&quot;the Site&quot;) and booking a property through our platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            <p>Evergreen Cottages is operated by Precision Management (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), located at 3801 Mobile Highway, Pensacola, FL 32505.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">2. Booking & Reservations</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Reservation confirmation:</strong> A reservation is confirmed only after full payment is received via Stripe. You will receive a confirmation on the success page and via email.</li>
              <li><strong>Accuracy:</strong> You are responsible for ensuring that all booking details (dates, number of guests, contact information) are accurate at the time of booking.</li>
              <li><strong>Guest limits:</strong> The number of guests must not exceed the maximum occupancy listed for the property. Unauthorized guests may result in cancellation without refund.</li>
              <li><strong>Minimum age:</strong> The primary guest must be at least 21 years of age.</li>
              <li><strong>Pricing:</strong> All prices are listed in US dollars (USD). Prices include nightly rates and cleaning fees. Taxes may apply and will be shown at checkout.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">3. Cancellation & Refund Policy</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Free cancellation:</strong> Cancel up to 7 days before check-in for a full refund.</li>
              <li><strong>Late cancellation (within 7 days):</strong> Non-refundable. Contact us for special circumstances.</li>
              <li><strong>No-show:</strong> No refund for no-shows.</li>
              <li><strong>Early departure:</strong> No refund for unused nights if you check out early.</li>
              <li><strong>Extenuating circumstances:</strong> For emergencies or exceptional situations, contact us at (510) 822-7060 and we will do our best to accommodate.</li>
            </ul>
            <p className="mt-3">Refunds are processed to the original payment method within 5-10 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">4. Check-in & Check-out</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Check-in:</strong> 4:00 PM (or as listed on the property page). Early check-in available for an additional fee, subject to availability.</li>
              <li><strong>Check-out:</strong> 11:00 AM (or as listed on the property page). Late check-out may be arranged by contacting us.</li>
              <li><strong>Smart lock entry:</strong> Your unique door code will be sent via text message before your arrival. Do not share your door code with unauthorized persons.</li>
              <li><strong>Gate code:</strong> The property gate code (if applicable) is provided in your check-in instructions and is required for entry after 8 PM.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">5. House Rules</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Quiet hours:</strong> 10:00 PM to 8:00 AM. Please be respectful of neighboring guests and residents.</li>
              <li><strong>Smoking:</strong> Smoking is strictly prohibited inside all units. Smoking is permitted in designated outdoor areas only.</li>
              <li><strong>Pets:</strong> Pets are welcome in pet-friendly units with a $50 pet fee per pet per stay. Guests are responsible for cleaning up after their pets.</li>
              <li><strong>Parties & events:</strong> No parties or events are permitted on the property.</li>
              <li><strong>Parking:</strong> Each unit has one designated parking spot. Additional parking is available on the street.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">6. Damages & Security Deposit</h2>
            <p>Guests are responsible for any damage to the property, furnishings, or appliances during their stay. We reserve the right to charge the payment method on file for damages beyond normal wear and tear.</p>
            <p className="mt-2">If you notice any pre-existing damage upon arrival, please report it immediately by texting (510) 822-7060.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">7. Add-on Services</h2>
            <p>Services purchased through our website (airport shuttle, early check-in, pet fees, etc.) are subject to availability. Payment is processed at the time of purchase. Refunds for services are handled on a case-by-case basis.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">8. Gift Cards</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Gift cards are redeemable toward any Evergreen Cottages property by contacting us directly.</li>
              <li>Gift cards do not expire.</li>
              <li>Gift cards are non-refundable and cannot be exchanged for cash.</li>
              <li>Lost or stolen gift cards cannot be replaced.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">9. Promo Codes</h2>
            <p>Promotional codes are subject to specific terms and conditions at the time of issue. Promo codes cannot be combined with other offers unless stated otherwise. We reserve the right to modify or cancel promotions at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">10. Limitation of Liability</h2>
            <p>Evergreen Cottages and Precision Management are not liable for:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Loss or theft of personal belongings during your stay</li>
              <li>Injury or illness sustained on the property</li>
              <li>Service interruptions (power outages, internet, water)</li>
              <li>Acts of nature, weather events, or circumstances beyond our control</li>
            </ul>
            <p className="mt-3">Our total liability for any claim arising from your booking shall not exceed the total amount you paid for your reservation.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">11. Governing Law</h2>
            <p>These Terms are governed by the laws of the State of Florida. Any disputes arising from these Terms or your use of our services shall be resolved in the courts of Escambia County, Florida.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">12. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Changes take effect when posted on this page. Continued use of our services after changes constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ocean-700 mb-3">13. Contact Us</h2>
            <p>For questions about these Terms:</p>
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
