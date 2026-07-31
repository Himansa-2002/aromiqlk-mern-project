import { useEffect, useState } from "react";

export default function AdminBrands() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    setLoading(true);
    fetch("/api/brands").then((r) => r.json()).then(setItems).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/brands/admin/${editingId}` : "/api/brands/admin";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", slug: "", description: "" });
    setEditingId(null);
    load();
  };

  const startEdit = (b) => { setForm({ name: b.name, slug: b.slug, description: b.description || "" }); setEditingId(b._id); };
  const handleDelete = async (id) => { if (!confirm("Delete this brand?")) return; await fetch(`/api/brands/admin/${id}`, { method: "DELETE" }); load(); };

  const inputClass = "bg-ink border border-line px-3.5 py-2.5 text-sm text-warm outline-none focus:border-gold w-full";

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1">Brands</h1>
      <p className="text-muted text-sm mb-8">{items.length} brand{items.length === 1 ? "" : "s"}</p>

      <form onSubmit={handleSubmit} className="border border-line bg-panel p-6 mb-8 grid grid-cols-3 gap-4 items-end">
        <div><label className="text-xs uppercase tracking-wider text-gold mb-1.5 block">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} /></div>
        <div><label className="text-xs uppercase tracking-wider text-gold mb-1.5 block">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className={inputClass} /></div>
        <button type="submit" className="px-6 py-2.5 text-xs uppercase tracking-widest bg-gold text-ink font-medium h-[42px]">{editingId ? "Update" : "+ Add Brand"}</button>
      </form>

      {loading ? <p className="text-muted text-sm">Loading...</p> : (
        <div className="border border-line bg-panel">
          {items.map((b) => (
            <div key={b._id} className="flex items-center justify-between p-4 border-b border-line last:border-b-0">
              <div><span className="text-sm">{b.name}</span> <span className="text-muted text-xs ml-2">/{b.slug}</span></div>
              <div>
                <button onClick={() => startEdit(b)} className="text-gold hover:text-gold-bright text-xs mr-4">Edit</button>
                <button onClick={() => handleDelete(b._id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-muted text-sm text-center py-10">No brands yet.</p>}
        </div>
      )}
    </div>
  );
}
