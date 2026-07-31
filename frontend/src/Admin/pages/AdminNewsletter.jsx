import { useEffect, useState } from "react";

export default function AdminNewsletter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/newsletter/admin/subscribers").then((r) => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  const activeCount = items.filter((s) => s.subscribed).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl mb-1">Newsletter Subscribers</h1>
          <p className="text-muted text-sm">{activeCount} active of {items.length} total</p>
        </div>
        <a
          href="/api/newsletter/admin/export"
          className="px-6 py-3 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition"
        >
          Export CSV
        </a>
      </div>

      {loading ? <p className="text-muted text-sm">Loading...</p> : (
        <div className="border border-line bg-panel">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-gold">
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Subscribed On</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s._id} className="border-b border-line last:border-b-0">
                  <td className="p-4">{s.email}</td>
                  <td className="p-4">
                    <span className={s.subscribed ? "text-green-400" : "text-muted"}>
                      {s.subscribed ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-muted text-sm text-center py-10">No subscribers yet.</p>}
        </div>
      )}
    </div>
  );
}
