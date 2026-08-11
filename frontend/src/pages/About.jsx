import { Link } from "react-router-dom";

const promises = [
  "Authentic Products",
  "Premium Quality",
  "Secure Shopping",
  "Fast Islandwide Delivery",
  "Excellent Service",
];

export default function About() {
  return (
    <>
      <section className="py-16 border-b border-line bg-gradient-to-br from-gold/10 to-transparent">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">Our Story</span>
          <h1 className="font-display font-semibold text-4xl md:text-5xl mt-2.5">About Aromiq.lk</h1>
          <div className="text-xs text-muted mt-3"><Link to="/" className="text-gold">Home</Link> / About Us</div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Bottled Arabian Soul</span>
            <h2 className="font-display font-semibold text-3xl md:text-[42px] mt-3 mb-4 leading-tight">
              A Premium Destination for Authentic Arabic Perfumes in Sri Lanka
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Aromiq.lk was founded on a simple belief: that a fragrance should be an experience, not just a purchase.
              We bring the richness of the Arabian perfume tradition — deep ouds, warm ambers, rare florals — to Sri Lanka,
              sourced directly from respected houses including Lattafa, Armaf, Afnan, Al Haramain and Rasasi.
            </p>
            <p className="text-muted text-sm leading-relaxed mt-3.5">
              Our mission is to make luxury, authentic Arabic perfumery accessible islandwide, with the same care and
              craftsmanship you'd expect walking into a boutique in Dubai — delivered straight to your door.
            </p>
          </div>
          <figure className="border border-line rounded overflow-hidden">
            <img
              src="/images/logo2.jpeg"
              alt="Arabic perfume collection"
              className="w-full h-auto block"
            />
          </figure>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-8 space-y-24">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="border border-line rounded overflow-hidden">
              <img
                src="/images/collection.jpg"
                alt="Arabic perfume collection"
                className="w-full h-auto block"
              />
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-gold">Our Collection</span>
              <h2 className="font-display font-semibold text-2xl md:text-[34px] mt-3 mb-3.5">Every Way to Wear a Scent</h2>
              <p className="text-muted text-sm leading-relaxed">
                Full-size perfume bottles for a signature scent, premium decants in 5ml and 10ml so you can discover
                a fragrance before committing, and curated gift collections ready to wrap and give — every format is
                sourced and bottled with the same standard of authenticity.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="md:order-2 border border-line rounded overflow-hidden">
              <img
                src="/images/arabic-perfume.jpg"
                alt="Arabic perfume"
                className="w-full h-auto block"
              />
            </div>
            <div className="md:order-1">
              <span className="text-xs uppercase tracking-[0.3em] text-gold">Why Arabic Perfumes</span>
              <h2 className="font-display font-semibold text-2xl md:text-[34px] mt-3 mb-3.5">Long-Lasting, Layered, Rooted in Heritage</h2>
              <p className="text-muted text-sm leading-relaxed">
                Arabic perfumery favours oil-based, highly concentrated formulas — built to last from morning
                meetings to evening events. Premium ingredients like oud, amber and saffron carry centuries of
                oriental craftsmanship into every bottle we stock.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-line">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Our Promise</span>
            <h2 className="font-display font-semibold text-3xl md:text-4xl mt-3">What You Can Always Expect</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {promises.map((p) => (
              <div key={p} className="text-center border border-line bg-panel py-7 px-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-8 h-8 text-gold mx-auto mb-4"><path d="M20 6 9 17l-5-5" /></svg>
                <h4 className="text-sm">{p}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
