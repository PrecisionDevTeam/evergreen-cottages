import Link from "next/link";
import Layout from "../components/Layout";

export default function NotFound() {
  return (
    <Layout title="Page Not Found" description="The page you're looking for doesn't exist.">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 lg:px-10 py-32 text-center">
        <div className="text-8xl font-serif text-sand-200 mb-6">404</div>
        <h1 className="text-3xl md:text-4xl font-serif text-ocean-500 mb-4">Page Not Found</h1>
        <p className="text-sand-500 mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/properties"
            className="bg-ocean-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-ocean-600 transition-all"
          >
            Browse Properties
          </Link>
          <Link
            href="/"
            className="border-2 border-sand-300 text-ocean-500 px-8 py-3.5 rounded-full font-semibold hover:border-ocean-500 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
