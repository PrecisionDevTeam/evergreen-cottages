import Link from "next/link";
import { GetServerSideProps } from "next";
import Layout from "../../components/Layout";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
  apiVersion: "2022-11-15",
});

export default function GiftSuccess({ amount }: { amount: string }) {
  return (
    <Layout title="Gift Card Purchased" description="Your gift card has been purchased.">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 lg:px-10 py-20 text-center">
        <div className="w-16 h-16 bg-evergreen-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-evergreen-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-ocean-500 mb-3">${amount} Gift Card Purchased!</h1>
        <p className="text-sand-500 mb-8">
          Thank you! We&apos;ll send the gift card details to the recipient. They can redeem it by contacting us when they&apos;re ready to book.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/gift-cards" className="bg-ocean-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-ocean-600 transition-all">
            Buy Another
          </Link>
          <Link href="/properties" className="border-2 border-sand-300 text-ocean-500 px-8 py-3.5 rounded-full font-semibold hover:border-ocean-500 transition-all">
            Browse Properties
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const sessionId = query.session_id as string;
  if (!sessionId) {
    return { redirect: { destination: "/gift-cards", permanent: false } };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return { redirect: { destination: "/gift-cards", permanent: false } };
    }
    return { props: { amount: session.metadata?.amount || "100" } };
  } catch {
    return { redirect: { destination: "/gift-cards", permanent: false } };
  }
};
