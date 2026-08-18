import { NavLink, Outlet, Link } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/brands", label: "Brands" },
  { to: "/admin/collections", label: "Collections" },
  { to: "/admin/banners", label: "Banners" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/messages", label: "Contact Messages" },
  { to: "/admin/newsletter", label: "Newsletter" },
  { to: "/admin/orders", label: "Orders" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-ink text-warm font-body flex">
      <aside className="w-64 flex-shrink-0 border-r border-line bg-panel min-h-screen">
        <div className="px-6 py-6 border-b border-line">
          <Link to="/" className="font-display text-xl text-gold-bright">aromiq<span className="text-gold">.lk</span></Link>
          <p className="text-[11px] uppercase tracking-widest text-muted mt-1">Admin Panel</p>
        </div>
        <nav className="py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-6 py-3 text-sm border-l-2 transition-colors ${isActive
                  ? "border-gold text-gold-bright bg-ink/50"
                  : "border-transparent text-muted hover:text-warm hover:bg-ink/30"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-line mt-4">
          <Link to="/" className="text-xs text-muted hover:text-gold-bright">← Back to site</Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
