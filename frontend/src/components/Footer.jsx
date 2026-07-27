import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <>
      <footer className="border-t border-line bg-panel pt-16 pb-6">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 font-display text-2xl text-gold-bright mb-4">
                <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
                  <path d="M16 6h8l3 4-3 3H16l-3-3 3-4Z" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="13" y="14" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M13 22c3 2 8 2 14 0" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                aromiq<span className="text-gold">.lk</span>
              </Link>
              <p className="text-muted text-sm">Bottled Arabian soul — authentic, long-lasting Arabic perfumes and oils, curated for Sri Lanka.</p>
              <div className="flex gap-3 mt-5">
                <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-line text-gold flex items-center justify-center hover:border-gold">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
                </a>
                <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-line text-gold flex items-center justify-center hover:border-gold">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M14 9h3V6h-3c-2 0-3.5 1.5-3.5 3.5V12H8v3h2.5v6h3v-6H16l.5-3h-3V9.8c0-.5.2-.8.5-.8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                </a>
                <a href="#" aria-label="TikTok" className="w-9 h-9 rounded-full border border-line text-gold flex items-center justify-center hover:border-gold">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 4v9.5a3.5 3.5 0 1 1-3.2-3.48M15 4c.4 2.4 2 4 4.5 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </div>
            </div>

            <div>
              <h5 className="text-xs uppercase tracking-widest text-gold mb-5">Shop</h5>
              <ul className="space-y-3 text-sm text-muted">
                <li><Link to="/shop" className="hover:text-gold-bright">Men's Collection</Link></li>
                <li><Link to="/shop" className="hover:text-gold-bright">Women's Collection</Link></li>
                <li><Link to="/shop" className="hover:text-gold-bright">Unisex Collection</Link></li>
                <li><Link to="/shop" className="hover:text-gold-bright">Arabic Perfume Oils</Link></li>
                <li><Link to="/shop" className="hover:text-gold-bright">Decants (5ml &amp; 10ml)</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs uppercase tracking-widest text-gold mb-5">Company</h5>
              <ul className="space-y-3 text-sm text-muted">
                <li><Link to="/about" className="hover:text-gold-bright">Our Story</Link></li>
                <li><Link to="/shop" className="hover:text-gold-bright">All Products</Link></li>
                <li><Link to="/contact" className="hover:text-gold-bright">Contact Us</Link></li>
                <li><a href="#" className="hover:text-gold-bright">Track Order</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs uppercase tracking-widest text-gold mb-5">Get In Touch</h5>
              <ul className="space-y-3 text-sm text-muted">
                <li><a href="tel:0788778808" className="hover:text-gold-bright">078 877 8808</a></li>
                <li><a href="mailto:info@aromiq.lk" className="hover:text-gold-bright">info@aromiq.lk</a></li>
                <li>Sri Lanka — Islandwide Delivery</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-line pt-6 flex justify-between text-xs text-muted">
            <span>&copy; {new Date().getFullYear()} Aromiq.lk — All rights reserved.</span>
            <span>Bottled Arabian Soul.</span>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/94788778808"
        target="_blank"
        rel="noreferrer"
        aria-label="Order on WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1fae5c] text-white flex items-center justify-center shadow-xl border border-white/15 hover:scale-105 transition-transform"
      >
        <svg viewBox="0 0 32 32" fill="currentColor" className="w-7 h-7"><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.6.7 5 2 7.1L3 29l6.4-2.2c2 1.1 4.3 1.7 6.6 1.7 7 0 12.7-5.7 12.7-12.8C28.7 8.7 23 3 16 3Zm0 23.2c-2.1 0-4.1-.6-5.8-1.6l-.4-.2-4 1.4 1.3-3.9-.3-.4a10.4 10.4 0 0 1-1.7-5.8c0-5.8 4.7-10.5 10.9-10.5 5.8 0 10.5 4.7 10.5 10.5S21.8 26.2 16 26.2Zm5.9-7.8c-.3-.2-1.9-1-2.2-1s-.5-.1-.7.2-.8 1-.9 1.1-.3.2-.6 0a8.4 8.4 0 0 1-4.2-3.7c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.5 2.7 1.1 3.2.9 3.8.8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5Z" /></svg>
      </a>
    </>
  );
}
