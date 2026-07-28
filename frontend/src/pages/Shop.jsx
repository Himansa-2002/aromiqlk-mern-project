import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

export default function Shop() {
  const [brandsList, setBrandsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  const [brands, setBrands] = useState([]);       // selected Brand _ids
  const [categories, setCategories] = useState([]); // selected Category _ids
  const [genders, setGenders] = useState([]);
  const [tags, setTags] = useState([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load brand/category options once, to build the filter sidebar and
  // translate checkbox selections into the ObjectIds the API expects.
  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then(setBrandsList).catch(() => {});
    fetch("/api/categories").then((r) => r.json()).then(setCategoriesList).catch(() => {});
  }, []);

  // Re-fetch products whenever any filter, sort, search, or page changes.
  useEffect(() => {
    const params = new URLSearchParams();
    if (brands.length) brands.forEach((b) => params.append("brand", b));
    if (categories.length) categories.forEach((c) => params.append("category", c));
    if (genders.length) genders.forEach((g) => params.append("gender", g));
    if (tags.length) tags.forEach((t) => params.append("tag", t));
    if (priceMin) params.set("minPrice", priceMin);
    if (priceMax) params.set("maxPrice", priceMax);
    if (search) params.set("search", search);
    params.set("sort", sort);
    params.set("page", page);
    params.set("limit", 9);

    setLoading(true);
    setError(null);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load products");
        return r.json();
      })
      .then((data) => {
        setProducts(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [brands, categories, genders, tags, priceMin, priceMax, search, sort, page]);

  const toggle = (list, setList, value) => {
    setPage(1);
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const clearFilters = () => {
    setBrands([]); setCategories([]); setGenders([]); setTags([]);
    setPriceMin(""); setPriceMax(""); setSearch(""); setSort("default"); setPage(1);
  };

  const checkboxRow = (checked, onChange, label) => (
    <label className="flex items-center gap-2.5 text-sm text-muted py-1.5 cursor-pointer hover:text-warm">
      <input type="checkbox" checked={checked} onChange={onChange} className="w-3.5 h-3.5 accent-gold" /> {label}
    </label>
  );

  const findCategoryId = (name) => categoriesList.find((c) => c.name === name)?._id;

  return (
    <>
      <section className="py-16 border-b border-line bg-gradient-to-br from-gold/10 to-transparent">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-xs uppercase tracking-[0.3em] text-gold">The Full Collection</span>
          <h1 className="font-display font-semibold text-4xl md:text-5xl mt-2.5">Shop All Fragrances</h1>
          <div className="text-xs text-muted mt-3"><Link to="/" className="text-gold">Home</Link> / Shop</div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-[260px_1fr] gap-12">

          <aside className="border border-line bg-panel p-6 self-start md:sticky md:top-28">
            <div className="pb-5 border-b border-line">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">Brand</h5>
              {brandsList.map((b) =>
                checkboxRow(brands.includes(b._id), () => toggle(brands, setBrands, b._id), b.name)
              )}
            </div>

            <div className="py-5 border-b border-line">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">Category</h5>
              {categoriesList.map((c) =>
                checkboxRow(categories.includes(c._id), () => toggle(categories, setCategories, c._id), c.name)
              )}
            </div>

            <div className="py-5 border-b border-line">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">Gender</h5>
              {checkboxRow(genders.includes("Men's"), () => toggle(genders, setGenders, "Men's"), "Men's")}
              {checkboxRow(genders.includes("Women's"), () => toggle(genders, setGenders, "Women's"), "Women's")}
              {checkboxRow(genders.includes("Unisex"), () => toggle(genders, setGenders, "Unisex"), "Unisex")}
            </div>

            <div className="py-5 border-b border-line">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">Price Range (Rs)</h5>
              <div className="flex items-center gap-2.5">
                <input type="number" placeholder="Min" value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setPage(1); }} className="w-full bg-ink border border-line px-2.5 py-2 text-xs text-warm outline-none focus:border-gold" />
                <span className="text-muted">—</span>
                <input type="number" placeholder="Max" value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setPage(1); }} className="w-full bg-ink border border-line px-2.5 py-2 text-xs text-warm outline-none focus:border-gold" />
              </div>
            </div>

            <div className="pt-5">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">Show</h5>
              {checkboxRow(tags.includes("bestseller"), () => toggle(tags, setTags, "bestseller"), "Best Selling")}
              {checkboxRow(tags.includes("new"), () => toggle(tags, setTags, "new"), "New Arrival")}
              {checkboxRow(tags.includes("popular"), () => toggle(tags, setTags, "popular"), "Popular Products")}
            </div>

            <button onClick={clearFilters} className="w-full mt-5 px-6 py-3.5 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition">
              Clear All
            </button>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7">
              <div className="flex-1 min-w-[220px] flex items-center gap-2.5 border border-line bg-panel px-4 py-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gold flex-shrink-0"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                <input type="text" placeholder="Search fragrances, brands, notes..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="flex-1 bg-transparent text-sm text-warm outline-none" />
              </div>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="bg-panel border border-line text-sm text-warm px-3.5 py-3">
                <option value="default">Sort: Popular Products</option>
                <option value="new">Sort: New Arrival</option>
                <option value="bestseller">Sort: Best Selling</option>
                <option value="price-asc">Sort: Price — Low to High</option>
                <option value="price-desc">Sort: Price — High to Low</option>
              </select>
            </div>

            <p className="text-sm text-muted mb-5">{loading ? "Loading..." : `${total} result${total === 1 ? "" : "s"}`}</p>

            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[1/1.6] border border-line bg-panel animate-pulse" />
                ))}
              </div>
            )}

            {!loading && error && (
              <p className="text-red-400 text-sm text-center py-12">
                Couldn't load products — is the backend running? ({error})
              </p>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((p) => <ProductCard product={p} key={p._id} />)}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <p className="text-muted text-sm text-center py-12">No fragrances match your filters — try clearing some.</p>
            )}

            {!loading && !error && totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-14">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center border text-sm ${
                      page === i + 1 ? "border-gold text-gold-bright" : "border-line text-muted"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </>
  );
}
