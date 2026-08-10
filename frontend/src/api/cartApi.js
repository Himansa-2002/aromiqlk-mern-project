const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      data = { message: text };
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || data?.error || "Something went wrong with the cart request."
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const getCart = () => request("/cart", { method: "GET" });

export const addCartItem = ({ productId, selectedSize, quantity }) =>
  request("/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, selectedSize, quantity }),
  });

export const updateCartItem = (itemId, quantity) =>
  request(`/cart/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });

export const removeCartItem = (itemId) =>
  request(`/cart/items/${itemId}`, {
    method: "DELETE",
  });

export const clearCart = () =>
  request("/cart", {
    method: "DELETE",
  });
