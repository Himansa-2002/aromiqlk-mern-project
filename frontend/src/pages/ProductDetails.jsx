import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeSize, setActiveSize] = useState(0);
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setProduct(null);
    setActiveSize(0);
    setQty(1);

    fetch(`/api/products/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Product not found");
        return r.json();
      })
      .then((data) => {
        setProduct(data);
        fetch(`/api/products/${data._id}/related`)
          .then((r) => (r && r.ok ? r.json() : []))
          .then((relatedData) => setRelated(relatedData || []))
          .catch(() => { });
        return fetch(`/api/products/${data._id}/reviews`);
      })
      .then((r) => (r && r.ok ? r.json() : []))
      .then((reviewData) => setReviews(reviewData || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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

  const getSelectedSize = () => {
    const availableSizes = product?.sizes?.length
      ? product.sizes
      : [{ label: "Full Bottle", price: product?.price }];

    return availableSizes[activeSize] || availableSizes[0];
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setCartMessage("");

    if (!product || addingToCart) return;

    if ((product.stock ?? 1) <= 0) {
      setCartMessage("This product is currently out of stock.");
      return;
    }

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    const selectedSize = getSelectedSize();
    setAddingToCart(true);

    try {
      await addItem({
        productId: product._id,
        selectedSize: selectedSize?.label,
        quantity: qty,
      });
      setCartMessage("Added to cart successfully.");
    } catch (err) {
      if (err.status === 401) {
        navigate("/login");
        return;
      }
      setCartMessage(err.message || "Unable to add this product to the cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    setCartMessage("");

    if (!product || addingToCart) return;

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    if ((product.stock ?? 1) <= 0) {
      setCartMessage("This product is currently out of stock.");
      return;
    }

    const selectedSize = getSelectedSize();
    setAddingToCart(true);

    try {
      await addItem(
        {
          productId: product._id,
          selectedSize: selectedSize?.label,
          quantity: qty,
        },
        { openDrawer: false }
      );
      navigate("/checkout");
    } catch (err) {
      if (err.status === 401) {
        navigate("/login");
        return;
      }
      setCartMessage(err.message || "Unable to continue to checkout.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8 text-center text-muted text-sm">Loading...</div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-red-400 text-sm mb-4">{error || "Product not found."}</p>
          <Link to="/shop" className="text-gold text-sm">← Back to Shop</Link>
        </div>
      </section>
    );
  }

  const brandName = typeof product.brand === "object" ? product.brand?.name : product.brand;
  const sizes = product.sizes?.length ? product.sizes : [{ label: "Full Bottle", price: product.price }];
  const displayPrice = sizes[activeSize]?.price ?? product.price;

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
            <div className="aspect-[4/5] border border-line bg-gradient-to-br from-gold/15 to-panel flex items-center justify-center mb-3.5 overflow-hidden">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 120 160" fill="none" className="w-[34%]"><rect x="34" y="42" width="52" height="98" rx="10" stroke="#c9a961" strokeWidth="1.2" /><path d="M46 18h28l10 13-10 10H46l-10-10 10-13Z" stroke="#c9a961" strokeWidth="1.2" /></svg>
              )}
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
            <span className="text-xs uppercase tracking-wider text-gold">{brandName}</span>
            <h1 className="font-display text-3xl md:text-4xl mt-2.5 mb-3">{product.name}</h1>
            <div className="text-gold text-sm mb-4">
              {"★".repeat(Math.round(product.rating || 0))} <span className="text-muted text-xs">({product.reviewCount || 0} reviews)</span>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-6">{product.description}</p>

            {product.notes && (
              <div className="flex gap-8 flex-wrap mb-7">
                <div>
                  <h5 className="text-[11px] uppercase tracking-wider text-gold mb-2">Top Notes</h5>
                  <p className="text-xs text-muted max-w-[160px]">{product.notes.top}</p>
                </div>
                <div>
                  <h5 className="text-[11px] uppercase tracking-wider text-gold mb-2">Middle Notes</h5>
                  <p className="text-xs text-muted max-w-[160px]">{product.notes.middle}</p>
                </div>
                <div>
                  <h5 className="text-[11px] uppercase tracking-wider text-gold mb-2">Base Notes</h5>
                  <p className="text-xs text-muted max-w-[160px]">{product.notes.base}</p>
                </div>
              </div>
            )}

            <h5 className="text-[11px] uppercase tracking-wider text-gold mb-2.5">Select Size</h5>
            <div className="flex gap-3 mb-7 flex-wrap">
              {sizes.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setActiveSize(i)}
                  className={`px-4 py-2.5 text-sm border transition-colors ${i === activeSize ? "border-gold text-gold-bright" : "border-line text-muted"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="font-display text-2xl text-gold-bright mb-7">
              Rs {displayPrice.toLocaleString()}
            </div>

            <div className="flex items-center gap-5 mb-7">
              <div className="flex items-center border border-line">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-10 text-gold text-lg">−</button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-9 h-10 text-gold text-lg">+</button>
              </div>
              <span className="text-green-400 text-sm">
                {(product.stock ?? 1) > 0 ? "● In Stock" : "● Out of Stock"}
              </span>
            </div>

            <div className="flex gap-3.5 flex-wrap mb-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart || (product.stock ?? 1) <= 0}
                className="px-8 py-4 text-xs uppercase tracking-widest bg-gradient-to-br from-gold-bright to-gold-deep text-ink font-medium hover:brightness-110 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={addingToCart || (product.stock ?? 1) <= 0}
                className="px-8 py-4 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
              <a href="https://wa.me/94788778808" target="_blank" rel="noreferrer" className="px-8 py-4 text-xs uppercase tracking-widest border border-warm/35 text-warm hover:border-warm transition">WhatsApp Inquiry</a>
            </div>

            {cartMessage && (
              <p className={`mb-7 text-sm ${cartMessage.includes("successfully") ? "text-green-400" : "text-red-400"}`}>
                {cartMessage}
              </p>
            )}

            <div className="text-sm text-muted">
              <div className="flex justify-between py-2 border-b border-line"><span>Brand</span><span>{brandName}</span></div>
              <div className="flex justify-between py-2 border-b border-line"><span>Availability</span><span>{(product.stock ?? 1) > 0 ? "In Stock" : "Out of Stock"}</span></div>
              <div className="flex justify-between py-2 border-b border-line"><span>Delivery</span><span>2–5 working days, islandwide</span></div>
            </div>
          </div>

        </div>
      </section>

      <ReviewsSection product={product} reviews={reviews} />

      {related.length > 0 && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center max-w-lg mx-auto mb-12">
              <span className="text-xs uppercase tracking-[0.3em] text-gold">You May Also Like</span>
              <h2 className="font-display font-semibold text-3xl md:text-4xl mt-3">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((r) => <ProductCard product={r} key={r._id} />)}
            </div>
          </div>
        </section>
      )}
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