import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { getCheckoutSummary } from "../../api/checkoutApi.js";
import { getUserAddresses } from "../../api/userApi.js";
import { createOrder } from "../../api/orderApi.js";

const formatPrice = (value) =>
    `Rs ${Number(value || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, subtotal: localSubtotal, loading: cartLoading, refreshCart, clearCart } = useCart();

    // Address state
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [addressesLoading, setAddressesLoading] = useState(true);

    // Coupon state
    const [couponCodeInput, setCouponCodeInput] = useState("");
    const [appliedCouponCode, setAppliedCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

    // Summary state (from backend)
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // 1. Initial cart sync and address load
    useEffect(() => {
        refreshCart().catch(() => { });
        loadAddresses();
    }, [refreshCart]);

    const loadAddresses = async () => {
        try {
            setAddressesLoading(true);
            const res = await getUserAddresses();
            const addrList = Array.isArray(res?.addresses) ? res.addresses : [];
            setAddresses(addrList);

            // Auto-select default address if exists
            if (addrList.length > 0) {
                const defaultAddr = addrList.find(a => a.isDefault);
                setSelectedAddressId(defaultAddr ? defaultAddr._id || defaultAddr.id : addrList[0]._id || addrList[0].id);
            }
        } catch (err) {
            setFormError("Unable to load saved addresses. Please ensure you are logged in.");
        } finally {
            setAddressesLoading(false);
        }
    };

    // 2. Fetch summary when address or cart or applied coupon changes
    const fetchSummary = useCallback(async () => {
        if (!selectedAddressId || items.length === 0) return;

        try {
            setSummaryLoading(true);
            setFormError("");
            const res = await getCheckoutSummary(selectedAddressId, appliedCouponCode);
            setSummary(res);
            setCouponError(""); // Clear any coupon error if successful
        } catch (err) {
            // If the error was due to an invalid coupon, the summary endpoint usually throws a 400 or 404.
            // Let's clear the applied coupon and show error
            if (appliedCouponCode && (err.message.toLowerCase().includes("coupon") || err.status === 404 || err.status === 400)) {
                setCouponError(err.message);
                setAppliedCouponCode("");
            } else {
                setFormError(err.message || "Failed to calculate shipping and totals.");
                setSummary(null);
            }
        } finally {
            setSummaryLoading(false);
        }
    }, [selectedAddressId, items.length, appliedCouponCode]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        const code = couponCodeInput.trim();
        if (!code) return;
        setAppliedCouponCode(code);
    };

    const handleRemoveCoupon = () => {
        setAppliedCouponCode("");
        setCouponCodeInput("");
        setCouponError("");
    };

    const handlePlaceOrder = async (event) => {
        event.preventDefault();
        setFormError("");

        if (items.length === 0) {
            setFormError("Your cart is empty.");
            return;
        }

        if (!selectedAddressId) {
            setFormError("Please select a delivery address.");
            return;
        }

        if (!summary) {
            setFormError("Order summary is not ready yet.");
            return;
        }

        setSubmitting(true);

        try {
            const orderRes = await createOrder({
                addressId: selectedAddressId,
                couponCode: appliedCouponCode,
                paymentMethod: paymentMethod,
                customerNote: "",
            });

            // If order successful, clear cart context
            clearCart();

            navigate("/order-success", {
                replace: true,
                state: { order: orderRes.order, paymentMethod },
            });
        } catch (err) {
            setFormError(err.message || "Unable to place the order.");
        } finally {
            setSubmitting(false);
        }
    };

    if (cartLoading && items.length === 0) {
        return (
            <main className="min-h-[70vh] px-6 py-20 flex items-center justify-center">
                <div className="text-sm text-muted animate-pulse">Loading checkout...</div>
            </main>
        );
    }

    if (!cartLoading && items.length === 0) {
        return (
            <main className="min-h-[70vh] px-6 py-20">
                <div className="mx-auto max-w-xl border border-line bg-panel p-10 text-center">
                    <h1 className="font-display text-3xl text-warm">Your cart is empty</h1>
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
                    <h1 className="mt-2 font-display text-4xl text-warm">Checkout & Payment</h1>
                </div>

                {formError && (
                    <div className="mb-6 border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
                        {formError}
                    </div>
                )}

                <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    <div className="space-y-8">
                        {/* Delivery Address Section */}
                        <section className="border border-line bg-panel/30 p-6 md:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold text-sm text-gold">1</span>
                                <h2 className="font-display text-2xl text-warm">Delivery Address</h2>
                            </div>

                            {addressesLoading ? (
                                <div className="text-sm tracking-wider text-muted animate-pulse">Loading addresses...</div>
                            ) : addresses.length === 0 ? (
                                <div className="border border-gold/30 bg-gold/5 p-6 text-center">
                                    <p className="text-sm text-muted mb-4">You don't have any saved addresses yet.</p>
                                    <Link to="/address" className="px-6 py-3 border border-gold text-gold text-xs uppercase tracking-widest hover:bg-gold/10 transition">
                                        Add Delivery Address
                                    </Link>
                                    <p className="mt-3 text-xs text-muted/60">You will need to return to cart after adding an address.</p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {addresses.map((addr) => {
                                        const id = addr._id || addr.id;
                                        const isSelected = selectedAddressId === id;
                                        return (
                                            <label
                                                key={id}
                                                className={`relative flex flex-col border p-5 cursor-pointer transition ${isSelected ? "border-gold bg-gold/5" : "border-line bg-ink hover:border-gold/50"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="addressId"
                                                    value={id}
                                                    checked={isSelected}
                                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold">{addr.label || "Home"}</span>
                                                    {isSelected && <span className="w-2 h-2 rounded-full bg-gold-bright" />}
                                                </div>
                                                <strong className="text-sm text-warm mb-1">{addr.fullName}</strong>
                                                <div className="text-xs text-muted space-y-1">
                                                    <p>{addr.addressLine1}</p>
                                                    {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                                    <p>{addr.city}{addr.postalCode ? `, ${addr.postalCode}` : ""}</p>
                                                    <p>{addr.district}, {addr.country}</p>
                                                    <p className="pt-2">{addr.phone}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                            {addresses.length > 0 && (
                                <div className="mt-5 text-right">
                                    <Link to="/address" className="text-[11px] text-muted hover:text-gold uppercase tracking-[0.15em] transition">
                                        Manage Addresses →
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Payment Method Section */}
                        <section className="border border-line bg-panel/30 p-6 md:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold text-sm text-gold">2</span>
                                <h2 className="font-display text-2xl text-warm">Payment Method</h2>
                            </div>

                            <div className="space-y-4">
                                <label
                                    className={`flex cursor-pointer items-start gap-4 border p-5 transition ${paymentMethod === "cash_on_delivery" ? "border-gold bg-gold/5" : "border-line bg-ink"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash_on_delivery"
                                        checked={paymentMethod === "cash_on_delivery"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mt-1 w-4 h-4 accent-[#c9a961]"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-warm tracking-wide">Cash on Delivery</p>
                                        <p className="mt-1.5 text-xs text-muted leading-relaxed">
                                            Pay with cash when your luxury fragrance arrives at your doorstep.
                                        </p>
                                    </div>
                                </label>

                                <label
                                    className={`flex cursor-pointer items-start gap-4 border p-5 transition ${paymentMethod === "card" ? "border-gold bg-gold/5" : "border-line bg-ink"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentMethod === "card"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mt-1 w-4 h-4 accent-[#c9a961]"
                                    />
                                    <div className="w-full">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-warm tracking-wide">Credit / Debit Card</p>
                                            <div className="flex gap-1 text-[10px]">
                                                <span className="px-1.5 py-0.5 border border-line rounded">VISA</span>
                                                <span className="px-1.5 py-0.5 border border-line rounded">MC</span>
                                            </div>
                                        </div>
                                        <p className="mt-1.5 text-xs text-muted leading-relaxed">
                                            Securely pay online. (Payment gateway integration pending).
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Order Summary Sidebar */}
                    <aside className="h-fit">
                        <div className="border border-line bg-panel/40 p-6 lg:sticky lg:top-28">
                            <h2 className="font-display text-2xl text-warm mb-6">Order Summary</h2>

                            {/* Summary Items */}
                            <div className="max-h-[300px] space-y-4 overflow-y-auto pr-2 mb-6">
                                {(summary ? summary.items : items).map((item, index) => {
                                    const qty = Number(item?.quantity || 1);
                                    // Use summary unitPrice if available, format fallbacks otherwise
                                    const price = item.itemTotal ? item.itemTotal : (item.unitPrice || item.price || item.product?.price || 0) * qty;

                                    return (
                                        <div key={item?.cartItemId || item?._id || index} className="flex gap-4">
                                            <div className="w-16 h-16 shrink-0 bg-panel border border-line flex items-center justify-center p-1">
                                                {item.image || (item.product && item.product.images?.[0]) ? (
                                                    <img src={item.image || item.product.images[0]} alt={item.name || item.product?.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-[10px] text-muted">IMG</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="truncate text-sm text-warm font-medium">{item.name || item.product?.name}</p>
                                                <p className="text-[11px] text-muted mt-1">
                                                    {item.selectedSize ? `${item.selectedSize} · ` : ""}Qty: {qty}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-sm font-display text-gold-bright flex items-center">
                                                {formatPrice(price)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Coupon Code Section */}
                            <div className="mb-6 pt-6 border-t border-line">
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Gift Card or Discount Code</h3>
                                {appliedCouponCode ? (
                                    <div className="flex items-center justify-between border border-green-400/30 bg-green-400/5 p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-400">✓</span>
                                            <div>
                                                <p className="text-sm font-medium text-green-400 tracking-widest">{appliedCouponCode}</p>
                                                {summary?.coupon?.description && <p className="text-[10px] text-green-400/70">{summary.coupon.description}</p>}
                                            </div>
                                        </div>
                                        <button type="button" onClick={handleRemoveCoupon} className="text-[10px] text-muted hover:text-red-400 uppercase tracking-widest transition">
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCodeInput}
                                            onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                            placeholder="Enter coupon code"
                                            className="flex-1 bg-ink border border-line px-4 py-3 text-sm tracking-widest text-warm outline-none focus:border-gold placeholder:normal-case placeholder:tracking-normal"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={!couponCodeInput.trim() || summaryLoading}
                                            className="px-5 bg-panel border border-line text-xs uppercase tracking-[0.15em] text-gold hover:border-gold transition disabled:opacity-50"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                )}
                                {couponError && (
                                    <p className="mt-2 text-xs text-red-400">{couponError}</p>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 text-sm pt-6 border-t border-line">
                                <div className="flex justify-between text-muted">
                                    <span>Subtotal</span>
                                    {summaryLoading ? <span className="w-16 h-4 bg-line animate-pulse" /> : <span>{formatPrice(summary ? summary.pricing.subtotal : localSubtotal)}</span>}
                                </div>

                                {summary?.pricing?.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Discount</span>
                                        <span>−{formatPrice(summary.pricing.discountAmount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-muted">
                                    <span>Shipping</span>
                                    {summaryLoading ? (
                                        <span className="w-16 h-4 bg-line animate-pulse" />
                                    ) : summary ? (
                                        <span>{summary.pricing.shippingFee === 0 ? "Free" : formatPrice(summary.pricing.shippingFee)}</span>
                                    ) : (
                                        <span className="text-[11px] italic">Select address</span>
                                    )}
                                </div>
                                {summary?.shipping?.ruleName && (
                                    <p className="text-[10px] text-muted text-right -mt-1">Via {summary.shipping.ruleName}</p>
                                )}
                            </div>

                            <div className="mt-5 flex items-end justify-between border-t border-line pt-5">
                                <span className="font-display text-xl text-warm">Grand Total</span>
                                {summaryLoading ? (
                                    <span className="w-24 h-8 bg-line animate-pulse" />
                                ) : (
                                    <strong className="font-display text-2xl text-gold-bright">
                                        {formatPrice(summary ? summary.pricing.grandTotal : localSubtotal)}
                                    </strong>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || summaryLoading || !selectedAddressId || addresses.length === 0}
                                className="mt-8 w-full bg-gradient-to-br from-gold-bright to-gold-deep py-4 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition hover:brightness-110 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Processing..." : "Place Order"}
                            </button>

                            <Link to="/cart" className="mt-4 block text-center text-[10px] uppercase tracking-[0.2em] text-muted transition hover:text-gold">
                                ← Return to Cart
                            </Link>
                        </div>
                    </aside>
                </form>
            </div>
        </main>
    );
}