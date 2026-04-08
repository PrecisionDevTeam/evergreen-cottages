import Link from "next/link";
import Layout from "../components/Layout";
import Breadcrumbs from "../components/Breadcrumbs";

type Place = {
  name: string;
  desc: string;
  distance: string;
  category: string;
};

const CATEGORIES = [
  {
    title: "Beaches",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
    places: [
      { name: "Pensacola Beach", desc: "White sand, clear water, pier with restaurants. Gulf Islands National Seashore.", distance: "20 min", category: "beach" },
      { name: "Perdido Key Beach", desc: "Quieter alternative with undeveloped stretches. Great for families.", distance: "35 min", category: "beach" },
      { name: "Navarre Beach", desc: "Less crowded, stunning turquoise water. Sea turtle nesting area.", distance: "40 min", category: "beach" },
      { name: "Casino Beach", desc: "At the foot of Pensacola Beach pier. Free parking, restrooms, lifeguards.", distance: "22 min", category: "beach" },
    ],
  },
  {
    title: "Food & Dining",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z",
    places: [
      { name: "Joe Patti's Seafood", desc: "Pensacola institution. Fresh catch market + prepared food. Must visit.", distance: "10 min", category: "food" },
      { name: "The Fish House", desc: "Upscale waterfront dining. Grits a Ya Ya is legendary.", distance: "13 min", category: "food" },
      { name: "Five Sisters Blues Cafe", desc: "Southern soul food + live blues music. Weekend brunch is packed.", distance: "10 min", category: "food" },
      { name: "The Ruby Slipper Cafe", desc: "Vibrant brunch spot in downtown. Eggs Benedict flights.", distance: "11 min", category: "food" },
      { name: "Taqueria El Asador", desc: "Authentic Mexican. Locals' favorite for tacos and burritos.", distance: "14 min", category: "food" },
      { name: "Al Fresco", desc: "Italian with outdoor courtyard seating in downtown Pensacola.", distance: "12 min", category: "food" },
    ],
  },
  {
    title: "Attractions",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    places: [
      { name: "NAS Pensacola", desc: "National Naval Aviation Museum — free admission, Blue Angels practice field.", distance: "15 min", category: "attraction" },
      { name: "Downtown Pensacola", desc: "Historic Palafox Street with shops, galleries, bars, and street art.", distance: "10 min", category: "attraction" },
      { name: "Pensacola Lighthouse", desc: "Climb 177 steps for panoramic views of the bay and Gulf.", distance: "18 min", category: "attraction" },
      { name: "Fort Pickens", desc: "Civil War-era fort on Santa Rosa Island. Great sunset spot.", distance: "30 min", category: "attraction" },
      { name: "Pensacola Bay Center", desc: "Concerts, Ice Flyers hockey, and events year-round.", distance: "12 min", category: "attraction" },
    ],
  },
  {
    title: "Coffee & Drinks",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    places: [
      { name: "Buzzed Brew Coffee", desc: "Drive-thru coffee hut near the property. Quick and affordable.", distance: "3 min", category: "coffee" },
      { name: "J's Bakery", desc: "Local pastries, cakes, and sweets. Minutes from Evergreen Cottages.", distance: "5 min", category: "coffee" },
      { name: "Bodacious Brew", desc: "Cozy craft coffee shop in East Hill. Pour-overs and cold brew.", distance: "10 min", category: "coffee" },
      { name: "Perfect Plain Brewing", desc: "Local brewery in downtown. Taproom with food trucks outside.", distance: "12 min", category: "coffee" },
    ],
  },
  {
    title: "Shopping",
    icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
    places: [
      { name: "Cordova Mall", desc: "Major retailers, restaurants, and a movie theater. 80+ stores.", distance: "12 min", category: "shopping" },
      { name: "Palafox Market", desc: "Saturday morning farmers market with local produce, crafts, and food.", distance: "10 min", category: "shopping" },
      { name: "Pensacola Flea Market", desc: "Bargain hunting on weekends. Vintage finds and local vendors.", distance: "8 min", category: "shopping" },
    ],
  },
  {
    title: "Getting Around",
    icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    places: [
      { name: "Pensacola International Airport (PNS)", desc: "Small, easy airport. Direct flights from major hubs.", distance: "15 min", category: "transport" },
      { name: "Uber/Lyft", desc: "Available throughout Pensacola. Expect 5-10 min pickup times.", distance: "On demand", category: "transport" },
      { name: "Pensacola Beach Trolley", desc: "Free seasonal trolley along the beach. Runs spring through fall.", distance: "At the beach", category: "transport" },
    ],
  },
];

export default function Guide() {
  return (
    <Layout title="Area Guide" description="Things to do in Pensacola, FL — beaches, restaurants, attractions, and more near Evergreen Cottages.">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <Breadcrumbs items={[{ label: "Area Guide" }]} />
        <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Explore</p>
        <h1 className="text-4xl md:text-5xl font-serif text-ocean-500 mb-4">Things to Do in Pensacola</h1>
        <p className="text-sand-500 mb-12 leading-relaxed">
          From white-sand beaches to fresh seafood and historic forts — here&apos;s our local guide
          to the best of Pensacola, all within 30 minutes of Evergreen Cottages.
        </p>

        <div className="space-y-12">
          {CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-ocean-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
                  </svg>
                </div>
                <h2 className="text-xl font-serif text-ocean-500">{cat.title}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cat.places.map((place) => (
                  <div key={place.name} className="bg-white border border-sand-100 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium text-ocean-700 text-sm">{place.name}</h3>
                      <span className="text-xs text-sand-400 ml-2 flex-shrink-0">{place.distance}</span>
                    </div>
                    <p className="text-sand-500 text-xs leading-relaxed">{place.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Internal links */}
        <div className="mt-12 p-6 bg-sand-50 rounded-xl">
          <h3 className="text-sm font-semibold text-ocean-700 mb-3">Explore More</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/properties" className="text-ocean-500 hover:text-coral-500 transition-colors">Browse Properties</Link>
            <span className="text-sand-300">|</span>
            <Link href="/faq" className="text-ocean-500 hover:text-coral-500 transition-colors">FAQ</Link>
            <span className="text-sand-300">|</span>
            <Link href="/services" className="text-ocean-500 hover:text-coral-500 transition-colors">Services & Add-ons</Link>
            <span className="text-sand-300">|</span>
            <Link href="/gallery" className="text-ocean-500 hover:text-coral-500 transition-colors">Photo Gallery</Link>
          </div>
        </div>

        <div className="mt-8 text-center bg-white rounded-2xl p-10 border border-sand-100">
          <h2 className="text-xl font-serif text-ocean-500 mb-3">Ready to explore Pensacola?</h2>
          <p className="text-sand-500 mb-6">Book your stay and start planning.</p>
          <Link href="/properties" className="bg-ocean-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-ocean-600 transition-all inline-block">
            Browse Properties
          </Link>
        </div>
      </div>
    </Layout>
  );
}
