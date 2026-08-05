import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";

const formatPrice = (value) =>
    `Rs ${Number(value || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;

const getProduct = (item) => item?.product || item;
const getName = (item) =>
    getProduct(item)?.name || getProduct(item)?.title || "Product";
const getSize = (item) => item?.selectedSize || item?.size || item?.variant || "";
const getPrice = (item) =>
    Number(
        item?.unitPrice ??
        item?.price ??
        item?.selectedPrice ??
        getProduct(item)?.salePrice ??
        getProduct(item)?.price ??
        0
    );

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, subtotal, loading, error, refreshCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState("cash-on-delivery");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        refreshCart().catch(() => { });
    }, [refreshCart]);

    const handlePlaceOrder = async (event) => {
        event.preventDefault();
        setFormError("");

        if (items.length === 0) {
            setFormError("Your cart is empty.");
            return;
        }

        setSubmitting(true);

        try {
            // Replace this section with your real order/payment API request.
            // The selected payment method is already available in paymentMethod.
            navigate("/order-success", {
                state: { paymentMethod },
            });
        } catch (err) {
            setFormError(err.message || "Unable to place the order.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && items.length === 0) {
        return (
            <main className="min-h-[70vh] px-6 py-20">
                <div className="mx-auto max-w-6xl text-center text-sm text-muted">
                    Loading checkout...
                </div>
            </main>
        );
    }

    if (!loading && items.length === 0) {
        return (
            <main className="min-h-[70vh] px-6 py-20">
                <div className="mx-auto max-w-xl border border-line bg-panel p-10 text-center">
                    <h1 className="font-display text-3xl">Your cart is empty</h1>
                    <p className="mt-3 text-sm leading-6 text-muted">
                        Add a product before continuing to checkout.
                    </p>
                    <Link
                        to="/shop"
                        className="mt-7 inline-block bg-gradient-to-br from-gold-bright to-gold-deep px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
                    >
                        Go to Shop
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-[70vh] px-6 py-14 md:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-10 border-b border-line pb-6">
                    <span className="text-xs uppercase tracking-[0.3em] text-gold">
                        Secure Checkout
                    </span>
                    <h1 className="mt-2 font-display text-4xl">Checkout & Payment</h1>
                </div>

                {(formError || error) && (
                    <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {formError || error}
                    </p>
                )}

                <form
                    onSubmit={handlePlaceOrder}
                    className="grid gap-8 lg:grid-cols-[1fr_380px]"
                >
                    <div className="space-y-8">
                        <section className="border border-line bg-panel p-6 md:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold text-sm text-gold">
                                    1
                                </span>
                                <h2 className="font-display text-2xl">Delivery Details</h2>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="flex flex-col gap-2 text-xs uppercase tracking-wider text-gold">
                                    Full Name
                                    <input
                                        name="fullName"
                                        required
                                        className="border border-line bg-ink px-4 py-3 text-sm normal-case tracking-normal text-warm outline-none focus:border-gold"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-xs uppercase tracking-wider text-gold">
                                    Phone Number
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        className="border border-line bg-ink px-4 py-3 text-sm normal-case tracking-normal text-warm outline-none focus:border-gold"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-xs uppercase tracking-wider text-gold sm:col-span-2">
                                    Address
                                    <input
                                        name="address"
                                        required
                                        className="border border-line bg-ink px-4 py-3 text-sm normal-case tracking-normal text-warm outline-none focus:border-gold"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-xs uppercase tracking-wider text-gold">
                                    City
                                    <input
                                        name="city"
                                        required
                                        className="border border-line bg-ink px-4 py-3 text-sm normal-case tracking-normal text-warm outline-none focus:border-gold"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-xs uppercase tracking-wider text-gold">
                                    Postal Code
                                    <input
                                        name="postalCode"
                                        className="border border-line bg-ink px-4 py-3 text-sm normal-case tracking-normal text-warm outline-none focus:border-gold"
                                    />
                                </label>
                            </div>
                        </section>

                        <section className="border border-line bg-panel p-6 md:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold text-sm text-gold">
                                    2
                                </span>
                                <h2 className="font-display text-2xl">Payment Method</h2>
                            </div>

                            <div className="space-y-3">
                                <label
                                    className={`flex cursor-pointer items-center justify-between border p-4 transition ${paymentMethod === "cash-on-delivery"
                                            ? "border-gold bg-gold/5"
                                            : "border-line"
                                        }`}
                                >
                                    <div>
                                        <p className="text-sm font-medium">Cash on Delivery</p>
                                        <p className="mt-1 text-xs text-muted">
                                            Pay when your order is delivered.
                                        </p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash-on-delivery"
                                        checked={paymentMethod === "cash-on-delivery"}
                                        onChange={(event) => setPaymentMethod(event.target.value)}
                                        className="h-4 w-4 accent-[#c9a961]"
                                    />
                                </label>

                                <label
                                    className={`flex cursor-pointer items-center justify-between border p-4 transition ${paymentMethod === "card"
                                            ? "border-gold bg-gold/5"
                                            : "border-line"
                                        }`}
                                >
                                    <div>
                                        <p className="text-sm font-medium">Card Payment</p>
                                        <p className="mt-1 text-xs text-muted">
                                            Continue using your payment gateway integration.
                                        </p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentMethod === "card"}
                                        onChange={(event) => setPaymentMethod(event.target.value)}
                                        className="h-4 w-4 accent-[#c9a961]"
                                    />
                                </label>
                            </div>

                            {paymentMethod === "card" && (
                                <p className="mt-4 border border-gold/30 bg-gold/5 px-4 py-3 text-xs leading-5 text-muted">
                                    Connect your existing payment API or gateway inside
                                    <code className="mx-1 text-gold-bright">handlePlaceOrder</code>
                                    before using card payments in production.
                                </p>
                            )}
                        </section>
                    </div>

                    <aside className="h-fit border border-line bg-panel p-6 lg:sticky lg:top-28">
                        <h2 className="font-display text-2xl">Order Summary</h2>

                        <div className="mt-6 max-h-[320px] space-y-4 overflow-y-auto pr-1">
                            {items.map((item, index) => {
                                const quantity = Number(item?.quantity || 1);
                                const unitPrice = getPrice(item);

                                return (
                                    <div
                                        key={item?._id || item?.id || index}
                                        className="flex items-start justify-between gap-4 border-b border-line pb-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm">{getName(item)}</p>
                                            <p className="mt-1 text-xs text-muted">
                                                {getSize(item) ? `${getSize(item)} · ` : ""}Qty: {quantity}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-sm text-gold-bright">
                                            {formatPrice(unitPrice * quantity)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 space-y-4 text-sm">
                            <div className="flex justify-between text-muted">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted">
                                <span>Shipping</span>
                                <span>Calculated separately</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                            <span className="font-display text-xl">Total</span>
                            <strong className="font-display text-2xl text-gold-bright">
                                {formatPrice(subtotal)}
                            </strong>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || loading}
                            className="mt-7 w-full bg-gradient-to-br from-gold-bright to-gold-deep py-4 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Processing..." : "Place Order"}
                        </button>

                        <Link
                            to="/cart"
                            className="mt-3 block text-center text-xs uppercase tracking-widest text-muted transition hover:text-gold-bright"
                        >
                            ← Return to Cart
                        </Link>
                    </aside>
                </form>
            </div>
        </main>
    );
}