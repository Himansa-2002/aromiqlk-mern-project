const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/$/, "");

const getToken = () => localStorage.getItem("token");

const request = async (endpoint, options = {}) => {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        const error = new Error(
            data?.message || data?.error || "Checkout request failed. Please try again."
        );
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

export const getCheckoutSummary = (addressId, couponCode = "") =>
    request("/checkout/summary", {
        method: "POST",
        body: JSON.stringify({ addressId, couponCode }),
    });
