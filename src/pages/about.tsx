import Head from "next/head";
import Link from "next/link";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>About — Evergreen Cottages</title>
      </Head>

      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-evergreen-700">Evergreen Cottages</Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/properties" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Properties</Link>
              <Link href="/services" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Services</Link>
              <Link href="/about" className="text-evergreen-700 text-sm font-semibold">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Evergreen Cottages</h1>

        <div className="prose prose-lg text-gray-600 space-y-6">
          <p>
            Evergreen Cottages is a collection of 17 professionally managed vacation rentals
            located at 3801 Mobile Highway in Pensacola, Florida. We offer comfortable,
            affordable accommodations just minutes from Pensacola Beach, NAS Pensacola,
            and downtown.
          </p>
          <p>
            Each unit is individually designed with everything you need for a comfortable
            stay — fully equipped kitchens, air conditioning, WiFi, washer/dryer, free
            parking, and smart lock entry. Most units welcome pets.
          </p>
          <p>
            Whether you're visiting for work, vacation, military duty, or just passing
            through, we're here to make your stay as smooth as possible. Our on-site
            management team is available 24/7 by phone or text.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-evergreen-700">17</div>
            <div className="text-sm text-gray-500 mt-1">Units</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-evergreen-700">4.9</div>
            <div className="text-sm text-gray-500 mt-1">Avg Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-evergreen-700">1,200+</div>
            <div className="text-sm text-gray-500 mt-1">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-evergreen-700">24/7</div>
            <div className="text-sm text-gray-500 mt-1">Support</div>
          </div>
        </div>

        <div className="mt-12 bg-gray-50 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          <p className="text-gray-600 mb-2">3801 Mobile Highway, Pensacola, FL 32505</p>
          <p className="text-gray-500 text-sm">
            Minutes from Pensacola Beach, NAS Pensacola, Downtown Pensacola,
            and Pensacola International Airport.
          </p>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          &copy; {new Date().getFullYear()} Evergreen Cottages. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default About;
