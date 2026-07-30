import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

export default function BrandPage() {
  const { slug } = useParams();

  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setBrand(null);
    setProducts([]);

    fetch(`/api/brands/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Brand not found");
        return r.json();
      })
      .then((data) => {
        setBrand(data.brand);
        setProducts(data.products || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8 text-center text-muted text-sm">Loading...</div>
      </section>
    );
  }

  if (error || !brand) {
    return (
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-red-400 text-sm mb-4">{error || "Brand not found."}</p>
          <Link to="/shop" className="text-gold text-sm">← Back to Shop</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 border-b border-line bg-gradient-to-br from-gold/10 to-transparent">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center gap-6">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="w-16 h-16 object-contain border border-line bg-panel p-2" />
            ) : (
              <div className="w-16 h-16 border border-line bg-panel flex items-center justify-center font-display text-2xl text-gold">
                {brand.name.charAt(0)}
              </div>
            )}
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-gold">Brand</span>
              <h1 className="font-display font-semibold text-3xl md:text-4xl">{brand.name}</h1>
            </div>
          </div>
          {brand.description && <p className="text-muted text-sm mt-4 max-w-xl">{brand.description}</p>}
          <div className="text-xs text-muted mt-4"><Link to="/" className="text-gold">Home</Link> / <Link to="/shop" className="text-gold">Shop</Link> / {brand.name}</div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-sm text-muted mb-6">{products.length} result{products.length === 1 ? "" : "s"}</p>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => <ProductCard product={p} key={p._id} />)}
            </div>
          ) : (
            <p className="text-muted text-sm text-center py-12">No products from this brand yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
