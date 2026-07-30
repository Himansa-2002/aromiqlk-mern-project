import { Link, useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { brand, name, price, oldPrice, rating = 5, badge, _id, slug } = product;
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation(); // prevent link navigation
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: _id || name })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add to cart');
        return res.json();
      })
      .then(() => {
        // After adding, navigate to cart page
        navigate('/cart');
      })
      .catch((err) => {
        console.error(err);
        // Optionally show error UI
      });
  };

  return (
    <Link
      to={`/product/${slug || name.replace(/\s+/g, '-').toLowerCase()}`}
      className="group border border-line bg-panel hover:border-gold transition-colors duration-300"
    >
      <div className="relative aspect-[1/1.15] bg-gradient-to-br from-gold/10 to-transparent flex items-center justify-center">
        {badge && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-gold text-ink px-2.5 py-1 rounded-sm">
            {badge}
          </span>
        )}
        <svg viewBox="0 0 120 160" fill="none" className="w-2/5 opacity-85">
          <rect x="34" y="42" width="52" height="98" rx="10" stroke="#c9a961" strokeWidth="1.2" />
          <path d="M46 18h28l10 13-10 10H46l-10-10 10-13Z" stroke="#c9a961" strokeWidth="1.2" />
        </svg>
        <div className="absolute left-3 right-3 bottom-3 text-center text-[11px] uppercase tracking-wider py-2.5 bg-ink/80 border border-gold text-gold-bright opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          Quick View
        </div>
      </div>
      <div className="p-4 pb-5">
        <span className="text-[11px] uppercase tracking-wider text-gold">{brand}</span>
        <h4 className="font-display text-lg mt-1.5 mb-2.5 text-warm">{name}</h4>
        <div className="text-gold text-xs mb-2 tracking-wider">
          {"★".repeat(rating)}{"☆".repeat(5 - rating)}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display text-xl text-gold-bright">
            {oldPrice && <s className="text-muted text-sm mr-2">Rs {oldPrice.toLocaleString()}</s>}
            Rs {price.toLocaleString()}
          </span>
          <button
            aria-label="Add to cart"
            onClick={handleAddToCart}
            className="w-9 h-9 rounded-full border border-gold text-gold flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 6h2l1.6 10.2A2 2 0 0 0 9.6 18h7.8a2 2 0 0 0 2-1.6L21 8H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="10" cy="21" r="1.3" fill="currentColor" /><circle cx="18" cy="21" r="1.3" fill="currentColor" /></svg>
          </button>
        </div>
      </div>
    </Link>
  );
};

// Removed unused handleBuyNow – buying is handled on the ProductDetails page

export default ProductCard;
