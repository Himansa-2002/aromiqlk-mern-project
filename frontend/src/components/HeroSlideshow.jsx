import { useEffect, useRef, useState } from "react";

// Each slide is a small gold line-art illustration, matching the existing
// bottle icon's style — swap these for real product photography later by
// replacing the <svg> with an <img src="..."> in each slide.
const slides = [
 {
  caption: "Signature Fragrances",
  art: <img src="images\image_2.jpg" alt="Signature fragrance bottle" className="w-full h-full object-cover" />,
 },
  {
    caption: "Rich Oud & Amber",
   art: <img src="images\image_1.jpg" alt="Signature fragrance bottle" className="w-full h-full object-cover" />,
  },
  {
    caption: "Luxury Gift Sets",
    art: <img src="images\image_4.jpg" alt="Signature fragrance bottle" className="w-full h-full object-cover" />,
  },
  {
    caption: "Decants — Try Before You Commit",
   art: <img src="images\image_3.jpg" alt="Signature fragrance bottle" className="w-full h-full object-cover" />,
  },
];

const INTERVAL_MS = 4000;

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const start = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
  };

  useEffect(() => {
    start();
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (i) => {
    setIndex(i);
    start(); // reset the auto-advance timer so it doesn't jump right after a manual click
  };

  return (
    <figure className="relative aspect-[3/4] border border-line rounded bg-gradient-to-br from-gold/15 to-panel overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
        >
          {slide.art}
        </div>
      ))}

      {/* Manual navigation dots */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-gold" : "w-1.5 bg-line hover:bg-gold/50"
            }`}
          />
        ))}
      </div>

      <figcaption className="absolute bottom-5 left-5 right-5 flex justify-between text-[11px] uppercase tracking-wider text-muted border-t border-line pt-3.5">
        <span>Est. Sri Lanka</span>
        <span>{slides[index].caption}</span>
      </figcaption>
    </figure>
  );
}