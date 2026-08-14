import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const catalogueCards = [
  { key: "products", label: "Products", to: "/admin/products" },
  { key: "categories", label: "Categories", to: "/admin/categories" },
  { key: "brands", label: "Brands", to: "/admin/brands" },
  { key: "collections", label: "Collections", to: "/admin/collections" },
];

const orderCards = [
  { key: "orders", label: "Orders", to: "/admin/orders" },
  { key: "pendingReviews", label: "Pending Reviews", to: "/admin/reviews" },
  { key: "newMessages", label: "New Messages", to: "/admin/messages" },
];

const contentCards = [
  { key: "banners", label: "Banners", to: "/admin/banners" },
  {
    key: "subscribers",
    label: "Newsletter Subscribers",
    to: "/admin/newsletter",
  },
];

const orderStatuses = [
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const authFetch = async (url) => {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return null;
  return res.json();
};

const normalizeStatus = (status) => {
  if (!status) return "unknown";
  return String(status).toLowerCase().replace(/[_-]/g, " ").trim();
};

export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products/admin/all").then((r) =>
        r.ok ? r.json() : []
      ),

      fetch("/api/categories").then((r) =>
        r.ok ? r.json() : []
      ),

      fetch("/api/brands").then((r) =>
        r.ok ? r.json() : []
      ),

      fetch("/api/collections").then((r) =>
        r.ok ? r.json() : []
      ),

      fetch("/api/banners/admin/all").then((r) =>
        r.ok ? r.json() : []
      ),

      fetch("/api/reviews/admin/all").then((r) =>
        r.ok ? r.json() : []
      ),

      fetch("/api/contact/admin/all").then((r) =>
        r.ok ? r.json() : []
      ),

      fetch("/api/newsletter/admin/subscribers").then((r) =>
        r.ok ? r.json() : []
      ),

      authFetch("/api/admin/orders?limit=100&sort=newest"),
      authFetch("/api/admin/dashboard/summary"),
      authFetch("/api/admin/dashboard/recent-orders?limit=5"),
    ])
      .then(
        ([
          productsData,
          categories,
          brands,
          collections,
          banners,
          reviews,
          messages,
          subscribers,
          ordersData,
          summaryData,
          recentOrdersData,
        ]) => {
          const safeProducts = Array.isArray(productsData)
            ? productsData
            : productsData?.items || [];

          const safeOrders = Array.isArray(ordersData?.orders)
            ? ordersData.orders
            : [];

          const recentOrders = Array.isArray(recentOrdersData?.orders)
            ? recentOrdersData.orders
            : safeOrders.slice(0, 5);

          setProducts(safeProducts);
          setOrders(recentOrders);
          setTotalSales(Number(summaryData?.summary?.totalRevenue || 0));

          const countByStatus = (status) =>
            safeOrders.filter(
              (o) =>
                normalizeStatus(o.orderStatus || o.status) === status
            ).length;

          setCounts({
            products: safeProducts.length,
            categories: categories.length,
            brands: brands.length,
            collections: collections.length,
            banners: banners.length,

            pendingReviews: reviews.filter(
              (r) => r.status === "pending"
            ).length,

            newMessages: messages.filter(
              (m) => m.status === "new"
            ).length,

            subscribers: subscribers.filter(
              (s) => s.subscribed
            ).length,

            orders:
              ordersData?.total ??
              summaryData?.summary?.totalOrders ??
              safeOrders.length,

            pendingOrders:
              summaryData?.summary?.pendingOrders ??
              countByStatus("pending"),

            processingOrders: countByStatus("processing"),
            shippedOrders: countByStatus("shipped"),
            deliveredOrders: countByStatus("delivered"),
            cancelledOrders: countByStatus("cancelled"),
          });
        }
      )
      .catch((err) => {
        console.error("Dashboard error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getOrderTotal = (order) => {
    const value =
      order?.pricing?.grandTotal ??
      order?.totalAmount ??
      order?.totalPrice ??
      order?.total ??
      order?.amount ??
      order?.grandTotal ??
      0;

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  const getOrderCustomer = (order) => {
    const customer = order?.customer || {};
    const name = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();

    return (
      name ||
      order?.customerName ||
      order?.name ||
      order?.user?.name ||
      customer.email ||
      order?.email ||
      order?.user?.email ||
      "Guest Customer"
    );
  };

  const getOrderStatus = (order) =>
    order?.orderStatus || order?.status || "unknown";

  const getOrderDate = (order) => {
    const date =
      order?.createdAt ||
      order?.created_at ||
      order?.date ||
      order?.orderDate;

    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getOrderId = (order, index) => {
    return (
      order?._id ||
      order?.id ||
      order?.orderNumber ||
      `#${index + 1}`
    );
  };

  const getStock = (product) => {
    const value =
      product?.stock ??
      product?.inventory ??
      product?.quantity ??
      product?.stockQuantity;

    if (value === undefined || value === null || value === "") {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  };

  const lowStockProducts = products
    .map((product) => ({
      ...product,
      currentStock: getStock(product),
    }))
    .filter(
      (product) =>
        product.currentStock !== null &&
        product.currentStock <= 5
    )
    .sort((a, b) => a.currentStock - b.currentStock)
    .slice(0, 5);

  const recentOrders = orders;

  const orderCountForAverage = counts.orders || orders.length;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderCards = (cards, columns = "md:grid-cols-4") => (
    <div className={`grid grid-cols-2 ${columns} gap-5`}>
      {cards.map((card) => (
        <Link
          key={card.key}
          to={card.to}
          className="group border border-line bg-panel p-6 hover:border-gold transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-3xl text-gold-bright mb-2">
                {loading ? "…" : counts[card.key] ?? 0}
              </div>

              <div className="text-xs uppercase tracking-wider text-muted">
                {card.label}
              </div>
            </div>

            <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );

  const getStatusCount = (status) => {
    const keyMap = {
      pending: "pendingOrders",
      processing: "processingOrders",
      shipped: "shippedOrders",
      delivered: "deliveredOrders",
      cancelled: "cancelledOrders",
    };

    return counts[keyMap[status]] ?? 0;
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
      processing: "text-blue-400 border-blue-400/30 bg-blue-400/5",
      shipped: "text-purple-400 border-purple-400/30 bg-purple-400/5",
      delivered: "text-green-400 border-green-400/30 bg-green-400/5",
      cancelled: "text-red-400 border-red-400/30 bg-red-400/5",
    };

    return (
      classes[normalizeStatus(status)] ||
      "text-muted border-line bg-panel"
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-[1500px] mx-auto">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-warm mb-2">
          Admin Dashboard
        </h1>

        <p className="text-muted text-sm">
          Overview of your store, orders and customer activity.
        </p>
      </div>


      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-display text-xl text-warm">
            Quick Actions
          </h2>

          <div className="h-px bg-line flex-1" />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products"
            className="px-5 py-3 text-xs uppercase tracking-widest border border-gold text-gold-bright hover:bg-gold/10 transition"
          >
            + Add Product
          </Link>

          <Link
            to="/admin/brands"
            className="px-5 py-3 text-xs uppercase tracking-widest border border-line text-warm hover:border-gold hover:text-gold-bright transition"
          >
            + Add Brand
          </Link>

          <Link
            to="/admin/categories"
            className="px-5 py-3 text-xs uppercase tracking-widest border border-line text-warm hover:border-gold hover:text-gold-bright transition"
          >
            + Add Category
          </Link>

          <Link
            to="/admin/orders"
            className="px-5 py-3 text-xs uppercase tracking-widest border border-line text-warm hover:border-gold hover:text-gold-bright transition"
          >
            View Orders →
          </Link>
        </div>
      </section>


      {/* =====================================================
          CATALOGUE
      ====================================================== */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-display text-xl text-warm">
            Catalogue
          </h2>

          <div className="h-px bg-line flex-1" />
        </div>

        <p className="text-xs text-muted mb-5">
          Manage products, brands, categories and collections.
        </p>

        {renderCards(catalogueCards)}
      </section>


      {/* =====================================================
          ORDERS & CUSTOMER ACTIVITY
      ====================================================== */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-display text-xl text-warm">
            Orders & Customer Activity
          </h2>

          <div className="h-px bg-line flex-1" />
        </div>

        <p className="text-xs text-muted mb-5">
          Monitor orders, reviews and customer enquiries.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {orderCards.map((card) => (
            <Link
              key={card.key}
              to={card.to}
              className={`group border bg-panel p-6 hover:border-gold transition-all duration-200 ${
                card.key === "orders"
                  ? "border-gold/60"
                  : "border-line"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-3xl text-gold-bright mb-2">
                    {loading ? "…" : counts[card.key] ?? 0}
                  </div>

                  <div className="text-xs uppercase tracking-wider text-muted">
                    {card.label}
                  </div>
                </div>

                <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* =====================================================
          ORDER STATUS
      ====================================================== */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-display text-xl text-warm">
            Order Status
          </h2>

          <div className="h-px bg-line flex-1" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {orderStatuses.map((status) => (
            <div
              key={status.key}
              className="border border-line bg-panel p-5"
            >
              <div className="text-2xl font-display text-gold-bright mb-2">
                {loading ? "…" : getStatusCount(status.key)}
              </div>

              <div
                className={`inline-flex px-2.5 py-1 border text-[10px] uppercase tracking-wider ${getStatusClass(
                  status.key
                )}`}
              >
                {status.label}
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* =====================================================
          SALES OVERVIEW
      ====================================================== */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-display text-xl text-warm">
            Sales Overview
          </h2>

          <div className="h-px bg-line flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="border border-line bg-panel p-6">
            <div className="text-xs uppercase tracking-wider text-muted mb-3">
              Total Orders
            </div>

            <div className="font-display text-3xl text-gold-bright">
              {loading ? "…" : counts.orders ?? 0}
            </div>
          </div>

          <div className="border border-line bg-panel p-6">
            <div className="text-xs uppercase tracking-wider text-muted mb-3">
              Total Sales
            </div>

            <div className="font-display text-3xl text-gold-bright">
              {loading ? "…" : formatCurrency(totalSales)}
            </div>
          </div>

          <div className="border border-line bg-panel p-6">
            <div className="text-xs uppercase tracking-wider text-muted mb-3">
              Average Order Value
            </div>

            <div className="font-display text-3xl text-gold-bright">
              {loading || !orderCountForAverage
                ? "—"
                : formatCurrency(totalSales / orderCountForAverage)}
            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          RECENT ORDERS
      ====================================================== */}
      <section className="mb-12">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="font-display text-xl text-warm">
              Recent Orders
            </h2>

            <div className="h-px bg-line flex-1" />
          </div>

          <Link
            to="/admin/orders"
            className="text-xs uppercase tracking-wider text-gold hover:text-gold-bright transition"
          >
            View All →
          </Link>
        </div>

        <div className="border border-line bg-panel overflow-x-auto">
          {recentOrders.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-5 py-4 text-xs uppercase tracking-wider text-muted font-normal">
                    Order
                  </th>

                  <th className="px-5 py-4 text-xs uppercase tracking-wider text-muted font-normal">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-xs uppercase tracking-wider text-muted font-normal">
                    Date
                  </th>

                  <th className="px-5 py-4 text-xs uppercase tracking-wider text-muted font-normal">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-xs uppercase tracking-wider text-muted font-normal">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={order?._id || order?.id || index}
                    className="border-b border-line last:border-b-0 hover:bg-ink/30 transition"
                  >
                    <td className="px-5 py-4 text-warm">
                      {order?.orderNumber ||
                        `#${String(getOrderId(order, index)).slice(-8)}`}
                    </td>

                    <td className="px-5 py-4 text-muted">
                      {getOrderCustomer(order)}
                    </td>

                    <td className="px-5 py-4 text-muted">
                      {getOrderDate(order)}
                    </td>

                    <td className="px-5 py-4 text-warm">
                      {formatCurrency(getOrderTotal(order))}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 border text-[10px] uppercase tracking-wider ${getStatusClass(
                          getOrderStatus(order)
                        )}`}
                      >
                        {getOrderStatus(order).replace(/\b\w/g, (c) =>
                          c.toUpperCase()
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-sm text-muted">
              {loading
                ? "Loading orders..."
                : "No orders available yet."}
            </div>
          )}
        </div>
      </section>


      {/* =====================================================
          INVENTORY ALERTS
      ====================================================== */}
      <section className="mb-12">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="font-display text-xl text-warm">
              Inventory Alerts
            </h2>

            <div className="h-px bg-line flex-1" />
          </div>

          <Link
            to="/admin/products"
            className="text-xs uppercase tracking-wider text-gold hover:text-gold-bright transition"
          >
            Manage Products →
          </Link>
        </div>

        {lowStockProducts.length > 0 ? (
          <div className="border border-line bg-panel divide-y divide-line">
            {lowStockProducts.map((product, index) => (
              <Link
                key={product?._id || product?.id || index}
                to="/admin/products"
                className="flex items-center justify-between px-5 py-4 hover:bg-ink/30 transition"
              >
                <div>
                  <div className="text-sm text-warm">
                    {product?.name || "Unnamed Product"}
                  </div>

                  <div className="text-xs text-muted mt-1">
                    {product?.brand?.name ||
                      product?.brand ||
                      "Product"}
                  </div>
                </div>

                <span
                  className={`text-xs uppercase tracking-wider ${
                    product.currentStock === 0
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {product.currentStock === 0
                    ? "Out of Stock"
                    : `${product.currentStock} left`}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-line bg-panel px-5 py-8 text-center">
            <p className="text-sm text-muted">
              {loading
                ? "Checking inventory..."
                : "No low-stock products found."}
            </p>
          </div>
        )}
      </section>


      {/* =====================================================
          CONTENT & MARKETING
      ====================================================== */}
      <section>
        <div className="flex items-center gap-4 mb-5">
          <h2 className="font-display text-xl text-warm">
            Content & Marketing
          </h2>

          <div className="h-px bg-line flex-1" />
        </div>

        <p className="text-xs text-muted mb-5">
          Manage promotional content and newsletter subscribers.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {contentCards.map((card) => (
            <Link
              key={card.key}
              to={card.to}
              className="group border border-line bg-panel p-6 hover:border-gold transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-3xl text-gold-bright mb-2">
                    {loading ? "…" : counts[card.key] ?? 0}
                  </div>

                  <div className="text-xs uppercase tracking-wider text-muted">
                    {card.label}
                  </div>
                </div>

                <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}