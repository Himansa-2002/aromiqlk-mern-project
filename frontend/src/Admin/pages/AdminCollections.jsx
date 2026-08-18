import { useEffect, useState } from "react";

export default function AdminCollections() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", slug: "", description: "", image: "", featured: false });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/collections").then((r) => r.json()).then(setItems).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/collections/admin/${editingId}` : "/api/collections/admin";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", slug: "", description: "", image: "", featured: false });
    setEditingId(null);
    load();
  };

  const startEdit = (c) => { setForm({ name: c.name, slug: c.slug, description: c.description || "", image: c.image || "", featured: c.featured }); setEditingId(c._id); };
  const handleDelete = async (id) => { if (!confirm("Delete this collection?")) return; await fetch(`/api/collections/admin/${id}`, { method: "DELETE" }); load(); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("The image must be 5MB or smaller.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append("image", file);
      const response = await fetch("/api/upload/admin", { method: "POST", body: data });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Upload failed");
      setForm((prev) => ({ ...prev, image: result.url }));
    } catch (error) {
      alert(`Collection image upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "bg-ink border border-line px-3.5 py-2.5 text-sm text-warm outline-none focus:border-gold w-full";

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1">Collections</h1>
      <p className="text-muted text-sm mb-8">{items.length} collection{items.length === 1 ? "" : "s"}</p>

      <form onSubmit={handleSubmit} className="border border-line bg-panel p-6 mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs uppercase tracking-wider text-gold mb-1.5 block">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} /></div>
          <div><label className="text-xs uppercase tracking-wider text-gold mb-1.5 block">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className={inputClass} /></div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-gold mb-1.5 block">Collection Cover Image</label>
          <p className="text-xs text-muted mb-2">Shown on the homepage collection card and the collection page banner.</p>
          <div className="flex items-center gap-3 mb-3">
            {form.image ? (
              <div className="relative">
                <img src={form.image} alt="Collection preview" className="w-20 h-20 object-cover border border-gold" />
                <button type="button" onClick={() => setForm((prev) => ({ ...prev, image: "" }))} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink border border-gold text-gold text-xs" aria-label="Remove collection image">×</button>
              </div>
            ) : (
              <div className="w-20 h-20 border border-dashed border-line flex items-center justify-center text-[10px] uppercase tracking-wider text-muted">No image</div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-sm text-muted file:mr-4 file:px-4 file:py-2 file:border-0 file:text-xs file:uppercase file:tracking-widest file:bg-gold file:text-ink file:cursor-pointer disabled:opacity-50" />
          </div>
          {uploading && <p className="text-xs text-gold mb-2">Uploading collection image...</p>}
          <input value={form.image} onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))} placeholder="Or paste a collection image URL" className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-gold" />
          Featured on homepage
        </label>
        <button type="submit" className="px-6 py-2.5 text-xs uppercase tracking-widest bg-gold text-ink font-medium">{editingId ? "Update" : "+ Add Collection"}</button>
      </form>

      {loading ? <p className="text-muted text-sm">Loading...</p> : (
        <div className="border border-line bg-panel">
          {items.map((c) => (
            <div key={c._id} className="flex items-center justify-between p-4 border-b border-line last:border-b-0">
              <div className="flex items-center gap-3">
                {c.image && <img src={c.image} alt="" className="w-10 h-10 object-cover border border-line" />}
                <div>
                <span className="text-sm">{c.name}</span> <span className="text-muted text-xs ml-2">/{c.slug}</span>
                {c.featured && <span className="ml-2 text-[10px] uppercase tracking-wider bg-gold text-ink px-2 py-0.5 rounded-sm">Featured</span>}
                </div>
              </div>
              <div>
                <button onClick={() => startEdit(c)} className="text-gold hover:text-gold-bright text-xs mr-4">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-muted text-sm text-center py-10">No collections yet.</p>}
        </div>
      )}
    </div>
  );
}
