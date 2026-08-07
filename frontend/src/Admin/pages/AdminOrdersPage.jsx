import { useCallback, useEffect, useState } from "react";

/* ── constants ───────────────────────────────────────── */

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "highest", label: "Highest Total" },
    { value: "lowest", label: "Lowest Total" },
];

const STATUS_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

/* ── helpers ─────────────────────────────────────────── */

const getToken = () => localStorage.getItem("token");

const request = async (path, options = {}) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    const text = await res.text();
    let data = null;
    if (text) {
        try { data = JSON.parse(text); } catch { data = { message: text }; }
    }
    if (!res.ok) {
        const err = new Error(data?.message || "Request failed");
        err.status = res.status;
        throw err;
    }
    return data;
};

const formatMoney = (v, c = "LKR") =>
    `${c} ${Number(v || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (v, time = false) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    const opts = { year: "numeric", month: "short", day: "numeric" };
    if (time) { opts.hour = "2-digit"; opts.minute = "2-digit"; }
    return d.toLocaleDateString("en-LK", opts);
};

const formatStatus = (s = "") =>
    s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const orderStatusColor = (s) => {
    const m = {
        pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
        confirmed: "text-blue-400 bg-blue-400/10 border-blue-400/30",
        processing: "text-sky-400 bg-sky-400/10 border-sky-400/30",
        shipped: "text-purple-400 bg-purple-400/10 border-purple-400/30",
        delivered: "text-green-400 bg-green-400/10 border-green-400/30",
        cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
    };
    return m[s] || "text-muted bg-panel border-line";
};

const paymentStatusColor = (s) => {
    const m = {
        pending: "text-yellow-400",
        paid: "text-green-400",
        failed: "text-red-400",
        refunded: "text-orange-400",
    };
    return m[s] || "text-muted";
};

/* ── component ───────────────────────────────────────── */

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* filters */
    const [search, setSearch] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const limit = 15;

    /* detail modal */
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    /* status update */
    const [updatingId, setUpdatingId] = useState(null);

    /* tracking form */
    const [trackingForm, setTrackingForm] = useState({
        orderId: null,
        trackingNumber: "",
        courier: "",
    });

    /* ── fetch orders ──────────────────────────────────── */
    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            if (search.trim()) params.set("search", search.trim());
            if (orderStatus) params.set("orderStatus", orderStatus);
            if (paymentStatus) params.set("paymentStatus", paymentStatus);
            params.set("sort", sort);
            params.set("page", String(page));
            params.set("limit", String(limit));

            const data = await request(`/admin/orders?${params.toString()}`);

            setOrders(Array.isArray(data?.orders) ? data.orders : []);
            setTotal(data?.total || 0);
            setPages(data?.pages || 1);
        } catch (err) {
            setError(err.message || "Unable to load orders.");
        } finally {
            setLoading(false);
        }
    }, [search, orderStatus, paymentStatus, sort, page]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    /* ── view order detail ─────────────────────────────── */
    const viewOrder = async (id) => {
        try {
            setDetailLoading(true);
            const data = await request(`/admin/orders/${id}`);
            setSelectedOrder(data?.order || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setDetailLoading(false);
        }
    };

    /* ── update order status ───────────────────────────── */
    const updateStatus = async (id, status) => {
        try {
            setUpdatingId(id);
            setError("");
            setSuccess("");

            await request(`/admin/orders/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });

            setSuccess(`Order status updated to ${formatStatus(status)}`);
            await loadOrders();

            if (selectedOrder && (selectedOrder._id === id)) {
                await viewOrder(id);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    /* ── update payment status ─────────────────────────── */
    const updatePayStatus = async (id, status) => {
        try {
            setUpdatingId(id);
            setError("");
            setSuccess("");

            await request(`/admin/orders/${id}/payment-status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });

            setSuccess(`Payment status updated to ${formatStatus(status)}`);
            await loadOrders();

            if (selectedOrder && (selectedOrder._id === id)) {
                await viewOrder(id);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    /* ── add tracking ──────────────────────────────────── */
    const submitTracking = async () => {
        const { orderId, trackingNumber, courier } = trackingForm;
        if (!trackingNumber.trim()) {
            setError("Tracking number is required.");
            return;
        }
        try {
            setUpdatingId(orderId);
            setError("");
            setSuccess("");

            await request(`/admin/orders/${orderId}/tracking`, {
                method: "PATCH",
                body: JSON.stringify({
                    trackingNumber: trackingNumber.trim(),
                    courier: courier.trim(),
                }),
            });

            setSuccess("Tracking information saved.");
            setTrackingForm({ orderId: null, trackingNumber: "", courier: "" });
            await loadOrders();

            if (selectedOrder && (selectedOrder._id === orderId)) {
                await viewOrder(orderId);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    /* ── reset filters ─────────────────────────────────── */
    const clearFilters = () => {
        setSearch("");
        setOrderStatus("");
        setPaymentStatus("");
        setSort("newest");
        setPage(1);
    };

    const customerName = (order) => {
        const c = order.customer || {};
        const name = `${c.firstName || ""} ${c.lastName || ""}`.trim();
        return name || c.email || "—";
    };

    /* ── skeleton ──────────────────────────────────────── */
    if (loading && orders.length === 0) {
        return (
            <div className="p-8 animate-pulse">
                <div className="h-6 w-48 bg-panel mb-2" />
                <div className="h-4 w-72 bg-panel mb-8" />
                <div className="h-14 bg-panel border border-line mb-6" />
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-14 bg-panel border border-line" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            {/* ── header ───────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-2xl text-warm">Order Management</h1>
                    <p className="text-sm text-muted mt-1">
                        {total} order{total === 1 ? "" : "s"} total
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadOrders}
                    disabled={loading}
                    className="px-5 py-2.5 border border-gold text-gold text-[11px] uppercase tracking-[0.16em] hover:bg-gold/10 transition disabled:opacity-50"
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* ── messages ─────────────────────────────────── */}
            {success && (
                <div className="mb-5 border border-green-400/30 bg-green-400/5 px-5 py-3 text-sm text-green-400 flex items-center justify-between">
                    <span>{success}</span>
                    <button type="button" onClick={() => setSuccess("")} className="text-xs text-green-300 hover:text-green-100">✕</button>
                </div>
            )}
            {error && (
                <div className="mb-5 border border-red-400/30 bg-red-400/5 px-5 py-3 text-sm text-red-400 flex items-center justify-between">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")} className="text-xs text-red-300 hover:text-red-100">✕</button>
                </div>
            )}

            {/* ── filters ──────────────────────────────────── */}
            <div className="border border-line bg-panel/40 p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* search */}
                    <div className="lg:col-span-2 flex items-center gap-2 border border-line bg-ink px-3 py-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gold shrink-0">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search order number, customer name, email..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="flex-1 bg-transparent text-sm text-warm outline-none"
                        />
                    </div>

                    {/* order status */}
                    <select
                        value={orderStatus}
                        onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}
                        className="bg-ink border border-line px-3 py-2.5 text-sm text-warm outline-none"
                    >
                        <option value="">All Statuses</option>
                        {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{formatStatus(s)}</option>
                        ))}
                    </select>

                    {/* payment status */}
                    <select
                        value={paymentStatus}
                        onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
                        className="bg-ink border border-line px-3 py-2.5 text-sm text-warm outline-none"
                    >
                        <option value="">All Payments</option>
                        {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{formatStatus(s)}</option>
                        ))}
                    </select>

                    {/* sort */}
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="bg-ink border border-line px-3 py-2.5 text-sm text-warm outline-none"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {(search || orderStatus || paymentStatus || sort !== "newest") && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-3 text-[11px] text-gold hover:text-gold-bright uppercase tracking-[0.16em]"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* ── tracking form (conditionally shown) ──────── */}
            {trackingForm.orderId && (
                <div className="mb-6 border border-gold/40 bg-panel/50 p-5">
                    <h3 className="font-display text-lg text-warm mb-4">
                        Add Tracking Information
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <input
                            type="text"
                            placeholder="Tracking Number *"
                            value={trackingForm.trackingNumber}
                            onChange={(e) => setTrackingForm((p) => ({ ...p, trackingNumber: e.target.value }))}
                            className="bg-ink border border-line px-3 py-2.5 text-sm text-warm outline-none focus:border-gold"
                        />
                        <input
                            type="text"
                            placeholder="Courier Name"
                            value={trackingForm.courier}
                            onChange={(e) => setTrackingForm((p) => ({ ...p, courier: e.target.value }))}
                            className="bg-ink border border-line px-3 py-2.5 text-sm text-warm outline-none focus:border-gold"
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={submitTracking}
                                disabled={updatingId === trackingForm.orderId}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-gold-bright to-gold-deep text-ink text-xs uppercase tracking-[0.14em] font-semibold hover:brightness-110 transition disabled:opacity-50"
                            >
                                {updatingId === trackingForm.orderId ? "Saving..." : "Save"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTrackingForm({ orderId: null, trackingNumber: "", courier: "" })}
                                className="px-4 py-2.5 border border-line text-xs text-muted hover:text-gold hover:border-gold transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── orders table ─────────────────────────────── */}
            {orders.length === 0 ? (
                <div className="border border-line bg-panel/40 py-16 text-center">
                    <p className="text-muted text-sm">No orders match your filters.</p>
                </div>
            ) : (
                <div className="border border-line overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-[0.16em] text-gold border-b border-line bg-panel/40">
                                <th className="text-left px-4 py-3 font-medium">Order</th>
                                <th className="text-left px-4 py-3 font-medium">Customer</th>
                                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Date</th>
                                <th className="text-center px-4 py-3 font-medium">Status</th>
                                <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Payment</th>
                                <th className="text-right px-4 py-3 font-medium">Total</th>
                                <th className="text-center px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {orders.map((order) => {
                                const oid = order._id;
                                const nextStatuses = STATUS_TRANSITIONS[order.orderStatus] || [];

                                return (
                                    <tr key={oid} className="hover:bg-ink/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => viewOrder(oid)}
                                                className="text-gold-bright hover:underline font-medium"
                                            >
                                                {order.orderNumber}
                                            </button>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="text-warm text-sm">{customerName(order)}</span>
                                        </td>

                                        <td className="px-4 py-3 text-muted hidden md:table-cell">
                                            {formatDate(order.createdAt || order.placedAt)}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-0.5 border text-[10px] uppercase tracking-[0.12em] ${orderStatusColor(order.orderStatus)}`}>
                                                {formatStatus(order.orderStatus)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                                            <span className={`text-xs ${paymentStatusColor(order.paymentStatus)}`}>
                                                {formatStatus(order.paymentStatus)}
                                            </span>
                                            <span className="block text-[10px] text-muted mt-0.5">
                                                {formatStatus(order.paymentMethod)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-right font-display text-gold-bright whitespace-nowrap">
                                            {formatMoney(order.pricing?.grandTotal)}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                {/* status transitions */}
                                                {nextStatuses.map((ns) => (
                                                    <button
                                                        key={ns}
                                                        type="button"
                                                        onClick={() => updateStatus(oid, ns)}
                                                        disabled={updatingId === oid}
                                                        title={`Mark as ${formatStatus(ns)}`}
                                                        className={`px-2 py-1 border text-[9px] uppercase tracking-[0.1em] transition disabled:opacity-40 ${ns === "cancelled"
                                                                ? "border-red-400/40 text-red-400 hover:bg-red-400/10"
                                                                : "border-gold/40 text-gold hover:bg-gold/10"
                                                            }`}
                                                    >
                                                        {formatStatus(ns)}
                                                    </button>
                                                ))}

                                                {/* add tracking */}
                                                {["confirmed", "processing"].includes(order.orderStatus) && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setTrackingForm({
                                                                orderId: oid,
                                                                trackingNumber: order.trackingNumber || "",
                                                                courier: "",
                                                            })
                                                        }
                                                        title="Add tracking"
                                                        className="px-2 py-1 border border-purple-400/40 text-purple-400 text-[9px] uppercase tracking-[0.1em] hover:bg-purple-400/10 transition"
                                                    >
                                                        Track
                                                    </button>
                                                )}

                                                {/* mark paid (if payment pending) */}
                                                {order.paymentStatus === "pending" && order.orderStatus !== "cancelled" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => updatePayStatus(oid, "paid")}
                                                        disabled={updatingId === oid}
                                                        title="Mark payment as paid"
                                                        className="px-2 py-1 border border-green-400/40 text-green-400 text-[9px] uppercase tracking-[0.1em] hover:bg-green-400/10 transition disabled:opacity-40"
                                                    >
                                                        Paid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── pagination ────────────────────────────────── */}
            {pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-xs text-muted">
                        Page {page} of {pages} · {total} order{total === 1 ? "" : "s"}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-4 py-2 border border-line text-xs text-muted hover:text-gold hover:border-gold transition disabled:opacity-30"
                        >
                            ← Prev
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(pages, p + 1))}
                            disabled={page >= pages}
                            className="px-4 py-2 border border-line text-xs text-muted hover:text-gold hover:border-gold transition disabled:opacity-30"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* ── order detail modal ────────────────────────── */}
            {(selectedOrder || detailLoading) && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setSelectedOrder(null)}
                    />

                    <div className="relative w-full max-w-3xl max-h-[75vh] overflow-y-auto bg-ink border border-line">
                        {/* close */}
                        <button
                            type="button"
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-line text-muted hover:text-gold hover:border-gold transition z-10"
                        >
                            ✕
                        </button>

                        {detailLoading ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-muted animate-pulse">Loading order details...</p>
                            </div>
                        ) : selectedOrder ? (
                            <div className="p-6 md:p-8">
                                {/* header */}
                                <div className="mb-6 pb-5 border-b border-line">
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
                                        Order Details
                                    </span>
                                    <h2 className="font-display text-2xl text-warm mt-2">
                                        {selectedOrder.orderNumber}
                                    </h2>
                                    <p className="text-xs text-muted mt-1">
                                        Placed {formatDate(selectedOrder.createdAt || selectedOrder.placedAt, true)}
                                    </p>
                                </div>

                                {/* status badges */}
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <span className={`px-3 py-1.5 border text-[10px] uppercase tracking-[0.14em] ${orderStatusColor(selectedOrder.orderStatus)}`}>
                                        Order: {formatStatus(selectedOrder.orderStatus)}
                                    </span>
                                    <span className={`px-3 py-1.5 border border-line text-[10px] uppercase tracking-[0.14em] ${paymentStatusColor(selectedOrder.paymentStatus)}`}>
                                        Payment: {formatStatus(selectedOrder.paymentStatus)}
                                    </span>
                                    <span className="px-3 py-1.5 border border-line text-[10px] uppercase tracking-[0.14em] text-muted">
                                        {formatStatus(selectedOrder.paymentMethod)}
                                    </span>
                                </div>

                                {/* customer info */}
                                <div className="grid md:grid-cols-2 gap-5 mb-6">
                                    <div className="border border-line bg-panel/30 p-5">
                                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Customer</h3>
                                        <p className="text-sm text-warm">{customerName(selectedOrder)}</p>
                                        <p className="text-xs text-muted mt-1">{selectedOrder.customer?.email}</p>
                                        <p className="text-xs text-muted mt-0.5">{selectedOrder.customer?.phone}</p>
                                    </div>

                                    <div className="border border-line bg-panel/30 p-5">
                                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Shipping</h3>
                                        <p className="text-sm text-warm">
                                            {selectedOrder.shipping?.address?.addressLine1}
                                        </p>
                                        <p className="text-xs text-muted mt-1">
                                            {selectedOrder.shipping?.address?.city}
                                            {selectedOrder.shipping?.address?.district && `, ${selectedOrder.shipping.address.district}`}
                                        </p>
                                        {selectedOrder.trackingNumber && (
                                            <p className="text-xs text-gold mt-2">
                                                Tracking: {selectedOrder.trackingNumber}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* items */}
                                <div className="border border-line mb-6">
                                    <h3 className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-gold border-b border-line bg-panel/30">
                                        Order Items ({selectedOrder.items?.length || 0})
                                    </h3>
                                    <div className="divide-y divide-line">
                                        {selectedOrder.items?.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 px-5 py-4">
                                                <div className="w-12 h-12 shrink-0 border border-line bg-panel flex items-center justify-center overflow-hidden">
                                                    {item.product?.images?.[0] ? (
                                                        <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gold text-[10px]">IMG</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-warm truncate">
                                                        {item.product?.name || item.name || "Product"}
                                                    </p>
                                                    {item.selectedSize && (
                                                        <p className="text-[10px] text-muted mt-0.5">{item.selectedSize}</p>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm text-warm">× {item.quantity}</p>
                                                    <p className="text-xs text-gold">{formatMoney(item.price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* pricing */}
                                <div className="border border-line bg-panel/30 p-5">
                                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4">Pricing</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-muted">
                                            <span>Subtotal</span>
                                            <span>{formatMoney(selectedOrder.pricing?.subtotal)}</span>
                                        </div>
                                        {selectedOrder.pricing?.shippingFee > 0 && (
                                            <div className="flex justify-between text-muted">
                                                <span>Shipping</span>
                                                <span>{formatMoney(selectedOrder.pricing?.shippingFee)}</span>
                                            </div>
                                        )}
                                        {selectedOrder.pricing?.discount > 0 && (
                                            <div className="flex justify-between text-green-400">
                                                <span>Discount</span>
                                                <span>−{formatMoney(selectedOrder.pricing?.discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-3 border-t border-line font-display text-lg text-gold-bright">
                                            <span>Grand Total</span>
                                            <span>{formatMoney(selectedOrder.pricing?.grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
