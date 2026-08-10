const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

const getToken = () => sessionStorage.getItem("token");

const request = async (path, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
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
        "Order request failed. Please try again."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export const createOrder = (orderData) =>
  request("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });

export const getMyOrders = ({
  status = "",
  page = 1,
  limit = 10,
} = {}) => {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  return request(`/orders/me?${params.toString()}`, {
    method: "GET",
  });
};

export const getOrderByNumber = (orderNumber) =>
  request(
    `/orders/${encodeURIComponent(orderNumber)}`,
    {
      method: "GET",
    }
  );

export const getOrderTracking = (orderNumber) =>
  request(
    `/orders/${encodeURIComponent(
      orderNumber
    )}/tracking`,
    {
      method: "GET",
    }
  );
