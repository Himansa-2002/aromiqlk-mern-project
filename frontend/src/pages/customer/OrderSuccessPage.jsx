import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useSearchParams,
} from "react-router-dom";

import { getOrderByNumber } from "../../api/orderApi.js";

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

const formatStatus = (status = "") =>
  status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

export default function OrderSuccessPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateOrder =
    location.state?.order || null;

  const orderNumber =
    stateOrder?.orderNumber ||
    location.state?.orderNumber ||
    searchParams.get("orderNumber") ||
    "";

  const [order, setOrder] = useState(
    stateOrder
  );

  const [loading, setLoading] = useState(
    Boolean(orderNumber && !stateOrder)
  );

  useEffect(() => {
    if (
      !orderNumber ||
      stateOrder ||
      !localStorage.getItem("token")
    ) {
      setLoading(false);
      return;
    }

    let active = true;

    getOrderByNumber(orderNumber)
      .then((response) => {
        if (active) {
          setOrder(response?.order || null);
        }
      })
      .catch(() => {
        // The success message should remain visible
        // even if the follow-up detail request fails.
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    orderNumber,
    stateOrder,
  ]);

  const displayOrderNumber =
    order?.orderNumber ||
    orderNumber ||
    location.state?.orderId ||
    "Processing";

  const currency =
    order?.pricing?.currency || "LKR";

  return (
    <main className="min-h-[75vh] bg-ink py-14 md:py-20">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <section className="relative overflow-hidden border border-gold/40 bg-panel/50 text-center">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

          <div className="px-6 md:px-12 py-12 md:py-16">
            <div className="w-24 h-24 mx-auto rounded-full border border-gold/50 bg-gold/5 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-bright to-gold-deep text-ink flex items-center justify-center text-2xl">
                ✓
              </div>
            </div>

            <span className="block mt-7 text-[10px] uppercase tracking-[0.35em] text-gold">
              Order Confirmed
            </span>

            <h1 className="font-display text-3xl md:text-5xl text-warm mt-4">
              Thank You for Your Order
            </h1>

            <p className="max-w-xl mx-auto mt-4 text-sm text-muted leading-relaxed">
              Your order has been received successfully.
              We will prepare your fragrances and keep
              you informed as the delivery progresses.
            </p>

            <div className="mt-9 border border-line bg-ink/40 p-5 md:p-6">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-gold">
                Order Number
              </span>

              <strong className="block font-display text-xl md:text-2xl text-gold-bright mt-2 break-all">
                {displayOrderNumber}
              </strong>
            </div>

            {loading ? (
              <div className="mt-6 h-24 border border-line bg-ink/30 animate-pulse" />
            ) : order ? (
              <div className="mt-6 grid sm:grid-cols-3 border border-line divide-y sm:divide-y-0 sm:divide-x divide-line text-left">
                <SuccessMeta
                  label="Order Status"
                  value={formatStatus(
                    order.orderStatus
                  )}
                />

                <SuccessMeta
                  label="Payment Method"
                  value={formatStatus(
                    order.paymentMethod
                  )}
                />

                <SuccessMeta
                  label="Total"
                  value={formatMoney(
                    order?.pricing?.grandTotal,
                    currency
                  )}
                  highlight
                />
              </div>
            ) : null}

            <div className="mt-9 grid sm:grid-cols-2 gap-3">
              {orderNumber && (
                <Link
                  to={`/order-details/${encodeURIComponent(
                    orderNumber
                  )}`}
                  className="px-7 py-4 bg-gradient-to-br from-gold-bright to-gold-deep text-ink text-xs uppercase tracking-[0.18em] font-semibold hover:brightness-110 transition"
                >
                  View Order Details
                </Link>
              )}

              <Link
                to="/orders"
                className="px-7 py-4 border border-gold text-gold text-xs uppercase tracking-[0.18em] hover:bg-gold/10 transition"
              >
                View All Orders
              </Link>

              <Link
                to="/shop"
                className={`px-7 py-4 border border-line text-muted text-xs uppercase tracking-[0.18em] hover:border-gold hover:text-gold transition ${
                  orderNumber
                    ? "sm:col-span-2"
                    : ""
                }`}
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="border-t border-line px-6 md:px-10 py-6 bg-ink/30">
            <div className="grid sm:grid-cols-3 gap-5 text-left">
              <NextStep
                number="01"
                title="Confirmation"
                text="Your order has been recorded in your account."
              />

              <NextStep
                number="02"
                title="Preparation"
                text="Our team will confirm and prepare the selected items."
              />

              <NextStep
                number="03"
                title="Delivery"
                text="Tracking information will appear in your order details."
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SuccessMeta({
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="p-5">
      <span className="block text-[10px] uppercase tracking-[0.18em] text-gold mb-2">
        {label}
      </span>

      <span
        className={`text-sm ${
          highlight
            ? "font-display text-lg text-gold-bright"
            : "text-warm"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function NextStep({
  number,
  title,
  text,
}) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.2em] text-gold">
        {number}
      </span>

      <h2 className="font-display text-lg text-warm mt-1">
        {title}
      </h2>

      <p className="text-xs text-muted mt-2 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
