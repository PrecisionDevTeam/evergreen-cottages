import { GetServerSideProps } from "next";
import Link from "next/link";
import { useState, useRef } from "react";
import Layout from "../../components/Layout";
import Stripe from "stripe";

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_API_KEY || "");

type Props = {
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  nights: string;
  total: string;
  guestName: string;
  guestEmail: string;
  sessionId: string;
};

export default function BookingSuccess({ propertyName, checkIn, checkOut, guests, nights, total, guestName, guestEmail, sessionId }: Props) {
  const checkInFormatted = new Date(checkIn + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const checkOutFormatted = new Date(checkOut + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const [idUploading, setIdUploading] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [idError, setIdError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleIdUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setIdError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setIdError("Photo must be under 10 MB.");
      return;
    }

    setIdUploading(true);
    setIdError("");

    try {
      // Convert file to base64 data URL
      const reader = new FileReader();
      const photoDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/id-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo: photoDataUrl,
          guestName,
          guestEmail,
          propertyName,
          stripeSessionId: sessionId,
        }),
      });
      if (res.ok) {
        setIdUploaded(true);
      } else {
        const data = await res.json();
        setIdError(data.error || "Upload failed. Please try again.");
      }
    } catch {
      setIdError("Connection error. Please try again.");
    }
    setIdUploading(false);
  };

  return (
    <Layout title="Booking Confirmed" description="Your reservation has been confirmed.">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 lg:px-10 py-20 text-center">
        <div className="w-16 h-16 bg-evergreen-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-evergreen-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-ocean-500 mb-3">Booking Confirmed!</h1>
        <p className="text-sand-500 mb-8">Thank you for booking with Evergreen Cottages. We&apos;ll send your check-in details before arrival.</p>

        <div className="bg-white border border-sand-100 rounded-2xl p-6 text-left mb-8">
          <h2 className="text-lg font-semibold text-ocean-700 mb-4">Reservation Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-sand-500">Property</span>
              <span className="font-medium text-ocean-700">{propertyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sand-500">Check-in</span>
              <span className="font-medium">{checkInFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sand-500">Check-out</span>
              <span className="font-medium">{checkOutFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sand-500">Guests</span>
              <span className="font-medium">{guests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sand-500">Duration</span>
              <span className="font-medium">{nights} night{Number(nights) > 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between border-t border-sand-100 pt-3">
              <span className="font-semibold text-ocean-500">Total Paid</span>
              <span className="font-semibold text-ocean-500">${total}</span>
            </div>
          </div>
        </div>

        <div className="bg-sand-50 rounded-2xl p-6 text-left mb-8">
          <h3 className="font-semibold text-ocean-700 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-sand-600">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-evergreen-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              You&apos;ll receive a confirmation email shortly
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-evergreen-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Your door code will be sent the day before check-in
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-evergreen-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Text us anytime at (510) 822-7060 with questions
            </li>
          </ul>
        </div>

        {/* ID Upload */}
        <div className="bg-white border border-sand-100 rounded-2xl p-6 text-left mb-8">
          <h3 className="font-semibold text-ocean-700 mb-2">Photo ID Verification</h3>
          <p className="text-sm text-sand-500 mb-4">
            For the safety and security of our guests and properties, we require a photo of a valid government-issued ID (driver&apos;s license or passport) for all direct bookings. Your door code and check-in details will be sent once your ID is verified.
          </p>

          {idUploaded ? (
            <div className="flex items-center gap-2 text-evergreen-600 text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ID uploaded successfully. We&apos;ll verify it shortly.
            </div>
          ) : (
            <div className="space-y-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="w-full text-sm text-sand-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-ocean-50 file:text-ocean-600 hover:file:bg-ocean-100"
              />
              {idError && <p className="text-sm text-red-500">{idError}</p>}
              <button
                onClick={handleIdUpload}
                disabled={idUploading}
                className="bg-ocean-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-ocean-600 transition disabled:opacity-50"
              >
                {idUploading ? "Uploading..." : "Upload ID"}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/properties" className="bg-ocean-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-ocean-600 transition-all">
            Browse More Properties
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
  if (!sessionId || !/^cs_(live|test)_[A-Za-z0-9]{10,}$/.test(sessionId)) {
    return { redirect: { destination: "/properties", permanent: false } };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return { redirect: { destination: `/properties/${session.metadata?.propertyId || ""}`, permanent: false } };
    }
    const meta = session.metadata || {};

    const customer = session.customer_details || {};
    const customFields = (session as any).custom_fields || [];
    const guestNameField = customFields.find((f: any) => f.key === "guest_full_name");
    const guestFullName = guestNameField?.text?.value || customer.name || "Guest";

    return {
      props: {
        propertyName: meta.propertyName || "Evergreen Cottages",
        checkIn: meta.checkIn || "",
        checkOut: meta.checkOut || "",
        guests: meta.guests || "1",
        nights: meta.nights || "1",
        total: meta.total || String((session.amount_total || 0) / 100),
        guestName: guestFullName,
        guestEmail: customer.email || "",
        sessionId: sessionId,
      },
    };
  } catch {
    return { redirect: { destination: "/properties", permanent: false } };
  }
};
