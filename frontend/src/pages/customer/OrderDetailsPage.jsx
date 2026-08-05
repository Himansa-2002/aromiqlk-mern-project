import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getOrderByNumber,
  getOrderTracking,
} from "../../api/orderApi.js";

const formatStatus = (status = "") =>
  status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const formatDate = (
  value,
  includeTime = false
) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });
};

const formatMoney = (
  value,
  currency = "LKR"
) =>
  `${currency} ${Number(
    value || 0
  ).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
    paid:
      "border-green-400/35 bg-green-400/5 text-green-300",
    cancelled:
      "border-red-400/35 bg-red-400/5 text-red-300",
    failed:
      "border-red-400/35 bg-red-400/5 text-red-300",
    refunded:
      "border-sky-400/35 bg-sky-400/5 text-sky-300",
  };

  return (
    classes[status] ||
    "border-line bg-panel text-muted"
  );
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

export default function OrderDetailsPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);

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
              "Please sign in to view this order.",
          },
        });

        return true;
      }

      return false;
    },
    [navigate]
  );

  const loadOrder = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Please sign in to view this order.",
        },
      });

      return;
    }

    if (!orderNumber) {
      setLoading(false);
      setError("Order number is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        orderResponse,
        trackingResponse,
      ] = await Promise.all([
        getOrderByNumber(orderNumber),
        getOrderTracking(orderNumber),
      ]);

      setOrder(orderResponse?.order || null);
      setTracking(
        trackingResponse?.tracking || null
      );
    } catch (requestError) {
      if (
        handleAuthenticationError(requestError)
      ) {
        return;
      }

      setError(
        requestError.message ||
          "Unable to load this order."
      );
    } finally {
      setLoading(false);
    }
  }, [
    orderNumber,
    navigate,
    handleAuthenticationError,
  ]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (loading) {
    return <OrderDetailsSkeleton />;
  }

  if (error || !order) {
    return (
      <main className="min-h-[75vh] bg-ink py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <section className="border border-red-400/30 bg-red-400/5 p-10">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-red-400/40 flex items-center justify-center text-red-400 text-xl">
              !
            </div>

            <h1 className="font-display text-3xl text-warm mb-3">
              Order Not Available
            </h1>

            <p className="text-sm text-muted mb-7">
              {error ||
                "The requested order could not be found."}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={loadOrder}
                className="px-7 py-3 border border-gold text-gold text-xs uppercase tracking-[0.2em] hover:bg-gold/10 transition"
              >
                Try Again
              </button>

              <Link
                to="/orders"
                className="px-7 py-3 border border-line text-muted text-xs uppercase tracking-[0.2em] hover:border-gold hover:text-gold transition"
              >
                My Orders
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const currency =
    order?.pricing?.currency || "LKR";

  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  const address = order.deliveryAddress || {};

  return (
    <main className="min-h-[75vh] bg-ink py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <Link
              to="/orders"
              className="text-[11px] uppercase tracking-[0.24em] text-gold hover:text-gold-bright transition"
            >
              ← My Orders
            </Link>

            <h1 className="font-display text-3xl md:text-4xl text-warm mt-4">
              Order Details
            </h1>

            <p className="text-sm text-muted mt-3">
              Order{" "}
              <span className="text-warm">
                {order.orderNumber}
              </span>{" "}
              · Placed{" "}
              {formatDate(
                order.placedAt ||
                  order.createdAt,
                true
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className={`inline-flex border px-4 py-2 text-[10px] uppercase tracking-[0.18em] ${statusClassName(
                order.orderStatus
              )}`}
            >
              {formatStatus(order.orderStatus)}
            </span>

            <span
              className={`inline-flex border px-4 py-2 text-[10px] uppercase tracking-[0.18em] ${statusClassName(
                order.paymentStatus
              )}`}
            >
              Payment{" "}
              {formatStatus(
                order.paymentStatus
              )}
            </span>
          </div>
        </div>

        <TrackingTimeline
          tracking={tracking}
          order={order}
        />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_350px] gap-8 mt-8">
          <div className="space-y-8">
            <section className="border border-line bg-panel/40">
              <div className="px-6 md:px-8 py-6 border-b border-line">
                <h2 className="font-display text-2xl text-warm">
                  Ordered Items
                </h2>

                <p className="text-xs text-muted mt-2">
                  {items.length} product line
                  {items.length === 1 ? "" : "s"} in
                  this order.
                </p>
              </div>

              <div className="divide-y divide-line">
                {items.map((item, index) => {
                  const imageUrl =
                    getImageUrl(item);

                  return (
                    <article
                      key={
                        item._id ||
                        `${item.slug}-${index}`
                      }
                      className="p-5 md:p-7 flex flex-col sm:flex-row gap-5"
                    >
                      <Link
                        to={
                          item.slug
                            ? `/product/${item.slug}`
                            : "/shop"
                        }
                        className="w-full sm:w-24 h-28 shrink-0 border border-line bg-ink overflow-hidden flex items-center justify-center"
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-display text-2xl text-gold">
                            {item.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "A"}
                          </span>
                        )}
                      </Link>

                      <div className="flex-1 flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                        <div>
                          <Link
                            to={
                              item.slug
                                ? `/product/${item.slug}`
                                : "/shop"
                            }
                            className="font-display text-xl text-warm hover:text-gold transition"
                          >
                            {item.name}
                          </Link>

                          {item.selectedSize && (
                            <p className="text-xs text-muted mt-2">
                              Size:{" "}
                              <span className="text-warm">
                                {item.selectedSize}
                              </span>
                            </p>
                          )}

                          <p className="text-xs text-muted mt-1">
                            Quantity:{" "}
                            <span className="text-warm">
                              {item.quantity}
                            </span>
                          </p>

                          <p className="text-xs text-muted mt-1">
                            Unit price:{" "}
                            <span className="text-warm">
                              {formatMoney(
                                item.unitPrice,
                                currency
                              )}
                            </span>
                          </p>
                        </div>

                        <strong className="font-display text-xl text-gold-bright">
                          {formatMoney(
                            item.itemTotal,
                            currency
                          )}
                        </strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="grid md:grid-cols-2 gap-8">
              <InfoCard title="Delivery Address">
                <p className="text-warm font-medium">
                  {address.fullName}
                </p>

                <p>{address.addressLine1}</p>

                {address.addressLine2 && (
                  <p>{address.addressLine2}</p>
                )}

                <p>
                  {address.city}
                  {address.postalCode
                    ? `, ${address.postalCode}`
                    : ""}
                </p>

                <p>
                  {address.district},{" "}
                  {address.country}
                </p>

                <p className="pt-3 text-warm">
                  {address.phone}
                </p>
              </InfoCard>

              <InfoCard title="Payment & Delivery">
                <InfoRow
                  label="Payment Method"
                  value={formatStatus(
                    order.paymentMethod
                  )}
                />

                <InfoRow
                  label="Payment Status"
                  value={formatStatus(
                    order.paymentStatus
                  )}
                />

                <InfoRow
                  label="Shipping Method"
                  value={
                    order?.shipping?.ruleName ||
                    "Standard delivery"
                  }
                />

                <InfoRow
                  label="Delivery Estimate"
                  value={
                    order.estimatedDeliveryDate
                      ? formatDate(
                          order.estimatedDeliveryDate
                        )
                      : getDeliveryEstimate(
                          order?.shipping
                            ?.estimatedDeliveryDays
                        )
                  }
                />
              </InfoCard>
            </section>

            {(order.customerNote ||
              order.trackingNumber ||
              order.trackingCourier) && (
              <section className="border border-line bg-panel/40 p-6 md:p-8">
                <h2 className="font-display text-2xl text-warm mb-5">
                  Additional Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {order.customerNote && (
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.2em] text-gold mb-2">
                        Customer Note
                      </span>

                      <p className="text-sm text-muted leading-relaxed">
                        {order.customerNote}
                      </p>
                    </div>
                  )}

                  {(order.trackingNumber ||
                    order.trackingCourier) && (
                    <div>
                      <span className="block text-[10px] uppercase tracking-[0.2em] text-gold mb-2">
                        Courier Tracking
                      </span>

                      <p className="text-sm text-muted">
                        {order.trackingCourier ||
                          "Courier"}
                        {order.trackingNumber
                          ? ` · ${order.trackingNumber}`
                          : ""}
                      </p>

                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex mt-3 text-xs uppercase tracking-[0.18em] text-gold hover:text-gold-bright"
                        >
                          Track with Courier →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <aside className="h-fit border border-gold/35 bg-panel/50">
            <div className="px-6 py-5 border-b border-line">
              <h2 className="font-display text-2xl text-warm">
                Order Summary
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <PriceRow
                label="Subtotal"
                value={formatMoney(
                  order?.pricing?.subtotal,
                  currency
                )}
              />

              {Number(
                order?.pricing?.discountAmount ||
                  0
              ) > 0 && (
                <PriceRow
                  label={
                    order?.coupon?.code
                      ? `Discount (${order.coupon.code})`
                      : "Discount"
                  }
                  value={`− ${formatMoney(
                    order.pricing.discountAmount,
                    currency
                  )}`}
                  highlight
                />
              )}

              <PriceRow
                label="Shipping"
                value={
                  Number(
                    order?.pricing?.shippingFee ||
                      0
                  ) === 0
                    ? "Free"
                    : formatMoney(
                        order.pricing.shippingFee,
                        currency
                      )
                }
              />

              <div className="pt-5 border-t border-line flex items-end justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.18em] text-warm">
                  Grand Total
                </span>

                <strong className="font-display text-2xl text-gold-bright text-right">
                  {formatMoney(
                    order?.pricing?.grandTotal,
                    currency
                  )}
                </strong>
              </div>
            </div>

            <div className="p-6 border-t border-line space-y-3">
              <Link
                to="/shop"
                className="block w-full text-center px-6 py-3.5 bg-gradient-to-br from-gold-bright to-gold-deep text-ink text-[11px] uppercase tracking-[0.18em] font-semibold hover:brightness-110 transition"
              >
                Continue Shopping
              </Link>

              <Link
                to="/orders"
                className="block w-full text-center px-6 py-3.5 border border-line text-muted text-[11px] uppercase tracking-[0.18em] hover:border-gold hover:text-gold transition"
              >
                Back to Orders
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function TrackingTimeline({
  tracking,
  order,
}) {
  const timeline = Array.isArray(
    tracking?.timeline
  )
    ? tracking.timeline
    : [];

  const cancelled =
    tracking?.cancelled ||
    order?.orderStatus === "cancelled";

  return (
    <section
      className={`border p-6 md:p-8 ${
        cancelled
          ? "border-red-400/30 bg-red-400/5"
          : "border-line bg-panel/40"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
            Delivery Progress
          </span>

          <h2 className="font-display text-2xl text-warm mt-2">
            {cancelled
              ? "Order Cancelled"
              : "Track Your Order"}
          </h2>
        </div>

        {tracking?.trackingNumber && (
          <div className="text-left md:text-right">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-gold">
              Tracking Number
            </span>

            <span className="text-sm text-warm mt-1 block">
              {tracking.trackingNumber}
            </span>
          </div>
        )}
      </div>

      {cancelled ? (
        <p className="text-sm text-red-300">
          This order has been cancelled. Contact
          customer support if you need more information.
        </p>
      ) : timeline.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-0">
          {timeline.map((step, index) => (
            <div
              key={step.status}
              className="relative flex sm:block gap-4 sm:gap-0 pb-6 sm:pb-0"
            >
              {index < timeline.length - 1 && (
                <div
                  className={`absolute left-[13px] top-7 bottom-0 w-px sm:left-1/2 sm:top-[13px] sm:bottom-auto sm:w-1/2 sm:h-px ${
                    step.completed
                      ? "bg-gold"
                      : "bg-line"
                  }`}
                />
              )}

              {index > 0 && (
                <div
                  className={`hidden sm:block absolute right-1/2 top-[13px] w-1/2 h-px ${
                    step.completed
                      ? "bg-gold"
                      : "bg-line"
                  }`}
                />
              )}

              <div
                className={`relative z-10 w-7 h-7 shrink-0 sm:mx-auto rounded-full border flex items-center justify-center ${
                  step.completed
                    ? "border-gold bg-gold text-ink"
                    : "border-line bg-ink text-muted"
                } ${
                  step.current
                    ? "ring-4 ring-gold/10"
                    : ""
                }`}
              >
                {step.completed ? "✓" : ""}
              </div>

              <div className="sm:text-center sm:mt-4">
                <span
                  className={`text-[10px] uppercase tracking-[0.16em] ${
                    step.current
                      ? "text-gold"
                      : step.completed
                        ? "text-warm"
                        : "text-muted"
                  }`}
                >
                  {formatStatus(step.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          Tracking updates are not available yet.
        </p>
      )}

      {!cancelled && tracking && (
        <div className="mt-7 pt-5 border-t border-line grid sm:grid-cols-3 gap-4">
          <InfoRow
            label="Shipping Method"
            value={
              tracking.shippingMethod ||
              "Standard delivery"
            }
          />

          <InfoRow
            label="Delivery District"
            value={
              tracking.deliveryDistrict ||
              "Not available"
            }
          />

          <InfoRow
            label="Estimated Time"
            value={getDeliveryEstimate(
              tracking.estimatedDeliveryDays
            )}
          />
        </div>
      )}
    </section>
  );
}

function InfoCard({ title, children }) {
  return (
    <section className="border border-line bg-panel/40 p-6 md:p-7">
      <h2 className="font-display text-2xl text-warm mb-5">
        {title}
      </h2>

      <div className="space-y-2 text-sm text-muted leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted">
        {label}
      </span>

      <span className="text-xs text-warm text-right">
        {value}
      </span>
    </div>
  );
}

function PriceRow({
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted">
        {label}
      </span>

      <span
        className={`text-sm text-right ${
          highlight
            ? "text-green-400"
            : "text-warm"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function getDeliveryEstimate(estimate) {
  const min = Number(estimate?.min);
  const max = Number(estimate?.max);

  if (
    Number.isFinite(min) &&
    Number.isFinite(max)
  ) {
    return `${min}–${max} working days`;
  }

  return "To be confirmed";
}

function OrderDetailsSkeleton() {
  return (
    <main className="min-h-[75vh] bg-ink py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-8 animate-pulse">
        <div className="h-3 w-24 bg-panel mb-5" />
        <div className="h-10 w-72 bg-panel mb-10" />
        <div className="h-56 border border-line bg-panel mb-8" />

        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          <div className="h-[520px] border border-line bg-panel" />
          <div className="h-[420px] border border-line bg-panel" />
        </div>
      </div>
    </main>
  );
}
