import { useEffect, useState } from "react";

export default function AdminMessages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});

  const load = () => {
    setLoading(true);
    fetch("/api/contact/admin/all").then((r) => r.json()).then(setItems).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const act = async (id, action) => {
    await fetch(`/api/contact/admin/${id}/${action}`, { method: "PATCH" });
    load();
  };

  const saveNote = async (id) => {
    await fetch(`/api/contact/admin/${id}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: noteDrafts[id] || "" }),
    });
    load();
  };

  const statusColor = { new: "text-yellow-400", read: "text-blue-400", replied: "text-green-400", closed: "text-muted" };

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1">Contact Messages</h1>
      <p className="text-muted text-sm mb-8">{items.filter((m) => m.status === "new").length} new of {items.length} total</p>

      {loading ? <p className="text-muted text-sm">Loading...</p> : (
        <div className="space-y-4">
          {items.map((m) => (
            <div key={m._id} className="border border-line bg-panel p-5">
              <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setExpanded(expanded === m._id ? null : m._id)}>
                <div>
                  <strong className="text-sm">{m.fullName}</strong>
                  <span className="text-muted text-xs ml-2">{m.email}</span>
                  {m.subject && <span className="text-muted text-xs ml-2">— {m.subject}</span>}
                </div>
                <span className={`text-xs uppercase tracking-wider ${statusColor[m.status]}`}>{m.status}</span>
              </div>

              {expanded === m._id && (
                <div className="mt-3 pt-3 border-t border-line">
                  <p className="text-muted text-sm mb-3">{m.message}</p>
                  {m.phone && <p className="text-muted text-xs mb-3">Phone: {m.phone}</p>}

                  <textarea
                    placeholder="Internal notes..."
                    value={noteDrafts[m._id] ?? m.notes ?? ""}
                    onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [m._id]: e.target.value }))}
                    rows={2}
                    className="bg-ink border border-line px-3 py-2 text-sm text-warm outline-none focus:border-gold w-full mb-3"
                  />

                  <div className="flex gap-4 flex-wrap">
                    <button onClick={() => act(m._id, "read")} className="text-blue-400 hover:text-blue-300 text-xs">Mark Read</button>
                    <button onClick={() => act(m._id, "replied")} className="text-green-400 hover:text-green-300 text-xs">Mark Replied</button>
                    <button onClick={() => act(m._id, "close")} className="text-muted hover:text-warm text-xs">Close</button>
                    <button onClick={() => saveNote(m._id)} className="text-gold hover:text-gold-bright text-xs">Save Note</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <p className="text-muted text-sm text-center py-10">No messages yet.</p>}
        </div>
      )}
    </div>
  );
}
