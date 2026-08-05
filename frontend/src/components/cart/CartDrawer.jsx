import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";

const formatPrice = (value) =>
    `Rs ${Number(value || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;

const getItemId = (item) => item?._id || item?.id;
const getProduct = (item) => item?.product || item;
const getProductName = (item) =>
    getProduct(item)?.name || getProduct(item)?.title || "Product";
const getProductSlug = (item) => getProduct(item)?.slug;
const getSelectedSize = (item) =>
    item?.selectedSize || item?.size || item?.variant || "";
const getUnitPrice = (item) =>
    Number(
        item?.unitPrice ??
        item?.price ??
        item?.selectedPrice ??
        getProduct(item)?.salePrice ??
        getProduct(item)?.price ??
        0
    );

const getProductImage = (item) => {
    const product = getProduct(item);
    const image = product?.images?.[0] || product?.image;

    if (typeof image === "string") return image;
    return image?.url || image?.secure_url || "";
};

export default function CartDrawer() {
    const navigate = useNavigate();
    const {
        items,
        subtotal,
        loading,
        error,
        isCartOpen,
        closeCart,
        updateQuantity,
        removeItem,
    } = useCart();

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [drawerMessage, setDrawerMessage] = useState("");

    useEffect(() => {
        if (!isCartOpen) {
            setDrawerMessage("");
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscape = (event) => {
            if (event.key === "Escape") closeCart();
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isCartOpen, closeCart]);

    const handleQuantityChange = async (item, nextQuantity) => {
        const itemId = getItemId(item);
        if (!itemId || nextQuantity < 1) return;

        setDrawerMessage("");

        try {
            await updateQuantity(itemId, nextQuantity);
        } catch (err) {
            setDrawerMessage(err.message || "Unable to update quantity.");
        }
    };

    const handleRemove = async (item) => {
        const itemId = getItemId(item);
        if (!itemId) return;

        setDrawerMessage("");

        try {
            await removeItem(itemId);
        } catch (err) {
            setDrawerMessage(err.message || "Unable to remove the item.");
        }
    };

    const handleViewCart = () => {
        closeCart();
        navigate("/cart");
    };

    const handleCheckout = () => {
        setDrawerMessage("");

        if (items.length === 0) {
            setDrawerMessage("Your cart is empty.");
            return;
        }

        if (!acceptedTerms) {
            setDrawerMessage("Please agree to the terms and conditions first.");
            return;
        }

        closeCart();
        navigate("/checkout");
    };

    return (
        <div
            className={`fixed inset-0 z-[100] ${isCartOpen ? "pointer-events-auto" : "pointer-events-none"
                }`}
            aria-hidden={!isCartOpen}
        >
            <button
                type="button"
                aria-label="Close shopping cart"
                onClick={closeCart}
                className={`absolute inset-0 bg-black/70 backdrop-blur-[1px] transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0"
                    }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                className={`absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-line bg-ink text-warm shadow-2xl transition-transform duration-300 ease-out ${isCartOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-line px-6">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
                            Aromiq.lk
                        </p>
                        <h2 className="mt-1 font-display text-2xl">Shopping Cart</h2>
                    </div>

                    <button
                        type="button"
                        onClick={closeCart}
                        aria-label="Close cart"
                        className="flex h-10 w-10 items-center justify-center border border-line text-2xl font-light text-warm transition hover:border-gold hover:text-gold-bright"
                    >
                        ×
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {loading && items.length === 0 ? (
                        <div className="flex h-full items-center justify-center px-6 text-sm text-muted">
                            Loading cart...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-line text-gold">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M4 6h2l1.6 10.2A2 2 0 0 0 9.6 18h7.8a2 2 0 0 0 2-1.6L21 8H7"
                                        stroke="currentColor"
                                        strokeWidth="1.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-display text-xl">Your cart is empty</h3>
                            <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
                                Add a fragrance to your cart and it will appear here.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    closeCart();
                                    navigate("/shop");
                                }}
                                className="mt-6 border border-gold px-7 py-3 text-xs uppercase tracking-[0.2em] text-gold-bright transition hover:bg-gold/10"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-line">
                            {items.map((item, index) => {
                                const product = getProduct(item);
                                const itemId = getItemId(item);
                                const quantity = Number(item?.quantity || 1);
                                const unitPrice = getUnitPrice(item);
                                const image = getProductImage(item);
                                const slug = getProductSlug(item);

                                return (
                                    <article
                                        key={itemId || `${product?._id || "cart-item"}-${index}`}
                                        className="grid grid-cols-[96px_1fr] gap-4 px-6 py-6"
                                    >
                                        <button
                                            type="button"
                                            disabled={!slug}
                                            onClick={() => {
                                                if (!slug) return;
                                                closeCart();
                                                navigate(`/product/${slug}`);
                                            }}
                                            className="h-28 overflow-hidden border border-line bg-panel disabled:cursor-default"
                                        >
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={getProductName(item)}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                                                    No image
                                                </div>
                                            )}
                                        </button>

                                        <div className="min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-sm font-medium text-warm">
                                                        {getProductName(item)}
                                                    </h3>
                                                    {getSelectedSize(item) && (
                                                        <p className="mt-1 text-xs uppercase tracking-wider text-muted">
                                                            {getSelectedSize(item)}
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemove(item)}
                                                    disabled={loading || !itemId}
                                                    className="shrink-0 text-xs uppercase tracking-wider text-muted transition hover:text-red-400 disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <p className="mt-2 font-display text-lg text-gold-bright">
                                                {formatPrice(unitPrice)}
                                            </p>

                                            <div className="mt-4 flex items-center justify-between gap-3">
                                                <div className="flex h-10 items-center border border-line">
                                                    <button
                                                        type="button"
                                                        aria-label="Decrease quantity"
                                                        onClick={() =>
                                                            handleQuantityChange(item, quantity - 1)
                                                        }
                                                        disabled={loading || quantity <= 1 || !itemId}
                                                        className="h-full w-10 text-lg text-gold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-10 text-center text-sm">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        aria-label="Increase quantity"
                                                        onClick={() =>
                                                            handleQuantityChange(item, quantity + 1)
                                                        }
                                                        disabled={loading || !itemId}
                                                        className="h-full w-10 text-lg text-gold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <p className="text-sm font-medium text-warm">
                                                    {formatPrice(unitPrice * quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="shrink-0 border-t border-line bg-panel/60 px-6 py-5">
                        <div className="flex items-center justify-between">
                            <span className="font-display text-xl">Subtotal</span>
                            <strong className="font-display text-2xl text-gold-bright">
                                {formatPrice(subtotal)}
                            </strong>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-muted">
                            Taxes, shipping and discount codes are calculated at checkout.
                        </p>

                        <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(event) => {
                                    setAcceptedTerms(event.target.checked);
                                    setDrawerMessage("");
                                }}
                                className="mt-0.5 h-4 w-4 accent-[#c9a961]"
                            />
                            <span>I agree with the terms and conditions.</span>
                        </label>

                        {(drawerMessage || error) && (
                            <p className="mt-3 text-xs text-red-400">
                                {drawerMessage || error}
                            </p>
                        )}

                        <div className="mt-5 grid gap-3">
                            <button
                                type="button"
                                onClick={handleViewCart}
                                className="w-full border border-gold py-3.5 text-xs uppercase tracking-[0.25em] text-gold-bright transition hover:bg-gold/10"
                            >
                                View Cart
                            </button>

                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-gradient-to-br from-gold-bright to-gold-deep py-3.5 text-xs font-semibold uppercase tracking-[0.25em] text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Updating..." : "Checkout"}
                            </button>
                        </div>
                    </div>
                )}
            </aside>
        </div>
    );
}
