import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const cards = [
  { key: "products", label: "Products", to: "/admin/products" },
  { key: "categories", label: "Categories", to: "/admin/categories" },
  { key: "brands", label: "Brands", to: "/admin/brands" },
  { key: "collections", label: "Collections", to: "/admin/collections" },
  { key: "banners", label: "Banners", to: "/admin/banners" },
  { key: "pendingReviews", label: "Pending Reviews", to: "/admin/reviews" },
  { key: "newMessages", label: "New Messages", to: "/admin/messages" },
  { key: "subscribers", label: "Newsletter Subscribers", to: "/admin/newsletter" },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products/admin/all").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/categories").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/brands").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/collections").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/banners/admin/all").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/reviews/admin/all").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/contact/admin/all").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/newsletter/admin/subscribers").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([products, categories, brands, collections, banners, reviews, messages, subscribers]) => {
        setCounts({
          products: products.length,
          categories: categories.length,
          brands: brands.length,
          collections: collections.length,
          banners: banners.length,
          pendingReviews: reviews.filter((r) => r.status === "pending").length,
          newMessages: messages.filter((m) => m.status === "new").length,
          subscribers: subscribers.filter((s) => s.subscribed).length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl mb-1">Dashboard</h1>
      <p className="text-muted text-sm mb-8">Overview of your catalogue and content.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {cards.map((c) => (
          <Link key={c.key} to={c.to} className="border border-line bg-panel p-6 hover:border-gold transition-colors">
            <div className="font-display text-3xl text-gold-bright mb-1">
              {loading ? "…" : (counts[c.key] ?? 0)}
            </div>
            <div className="text-xs uppercase tracking-wider text-muted">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
