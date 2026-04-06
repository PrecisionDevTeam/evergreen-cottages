import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getStayByToken } from "../../lib/db";

type Props = {
  data: {
    reservation: any;
    property: any;
    guest: any;
    knowledgeMap: Record<string, string | null>;
    doorCode: string | null;
  };
};

const MyStay = ({ data }: Props) => {
  const { reservation, property, guest, knowledgeMap, doorCode } = data;
  const guestName = guest?.first_name || "Guest";

  const checkIn = reservation.check_in
    ? new Date(reservation.check_in + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const checkOut = reservation.check_out
    ? new Date(reservation.check_out + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Your Stay — Evergreen Cottages</title>
      </Head>

      {/* Header */}
      <div className="bg-evergreen-700 text-white py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Link href="/" className="text-evergreen-200 text-sm mb-2 inline-block">
            Evergreen Cottages
          </Link>
          <h1 className="text-2xl font-bold">Welcome, {guestName}!</h1>
          <p className="text-evergreen-100 mt-1">Everything you need for your stay</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Reservation Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reservation Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Property</span>
              <span className="font-medium text-right">{property?.name || "Evergreen Cottages"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Address</span>
              <span className="font-medium text-right">{property?.address || "3801 Mobile Hwy, Pensacola, FL"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-in</span>
              <span className="font-medium">{checkIn}, 4:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-out</span>
              <span className="font-medium">{checkOut}, 11:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Guests</span>
              <span className="font-medium">{reservation.adults || 1}{reservation.children ? ` + ${reservation.children} children` : ""}</span>
            </div>
          </div>
        </div>

        {/* Access Codes */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Codes</h2>
          <div className="space-y-4">
            {doorCode && (
              <div className="flex items-center justify-between bg-evergreen-50 p-4 rounded-lg">
                <div>
                  <div className="text-sm text-gray-500">Door Code</div>
                  <div className="text-2xl font-bold text-evergreen-700">{doorCode}</div>
                </div>
                <span className="text-3xl">🔑</span>
              </div>
            )}
            {knowledgeMap.gate_code && (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  <div className="text-sm text-gray-500">Gate Code (needed after 8 PM)</div>
                  <div className="text-lg font-bold text-gray-900">{knowledgeMap.gate_code}</div>
                </div>
                <span className="text-2xl">🚗</span>
              </div>
            )}
            {knowledgeMap.wifi && (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  <div className="text-sm text-gray-500">WiFi</div>
                  <div className="text-lg font-bold text-gray-900">{knowledgeMap.wifi}</div>
                </div>
                <span className="text-2xl">📶</span>
              </div>
            )}
          </div>
        </div>

        {/* Property Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Info</h2>
          <div className="space-y-3 text-sm">
            {knowledgeMap.parking && (
              <div className="flex items-start">
                <span className="mr-3 text-lg">🅿️</span>
                <div>
                  <div className="font-medium text-gray-900">Parking</div>
                  <div className="text-gray-500">{knowledgeMap.parking}</div>
                </div>
              </div>
            )}
            {knowledgeMap.trash && (
              <div className="flex items-start">
                <span className="mr-3 text-lg">🗑</span>
                <div>
                  <div className="font-medium text-gray-900">Trash</div>
                  <div className="text-gray-500">{knowledgeMap.trash}</div>
                </div>
              </div>
            )}
            {knowledgeMap.laundry && (
              <div className="flex items-start">
                <span className="mr-3 text-lg">🧺</span>
                <div>
                  <div className="font-medium text-gray-900">Laundry</div>
                  <div className="text-gray-500">{knowledgeMap.laundry}</div>
                </div>
              </div>
            )}
            {knowledgeMap.rules && (
              <div className="flex items-start">
                <span className="mr-3 text-lg">📋</span>
                <div>
                  <div className="font-medium text-gray-900">House Rules</div>
                  <div className="text-gray-500 whitespace-pre-line">{knowledgeMap.rules}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:+15108227060"
              className="flex items-center justify-center bg-evergreen-600 text-white py-3 rounded-lg font-medium hover:bg-evergreen-700"
            >
              📞 Call Us
            </a>
            <a
              href="sms:+15108227060"
              className="flex items-center justify-center bg-white border border-evergreen-600 text-evergreen-700 py-3 rounded-lg font-medium hover:bg-evergreen-50"
            >
              💬 Text Us
            </a>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add-on Services</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/services" className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="text-2xl mb-1">✈️</div>
              <div className="text-sm font-medium text-gray-900">Airport Shuttle</div>
              <div className="text-xs text-gray-500">$25 each way</div>
            </Link>
            <Link href="/services" className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="text-2xl mb-1">🕐</div>
              <div className="text-sm font-medium text-gray-900">Early Check-in</div>
              <div className="text-xs text-gray-500">From $25</div>
            </Link>
            <Link href="/services" className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="text-2xl mb-1">📅</div>
              <div className="text-sm font-medium text-gray-900">Extend Stay</div>
              <div className="text-xs text-gray-500">Check availability</div>
            </Link>
            <Link href="/services" className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="text-2xl mb-1">🐾</div>
              <div className="text-sm font-medium text-gray-900">Pet Fee</div>
              <div className="text-xs text-gray-500">$50 per pet</div>
            </Link>
          </div>
        </div>

        {/* Troubleshooting */}
        <Link
          href={`/maintenance/${property?.id || ""}`}
          className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Something not working?</h2>
              <p className="text-sm text-gray-500 mt-1">WiFi, AC, hot water, lockout — get help instantly</p>
            </div>
            <span className="text-2xl">🔧</span>
          </div>
        </Link>

        <div className="text-center text-xs text-gray-400 py-4">
          &copy; {new Date().getFullYear()} Evergreen Cottages
        </div>
      </div>
    </div>
  );
};

export default MyStay;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const token = params?.token as string;
  if (!token) return { notFound: true };

  const data = await getStayByToken(token);
  if (!data) return { notFound: true };

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  };
};
