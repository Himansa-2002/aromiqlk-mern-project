import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";

const formatPrice = (value) =>
    `Rs ${Number(value || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;

const getItemId = (item) => item?._id || item?.id;
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
const getImage = (item) => {
    const product = getProduct(item);
    const image = product?.images?.[0] || product?.image;
    if (typeof image === "string") return image;
    return image?.url || image?.secure_url || "";
};

export default function CartPage() {
    const navigate = useNavigate();
    const {
        items,
        subtotal,
        loading,
        error,
        refreshCart,
        updateQuantity,
        removeItem,
        clearCart,
    } = useCart();
    const [message, setMessage] = useState("");

    useEffect(() => {
        refreshCart().catch(() => { });
    }, [refreshCart]);

    const runCartAction = async (action) => {
        setMessage("");
        try {
            await action();
        } catch (err) {
            setMessage(err.message || "Unable to update the cart.");
        }
    };

    if (loading && items.length === 0) {
        return (
            <main className="min-h-[70vh] px-6 py-20">
                <div className="mx-auto max-w-6xl text-center text-sm text-muted">
                    Loading cart...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-[70vh] px-6 py-14 md:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
                    <div>
                        <span className="text-xs uppercase tracking-[0.3em] text-gold">
                            Your Selection
                        </span>
                        <h1 className="mt-2 font-display text-4xl">Shopping Cart</h1>
                    </div>

                    {items.length > 0 && (
                        <button
                            type="button"
                            onClick={() => runCartAction(clearCart)}
                            disabled={loading}
                            className="text-xs uppercase tracking-widest text-muted transition hover:text-red-400 disabled:opacity-50"
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {(message || error) && (
                    <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {message || error}
                    </p>
                )}

                {items.length === 0 ? (
                    <section className="border border-line bg-panel px-6 py-20 text-center">
                        <h2 className="font-display text-2xl">Your cart is empty</h2>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
                            Browse the collection and add your favourite fragrances to continue.
                        </p>
                        <Link
                            to="/shop"
                            className="mt-7 inline-block bg-gradient-to-br from-gold-bright to-gold-deep px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:brightness-110"
                        >
                            Continue Shopping
                        </Link>
                    </section>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                        <section className="divide-y divide-line border border-line bg-panel/40">
                            {items.map((item, index) => {
                                const product = getProduct(item);
                                const itemId = getItemId(item);
                                const quantity = Number(item?.quantity || 1);
                                const unitPrice = getPrice(item);
                                const image = getImage(item);

                                return (
                                    <article
                                        key={itemId || `${product?._id || "item"}-${index}`}
                                        className="grid gap-5 p-5 sm:grid-cols-[130px_1fr] sm:p-6"
                                    >
                                        <div className="h-40 overflow-hidden border border-line bg-ink">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={getName(item)}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs text-muted">
                                                    No image
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex min-w-0 flex-col justify-between gap-5">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div>
                                                    <h2 className="font-display text-xl">{getName(item)}</h2>
                                                    {getSize(item) && (
                                                        <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                                                            Size: {getSize(item)}
                                                        </p>
                                                    )}
                                                    <p className="mt-3 text-sm text-gold-bright">
                                                        {formatPrice(unitPrice)} each
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        runCartAction(() => removeItem(itemId))
                                                    }
                                                    disabled={loading || !itemId}
                                                    className="text-xs uppercase tracking-widest text-muted transition hover:text-red-400 disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex h-11 items-center border border-line bg-ink">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            runCartAction(() =>
                                                                updateQuantity(itemId, quantity - 1)
                                                            )
                                                        }
                                                        disabled={loading || quantity <= 1 || !itemId}
                                                        className="h-full w-11 text-lg text-gold transition hover:bg-gold/10 disabled:opacity-40"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-12 text-center text-sm">{quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            runCartAction(() =>
                                                                updateQuantity(itemId, quantity + 1)
                                                            )
                                                        }
                                                        disabled={loading || !itemId}
                                                        className="h-full w-11 text-lg text-gold transition hover:bg-gold/10 disabled:opacity-40"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <strong className="font-display text-xl text-gold-bright">
                                                    {formatPrice(unitPrice * quantity)}
                                                </strong>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        <aside className="h-fit border border-line bg-panel p-6 lg:sticky lg:top-28">
                            <h2 className="font-display text-2xl">Order Summary</h2>

                            <div className="mt-6 space-y-4 text-sm">
                                <div className="flex justify-between text-muted">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-muted">
                                    <span>Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                                <span className="font-display text-xl">Total</span>
                                <strong className="font-display text-2xl text-gold-bright">
                                    {formatPrice(subtotal)}
                                </strong>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/checkout")}
                                disabled={loading || items.length === 0}
                                className="mt-7 w-full bg-gradient-to-br from-gold-bright to-gold-deep py-4 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition hover:brightness-110 disabled:opacity-50"
                            >
                                Proceed to Checkout
                            </button>

                            <Link
                                to="/shop"
                                className="mt-3 block w-full border border-gold py-4 text-center text-xs uppercase tracking-[0.22em] text-gold-bright transition hover:bg-gold/10"
                            >
                                Continue Shopping
                            </Link>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}