import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

const collectionIcons = {
  "Men's Collection": "bottle",
  "Women's Collection": "flower",
  "Unisex Collection": "infinity",
  "Arabic Perfume Oils": "droplet",
  "Luxury Gift Sets": "gift",
  "Decants (5ml & 10ml)": "vial",
};

const icons = {
  bottle: <><rect x="7" y="8" width="10" height="13" rx="2" /><path d="M10 8V5h4v3" /></>,
  flower: <><circle cx="12" cy="12" r="3" /><path d="M12 3v6M12 15v6M3 12h6M15 12h6" /></>,
  infinity: <path d="M7 12a3 3 0 1 1 5-2 3 3 0 1 1 5 2 3 3 0 1 1-5 2 3 3 0 1 1-5-2Z" />,
  droplet: <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z" />,
  gift: <><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M4 9h16M12 9v11M8 9c-2-3 0-5 2-5s2 3 2 5M16 9c2-3 0-5-2-5s-2 3-2 5" /></>,
  vial: <><rect x="9" y="4" width="6" height="16" rx="3" /><path d="M9 12h6" /></>,
};

const whyUs = [
  ["100% Authentic", "Every bottle is sourced directly from authorised distributors — never diluted, never fake."],
  ["Premium Imported Fragrances", "Curated from renowned Arabic perfume houses across the Gulf."],
  ["Luxury Decants Available", "Try a fragrance in 5ml or 10ml before committing to a full bottle."],
  ["Islandwide Delivery", "Discreet, tracked delivery to every district in Sri Lanka."],
  ["Secure Online Payments", "Encrypted checkout with trusted local payment gateways."],
  ["Excellent Customer Support", "Real answers over WhatsApp, before and after your order."],
];

const reviews = [
  ["N", "Nadeesha K.", "Colombo", "The Khamrah Qahwa lasted through my entire workday. Packaging felt genuinely premium, not like a reseller."],
  ["A", "Amila S.", "Kandy", "Ordered a decant first to try it — smart way to shop. Now I'm buying the full bottle."],
  ["F", "Fathima R.", "Galle", "WhatsApp support replied within minutes and tracked my order the whole way. Will order again."],
];

