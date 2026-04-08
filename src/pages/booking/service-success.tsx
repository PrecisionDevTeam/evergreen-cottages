import Link from "next/link";
import { GetServerSideProps } from "next";
import Layout from "../../components/Layout";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY || "", {
  apiVersion: "2022-11-15",
});

export default function ServiceSuccess({ serviceName }: { serviceName: string }) {
  return (
    <Layout title="Payment Confirmed" description="Your service payment has been confirmed.">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 lg:px-10 py-20 text-center">
        <div className="w-16 h-16 bg-evergreen-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-evergreen-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-ocean-500 mb-3">Payment Confirmed!</h1>
        <p className="text-sand-500 mb-8">
          {serviceName ? `Your ${serviceName} has been paid.` : "Thank you for your payment."} We&apos;ll follow up with details via text or email.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/services" className="bg-ocean-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-ocean-600 transition-all">
            Back to Services
          </Link>
          <a href="tel:+15108227060" className="border-2 border-sand-300 text-ocean-500 px-8 py-3.5 rounded-full font-semibold hover:border-ocean-500 transition-all">
            Call or Text Us
          </a>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const sessionId = query.session_id as string;
  if (!sessionId) {
    return { redirect: { destination: "/services", permanent: false } };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return { redirect: { destination: "/services", permanent: false } };
    }
    return { props: { serviceName: session.metadata?.serviceName || "" } };
  } catch {
    return { redirect: { destination: "/services", permanent: false } };
  }
};
