import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

const product = {
  brand: "Lattafa",
  name: "Khamrah Qahwa",
  price: 8900,
  rating: 5,
  reviews: 42,
  desc: "A warm, coffee-laced oriental fragrance layered with cinnamon, cardamom and rich amber — Khamrah Qahwa opens with spiced espresso and settles into a deep, long-lasting base of oud and vanilla.",
  top: "Cardamom, Cinnamon, Coffee",
  middle: "Praline, Amber, Saffron",
  base: "Oud, Vanilla, Musk",
  sizes: [
    { label: "5ml Decant", price: 1800 },
    { label: "10ml Decant", price: 3200 },
    { label: "Full Bottle 100ml", price: 8900 },
  ],
};

const related = [
  { brand: "Armaf", name: "Club de Nuit Intense", price: 7200 },
  { brand: "Afnan", name: "Supremacy Silver", price: 6500 },
  { brand: "Al Haramain", name: "Amber Oud Gold", price: 11400 },
  { brand: "Lattafa", name: "Yara Moi", price: 7500 },
];

export default function ProductDetails() {
  const [activeSize, setActiveSize] = useState(0);
  const [qty, setQty] = useState(1);

  return (
    <>
      <section className="pt-8">
        <div className="max-w-6xl mx-auto px-8 text-xs text-muted">
          <Link to="/" className="text-gold">Home</Link> / <Link to="/shop" className="text-gold">Shop</Link> / {product.name}
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-14">

          <div>
            <div className="aspect-[4/5] border border-line bg-gradient-to-br from-gold/15 to-panel flex items-center justify-center mb-3.5">
              <svg viewBox="0 0 120 160" fill="none" className="w-[34%]"><rect x="34" y="42" width="52" height="98" rx="10" stroke="#c9a961" strokeWidth="1.2" /><path d="M46 18h28l10 13-10 10H46l-10-10 10-13Z" stroke="#c9a961" strokeWidth="1.2" /></svg>
            </div>
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`w-[70px] h-[84px] border bg-panel flex items-center justify-center cursor-pointer ${i === 0 ? "border-gold" : "border-line"}`}>
                  <svg viewBox="0 0 120 160" fill="none" className="w-[55%] opacity-80"><rect x="34" y="42" width="52" height="98" rx="10" stroke="#c9a961" strokeWidth="1.2" /></svg>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-gold">{product.brand}</span>
            <h1 className="font-display text-3xl md:text-4xl mt-2.5 mb-3">{product.name}</h1>
            <div className="text-gold text-sm mb-4">
              {"★".repeat(product.rating)} <span className="text-muted text-xs">({product.reviews} reviews)</span>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-6">{product.desc}</p>

            <div className="flex gap-8 flex-wrap mb-7">
              <div>
                <h5 className="text-[11px] uppercase tracking-wider text-gold mb-2">Top Notes</h5>
                <p className="text-xs text-muted max-w-[160px]">{product.top}</p>
              </div>
              <div>
                <h5 className="text-[11px] uppercase tracking-wider text-gold mb-2">Middle Notes</h5>
                <p className="text-xs text-muted max-w-[160px]">{product.middle}</p>
              </div>
              <div>
                <h5 className="text-[11px] uppercase tracking-wider text-gold mb-2">Base Notes</h5>
                <p className="text-xs text-muted max-w-[160px]">{product.base}</p>
              </div>
            </div>

            <h5 className="text-[11px] uppercase tracking-wider text-gold mb-2.5">Select Size</h5>
            <div className="flex gap-3 mb-7 flex-wrap">
              {product.sizes.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setActiveSize(i)}
                  className={`px-4 py-2.5 text-sm border transition-colors ${
                    i === activeSize ? "border-gold text-gold-bright" : "border-line text-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="font-display text-2xl text-gold-bright mb-7">
              Rs {product.sizes[activeSize].price.toLocaleString()}
            </div>

            <div className="flex items-center gap-5 mb-7">
              <div className="flex items-center border border-line">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-10 text-gold text-lg">−</button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-9 h-10 text-gold text-lg">+</button>
              </div>
              <span className="text-green-400 text-sm">● In Stock</span>
            </div>

            <div className="flex gap-3.5 flex-wrap mb-7">
              <button className="px-8 py-4 text-xs uppercase tracking-widest bg-gradient-to-br from-gold-bright to-gold-deep text-ink font-medium hover:brightness-110 transition">Add to Cart</button>
              <button className="px-8 py-4 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition">Buy Now</button>
              <a href="https://wa.me/94788778808" target="_blank" rel="noreferrer" className="px-8 py-4 text-xs uppercase tracking-widest border border-warm/35 text-warm hover:border-warm transition">WhatsApp Inquiry</a>
            </div>

            <div className="text-sm text-muted">
              <div className="flex justify-between py-2 border-b border-line"><span>Brand</span><span>{product.brand}</span></div>
              <div className="flex justify-between py-2 border-b border-line"><span>Availability</span><span>In Stock</span></div>
              <div className="flex justify-between py-2 border-b border-line"><span>Delivery</span><span>2–5 working days, islandwide</span></div>
            </div>
          </div>

        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">You May Also Like</span>
            <h2 className="font-display font-semibold text-3xl md:text-4xl mt-3">Related Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((r) => <ProductCard product={r} key={r.name} />)}
          </div>
        </div>
      </section>
    </>
  );
}