export default function Home() {
  const [tab, setTab] = useState("new");
  const [homeData, setHomeData] = useState({ featuredCollections: [], newArrivals: [], bestSellers: [] });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load homepage data");
        return r.json();
      })
      .then(setHomeData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => {});
  }, []);

  const visibleProducts = tab === "new" ? homeData.newArrivals : homeData.bestSellers;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-b from-ink to-[#100c07] overflow-hidden">
        <div className="absolute inset-6 border border-line pointer-events-none">
          <div className="absolute -top-px -left-px w-9 h-9 border-t border-l border-gold" />
          <div className="absolute -bottom-px -right-px w-9 h-9 border-b border-r border-gold" />
        </div>

        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-2 gap-14 items-center relative w-full">
          <div>
            <span className="flex items-center gap-2.5 text-xs uppercase tracking-[0.3em] text-gold mb-4">
              <span className="w-7 h-px bg-gold" /> Authentic Arabic Perfumes
            </span>
            <h1 className="font-display font-semibold text-5xl md:text-7xl leading-[1.05] text-warm">
              Bottled<br /><em className="italic text-gold-bright">Arabian</em> Soul.
            </h1>
            <p className="text-muted text-base max-w-md mt-6 mb-9">
              Discover long-lasting, richly layered fragrances imported from the house of Lattafa, Armaf, Afnan, Al Haramain and Rasasi — delivered islandwide across Sri Lanka.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="px-8 py-4 text-xs uppercase tracking-widest bg-gradient-to-br from-gold-bright to-gold-deep text-ink font-medium hover:brightness-110 transition">
                Shop Now
              </Link>
              <Link to="/shop" className="px-8 py-4 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition">
                Explore Collection
              </Link>
              <a href="https://wa.me/94788778808" target="_blank" rel="noreferrer" className="px-8 py-4 text-xs uppercase tracking-widest border border-warm/35 text-warm hover:border-warm transition flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 32 32" fill="currentColor"><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.6.7 5 2 7.1L3 29l6.4-2.2c2 1.1 4.3 1.7 6.6 1.7 7 0 12.7-5.7 12.7-12.8C28.7 8.7 23 3 16 3Z" /></svg>
                WhatsApp Order
              </a>
            </div>
          </div>

          <figure className="relative aspect-[3/4] border border-line rounded bg-gradient-to-br from-gold/15 to-panel flex items-center justify-center">
            <svg viewBox="0 0 120 160" fill="none" className="w-[46%] opacity-90">
              <path d="M46 18h28l10 13-10 10H46l-10-10 10-13Z" stroke="#c9a961" strokeWidth="1.4" />
              <rect x="34" y="42" width="52" height="98" rx="10" stroke="#c9a961" strokeWidth="1.4" />
              <path d="M34 84c17 9 35 9 52 0" stroke="#c9a961" strokeWidth="1.1" />
            </svg>
            <figcaption className="absolute bottom-5 left-5 right-5 flex justify-between text-[11px] uppercase tracking-wider text-muted border-t border-line pt-3.5">
              <span>Est. Sri Lanka</span>
              <span>100% Authentic</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Featured Collections */}
      <section id="collections" className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Featured Collections</span>
            <h2 className="font-display font-semibold text-3xl md:text-4xl mt-3">Curated by Character</h2>
            <p className="text-muted text-sm mt-3">Six ways into the house of Aromiq — from bold oud oils to gift-ready sets.</p>
          </div>

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] border border-line bg-panel animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="text-red-400 text-sm text-center py-8">Couldn't load collections — is the backend running? ({error})</p>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {homeData.featuredCollections.map((c) => (
                <Link
                  to={`/collection/${c.slug}`}
                  key={c._id}
                  className="relative aspect-[4/5] border border-line bg-gradient-to-br from-panel2 to-panel hover:border-gold transition-colors flex items-end p-6"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="absolute top-6 right-6 w-8 h-8 text-gold opacity-55">
                    {icons[collectionIcons[c.name]] || icons.bottle}
                  </svg>
                  <div>
                    <h3 className="font-display text-2xl mb-1.5">{c.name}</h3>
                    {c.description && <span className="text-xs uppercase tracking-wider text-gold">{c.description}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category */}
      {categories.length > 0 && (
        <section className="py-16 border-y border-line bg-panel">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center max-w-lg mx-auto mb-10">
              <span className="text-xs uppercase tracking-[0.3em] text-gold">Browse</span>
              <h2 className="font-display font-semibold text-2xl md:text-3xl mt-3">Shop by Category</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  className="px-7 py-3.5 text-xs uppercase tracking-widest border border-line text-muted hover:border-gold hover:text-gold-bright transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals / Best Sellers */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">The Edit</span>
            <h2 className="font-display font-semibold text-3xl md:text-4xl mt-3">New Arrivals &amp; Best Sellers</h2>
          </div>
          <div className="flex justify-center gap-9 mb-11">
            {["new", "best"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs uppercase tracking-widest pb-2.5 border-b transition-colors ${
                  tab === t ? "text-gold-bright border-gold" : "text-muted border-transparent"
                }`}
              >
                {t === "new" ? "New Arrivals" : "Best Sellers"}
              </button>
            ))}
          </div>

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[1/1.6] border border-line bg-panel animate-pulse" />
              ))}
            </div>
          )}

          {!loading && !error && visibleProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {visibleProducts.map((p) => <ProductCard product={p} key={p._id} />)}
            </div>
          )}

          {!loading && !error && visibleProducts.length === 0 && (
            <p className="text-muted text-sm text-center py-8">Nothing to show here yet.</p>
          )}
        </div>
      </section>

      {/* Special Offers */}
      <section className="border-y border-line bg-panel">
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line">
          <div className="p-11 flex flex-col justify-center bg-gradient-to-br from-[#221b10] to-panel min-h-[220px]">
            <span className="text-xs uppercase tracking-[0.3em] text-gold mb-2.5">Limited Time</span>
            <h3 className="font-display text-3xl mb-2.5">Buy 2 Decants,<br />Get 10% Off</h3>
            <p className="text-muted text-sm mb-5">Mix and match any 5ml or 10ml decants from our full collection.</p>
            <Link to="/shop" className="w-fit px-8 py-4 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition">Shop Decants</Link>
          </div>
          <div className="p-11 flex flex-col justify-center min-h-[220px]">
            <span className="text-xs uppercase tracking-[0.3em] text-gold mb-2.5">Bundle Offer</span>
            <h3 className="font-display text-3xl mb-2.5">Gift Sets from<br />Rs 12,500</h3>
            <p className="text-muted text-sm">Ready-wrapped luxury gift sets for every occasion.</p>
          </div>
          <div className="p-11 flex flex-col justify-center min-h-[220px]">
            <span className="text-xs uppercase tracking-[0.3em] text-gold mb-2.5">Islandwide</span>
            <h3 className="font-display text-3xl mb-2.5">Free Delivery<br />Over Rs 15,000</h3>
            <p className="text-muted text-sm">Fast, discreet islandwide shipping on qualifying orders.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Why Aromiq.lk</span>
            <h2 className="font-display font-semibold text-3xl md:text-4xl mt-3">The Promise Behind Every Bottle</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
            {whyUs.map(([title, desc]) => (
              <div key={title}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-10 h-10 text-gold mb-4">
                  <path d="M12 3l2.4 5.5 6 .6-4.4 4 1.3 5.9L12 16l-5.3 3 1.3-5.9-4.4-4 6-.6L12 3Z" />
                </svg>
                <h4 className="text-lg mb-2">{title}</h4>
                <p className="text-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Testimonials</span>
            <h2 className="font-display font-semibold text-3xl md:text-4xl mt-3">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {reviews.map(([initial, name, city, text]) => (
              <div key={name} className="border border-line bg-panel p-8">
                <div className="text-gold mb-4">★★★★★</div>
                <p className="text-warm text-sm italic mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-gold text-gold flex items-center justify-center font-display text-base">{initial}</div>
                  <div>
                    <strong className="block text-sm font-medium">{name}</strong>
                    <span className="text-xs text-muted">{city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-8 mb-10 text-center max-w-lg mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">@aromiq.lk</span>
          <h2 className="font-display font-semibold text-3xl md:text-4xl mt-3">Follow the Fragrance</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <a
              key={i}
              href="https://instagram.com/aromiq.lk"
              target="_blank"
              rel="noreferrer"
              className="aspect-square bg-gradient-to-br from-gold/15 to-panel2 flex items-center justify-center hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gold opacity-70"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
            </a>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-20 border-t border-line bg-gradient-to-b from-transparent to-ink text-center">
      <div className="max-w-6xl mx-auto px-8">
        <h2 className="font-display font-semibold text-3xl md:text-4xl mb-3">Join the Inner Circle</h2>
        <p className="text-muted mb-8">New arrivals, exclusive discounts and launch drops — straight to your inbox.</p>
        <form className="flex max-w-md mx-auto border border-line" onSubmit={handleSubmit}>
          <input
            type="email" required placeholder="Your email address" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent px-5 py-4 text-sm text-warm outline-none"
          />
          <button type="submit" disabled={status === "sending"} className="px-7 bg-gold text-ink text-xs uppercase tracking-widest disabled:opacity-60">
            {status === "sending" ? "..." : "Subscribe"}
          </button>
        </form>
        {status === "success" && <p className="text-gold-bright text-sm mt-4">Thanks for subscribing!</p>}
        {status === "error" && <p className="text-red-400 text-sm mt-4">Something went wrong — try again.</p>}
      </div>
    </section>
  );
}
