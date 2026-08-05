import {
  Link,
  useNavigate,
} from "react-router-dom";

const formatPrice = (value) =>
  Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const getImageUrl = (image) => {
  if (typeof image === "string") {
    return image;
  }

  return (
    image?.url ||
    image?.secure_url ||
    ""
  );
};

const ProductCard = ({
  product,
  wishlistMode = false,
  selectedSize = "",
  moving = false,
  removing = false,
  onMoveToCart,
  onRemove,
}) => {
  const navigate = useNavigate();

  if (!product) {
    return null;
  }

  const {
    name,
    price,
    oldPrice,
    rating = 5,
    badge,
    slug,
  } = product;

  const brandName =
    typeof product.brand === "object"
      ? product.brand?.name
      : product.brand;

  const brandSlug =
    typeof product.brand === "object"
      ? product.brand?.slug
      : null;

  const selectedSizeData =
    Array.isArray(product.sizes) &&
      selectedSize
      ? product.sizes.find(
        (size) =>
          size.label === selectedSize
      )
      : null;

  const displayPrice =
    selectedSizeData?.price ??
    price ??
    0;

  const stockValue =
    selectedSizeData?.stock ??
    product.stock;

  const hasStockInformation =
    stockValue !== undefined &&
    stockValue !== null;

  const outOfStock =
    hasStockInformation &&
    Number(stockValue) <= 0;

  const normalizedRating = Math.min(
    5,
    Math.max(
      0,
      Math.round(Number(rating) || 0)
    )
  );

  const imageUrl = getImageUrl(
    product.images?.[0] || product.image
  );

  const productPath = slug
    ? `/product/${slug}`
    : "/shop";

  const handleDefaultCartClick = () => {
    navigate(productPath);
  };

  return (
    <article className="group flex h-full flex-col border border-line bg-panel hover:border-gold/70 transition-colors duration-300">
      <Link
        to={productPath}
        className="block"
      >
        <div className="relative aspect-[1/1.15] bg-gradient-to-br from-gold/10 to-transparent overflow-hidden">
          {badge && (
            <span className="absolute z-10 top-3 left-3 text-[10px] uppercase tracking-wider bg-gold text-ink px-2.5 py-1">
              {badge}
            </span>
          )}

          {wishlistMode && (
            <span className="absolute z-10 top-3 right-3 w-9 h-9 rounded-full border border-gold/50 bg-ink/85 text-gold flex items-center justify-center">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
              </svg>
            </span>
          )}

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                viewBox="0 0 120 160"
                fill="none"
                className="w-2/5 opacity-85"
              >
                <rect
                  x="34"
                  y="42"
                  width="52"
                  height="98"
                  rx="10"
                  stroke="#c9a961"
                  strokeWidth="1.2"
                />

                <path
                  d="M46 18h28l10 13-10 10H46l-10-10 10-13Z"
                  stroke="#c9a961"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
          )}

          <div className="absolute left-3 right-3 bottom-3 text-center text-[11px] uppercase tracking-wider py-2.5 bg-ink/85 border border-gold text-gold-bright opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            View Product
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 pb-5">
        {brandSlug ? (
          <Link
            to={`/brand/${brandSlug}`}
            className="text-[11px] uppercase tracking-wider text-gold hover:text-gold-bright"
          >
            {brandName}
          </Link>
        ) : (
          <span className="text-[11px] uppercase tracking-wider text-gold">
            {brandName || "Aromiq"}
          </span>
        )}

        <Link to={productPath}>
          <h4 className="font-display text-lg mt-1.5 mb-2 text-warm hover:text-gold-bright transition-colors">
            {name}
          </h4>
        </Link>

        {wishlistMode && selectedSize && (
          <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted">
            Selected size:{" "}
            <span className="text-warm">
              {selectedSize}
            </span>
          </p>
        )}

        <div className="text-gold text-xs mb-3 tracking-wider">
          {"★".repeat(normalizedRating)}
          {"☆".repeat(
            5 - normalizedRating
          )}
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-xl text-gold-bright">
              {oldPrice && (
                <s className="text-muted text-sm mr-2">
                  Rs {formatPrice(oldPrice)}
                </s>
              )}

              Rs {formatPrice(displayPrice)}
            </span>

            {!wishlistMode && (
              <button
                type="button"
                aria-label="View product options"
                onClick={
                  handleDefaultCartClick
                }
                className="w-9 h-9 shrink-0 rounded-full border border-gold text-gold flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M4 6h2l1.6 10.2A2 2 0 0 0 9.6 18h7.8a2 2 0 0 0 2-1.6L21 8H7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <circle
                    cx="10"
                    cy="21"
                    r="1.3"
                    fill="currentColor"
                  />

                  <circle
                    cx="18"
                    cy="21"
                    r="1.3"
                    fill="currentColor"
                  />
                </svg>
              </button>
            )}
          </div>

          {wishlistMode && (
            <div className="mt-5 pt-4 border-t border-line grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onMoveToCart}
                disabled={
                  moving ||
                  removing ||
                  outOfStock
                }
                className="px-3 py-3 bg-gradient-to-br from-gold-bright to-gold-deep text-ink text-[10px] uppercase tracking-[0.14em] font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {moving
                  ? "Moving..."
                  : outOfStock
                    ? "Out of Stock"
                    : "Move to Cart"}
              </button>

              <button
                type="button"
                onClick={onRemove}
                disabled={
                  moving || removing
                }
                className="px-3 py-3 border border-line text-muted text-[10px] uppercase tracking-[0.14em] hover:border-red-400/50 hover:text-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removing
                  ? "Removing..."
                  : "Remove"}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;