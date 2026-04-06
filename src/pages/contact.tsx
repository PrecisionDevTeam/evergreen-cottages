import Head from "next/head";
import Link from "next/link";

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Contact — Evergreen Cottages</title>
      </Head>

      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-evergreen-700">Evergreen Cottages</Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/properties" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Properties</Link>
              <Link href="/services" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">Services</Link>
              <Link href="/about" className="text-gray-600 hover:text-evergreen-700 text-sm font-medium">About</Link>
              <Link href="/contact" className="text-evergreen-700 text-sm font-semibold">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <a href="tel:+15108227060" className="text-lg font-medium text-evergreen-700 hover:underline">
                  (510) 822-7060
                </a>
                <p className="text-xs text-gray-400 mt-0.5">Call or text 24/7</p>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <a href="mailto:hello@staywithprecision.com" className="text-lg font-medium text-evergreen-700 hover:underline">
                  hello@staywithprecision.com
                </a>
              </div>
              <div>
                <div className="text-sm text-gray-500">Address</div>
                <p className="font-medium">3801 Mobile Highway<br />Pensacola, FL 32505</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Message</label>
                <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="How can we help?" />
              </div>
              <button type="submit" className="w-full bg-evergreen-600 text-white py-2.5 rounded-lg font-medium hover:bg-evergreen-700">
                Send Message
              </button>
            </form>
          </div>
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

export default Contact;
