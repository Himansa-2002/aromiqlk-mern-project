import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyOrders } from "../../api/orderApi.js";
import { getUserProfile } from "../../api/userApi.js";
import { getWishlist } from "../../api/wishlistApi.js";

/* ── helpers ─────────────────────────────────────────── */

const formatMoney = (value, currency = "LKR") =>
    `${currency} ${Number(value || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-LK", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const formatStatus = (s = "") =>
    s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const statusColor = (status) => {
    const map = {
        pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
        confirmed: "text-blue-400 bg-blue-400/10 border-blue-400/30",
        processing: "text-sky-400 bg-sky-400/10 border-sky-400/30",
        shipped: "text-purple-400 bg-purple-400/10 border-purple-400/30",
        delivered: "text-green-400 bg-green-400/10 border-green-400/30",
        cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
    };
    return map[status] || "text-muted bg-panel border-line";
};

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
};

/* ── component ───────────────────────────────────────── */

export default function DashboardPage() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        wishlistCount: 0,
        addressCount: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            navigate("/login", {
                replace: true,
                state: { message: "Please sign in to view your dashboard." },
            });
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                setError("");

                const [profileRes, ordersRes, wishlistRes] = await Promise.allSettled([
                    getUserProfile(),
                    getMyOrders({ page: 1, limit: 5 }),
                    getWishlist(),
                ]);

                /* Profile */
                if (profileRes.status === "fulfilled" && profileRes.value?.user) {
                    const u = profileRes.value.user;
                    setUser(u);
                    setStats((prev) => ({
                        ...prev,
                        addressCount: u.addresses?.length || 0,
                    }));
                } else if (profileRes.reason?.status === 401) {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("user");
                    navigate("/login", {
                        replace: true,
                        state: { message: "Session expired. Please sign in again." },
                    });
                    return;
                }

                /* Orders */
                if (ordersRes.status === "fulfilled") {
                    const data = ordersRes.value;
                    setRecentOrders(
                        Array.isArray(data?.orders) ? data.orders : []
                    );

                    const totalSpent = Array.isArray(data?.orders)
                        ? data.orders.reduce(
                            (sum, o) => sum + (o?.pricing?.grandTotal || 0),
                            0
                        )
                        : 0;

                    setStats((prev) => ({
                        ...prev,
                        totalOrders: data?.total || data?.orders?.length || 0,
                        totalSpent,
                    }));
                }

                /* Wishlist */
                if (wishlistRes.status === "fulfilled") {
                    const items = wishlistRes.value?.wishlist?.items;
                    setStats((prev) => ({
                        ...prev,
                        wishlistCount: Array.isArray(items) ? items.length : 0,
                    }));
                }
            } catch (err) {
                setError(err.message || "Unable to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [navigate]);

    /* ── loading skeleton ──────────────────────────────── */
    if (loading) {
        return (
            <main className="min-h-[75vh] bg-ink py-16">
                <div className="max-w-6xl mx-auto px-6 md:px-8 animate-pulse">
                    <div className="h-4 w-32 bg-panel mb-4" />
                    <div className="h-10 w-72 bg-panel mb-3" />
                    <div className="h-4 w-96 bg-panel mb-10" />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-32 border border-line bg-panel" />
                        ))}
                    </div>

                    <div className="h-80 border border-line bg-panel" />
                </div>
            </main>
        );
    }

    /* ── error state ───────────────────────────────────── */
    if (error && !user) {
        return (
            <main className="min-h-[75vh] bg-ink py-20">
                <div className="max-w-xl mx-auto px-6 text-center">
                    <div className="border border-red-400/30 bg-red-400/5 p-10">
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-red-400/40 flex items-center justify-center text-red-400 text-xl">
                            !
                        </div>
                        <h1 className="font-display text-3xl text-warm mb-3">
                            Unable to Load Dashboard
                        </h1>
                        <p className="text-sm text-muted mb-7">{error}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="px-7 py-3 border border-gold text-gold text-xs uppercase tracking-[0.2em] hover:bg-gold/10 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const firstName = user?.firstName || "there";

    /* ── stat cards data ───────────────────────────────── */
    const cards = [
        {
            label: "Total Orders",
            value: stats.totalOrders,
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                </svg>
            ),
            link: "/orders",
        },
        {
            label: "Total Spent",
            value: formatMoney(stats.totalSpent),
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M14.5 9.5a2.5 2.5 0 0 0-5 0c0 2 5 2 5 4.5a2.5 2.5 0 0 1-5 0M12 6v1.5m0 9V18" />
                </svg>
            ),
            link: "/orders",
        },
        {
            label: "Wishlist Items",
            value: stats.wishlistCount,
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                </svg>
            ),
            link: "/wishlist",
        },
        {
            label: "Saved Addresses",
            value: stats.addressCount,
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                </svg>
            ),
            link: "/address",
        },
    ];

    /* ── quick actions ─────────────────────────────────── */
    const quickActions = [
        { to: "/profile", label: "Edit Profile" },
        { to: "/address", label: "Manage Addresses" },
        { to: "/wishlist", label: "My Wishlist" },
        { to: "/orders", label: "View All Orders" },
        { to: "/shop", label: "Continue Shopping" },
    ];

    return (
        <main className="min-h-[75vh] bg-ink py-12 md:py-16">
            <div className="max-w-6xl mx-auto px-6 md:px-8">

                {/* ── greeting banner ──────────────────────────── */}
                <section className="relative overflow-hidden border border-gold/30 bg-gradient-to-br from-gold/10 via-panel/60 to-ink mb-10">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                    <div className="px-6 md:px-10 py-8 md:py-10">
                        <span className="text-[10px] uppercase tracking-[0.35em] text-gold">
                            {getGreeting()}
                        </span>
                        <h1 className="font-display text-3xl md:text-4xl text-warm mt-3">
                            Welcome back, {firstName}
                        </h1>
                        <p className="text-sm text-muted mt-3 max-w-2xl leading-relaxed">
                            Manage your profile, track orders, and explore our latest
                            fragrance arrivals — all from your Aromiq account.
                        </p>

                        {user?.createdAt && (
                            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted">
                                Member since {formatDate(user.createdAt)}
                            </p>
                        )}
                    </div>
                </section>

                {/* ── stat cards ───────────────────────────────── */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {cards.map((card) => (
                        <Link
                            key={card.label}
                            to={card.link}
                            className="group border border-line bg-panel/40 p-6 hover:border-gold/60 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] uppercase tracking-[0.22em] text-gold">
                                    {card.label}
                                </span>
                                <span className="text-gold/60 group-hover:text-gold transition-colors">
                                    {card.icon}
                                </span>
                            </div>
                            <div className="font-display text-2xl md:text-3xl text-gold-bright">
                                {card.value}
                            </div>
                        </Link>
                    ))}
                </section>

                {/* ── recent orders ─────────────────────────────── */}
                <section className="border border-line bg-panel/30 mb-10">
                    <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-line">
                        <h2 className="font-display text-xl text-warm">Recent Orders</h2>
                        <Link
                            to="/orders"
                            className="text-[11px] uppercase tracking-[0.18em] text-gold hover:text-gold-bright transition"
                        >
                            View All →
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="px-6 md:px-8 py-12 text-center">
                            <p className="text-sm text-muted mb-5">
                                You haven't placed any orders yet.
                            </p>
                            <Link
                                to="/shop"
                                className="inline-flex px-7 py-3 border border-gold text-gold text-xs uppercase tracking-[0.18em] hover:bg-gold/10 transition"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-[0.18em] text-gold border-b border-line">
                                        <th className="text-left px-6 py-3 font-medium">Order</th>
                                        <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                                        <th className="text-left px-4 py-3 font-medium">Status</th>
                                        <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Items</th>
                                        <th className="text-right px-6 py-3 font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {recentOrders.map((order) => (
                                        <tr
                                            key={order._id || order.orderNumber}
                                            className="hover:bg-ink/30 cursor-pointer transition-colors"
                                            onClick={() =>
                                                navigate(
                                                    `/order-details/${encodeURIComponent(
                                                        order.orderNumber
                                                    )}`
                                                )
                                            }
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-gold-bright font-medium">
                                                    {order.orderNumber}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-muted hidden sm:table-cell">
                                                {formatDate(order.createdAt || order.placedAt)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex px-2.5 py-1 border text-[10px] uppercase tracking-[0.14em] ${statusColor(
                                                        order.orderStatus
                                                    )}`}
                                                >
                                                    {formatStatus(order.orderStatus)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-muted text-right hidden md:table-cell">
                                                {order.items?.length || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right font-display text-gold-bright">
                                                {formatMoney(order.pricing?.grandTotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* ── quick actions ─────────────────────────────── */}
                <section className="border border-line bg-panel/30">
                    <div className="px-6 md:px-8 py-5 border-b border-line">
                        <h2 className="font-display text-xl text-warm">Quick Actions</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y divide-line">
                        {quickActions.map((action) => (
                            <Link
                                key={action.to}
                                to={action.to}
                                className="flex items-center justify-center gap-2 px-4 py-6 text-xs uppercase tracking-[0.16em] text-muted hover:text-gold hover:bg-ink/30 transition-colors"
                            >
                                {action.label}
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
