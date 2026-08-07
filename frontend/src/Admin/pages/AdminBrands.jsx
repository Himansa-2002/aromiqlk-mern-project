import { useEffect, useState } from "react";

export default function AdminBrands() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", slug: "", description: "", logo: "" });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    setForm({ name: "", slug: "", description: "", logo: "" });
    setEditingId(null);
    load();
  };

  const startEdit = (b) => { setForm({ name: b.name, slug: b.slug, description: b.description || "", logo: b.logo || "" }); setEditingId(b._id); };
  const handleDelete = async (id) => { if (!confirm("Delete this brand?")) return; await fetch(`/api/brands/admin/${id}`, { method: "DELETE" }); load(); };

  const handleLogoUpload = async (e) => {
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
      setForm((prev) => ({ ...prev, logo: result.url }));
    } catch (error) {
      alert(`Logo upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "bg-ink border border-line px-3.5 py-2.5 text-sm text-warm outline-none focus:border-gold w-full";

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1">Brands</h1>
      <p className="text-muted text-sm mb-8">{items.length} brand{items.length === 1 ? "" : "s"}</p>

      <form onSubmit={handleSubmit} className="border border-line bg-panel p-6 mb-8 grid md:grid-cols-4 gap-4 items-end">
        <div><label className="text-xs uppercase tracking-wider text-gold mb-1.5 block">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} /></div>
        <div><label className="text-xs uppercase tracking-wider text-gold mb-1.5 block">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className={inputClass} /></div>
        <div><label className="text-xs uppercase tracking-wider text-gold mb-1.5 block">Brand Logo</label><div className="flex items-center gap-2">{form.logo && <img src={form.logo} alt="Brand preview" className="w-10 h-10 object-contain border border-gold" />}<input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="w-full text-xs text-muted file:mr-2 file:px-3 file:py-2 file:border-0 file:bg-gold file:text-ink file:cursor-pointer" /></div>{uploading && <p className="text-xs text-gold mt-1">Uploading...</p>}</div>
        <button type="submit" className="px-6 py-2.5 text-xs uppercase tracking-widest bg-gold text-ink font-medium h-[42px]">{editingId ? "Update" : "+ Add Brand"}</button>
      </form>

      {loading ? <p className="text-muted text-sm">Loading...</p> : (
        <div className="border border-line bg-panel">
          {items.map((b) => (
            <div key={b._id} className="flex items-center justify-between p-4 border-b border-line last:border-b-0">
              <div className="flex items-center gap-3">{b.logo && <img src={b.logo} alt="" className="w-10 h-10 object-contain border border-line" />}<div><span className="text-sm">{b.name}</span> <span className="text-muted text-xs ml-2">/{b.slug}</span></div></div>
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
