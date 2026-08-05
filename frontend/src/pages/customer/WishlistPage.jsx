import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import ProductCard from "../../components/ProductCard.jsx";

import {
    clearWishlist,
    getWishlist,
    moveWishlistItemToCart,
    removeWishlistItem,
} from "../../api/wishlistApi.js";

import { useCart } from "../../context/CartContext.jsx";

const getProductId = (item) =>
    item?.product?._id ||
    item?.product?.id ||
    item?.product;

const getWishlistItemId = (item) =>
    item?._id ||
    item?.id ||
    `${getProductId(item)}-${item?.selectedSize || "default"}`;

export default function WishlistPage() {
    const navigate = useNavigate();
    const { openCart } = useCart();

    const [items, setItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);

    const [movingId, setMovingId] = useState(null);
    const [removingId, setRemovingId] = useState(null);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

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
                            "Please sign in to access your wishlist.",
                    },
                });

                return true;
            }

            return false;
        },
        [navigate]
    );

    const loadWishlist = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login", {
                replace: true,
                state: {
                    message:
                        "Please sign in to access your wishlist.",
                },
            });

            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await getWishlist();

            setItems(
                Array.isArray(response?.wishlist?.items)
                    ? response.wishlist.items
                    : []
            );
        } catch (requestError) {
            if (
                handleAuthenticationError(requestError)
            ) {
                return;
            }

            setError(
                requestError.message ||
                "Unable to load your wishlist."
            );
        } finally {
            setLoading(false);
        }
    }, [
        navigate,
        handleAuthenticationError,
    ]);

    useEffect(() => {
        loadWishlist();
    }, [loadWishlist]);

    const handleRemove = async (item) => {
        const productId = getProductId(item);
        const itemId = getWishlistItemId(item);

        if (!productId) {
            setError("Invalid wishlist product.");
            return;
        }

        try {
            setRemovingId(itemId);
            setError("");
            setSuccessMessage("");

            const response = await removeWishlistItem(
                productId,
                item.selectedSize || ""
            );

            if (
                Array.isArray(response?.wishlist?.items)
            ) {
                setItems(response.wishlist.items);
            } else {
                setItems((currentItems) =>
                    currentItems.filter(
                        (currentItem) =>
                            getWishlistItemId(currentItem) !==
                            itemId
                    )
                );
            }

            setSuccessMessage(
                response?.message ||
                "Product removed from wishlist."
            );
        } catch (requestError) {
            if (
                handleAuthenticationError(requestError)
            ) {
                return;
            }

            setError(
                requestError.message ||
                "Unable to remove this product."
            );
        } finally {
            setRemovingId(null);
        }
    };

    const handleMoveToCart = async (item) => {
        const productId = getProductId(item);
        const itemId = getWishlistItemId(item);
        const selectedSize =
            item.selectedSize || "";

        if (!productId) {
            setError("Invalid wishlist product.");
            return;
        }

        if (
            Array.isArray(item?.product?.sizes) &&
            item.product.sizes.length > 0 &&
            !selectedSize
        ) {
            setError(
                "Please open the product and select a size before adding it to the cart."
            );

            return;
        }

        try {
            setMovingId(itemId);
            setError("");
            setSuccessMessage("");

            const response =
                await moveWishlistItemToCart({
                    productId,
                    selectedSize,
                    quantity: 1,
                });

            setItems(
                Array.isArray(response?.wishlist?.items)
                    ? response.wishlist.items
                    : items.filter(
                        (currentItem) =>
                            getWishlistItemId(currentItem) !==
                            itemId
                    )
            );

            setSuccessMessage(
                response?.message ||
                "Product moved to your cart."
            );

            await openCart();
        } catch (requestError) {
            if (
                handleAuthenticationError(requestError)
            ) {
                return;
            }

            setError(
                requestError.message ||
                "Unable to move this product to the cart."
            );
        } finally {
            setMovingId(null);
        }
    };

    const handleClearWishlist = async () => {
        const confirmed = window.confirm(
            "Remove all products from your wishlist?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setClearing(true);
            setError("");
            setSuccessMessage("");

            const response = await clearWishlist();

            setItems([]);

            setSuccessMessage(
                response?.message ||
                "Wishlist cleared successfully."
            );
        } catch (requestError) {
            if (
                handleAuthenticationError(requestError)
            ) {
                return;
            }

            setError(
                requestError.message ||
                "Unable to clear your wishlist."
            );
        } finally {
            setClearing(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-[75vh] bg-ink py-16">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="animate-pulse">
                        <div className="h-3 w-32 bg-panel mb-4" />
                        <div className="h-10 w-72 bg-panel mb-10" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({
                                length: 3,
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="border border-line bg-panel"
                                >
                                    <div className="aspect-[1/1.15] bg-black/30" />

                                    <div className="p-5">
                                        <div className="h-3 w-20 bg-ink mb-3" />
                                        <div className="h-6 w-40 bg-ink mb-4" />
                                        <div className="h-5 w-28 bg-ink" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-[75vh] bg-ink py-12 md:py-16">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div>
                        <span className="text-[11px] uppercase tracking-[0.35em] text-gold">
                            My Account
                        </span>

                        <h1 className="font-display text-3xl md:text-4xl text-warm mt-3">
                            My Wishlist
                        </h1>

                        <p className="text-sm text-muted mt-3 max-w-2xl leading-relaxed">
                            Save your favourite fragrances and move
                            them to your shopping cart whenever you
                            are ready.
                        </p>
                    </div>

                    {items.length > 0 && (
                        <div className="flex items-center gap-4">
                            <span className="text-xs uppercase tracking-[0.2em] text-muted">
                                {items.length}{" "}
                                {items.length === 1
                                    ? "Product"
                                    : "Products"}
                            </span>

                            <button
                                type="button"
                                onClick={handleClearWishlist}
                                disabled={clearing}
                                className="px-6 py-3 border border-red-400/30 text-red-400 text-[11px] uppercase tracking-[0.18em] hover:bg-red-400/5 transition disabled:opacity-50"
                            >
                                {clearing
                                    ? "Clearing..."
                                    : "Clear Wishlist"}
                            </button>
                        </div>
                    )}
                </div>

                {successMessage && (
                    <div
                        role="status"
                        className="mb-7 border border-green-400/30 bg-green-400/5 px-5 py-4 text-sm text-green-400"
                    >
                        {successMessage}
                    </div>
                )}

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
                            onClick={loadWishlist}
                            className="text-[11px] uppercase tracking-[0.18em] text-red-300 hover:text-red-200"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {items.length === 0 ? (
                    <section className="border border-line bg-panel/40 px-6 py-16 md:py-20 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center text-gold">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                                    stroke="currentColor"
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <span className="block mt-6 text-[10px] uppercase tracking-[0.3em] text-gold">
                            Your Collection
                        </span>

                        <h2 className="font-display text-2xl md:text-3xl text-warm mt-3">
                            Your Wishlist Is Empty
                        </h2>

                        <p className="max-w-md mx-auto mt-3 text-sm text-muted leading-relaxed">
                            Explore our fragrance collection and save
                            the products you would love to purchase
                            later.
                        </p>

                        <Link
                            to="/shop"
                            className="inline-flex mt-8 px-8 py-4 bg-gradient-to-br from-gold-bright to-gold-deep text-ink text-xs uppercase tracking-[0.2em] font-semibold hover:brightness-110 transition"
                        >
                            Explore Collection
                        </Link>
                    </section>
                ) : (
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => {
                            const itemId =
                                getWishlistItemId(item);

                            return (
                                <ProductCard
                                    key={itemId}
                                    product={item.product}
                                    wishlistMode
                                    selectedSize={
                                        item.selectedSize || ""
                                    }
                                    moving={
                                        movingId === itemId
                                    }
                                    removing={
                                        removingId === itemId
                                    }
                                    onMoveToCart={() =>
                                        handleMoveToCart(item)
                                    }
                                    onRemove={() =>
                                        handleRemove(item)
                                    }
                                />
                            );
                        })}
                    </section>
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