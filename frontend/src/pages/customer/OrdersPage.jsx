import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { getMyOrders } from "../../api/orderApi.js";

const STATUS_OPTIONS = [
  {
    value: "",
    label: "All Orders",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const statusClassName = (status) => {
  const classes = {
    pending:
      "border-amber-400/35 bg-amber-400/5 text-amber-300",
    confirmed:
      "border-blue-400/35 bg-blue-400/5 text-blue-300",
    processing:
      "border-violet-400/35 bg-violet-400/5 text-violet-300",
    shipped:
      "border-cyan-400/35 bg-cyan-400/5 text-cyan-300",
    delivered:
      "border-green-400/35 bg-green-400/5 text-green-300",
    cancelled:
      "border-red-400/35 bg-red-400/5 text-red-300",
  };

  return (
    classes[status] ||
    "border-line bg-panel text-muted"
  );
};

const formatStatus = (status = "") =>
  status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const formatDate = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatMoney = (
  value,
  currency = "LKR"
) => {
  const number = Number(value || 0);

  return `${currency} ${number.toLocaleString(
    "en-LK",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

const getImageUrl = (item) => {
  if (typeof item?.image === "string") {
    return item.image;
  }

  return (
    item?.image?.url ||
    item?.product?.images?.[0] ||
    ""
  );
};

export default function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleAuthenticationError = useCallback(
    (requestError) => {
      if (
        requestError?.status === 401 ||
        requestError?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
          state: {
            message:
              requestError.message ||
              "Please sign in to view your orders.",
          },
        });

        return true;
      }

      return false;
    },
    [navigate]
  );

  const loadOrders = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Please sign in to view your orders.",
        },
      });

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getMyOrders({
        status,
        page,
        limit: 8,
      });

      setOrders(
        Array.isArray(response?.orders)
          ? response.orders
          : []
      );

      setTotal(Number(response?.total || 0));
      setPages(
        Math.max(Number(response?.pages || 1), 1)
      );
    } catch (requestError) {
      if (
        handleAuthenticationError(requestError)
      ) {
        return;
      }

      setError(
        requestError.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }, [
    status,
    page,
    navigate,
    handleAuthenticationError,
  ]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const goToDetails = (orderNumber) => {
    navigate(
      `/order-details/${encodeURIComponent(
        orderNumber
      )}`
    );
  };

  return (
    <main className="min-h-[75vh] bg-ink py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <span className="text-[11px] uppercase tracking-[0.35em] text-gold">
              My Account
            </span>

            <h1 className="font-display text-3xl md:text-4xl text-warm mt-3">
              My Orders
            </h1>

            <p className="text-sm text-muted mt-3 max-w-2xl leading-relaxed">
              Review your purchases, payment state,
              delivery progress, and full order details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              {total} {total === 1 ? "Order" : "Orders"}
            </span>

            <select
              value={status}
              onChange={handleStatusChange}
              className="min-w-[190px] bg-panel border border-line px-4 py-3 text-xs uppercase tracking-[0.15em] text-warm outline-none focus:border-gold"
              aria-label="Filter orders by status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option.value || "all"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-red-400/30 bg-red-400/5 px-5 py-4"
          >
            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadOrders}
              className="text-[11px] uppercase tracking-[0.18em] text-red-300 hover:text-red-200"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <OrdersSkeleton />
        ) : orders.length === 0 ? (
          <section className="border border-line bg-panel/40 px-6 py-16 md:py-20 text-center">
            <div className="w-20 h-20 mx-auto rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center text-gold">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 2h12l2 5H4l2-5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 7h14v15H5V7Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M9 11h6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <span className="block mt-6 text-[10px] uppercase tracking-[0.3em] text-gold">
              Order History
            </span>

            <h2 className="font-display text-2xl md:text-3xl text-warm mt-3">
              {status
                ? `No ${formatStatus(status)} Orders`
                : "No Orders Yet"}
            </h2>

            <p className="max-w-md mx-auto mt-3 text-sm text-muted leading-relaxed">
              {status
                ? "Try another status filter to find your order."
                : "Your completed purchases will appear here after you place an order."}
            </p>

            {status ? (
              <button
                type="button"
                onClick={() => {
                  setStatus("");
                  setPage(1);
                }}
                className="inline-flex mt-8 px-8 py-4 border border-gold text-gold text-xs uppercase tracking-[0.2em] hover:bg-gold/10 transition"
              >
                Show All Orders
              </button>
            ) : (
              <Link
                to="/shop"
                className="inline-flex mt-8 px-8 py-4 bg-gradient-to-br from-gold-bright to-gold-deep text-ink text-xs uppercase tracking-[0.2em] font-semibold hover:brightness-110 transition"
              >
                Explore Collection
              </Link>
            )}
          </section>
        ) : (
          <section className="space-y-5">
            {orders.map((order) => {
              const currency =
                order?.pricing?.currency || "LKR";
              const items = Array.isArray(order?.items)
                ? order.items
                : [];

              return (
                <article
                  key={order._id || order.orderNumber}
                  className="border border-line bg-panel/40 hover:border-gold/50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 md:px-7 py-5 border-b border-line">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gold">
                        Order Number
                      </span>

                      <h2 className="font-display text-xl text-warm mt-1">
                        {order.orderNumber}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] ${statusClassName(
                          order.orderStatus
                        )}`}
                      >
                        {formatStatus(
                          order.orderStatus
                        )}
                      </span>

                      <span
                        className={`inline-flex border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] ${statusClassName(
                          order.paymentStatus ===
                            "paid"
                            ? "delivered"
                            : order.paymentStatus ===
                                "failed"
                              ? "cancelled"
                              : "pending"
                        )}`}
                      >
                        Payment{" "}
                        {formatStatus(
                          order.paymentStatus
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-[1fr_230px] gap-6 p-5 md:p-7">
                    <div>
                      <div className="flex -space-x-3 mb-5">
                        {items
                          .slice(0, 4)
                          .map((item, index) => {
                            const imageUrl =
                              getImageUrl(item);

                            return (
                              <div
                                key={
                                  item._id ||
                                  `${item.slug}-${index}`
                                }
                                className="w-14 h-14 border border-line bg-ink overflow-hidden flex items-center justify-center"
                                title={item.name}
                              >
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="font-display text-gold">
                                    {item.name
                                      ?.charAt(0)
                                      ?.toUpperCase() ||
                                      "A"}
                                  </span>
                                )}
                              </div>
                            );
                          })}

                        {items.length > 4 && (
                          <div className="w-14 h-14 border border-gold/40 bg-ink flex items-center justify-center text-xs text-gold">
                            +{items.length - 4}
                          </div>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <OrderMeta
                          label="Placed On"
                          value={formatDate(
                            order.placedAt ||
                              order.createdAt
                          )}
                        />

                        <OrderMeta
                          label="Items"
                          value={`${items.reduce(
                            (sum, item) =>
                              sum +
                              Number(
                                item.quantity || 0
                              ),
                            0
                          )} item(s)`}
                        />

                        <OrderMeta
                          label="Payment"
                          value={formatStatus(
                            order.paymentMethod
                          )}
                        />
                      </div>
                    </div>

                    <div className="lg:border-l lg:border-line lg:pl-7 flex flex-col justify-between gap-5">
                      <div>
                        <span className="block text-[10px] uppercase tracking-[0.2em] text-gold mb-2">
                          Order Total
                        </span>

                        <strong className="font-display text-2xl text-gold-bright">
                          {formatMoney(
                            order?.pricing?.grandTotal,
                            currency
                          )}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          goToDetails(
                            order.orderNumber
                          )
                        }
                        className="w-full px-6 py-3.5 border border-gold text-gold text-[11px] uppercase tracking-[0.18em] hover:bg-gold hover:text-ink transition"
                      >
                        View Order Details
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {!loading && pages > 1 && (
          <nav
            className="mt-10 pt-7 border-t border-line flex items-center justify-center gap-3"
            aria-label="Order pagination"
          >
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.max(current - 1, 1)
                )
              }
              disabled={page === 1}
              className="px-5 py-3 border border-line text-xs uppercase tracking-[0.16em] text-muted hover:border-gold hover:text-gold transition disabled:opacity-35 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="px-4 text-xs uppercase tracking-[0.18em] text-muted">
              Page {page} of {pages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(current + 1, pages)
                )
              }
              disabled={page === pages}
              className="px-5 py-3 border border-line text-xs uppercase tracking-[0.16em] text-muted hover:border-gold hover:text-gold transition disabled:opacity-35 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        )}

        <div className="mt-12 pt-7 border-t border-line flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <Link
            to="/profile"
            className="text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-bright transition"
          >
            ← Back to Profile
          </Link>

          <Link
            to="/shop"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-gold transition"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    </main>
  );
}

function OrderMeta({ label, value }) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-[0.18em] text-gold mb-1">
        {label}
      </span>

      <span className="text-sm text-muted">
        {value}
      </span>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <section className="space-y-5 animate-pulse">
      {Array.from({
        length: 3,
      }).map((_, index) => (
        <div
          key={index}
          className="border border-line bg-panel/40"
        >
          <div className="h-20 border-b border-line bg-black/10" />
          <div className="h-48 bg-panel/30" />
        </div>
      ))}
    </section>
  );
}
