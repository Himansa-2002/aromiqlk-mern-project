import { useEffect, useState } from "react";

export default function AdminCollections() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", slug: "", description: "", featured: false });
  const [editingId, setEditingId] = useState(null);

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
    setForm({ name: "", slug: "", description: "", featured: false });
    setEditingId(null);
    load();
  };

  const startEdit = (c) => { setForm({ name: c.name, slug: c.slug, description: c.description || "", featured: c.featured }); setEditingId(c._id); };
  const handleDelete = async (id) => { if (!confirm("Delete this collection?")) return; await fetch(`/api/collections/admin/${id}`, { method: "DELETE" }); load(); };

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
              <div>
                <span className="text-sm">{c.name}</span> <span className="text-muted text-xs ml-2">/{c.slug}</span>
                {c.featured && <span className="ml-2 text-[10px] uppercase tracking-wider bg-gold text-ink px-2 py-0.5 rounded-sm">Featured</span>}
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
