import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

const brandOptions = ["Lattafa", "Armaf", "Afnan", "Al Haramain", "Rasasi"];

const matchesProductSearch = (product, query) => {
  const q = query.toLowerCase().trim();
  if (!q) return true;

  const collectionNames = (product.collections || [])
    .map((c) => (typeof c === "string" ? c : c?.name))
    .filter(Boolean);

  const extras = [];
  if (product.tags?.includes("new")) extras.push("new arrival", "arrival");
  if (product.tags?.includes("bestseller")) extras.push("best selling", "best seller");
  if (product.tags?.includes("popular")) extras.push("popular products");
  if (product.gender === "Men's") extras.push("men", "male");
  if (product.gender === "Women's") extras.push("women", "female");
  if (product.category === "Oils") extras.push("perfume oils", "oil");

  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.gender,
    ...collectionNames,
    ...(product.tags || []),
    product.description,
    ...extras,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return q.split(/\s+/).every((term) => haystack.includes(term));
};

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [tags, setTags] = useState([]);

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // Fetch product data from backend API on component mount
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        const items = (data.items || data).map((p) => ({
          ...p,
          brand: p.brand?.name || p.brand,
          category: p.category?.name || p.category,
          collections: (p.collections || []).map((c) => c?.name || c).filter(Boolean),
          tags: p.tags || [],
        }));
        setProducts(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const updateSearch = (value) => {
    setSearch(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("search", value.trim());
    else next.delete("search");
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setBrands([]);
    setCategories([]);
    setGenders([]);
    setTags([]);
    setPriceMin("");
    setPriceMax("");
    setSearch("");
    setSort("default");
    const next = new URLSearchParams(searchParams);
    next.delete("search");
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (brands.length && !brands.includes(p.brand)) return false;
      if (categories.length && !categories.includes(p.category)) return false;
      if (genders.length && !genders.includes(p.gender)) return false;
      if (tags.length && !tags.some((t) => p.tags.includes(t))) return false;
      if (priceMin && p.price < parseFloat(priceMin)) return false;
      if (priceMax && p.price > parseFloat(priceMax)) return false;
      
      if (search && !matchesProductSearch(p, search)) return false;
      return true;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "new") list = [...list].sort((a, b) => b.tags.includes("new") - a.tags.includes("new"));
    if (sort === "bestseller") list = [...list].sort((a, b) => b.tags.includes("bestseller") - a.tags.includes("bestseller"));
    return list;
  }, [products, brands, categories, genders, tags, priceMin, priceMax, search, sort]);

  const checkboxRow = (checked, onChange, label) => (
    <label className="flex items-center gap-2.5 text-sm text-muted py-1.5 cursor-pointer hover:text-warm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 accent-gold"
      />

      <span>{label}</span>
    </label>
  );

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-8 text-center text-warm">Loading products...</div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 border-b border-line bg-gradient-to-br from-gold/10 to-transparent">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">
            The Full Collection
          </span>

          <h1 className="font-display font-semibold text-4xl md:text-5xl mt-2.5">
            Shop All Fragrances
          </h1>

          <div className="text-xs text-muted mt-3">
            <Link to="/" className="text-gold">
              Home
            </Link>
            {" / "}
            Shop
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-[260px_1fr] gap-12">
          <aside className="border border-line bg-panel p-6 self-start md:sticky md:top-28">
            <div className="pb-5 border-b border-line">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">Brand</h5>
              {brandOptions.map((b) => checkboxRow(brands.includes(b), () => toggle(brands, setBrands, b), b))}
            </div>

            <div className="py-5 border-b border-line">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">Category</h5>
              {checkboxRow(categories.includes("Oils"), () => toggle(categories, setCategories, "Oils"), "Perfume Oils")}
              {checkboxRow(categories.includes("Gift Sets"), () => toggle(categories, setCategories, "Gift Sets"), "Gift Sets")}
              {checkboxRow(categories.includes("Decants"), () => toggle(categories, setCategories, "Decants"), "Decants (5ml & 10ml)")}
            </div>

            <div className="py-5 border-b border-line">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">
                Gender
              </h5>

              {checkboxRow(
                genders.includes("Men's"),
                () => toggle(genders, setGenders, "Men's"),
                "Men's"
              )}

              {checkboxRow(
                genders.includes("Women's"),
                () => toggle(genders, setGenders, "Women's"),
                "Women's"
              )}

              {checkboxRow(
                genders.includes("Unisex"),
                () => toggle(genders, setGenders, "Unisex"),
                "Unisex"
              )}
            </div>

            <div className="py-5 border-b border-line">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">
                Price Range (Rs)
              </h5>

              <div className="flex items-center gap-2.5">
                <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full bg-ink border border-line px-2.5 py-2 text-xs text-warm outline-none focus:border-gold" />
                <span className="text-muted">—</span>
                <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full bg-ink border border-line px-2.5 py-2 text-xs text-warm outline-none focus:border-gold" />
              </div>
            </div>

            <div className="pt-5">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">
                Show
              </h5>

              {checkboxRow(
                tags.includes("bestseller"),
                () =>
                  toggle(tags, setTags, "bestseller"),
                "Best Selling"
              )}

              {checkboxRow(
                tags.includes("new"),
                () => toggle(tags, setTags, "new"),
                "New Arrival"
              )}

              {checkboxRow(
                tags.includes("popular"),
                () => toggle(tags, setTags, "popular"),
                "Popular Products"
              )}
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="w-full mt-5 px-6 py-3.5 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition"
            >
              Clear All
            </button>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7">
              <div className="flex-1 min-w-[220px] flex items-center gap-2.5 border border-line bg-panel px-4 py-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gold flex-shrink-0"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                <input type="text" placeholder="Search products, brands, categories, collections..." value={search} onChange={(e) => updateSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-warm outline-none" />
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-panel border border-line text-sm text-warm px-3.5 py-3">
                <option value="default">Sort: Popular Products</option>
                <option value="new">Sort: New Arrival</option>
                <option value="bestseller">Sort: Best Selling</option>
                <option value="price-asc">Sort: Price — Low to High</option>
                <option value="price-desc">Sort: Price — High to Low</option>
              </select>
            </div>

            <p className="text-sm text-muted mb-5">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filtered.map((p) => <ProductCard product={p} key={p.name} />)}
            </div>

            {filtered.length === 0 && (
              <p className="text-muted text-sm text-center py-12">No fragrances match your filters — try clearing some.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}