import { useEffect, useState } from "react";

const STANDARD_SIZES = ["5ml Decant", "10ml Decant", "Full Bottle 100ml"];

const emptyForm = {
  name: "", slug: "", brand: "", category: "", gender: "Men's",
  price: "", oldPrice: "", badge: "", tags: "", mainImage: "", galleryImages: [],
  description: "", topNotes: "", middleNotes: "", baseNotes: "",
  featured: false, newArrival: false, bestSeller: false, stock: 50,
  collections: [], sizes: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collectionsList, setCollectionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    fetch("/api/products/admin/all")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    fetch("/api/brands").then((r) => r.json()).then(setBrands);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    fetch("/api/collections").then((r) => r.json()).then(setCollectionsList);
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    const productImages = (p.images?.length ? p.images : p.image ? [p.image] : []).filter(Boolean);
    setForm({
      name: p.name, slug: p.slug,
      brand: typeof p.brand === "object" ? p.brand._id : p.brand,
      category: typeof p.category === "object" ? p.category._id : p.category,
      gender: p.gender, price: p.price, oldPrice: p.oldPrice || "",
      badge: p.badge || "", tags: (p.tags || []).join(", "), mainImage: productImages[0] || "", galleryImages: productImages.slice(1),
      description: p.description || "",
      topNotes: p.notes?.top || "", middleNotes: p.notes?.middle || "", baseNotes: p.notes?.base || "",
      featured: p.featured, newArrival: p.newArrival, bestSeller: p.bestSeller, stock: p.stock ?? 50,
      collections: (p.collections || []).map((c) => (typeof c === "object" ? c._id : c)),
      // Any size saved on the product that matches one of our 3 standard
      // labels gets picked up here; a custom/legacy label from before
      // this change just won't show a checkbox (still safe, not deleted
      // unless you resave without it).
      sizes: (p.sizes || [])
        .filter((s) => STANDARD_SIZES.includes(s.label))
        .map((s) => ({ label: s.label, price: s.price })),
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const toggleCollection = (id) => {
    setForm((prev) => ({
      ...prev,
      collections: prev.collections.includes(id)
        ? prev.collections.filter((c) => c !== id)
        : [...prev.collections, id],
    }));
  };

  // ---- Sizes management — fixed set of 3 checkboxes, price shown once checked ----
  const isSizeChecked = (label) => form.sizes.some((s) => s.label === label);
  const getSizePrice = (label) => form.sizes.find((s) => s.label === label)?.price ?? "";

  const toggleSize = (label) => {
    setForm((prev) => {
      const exists = prev.sizes.some((s) => s.label === label);
      return {
        ...prev,
        sizes: exists
          ? prev.sizes.filter((s) => s.label !== label)
          : [...prev.sizes, { label, price: "" }],
      };
    });
  };

  const setSizePrice = (label, price) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => (s.label === label ? { ...s, price } : s)),
    }));
  };

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    if (file.size > 5 * 1024 * 1024) {
      alert(`This file is ${sizeMB}MB — the limit is 5MB. Please pick a smaller image.`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append("image", file);
    try {
      const res = await fetch("/api/upload/admin", { method: "POST", body: data });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || `Server responded with status ${res.status}`);
      setForm((prev) => imageType === "main"
        ? { ...prev, mainImage: result.url }
        : { ...prev, galleryImages: [...prev.galleryImages, result.url] }
      );
    } catch (err) {
      alert(`Image upload failed: ${err.message}\n\nFile: ${file.name} (${sizeMB}MB, ${file.type || "unknown type"})`);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const cleanSizes = form.sizes
      .filter((s) => s.price !== "" && s.price !== null)
      .map((s) => ({ label: s.label, price: Number(s.price) }));

    const payload = {
      name: form.name, slug: form.slug, brand: form.brand, category: form.category,
      gender: form.gender, price: Number(form.price), oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      badge: form.badge || null, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      images: [form.mainImage, ...form.galleryImages].filter(Boolean), description: form.description,
      notes: { top: form.topNotes, middle: form.middleNotes, base: form.baseNotes },
      featured: form.featured, newArrival: form.newArrival, bestSeller: form.bestSeller,
      stock: Number(form.stock), collections: form.collections,
      sizes: cleanSizes,
    };

    try {
      const url = editingId ? `/api/products/admin/${editingId}` : "/api/products/admin";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setShowForm(false);
      loadProducts();
    } catch {
      alert("Failed to save product. Check required fields.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/admin/${id}`, { method: "DELETE" });
    loadProducts();
  };

  const inputClass = "bg-ink border border-line px-3.5 py-2.5 text-sm text-warm outline-none focus:border-gold w-full";
  const labelClass = "text-xs uppercase tracking-wider text-gold mb-1.5 block";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl mb-1">Products</h1>
          <p className="text-muted text-sm">{products.length} product{products.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/products/admin/export"
            className="px-6 py-3 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition"
          >
            Export CSV
          </a>
          <button onClick={openCreate} className="px-6 py-3 text-xs uppercase tracking-widest bg-gold text-ink font-medium hover:brightness-110 transition">
            + Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <div className="border border-line bg-panel p-6 mb-8">
          <h2 className="font-display text-lg mb-5">{editingId ? "Edit Product" : "New Product"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Name</label><input name="name" value={form.name} onChange={handleChange} required className={inputClass} /></div>
              <div><label className={labelClass}>Slug</label><input name="slug" value={form.slug} onChange={handleChange} required className={inputClass} placeholder="e.g. khamrah-qahwa" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Brand</label>
                <select name="brand" value={form.brand} onChange={handleChange} required className={inputClass}>
                  <option value="">Select brand</option>
                  {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                  <option>Men's</option><option>Women's</option><option>Unisex</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className={labelClass}>Base Price (Rs)</label><input type="number" name="price" value={form.price} onChange={handleChange} required className={inputClass} /></div>
              <div><label className={labelClass}>Old Price</label><input type="number" name="oldPrice" value={form.oldPrice} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Badge</label><input name="badge" value={form.badge} onChange={handleChange} placeholder="New / Sale / Best Seller" className={inputClass} /></div>
              <div><label className={labelClass}>Stock</label><input type="number" name="stock" value={form.stock} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Tags (comma separated: new, bestseller, popular)</label><input name="tags" value={form.tags} onChange={handleChange} className={inputClass} /></div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Main Product Image</label>
                <p className="text-xs text-muted mb-2">This is the primary image on product cards and opens first on the product page.</p>
                <div className="flex items-center gap-4 mb-2">
                  {form.mainImage && <img src={form.mainImage} alt="Main product preview" className="w-16 h-16 object-cover border border-gold" />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "main")}
                    disabled={uploading}
                    className="text-sm text-muted file:mr-4 file:px-4 file:py-2 file:border-0 file:text-xs file:uppercase file:tracking-widest file:bg-gold file:text-ink file:cursor-pointer cursor-pointer"
                  />
                </div>
                <input name="mainImage" value={form.mainImage} onChange={handleChange} placeholder="Or paste the main image URL" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Additional Gallery Images</label>
                <p className="text-xs text-muted mb-2">These appear as clickable thumbnails below the main image. Add one image at a time.</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "gallery")}
                  disabled={uploading}
                  className="text-sm text-muted file:mr-4 file:px-4 file:py-2 file:border-0 file:text-xs file:uppercase file:tracking-widest file:bg-gold file:text-ink file:cursor-pointer cursor-pointer"
                />
                {uploading && <p className="text-xs text-gold mt-2">Uploading...</p>}
                {form.galleryImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.galleryImages.map((image, index) => (
                      <div key={`${image}-${index}`} className="relative">
                        <img src={image} alt={`Gallery image ${index + 1}`} className="w-16 h-16 object-cover border border-line" />
                        <button type="button" onClick={() => removeGalleryImage(index)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink border border-gold text-gold text-xs" aria-label={`Remove gallery image ${index + 1}`}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div><label className={labelClass}>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelClass}>Top Notes</label><input name="topNotes" value={form.topNotes} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Middle Notes</label><input name="middleNotes" value={form.middleNotes} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Base Notes</label><input name="baseNotes" value={form.baseNotes} onChange={handleChange} className={inputClass} /></div>
            </div>

            {/* Sizes — fixed set of 3, pick which ones this product offers */}
            <div>
              <label className={labelClass}>Sizes &amp; Prices</label>
              <p className="text-xs text-muted mb-3">
                Check which sizes this product comes in, then set the price for each. Unchecked sizes won't show on the product page.
              </p>
              <div className="space-y-3">
                {STANDARD_SIZES.map((label) => {
                  const checked = isSizeChecked(label);
                  return (
                    <div key={label} className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-muted w-44 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSize(label)}
                          className="accent-gold"
                        />
                        {label}
                      </label>
                      {checked && (
                        <input
                          type="number"
                          value={getSizePrice(label)}
                          onChange={(e) => setSizePrice(label, e.target.value)}
                          placeholder="Price (Rs)"
                          className="bg-ink border border-line px-3.5 py-2.5 text-sm text-warm outline-none focus:border-gold w-40"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>Collections</label>
              <div className="flex flex-wrap gap-4">
                {collectionsList.map((c) => (
                  <label key={c._id} className="flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={form.collections.includes(c._id)}
                      onChange={() => toggleCollection(c._id)}
                      className="accent-gold"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="accent-gold" /> Featured</label>
              <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" name="newArrival" checked={form.newArrival} onChange={handleChange} className="accent-gold" /> New Arrival</label>
              <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" name="bestSeller" checked={form.bestSeller} onChange={handleChange} className="accent-gold" /> Best Seller</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-6 py-3 text-xs uppercase tracking-widest bg-gold text-ink font-medium disabled:opacity-60">
                {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-xs uppercase tracking-widest border border-line text-muted">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : (
        <div className="border border-line bg-panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-gold">
                <th className="p-4"></th><th className="p-4">Name</th><th className="p-4">Brand</th><th className="p-4">Category</th>
                <th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-line last:border-b-0">
                  <td className="p-4">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover border border-line" />
                    ) : (
                      <div className="w-10 h-10 border border-line bg-ink flex items-center justify-center text-muted text-[10px]">—</div>
                    )}
                  </td>
                  <td className="p-4">{p.name}</td>
                  <td className="p-4 text-muted">{p.brand?.name}</td>
                  <td className="p-4 text-muted">{p.category?.name}</td>
                  <td className="p-4 text-gold-bright">Rs {p.price?.toLocaleString()}</td>
                  <td className="p-4 text-muted">{p.stock}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="text-gold hover:text-gold-bright text-xs mr-4">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-muted text-sm text-center py-10">No products yet.</p>}
        </div>
      )}
    </div>
  );
}
