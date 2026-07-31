import { useEffect, useState } from "react";

export default function AdminReviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const load = () => {
    setLoading(true);
    fetch("/api/reviews/admin/all").then((r) => r.json()).then(setItems).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const act = async (id, action) => {
    if (action === "delete") {
      if (!confirm("Delete this review?")) return;
      await fetch(`/api/reviews/admin/${id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/reviews/admin/${id}/${action}`, { method: "PATCH" });
    }
    load();
  };

  const visible = filter === "all" ? items : items.filter((r) => r.status === filter);
  const statusColor = { pending: "text-yellow-400", approved: "text-green-400", rejected: "text-red-400" };

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1">Reviews</h1>
      <p className="text-muted text-sm mb-6">{items.filter((r) => r.status === "pending").length} pending of {items.length} total</p>

      <div className="flex gap-2 mb-6">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
              filter === f ? "border-gold text-gold-bright" : "border-line text-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <p className="text-muted text-sm">Loading...</p> : (
        <div className="space-y-4">
          {visible.map((r) => (
            <div key={r._id} className="border border-line bg-panel p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <strong className="text-sm">{r.name}</strong>
                  <span className="text-muted text-xs ml-2">on {r.product?.name || "deleted product"}</span>
                </div>
                <span className={`text-xs uppercase tracking-wider ${statusColor[r.status]}`}>{r.status}</span>
              </div>
              <div className="text-gold text-xs mb-2">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              <p className="text-muted text-sm mb-4">{r.comment}</p>
              <div className="flex gap-4">
                {r.status !== "approved" && <button onClick={() => act(r._id, "approve")} className="text-green-400 hover:text-green-300 text-xs">Approve</button>}
                {r.status !== "rejected" && <button onClick={() => act(r._id, "reject")} className="text-yellow-400 hover:text-yellow-300 text-xs">Reject</button>}
                <button onClick={() => act(r._id, "delete")} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
              </div>
            </div>
          ))}
          {visible.length === 0 && <p className="text-muted text-sm text-center py-10">No {filter === "all" ? "" : filter} reviews.</p>}
        </div>
      )}
    </div>
  );
}
