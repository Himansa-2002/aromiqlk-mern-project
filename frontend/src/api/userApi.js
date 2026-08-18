const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/$/, "");

const getToken = () => sessionStorage.getItem("token");

const request = async (endpoint, options = {}) => {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {}),
            ...options.headers,
        },
    });

    const contentType = response.headers.get("content-type");

    const data = contentType?.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        const error = new Error(
            data?.message || "Something went wrong. Please try again."
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
};

/* Profile API */

export const getUserProfile = () =>
    request("/api/users/profile", {
        method: "GET",
    });

export const updateUserProfile = (profileData) =>
    request("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
    });

/* Address API */

export const getUserAddresses = () =>
    request("/api/users/addresses", {
        method: "GET",
    });

export const createUserAddress = (addressData) =>
    request("/api/users/addresses", {
        method: "POST",
        body: JSON.stringify(addressData),
    });

export const updateUserAddress = (addressId, addressData) =>
    request(`/api/users/addresses/${addressId}`, {
        method: "PUT",
        body: JSON.stringify(addressData),
    });

export const removeUserAddress = (addressId) =>
    request(`/api/users/addresses/${addressId}`, {
        method: "DELETE",
    });

export const makeDefaultAddress = (addressId) =>
    request(`/api/users/addresses/${addressId}/default`, {
        method: "PATCH",
    });