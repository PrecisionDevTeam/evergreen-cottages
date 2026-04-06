import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
  priority?: boolean;
};

export default function ImageCarousel({ images, alt, priority = false }: Props) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const total = images.length;

  if (total === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sand-400 font-serif text-lg bg-sand-200">
        No photo
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoaded(false);
    setCurrent((c) => (c > 0 ? c - 1 : total - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoaded(false);
    setCurrent((c) => (c < total - 1 ? c + 1 : 0));
  };

  return (
    <div className="relative w-full h-full group">
      {/* Skeleton shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-sand-200 animate-pulse" />
      )}
      <Image
        src={images[current]}
        alt={`${alt} — photo ${current + 1}`}
        fill
        className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority={priority && current === 0}
        onLoad={() => setLoaded(true)}
      />

      {/* Arrows — visible on hover */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
            aria-label="Previous photo"
          >
            <svg className="w-3.5 h-3.5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
            aria-label="Next photo"
          >
            <svg className="w-3.5 h-3.5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
          {images.slice(0, Math.min(total, 5)).map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? "bg-white w-3" : "bg-white/60"
              }`}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
          {total > 5 && (
            <span className="text-white/60 text-[8px] ml-0.5">+{total - 5}</span>
          )}
        </div>
      )}
    </div>
  );
}
