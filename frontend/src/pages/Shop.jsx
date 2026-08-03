import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";

export default function Shop() {
  const [brandsList, setBrandsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const [filterLoading, setFilterLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load brand and category filter options.
  useEffect(() => {
    const loadFilters = async () => {
      setFilterLoading(true);

      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/brands"),
          fetch("/api/categories"),
        ]);

        if (!brandsResponse.ok) {
          throw new Error("Failed to load brands");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Failed to load categories");
        }

        const brandsData = await brandsResponse.json();
        const categoriesData = await categoriesResponse.json();

        setBrandsList(
          Array.isArray(brandsData)
            ? brandsData
            : brandsData.items || brandsData.brands || []
        );

        setCategoriesList(
          Array.isArray(categoriesData)
            ? categoriesData
            : categoriesData.items || categoriesData.categories || []
        );
      } catch (err) {
        console.error("Filter loading error:", err);
      } finally {
        setFilterLoading(false);
      }
    };

    loadFilters();
  }, []);

  // Fetch products whenever filters, search, sorting, or page changes.
  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      const params = new URLSearchParams();

      brands.forEach((brandId) => {
        params.append("brand", brandId);
      });

      categories.forEach((categoryId) => {
        params.append("category", categoryId);
      });

      genders.forEach((gender) => {
        params.append("gender", gender);
      });

      tags.forEach((tag) => {
        params.append("tag", tag);
      });

      if (priceMin) {
        params.set("minPrice", priceMin);
      }

      if (priceMax) {
        params.set("maxPrice", priceMax);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (sort !== "default") {
        params.set("sort", sort);
      }

      params.set("page", page.toString());
      params.set("limit", "9");

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/products?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        const productItems = Array.isArray(data)
          ? data
          : data.items || data.products || [];

        setProducts(productItems);

        setTotal(
          Array.isArray(data)
            ? data.length
            : data.total ?? data.count ?? productItems.length
        );

        setTotalPages(
          Array.isArray(data)
            ? 1
            : data.totalPages ?? data.pages ?? 1
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Product loading error:", err);
          setError(err.message);
          setProducts([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [
    brands,
    categories,
    genders,
    tags,
    priceMin,
    priceMax,
    search,
    sort,
    page,
  ]);

  const toggle = (list, setList, value) => {
    setPage(1);

    setList((currentList) =>
      currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value]
    );
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
    setPage(1);
  };

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

  const handlePreviousPage = () => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    setPage((currentPage) =>
      Math.min(totalPages, currentPage + 1)
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">
                Brand
              </h5>

              {filterLoading && (
                <p className="text-xs text-muted">
                  Loading brands...
                </p>
              )}

              {!filterLoading && brandsList.length === 0 && (
                <p className="text-xs text-muted">
                  No brands available.
                </p>
              )}

              {brandsList.map((brand) =>
                checkboxRow(
                  brands.includes(brand._id),
                  () => toggle(brands, setBrands, brand._id),
                  brand.name
                )
              )}
            </div>

            <div className="py-5 border-b border-line">
              <h5 className="text-xs uppercase tracking-widest text-gold mb-3.5">
                Category
              </h5>

              {filterLoading && (
                <p className="text-xs text-muted">
                  Loading categories...
                </p>
              )}

              {!filterLoading && categoriesList.length === 0 && (
                <p className="text-xs text-muted">
                  No categories available.
                </p>
              )}

              {categoriesList.map((category) =>
                checkboxRow(
                  categories.includes(category._id),
                  () =>
                    toggle(
                      categories,
                      setCategories,
                      category._id
                    ),
                  category.name
                )
              )}
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
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(event) => {
                    setPriceMin(event.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-ink border border-line px-2.5 py-2 text-xs text-warm outline-none focus:border-gold"
                />

                <span className="text-muted">—</span>

                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(event) => {
                    setPriceMax(event.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-ink border border-line px-2.5 py-2 text-xs text-warm outline-none focus:border-gold"
                />
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gold flex-shrink-0"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />

                  <path
                    d="M21 21l-4.3-4.3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Search fragrances, brands, notes..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="flex-1 bg-transparent text-sm text-warm outline-none"
                />
              </div>

              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                className="bg-panel border border-line text-sm text-warm px-3.5 py-3"
              >
                <option value="default">
                  Sort: Popular Products
                </option>

                <option value="new">
                  Sort: New Arrival
                </option>

                <option value="bestseller">
                  Sort: Best Selling
                </option>

                <option value="price-asc">
                  Sort: Price — Low to High
                </option>

                <option value="price-desc">
                  Sort: Price — High to Low
                </option>
              </select>
            </div>

            <p className="text-sm text-muted mb-5">
              {loading
                ? "Loading..."
                : `${total} result${total === 1 ? "" : "s"}`}
            </p>

            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[1/1.6] border border-line bg-panel animate-pulse"
                  />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="border border-red-400/30 bg-red-400/5 px-6 py-10 text-center">
                <p className="text-red-400 text-sm">
                  Could not load products. Make sure the backend is
                  running.
                </p>

                <p className="text-red-400/70 text-xs mt-2">
                  {error}
                </p>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id || product.slug}
                    product={product}
                  />
                ))}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="border border-line bg-panel px-6 py-12 text-center">
                <p className="text-muted text-sm">
                  No fragrances match your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 px-6 py-3 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {!loading && !error && totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-14">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="px-4 h-10 flex items-center justify-center border border-line text-sm text-muted hover:border-gold hover:text-gold-bright disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() =>
                      handlePageChange(pageNumber)
                    }
                    className={`w-10 h-10 flex items-center justify-center border text-sm transition-colors ${page === pageNumber
                        ? "border-gold bg-gold/10 text-gold-bright"
                        : "border-line text-muted hover:border-gold hover:text-gold-bright"
                      }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="px-4 h-10 flex items-center justify-center border border-line text-sm text-muted hover:border-gold hover:text-gold-bright disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}