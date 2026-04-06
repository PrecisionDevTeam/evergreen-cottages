import { useState } from "react";
import Image from "next/image";
import Layout from "../components/Layout";
import Breadcrumbs from "../components/Breadcrumbs";
import { getProperties } from "../lib/db";

type GalleryImage = {
  src: string;
  propertyName: string;
  propertyId: number;
};

type Props = {
  images: GalleryImage[];
};

const BATCH_SIZE = 18;

export default function Gallery({ images }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const visible = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  const goTo = (index: number) => {
    setLightboxIndex(((index % images.length) + images.length) % images.length);
  };

  return (
    <Layout title="Gallery" description="Photos of our 17 vacation rental units in Pensacola, FL.">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <Breadcrumbs items={[{ label: "Gallery" }]} />
        <p className="text-coral-500 text-xs uppercase tracking-[0.2em] font-semibold mb-3">Photos</p>
        <h1 className="text-4xl md:text-5xl font-serif text-ocean-500 mb-4">Property Gallery</h1>
        <p className="text-sand-500 mb-12">Browse photos from all our Evergreen Cottages units.</p>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {visible.map((img, i) => (
            <div
              key={`${img.propertyId}-${i}`}
              className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl"
              onClick={() => setLightboxIndex(i)}
            >
              <Image
                src={img.src}
                alt={`${img.propertyName} photo`}
                width={600}
                height={400}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading={i < 6 ? "eager" : "lazy"}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">{img.propertyName}</span>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={() => setVisibleCount((c) => c + BATCH_SIZE)}
              className="bg-ocean-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-ocean-600 transition-all"
            >
              Load More ({images.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {images.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sand-400 text-lg font-serif">No photos available yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close gallery"
          >
            &times;
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl z-50 hover:opacity-70"
            onClick={(e) => { e.stopPropagation(); goTo(lightboxIndex - 1); }}
            aria-label="Previous image"
          >
            &#8249;
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl z-50 hover:opacity-70"
            onClick={(e) => { e.stopPropagation(); goTo(lightboxIndex + 1); }}
            aria-label="Next image"
          >
            &#8250;
          </button>
          <div className="relative w-full max-w-4xl aspect-[3/2] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].propertyName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <div className="absolute bottom-6 text-white text-sm">
            {images[lightboxIndex].propertyName} — {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </Layout>
  );
}

export const getServerSideProps = async () => {
  const properties = await getProperties("Pensacola");

  const images: GalleryImage[] = properties.flatMap((p: any) =>
    p.images.slice(0, 5).map((src: string) => ({
      src,
      propertyName: p.name,
      propertyId: p.id,
    }))
  );

  // Interleave properties for visual variety (deterministic)
  const maxPerProperty = 5;
  const byProperty: GalleryImage[][] = [];
  const seen = new Map<number, number>();
  for (const img of images) {
    const idx = seen.get(img.propertyId) ?? byProperty.length;
    if (!seen.has(img.propertyId)) {
      seen.set(img.propertyId, idx);
      byProperty.push([]);
    }
    byProperty[idx].push(img);
  }
  const interleaved: GalleryImage[] = [];
  for (let i = 0; i < maxPerProperty; i++) {
    for (const group of byProperty) {
      if (group[i]) interleaved.push(group[i]);
    }
  }

  return {
    props: { images: interleaved },
  };
};
