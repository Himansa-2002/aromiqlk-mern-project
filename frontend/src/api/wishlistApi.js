const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

const getAuthHeaders = () => {
    const token = sessionStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        ...(token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : {}),
    };
};

const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {}),
        },
    });

    const text = await response.text();

    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = {
                message: text,
            };
        }
    }

    if (!response.ok) {
        const error = new Error(
            data?.message ||
            data?.error ||
            "Wishlist request failed."
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
};

export const getWishlist = () =>
    request("/wishlist", {
        method: "GET",
    });

export const addWishlistItem = ({
    productId,
    selectedSize = "",
}) =>
    request("/wishlist/items", {
        method: "POST",
        body: JSON.stringify({
            productId,
            selectedSize,
        }),
    });

export const removeWishlistItem = (
    productId,
    selectedSize = ""
) => {
    const query = selectedSize
        ? `?selectedSize=${encodeURIComponent(selectedSize)}`
        : "";

    return request(
        `/wishlist/items/${productId}${query}`,
        {
            method: "DELETE",
        }
    );
};

export const moveWishlistItemToCart = ({
    productId,
    selectedSize = "",
    quantity = 1,
}) =>
    request(
        `/wishlist/items/${productId}/move-to-cart`,
        {
            method: "POST",
            body: JSON.stringify({
                selectedSize,
                quantity,
            }),
        }
    );

export const clearWishlist = () =>
    request("/wishlist", {
        method: "DELETE",
    });