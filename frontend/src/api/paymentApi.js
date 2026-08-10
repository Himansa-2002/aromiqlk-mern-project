const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const getToken = () => localStorage.getItem("token");

const request = async (path, options = {}) => {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    if (!response.ok) {
        const error = new Error(
            data?.message || data?.error || "Payment request failed."
        );
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

export const createOnePayTransactionApi = (orderId) =>
    request("/payments/onepay/create", {
        method: "POST",
        body: JSON.stringify({ orderId }),
    });

export const verifyOnePayTransactionApi = (verifyData) =>
    request("/payments/onepay/verify", {
        method: "POST",
        body: JSON.stringify(verifyData),
    });
