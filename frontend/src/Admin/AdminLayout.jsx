import { NavLink, Outlet, Link } from "react-router-dom";

const navGroups = [
  {
    title: "Main",
    items: [
      {
        to: "/admin",
        label: "Dashboard",
        end: true,
        icon: "dashboard",
      },
    ],
  },
  {
    title: "Catalogue",
    items: [
      {
        to: "/admin/products",
        label: "Products",
        icon: "products",
      },
      {
        to: "/admin/categories",
        label: "Categories",
        icon: "categories",
      },
      {
        to: "/admin/brands",
        label: "Brands",
        icon: "brands",
      },
      {
        to: "/admin/collections",
        label: "Collections",
        icon: "collections",
      },
    ],
  },
  {
    title: "Orders & Customers",
    items: [
      {
        to: "/admin/orders",
        label: "Orders",
        icon: "orders",
      },
      {
        to: "/admin/reviews",
        label: "Reviews",
        icon: "reviews",
      },
      {
        to: "/admin/messages",
        label: "Contact Messages",
        icon: "messages",
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        to: "/admin/banners",
        label: "Banners",
        icon: "banners",
      },
      {
        to: "/admin/newsletter",
        label: "Newsletter",
        icon: "newsletter",
      },
    ],
  },
];

function MenuIcon({ type }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (type) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "products":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M6 4h12l2 17H4L6 4Z" />
          <path d="M9 4a3 3 0 0 1 6 0" />
        </svg>
      );

    case "categories":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      );

    case "brands":
      return (
        <svg {...common}>
          <path d="M20 13 13 20l-9-9V4h7l9 9Z" />
          <circle cx="8" cy="8" r="1.2" />
        </svg>
      );

    case "collections":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <path d="M6 3h12v18H6z" />
          <path d="M9 7h6M9 11h6M9 15h4" />
        </svg>
      );

    case "reviews":
      return (
        <svg {...common}>
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
        </svg>
      );

    case "messages":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H8l-4 4V5Z" />
          <path d="M8 9h8M8 12h5" />
        </svg>
      );

    case "banners":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8" cy="10" r="1.5" />
          <path d="m5 17 5-5 3 3 2-2 4 4" />
        </svg>
      );

    case "newsletter":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );

    default:
      return null;
  }
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-ink text-warm font-body flex">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside className="w-64 flex-shrink-0 border-r border-line bg-panel min-h-screen flex flex-col">

        {/* Brand */}
        <div className="px-6 py-6 border-b border-line">
          <Link
            to="/"
            className="group inline-block"
          >
            <div className="font-display text-xl text-gold-bright tracking-wide group-hover:text-white transition-colors">
              aromiq<span className="text-gold">.lk</span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="w-5 h-px bg-gold/60" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
                Admin Panel
              </p>
            </div>
          </Link>
        </div>


        {/* Navigation */}
        <nav className="flex-1 py-5 px-3 overflow-y-auto">

          {navGroups.map((group) => (
            <div key={group.title} className="mb-7 last:mb-0">

              {/* Group title */}
              <div className="px-3 mb-2">
                <span className="text-[9px] uppercase tracking-[0.25em] text-muted/70">
                  {group.title}
                </span>
              </div>

              {/* Group items */}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 rounded-sm ${
                        isActive
                          ? "text-gold-bright bg-ink/70"
                          : "text-muted hover:text-warm hover:bg-ink/40"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator */}
                        <span
                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-gold transition-opacity ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        />

                        {/* Icon */}
                        <span
                          className={`flex-shrink-0 transition-colors ${
                            isActive
                              ? "text-gold"
                              : "text-muted group-hover:text-gold"
                          }`}
                        >
                          <MenuIcon type={item.icon} />
                        </span>

                        {/* Label */}
                        <span className="flex-1">
                          {item.label}
                        </span>

                        {/* Active arrow */}
                        <span
                          className={`text-xs transition-all ${
                            isActive
                              ? "opacity-100 text-gold translate-x-0"
                              : "opacity-0 -translate-x-1"
                          }`}
                        >
                          →
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

        </nav>


        {/* Bottom section */}
        <div className="border-t border-line">

          {/* Admin status */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">

              <div className="w-8 h-8 rounded-full border border-gold/40 bg-ink flex items-center justify-center">
                <span className="text-xs text-gold">
                  A
                </span>
              </div>

              <div className="min-w-0">
                <div className="text-xs text-warm">
                  Administrator
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-muted">
                    Online
                  </span>
                </div>
              </div>

            </div>
          </div>


          {/* Back to website */}
          <div className="px-5 py-4 border-t border-line">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs text-muted hover:text-gold-bright transition-colors"
            >
              <span>←</span>
              <span>Back to website</span>
            </Link>
          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>

    </div>
  );
}