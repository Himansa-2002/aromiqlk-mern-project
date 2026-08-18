import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

export default function CategoryPage() {
  const { slug } = useParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCategory(null);
    setProducts([]);

    fetch(`/api/categories/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Category not found");
        return r.json();
      })
      .then((data) => {
        setCategory(data.category);
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

  if (error || !category) {
    return (
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-red-400 text-sm mb-4">{error || "Category not found."}</p>
          <Link to="/shop" className="text-gold text-sm">← Back to Shop</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 border-b border-line bg-gradient-to-br from-gold/10 to-transparent">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">Category</span>
          <h1 className="font-display font-semibold text-4xl md:text-5xl mt-2.5">{category.name}</h1>
          {category.description && <p className="text-muted text-sm mt-4 max-w-xl">{category.description}</p>}
          <div className="text-xs text-muted mt-4"><Link to="/" className="text-gold">Home</Link> / <Link to="/shop" className="text-gold">Shop</Link> / {category.name}</div>
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
            <p className="text-muted text-sm text-center py-12">No products in this category yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
