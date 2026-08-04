import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSize, setActiveSize] = useState(0);
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  // Fetch product by slug
  useEffect(() => {
    if (!slug) return;
    fetch(`http://localhost:5000/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch product');
        return res.json();
      })
      .then((data) => {
        const p = {
          ...data,
          brand: data.brand?.name || data.brand,
          category: data.category?.name || data.category,
          tags: data.tags || [],
        };
        setProduct(p);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  // Fetch related products after product is loaded
  useEffect(() => {
    if (product && product._id) {
      fetch(`http://localhost:5000/api/products/${product._id}/related`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch related');
          return res.json();
        })
        .then((data) => {
          const items = data.map((p) => ({
            ...p,
            brand: p.brand?.name || p.brand,
            category: p.category?.name || p.category,
            tags: p.tags || [],
          }));
          setRelated(items);
        })
        .catch((err) => console.error(err));
    }
  }, [product]);

  // Debug: verify stored token works
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Current token on mount:', token);
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => console.log('Auth/me response:', data))
        .catch((err) => console.error('Auth/me error:', err));
    }
  }, []);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!product) return;
    const token = localStorage.getItem('token');
    console.log('Add to cart token:', token);
    if (!token) {
      alert('You must be logged in to add items to the cart.');
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id || product.name,
          selectedSize: product.sizes[activeSize].label,
          quantity: qty,
        }),
      });
      if (!res.ok) {
        console.error('Add to cart failed', res.status, res.statusText);
        throw new Error('Failed to add to cart');
      }
      console.log('Added to cart');
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (!product) return;
    fetch('http://localhost:5000/api/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        productId: product._id || product.name,
        selectedSize: product.sizes[activeSize].label,
        quantity: qty,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add to cart');
        return res.json();
      })
      .then(() => navigate('/checkout'))
      .catch((err) => console.error(err));
  };

  if (loading) {
    return (
      <section className="pt-8">
        <div className="max-w-6xl mx-auto px-8 text-xs text-muted">Loading product...</div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="pt-8">
        <div className="max-w-6xl mx-auto px-8 text-xs text-muted">Product not found.</div>
      </section>
    );
  }

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
              {/* Image placeholder */}
            </div>
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`w-[70px] h-[84px] border bg-panel flex items-center justify-center cursor-pointer ${i === 0 ? "border-gold" : "border-line"}`}>
                  {/* Icon placeholder */}
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-gold">{product.brand}</span>
            <h1 className="font-display text-3xl md:text-4xl mt-2.5 mb-3">{product.name}</h1>
            <div className="text-gold text-sm mb-4">
              {"★".repeat(product.rating)} <span className="text-muted text-xs">({product.reviewCount} reviews)</span>
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
                  className={`px-4 py-2.5 text-sm border transition-colors ${i === activeSize ? "border-gold text-gold-bright" : "border-line text-muted"}`}
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
              <button onClick={handleAddToCart} className="px-8 py-4 text-xs uppercase tracking-widest bg-gradient-to-br from-gold-bright to-gold-deep text-ink font-medium hover:brightness-110 transition">Add to Cart</button>
              <button onClick={handleBuyNow} className="px-8 py-4 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition">Buy Now</button>
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
            {related.map((r) => <ProductCard product={r} key={r._id || r.name} />)}
          </div>
        </div>
      </section>
    </>
  );
}

function ReviewsSection({ product, reviews }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: product._id, name, rating, comment }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setName("");
      setRating(5);
      setComment("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-20 border-t border-line">
      <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-[280px_1fr] gap-14">

        {/* Rating summary */}
        <div>
          <h2 className="font-display text-2xl mb-5">Customer Reviews</h2>
          <div className="flex items-end gap-3 mb-2">
            <span className="font-display text-5xl text-gold-bright">{(product.rating || 0).toFixed(1)}</span>
            <span className="text-muted text-sm mb-2">/ 5</span>
          </div>
          <div className="text-gold text-sm mb-2">{"★".repeat(Math.round(product.rating || 0))}{"☆".repeat(5 - Math.round(product.rating || 0))}</div>
          <p className="text-muted text-xs">Based on {product.reviewCount || 0} review{product.reviewCount === 1 ? "" : "s"}</p>
        </div>

        {/* Review list + submit form */}
        <div>
          {reviews.length > 0 ? (
            <div className="space-y-6 mb-12">
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-line pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm font-medium">{r.name}</strong>
                    <div className="text-gold text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm mb-12">No reviews yet — be the first to share your thoughts.</p>
          )}

          <div className="border border-line bg-panel p-8">
            <h3 className="font-display text-xl mb-5">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-gold">Your Name</label>
                  <input
                    value={name} onChange={(e) => setName(e.target.value)} required
                    placeholder="Your name"
                    className="bg-ink border border-line px-3.5 py-3 text-sm text-warm outline-none focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-gold">Rating</label>
                  <select
                    value={rating} onChange={(e) => setRating(Number(e.target.value))}
                    className="bg-ink border border-line px-3.5 py-3 text-sm text-warm outline-none focus:border-gold"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Star{n === 1 ? "" : "s"}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider text-gold">Your Review</label>
                <textarea
                  value={comment} onChange={(e) => setComment(e.target.value)} required rows={4}
                  placeholder="Share your experience with this fragrance..."
                  className="bg-ink border border-line px-3.5 py-3 text-sm text-warm outline-none focus:border-gold resize-y"
                />
              </div>
              <button
                type="submit" disabled={status === "sending"}
                className="px-8 py-4 text-xs uppercase tracking-widest bg-gradient-to-br from-gold-bright to-gold-deep text-ink font-medium hover:brightness-110 transition disabled:opacity-60"
              >
                {status === "sending" ? "Submitting..." : "Submit Review"}
              </button>
              {status === "success" && (
                <p className="text-gold-bright text-sm">Thanks for your review! It'll appear here once approved.</p>
              )}
              {status === "error" && (
                <p className="text-red-400 text-sm">Something went wrong — please try again.</p>
              )}
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
