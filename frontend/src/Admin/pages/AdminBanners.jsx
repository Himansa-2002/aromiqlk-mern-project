import { useEffect, useState } from "react";

const emptyForm = { title: "", desktopImage: "", mobileImage: "", ctaText: "", ctaLink: "", active: true };

export default function AdminBanners() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    setLoading(true);
    fetch("/api/banners/admin/all").then((r) => r.json()).then(setItems).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/banners/admin/${editingId}` : "/api/banners/admin";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const startEdit = (b) => {
    setForm({ title: b.title, desktopImage: b.desktopImage, mobileImage: b.mobileImage || "", ctaText: b.ctaText || "", ctaLink: b.ctaLink || "", active: b.active });
    setEditingId(b._id);
  };
  const handleDelete = async (id) => { if (!confirm("Delete this banner?")) return; await fetch(`/api/banners/admin/${id}`, { method: "DELETE" }); load(); };

  const inputClass = "bg-ink border border-line px-3.5 py-2.5 text-sm text-warm outline-none focus:border-gold w-full";
  const labelClass = "text-xs uppercase tracking-wider text-gold mb-1.5 block";

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1">Banners</h1>
      <p className="text-muted text-sm mb-8">{items.length} banner{items.length === 1 ? "" : "s"}</p>

      <form onSubmit={handleSubmit} className="border border-line bg-panel p-6 mb-8 space-y-4">
        <div><label className={labelClass}>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputClass} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Desktop Image URL</label><input value={form.desktopImage} onChange={(e) => setForm({ ...form, desktopImage: e.target.value })} required className={inputClass} /></div>
          <div><label className={labelClass}>Mobile Image URL</label><input value={form.mobileImage} onChange={(e) => setForm({ ...form, mobileImage: e.target.value })} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>CTA Text</label><input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} placeholder="Shop Now" className={inputClass} /></div>
          <div><label className={labelClass}>CTA Link</label><input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="/shop" className={inputClass} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-gold" /> Active
        </label>
        <button type="submit" className="px-6 py-2.5 text-xs uppercase tracking-widest bg-gold text-ink font-medium">{editingId ? "Update Banner" : "+ Add Banner"}</button>
      </form>

      {loading ? <p className="text-muted text-sm">Loading...</p> : (
        <div className="border border-line bg-panel">
          {items.map((b) => (
            <div key={b._id} className="flex items-center justify-between p-4 border-b border-line last:border-b-0">
              <div>
                <span className="text-sm">{b.title}</span>
                {!b.active && <span className="ml-2 text-[10px] uppercase tracking-wider bg-muted/30 text-muted px-2 py-0.5 rounded-sm">Inactive</span>}
              </div>
              <div>
                <button onClick={() => startEdit(b)} className="text-gold hover:text-gold-bright text-xs mr-4">Edit</button>
                <button onClick={() => handleDelete(b._id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-muted text-sm text-center py-10">No banners yet.</p>}
        </div>
      )}
    </div>
  );
}
