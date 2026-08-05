import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    getUserAddresses,
    createUserAddress,
    updateUserAddress,
    removeUserAddress,
    makeDefaultAddress,
} from "../../api/userApi.js";

const EMPTY_FORM = {
    label: "Home",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    postalCode: "",
    country: "Sri Lanka",
    isDefault: false,
};

const getAddressId = (address) => address?._id || address?.id;

export default function AddressPage() {
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);

    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [defaultUpdatingId, setDefaultUpdatingId] =
        useState(null);

    const [pageError, setPageError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        loadAddresses();
    }, []);

    const handleAuthenticationError = (error) => {
        if (error?.status === 401 || error?.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login", {
                replace: true,
                state: {
                    message:
                        error.message ||
                        "Your session has expired. Please sign in again.",
                },
            });

            return true;
        }

        return false;
    };

    const loadAddresses = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login", {
                replace: true,
                state: {
                    message: "Please sign in to manage your addresses.",
                },
            });

            return;
        }

        try {
            setLoading(true);
            setPageError("");

            const response = await getUserAddresses();

            setAddresses(
                Array.isArray(response?.addresses)
                    ? response.addresses
                    : []
            );
        } catch (error) {
            if (handleAuthenticationError(error)) {
                return;
            }

            setPageError(
                error.message || "Unable to load your saved addresses."
            );
        } finally {
            setLoading(false);
        }
    };

    const openNewAddressForm = () => {
        setEditingId(null);

        setForm({
            ...EMPTY_FORM,
            isDefault: addresses.length === 0,
        });

        setFieldErrors({});
        setPageError("");
        setSuccessMessage("");
        setShowForm(true);
    };

    const openEditForm = (address) => {
        setEditingId(getAddressId(address));

        setForm({
            label: address.label || "Home",
            fullName: address.fullName || "",
            phone: address.phone || "",
            addressLine1: address.addressLine1 || "",
            addressLine2: address.addressLine2 || "",
            city: address.city || "",
            district: address.district || "",
            postalCode: address.postalCode || "",
            country: address.country || "Sri Lanka",
            isDefault: Boolean(address.isDefault),
        });

        setFieldErrors({});
        setPageError("");
        setSuccessMessage("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFieldErrors({});
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));

        setFieldErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setPageError("");
        setSuccessMessage("");
    };

    const validateForm = () => {
        const errors = {};

        if (!form.fullName.trim()) {
            errors.fullName = "Full name is required.";
        } else if (form.fullName.trim().length < 2) {
            errors.fullName =
                "Full name must contain at least 2 characters.";
        }

        if (!form.phone.trim()) {
            errors.phone = "Phone number is required.";
        } else if (
            !/^[0-9+\-()\s]{7,20}$/.test(form.phone.trim())
        ) {
            errors.phone = "Please enter a valid phone number.";
        }

        if (!form.addressLine1.trim()) {
            errors.addressLine1 = "Address line 1 is required.";
        }

        if (!form.city.trim()) {
            errors.city = "City is required.";
        }

        if (!form.district.trim()) {
            errors.district = "District is required.";
        }

        if (!form.country.trim()) {
            errors.country = "Country is required.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setPageError("");
        setSuccessMessage("");

        if (!validateForm()) {
            return;
        }

        const payload = {
            label: form.label,
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            addressLine1: form.addressLine1.trim(),
            addressLine2: form.addressLine2.trim(),
            city: form.city.trim(),
            district: form.district.trim(),
            postalCode: form.postalCode.trim(),
            country: form.country.trim(),
            isDefault: form.isDefault,
        };

        try {
            setSaving(true);

            if (editingId) {
                const response = await updateUserAddress(
                    editingId,
                    payload
                );

                const updatedAddress = response?.address;

                setAddresses((previous) =>
                    previous.map((address) => {
                        const currentId = getAddressId(address);

                        if (
                            updatedAddress?.isDefault &&
                            currentId !== editingId
                        ) {
                            return {
                                ...address,
                                isDefault: false,
                            };
                        }

                        if (currentId === editingId) {
                            return updatedAddress || {
                                ...address,
                                ...payload,
                            };
                        }

                        return address;
                    })
                );

                setSuccessMessage(
                    response?.message || "Address updated successfully."
                );
            } else {
                const response = await createUserAddress(payload);
                const newAddress = response?.address;

                if (!newAddress) {
                    throw new Error(
                        "The server did not return the new address."
                    );
                }

                setAddresses((previous) => {
                    const normalized = newAddress.isDefault
                        ? previous.map((address) => ({
                            ...address,
                            isDefault: false,
                        }))
                        : previous;

                    return [...normalized, newAddress];
                });

                setSuccessMessage(
                    response?.message || "Address added successfully."
                );
            }

            closeForm();
        } catch (error) {
            if (handleAuthenticationError(error)) {
                return;
            }

            setPageError(
                error.message || "Unable to save the address."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (address) => {
        const addressId = getAddressId(address);

        if (!addressId) {
            return;
        }

        const confirmed = window.confirm(
            `Delete the ${address.label || "saved"} address?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(addressId);
            setPageError("");
            setSuccessMessage("");

            const response = await removeUserAddress(addressId);

            if (Array.isArray(response?.addresses)) {
                setAddresses(response.addresses);
            } else {
                setAddresses((previous) =>
                    previous.filter(
                        (item) => getAddressId(item) !== addressId
                    )
                );
            }

            if (editingId === addressId) {
                closeForm();
            }

            setSuccessMessage(
                response?.message || "Address deleted successfully."
            );
        } catch (error) {
            if (handleAuthenticationError(error)) {
                return;
            }

            setPageError(
                error.message || "Unable to delete the address."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetDefault = async (address) => {
        const addressId = getAddressId(address);

        if (!addressId || address.isDefault) {
            return;
        }

        try {
            setDefaultUpdatingId(addressId);
            setPageError("");
            setSuccessMessage("");

            const response = await makeDefaultAddress(addressId);

            setAddresses((previous) =>
                previous.map((item) => ({
                    ...item,
                    isDefault: getAddressId(item) === addressId,
                }))
            );

            setSuccessMessage(
                response?.message ||
                "Default address updated successfully."
            );
        } catch (error) {
            if (handleAuthenticationError(error)) {
                return;
            }

            setPageError(
                error.message ||
                "Unable to update the default address."
            );
        } finally {
            setDefaultUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <main className="min-h-[75vh] bg-ink py-16">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="animate-pulse">
                        <div className="h-3 w-32 bg-panel mb-4" />
                        <div className="h-10 w-72 bg-panel mb-10" />

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="h-72 bg-panel border border-line" />
                            <div className="h-72 bg-panel border border-line" />
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
                            Saved Addresses
                        </h1>

                        <p className="text-sm text-muted mt-3 max-w-2xl leading-relaxed">
                            Manage your billing and delivery addresses for a
                            faster checkout experience.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openNewAddressForm}
                        className="px-7 py-4 bg-gradient-to-br from-gold-bright to-gold-deep text-ink text-xs uppercase tracking-[0.2em] font-semibold hover:brightness-110 transition"
                    >
                        + Add New Address
                    </button>
                </div>

                {successMessage && (
                    <div
                        role="status"
                        className="mb-6 border border-green-400/30 bg-green-400/5 px-5 py-4 text-sm text-green-400"
                    >
                        {successMessage}
                    </div>
                )}

                {pageError && (
                    <div
                        role="alert"
                        className="mb-6 border border-red-400/30 bg-red-400/5 px-5 py-4 text-sm text-red-400"
                    >
                        {pageError}
                    </div>
                )}

                {showForm && (
                    <section className="border border-gold/40 bg-panel/50 mb-10">
                        <div className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-line">
                            <div>
                                <h2 className="font-display text-2xl text-warm">
                                    {editingId
                                        ? "Edit Address"
                                        : "Add New Address"}
                                </h2>

                                <p className="text-xs text-muted mt-2">
                                    Complete the required delivery information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                className="w-10 h-10 border border-line text-muted hover:text-gold hover:border-gold transition"
                                aria-label="Close address form"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-6 md:p-8"
                            noValidate
                        >
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    label="Address Label"
                                    name="label"
                                >
                                    <select
                                        id="label"
                                        name="label"
                                        value={form.label}
                                        onChange={handleChange}
                                        className="address-input"
                                    >
                                        <option value="Home">Home</option>
                                        <option value="Work">Work</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </FormField>

                                <FormField
                                    label="Full Name *"
                                    name="fullName"
                                    error={fieldErrors.fullName}
                                >
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        autoComplete="name"
                                        placeholder="Recipient's full name"
                                        className={getInputClass(
                                            fieldErrors.fullName
                                        )}
                                    />
                                </FormField>

                                <FormField
                                    label="Phone Number *"
                                    name="phone"
                                    error={fieldErrors.phone}
                                >
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        autoComplete="tel"
                                        placeholder="+94 77 123 4567"
                                        className={getInputClass(fieldErrors.phone)}
                                    />
                                </FormField>

                                <FormField
                                    label="Country *"
                                    name="country"
                                    error={fieldErrors.country}
                                >
                                    <input
                                        id="country"
                                        name="country"
                                        type="text"
                                        value={form.country}
                                        onChange={handleChange}
                                        autoComplete="country-name"
                                        className={getInputClass(
                                            fieldErrors.country
                                        )}
                                    />
                                </FormField>

                                <div className="md:col-span-2">
                                    <FormField
                                        label="Address Line 1 *"
                                        name="addressLine1"
                                        error={fieldErrors.addressLine1}
                                    >
                                        <input
                                            id="addressLine1"
                                            name="addressLine1"
                                            type="text"
                                            value={form.addressLine1}
                                            onChange={handleChange}
                                            autoComplete="address-line1"
                                            placeholder="House number and street address"
                                            className={getInputClass(
                                                fieldErrors.addressLine1
                                            )}
                                        />
                                    </FormField>
                                </div>

                                <div className="md:col-span-2">
                                    <FormField
                                        label="Address Line 2"
                                        name="addressLine2"
                                    >
                                        <input
                                            id="addressLine2"
                                            name="addressLine2"
                                            type="text"
                                            value={form.addressLine2}
                                            onChange={handleChange}
                                            autoComplete="address-line2"
                                            placeholder="Apartment, suite or landmark"
                                            className={getInputClass()}
                                        />
                                    </FormField>
                                </div>

                                <FormField
                                    label="City *"
                                    name="city"
                                    error={fieldErrors.city}
                                >
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        value={form.city}
                                        onChange={handleChange}
                                        autoComplete="address-level2"
                                        className={getInputClass(fieldErrors.city)}
                                    />
                                </FormField>

                                <FormField
                                    label="District *"
                                    name="district"
                                    error={fieldErrors.district}
                                >
                                    <input
                                        id="district"
                                        name="district"
                                        type="text"
                                        value={form.district}
                                        onChange={handleChange}
                                        autoComplete="address-level1"
                                        className={getInputClass(
                                            fieldErrors.district
                                        )}
                                    />
                                </FormField>

                                <FormField
                                    label="Postal Code"
                                    name="postalCode"
                                >
                                    <input
                                        id="postalCode"
                                        name="postalCode"
                                        type="text"
                                        value={form.postalCode}
                                        onChange={handleChange}
                                        autoComplete="postal-code"
                                        className={getInputClass()}
                                    />
                                </FormField>

                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 text-sm text-muted cursor-pointer pb-3">
                                        <input
                                            type="checkbox"
                                            name="isDefault"
                                            checked={form.isDefault}
                                            onChange={handleChange}
                                            className="w-4 h-4 accent-[#c9a961]"
                                        />

                                        Set as my default address
                                    </label>
                                </div>
                            </div>

                            <div className="mt-8 pt-7 border-t border-line flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="px-7 py-3.5 border border-line text-xs uppercase tracking-[0.18em] text-muted hover:border-gold hover:text-gold transition disabled:opacity-40"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3.5 bg-gradient-to-br from-gold-bright to-gold-deep text-ink text-xs uppercase tracking-[0.18em] font-semibold hover:brightness-110 transition disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Address"
                                            : "Save Address"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {addresses.length === 0 ? (
                    <section className="border border-line bg-panel/40 py-16 px-6 text-center">
                        <div className="w-16 h-16 mx-auto border border-gold/40 rounded-full flex items-center justify-center text-2xl text-gold mb-5">
                            ⌂
                        </div>

                        <h2 className="font-display text-2xl text-warm">
                            No Saved Addresses
                        </h2>

                        <p className="text-sm text-muted max-w-md mx-auto mt-3 leading-relaxed">
                            Add a delivery address to make your future
                            checkout process faster.
                        </p>

                        <button
                            type="button"
                            onClick={openNewAddressForm}
                            className="mt-7 px-7 py-3.5 border border-gold text-gold text-xs uppercase tracking-[0.2em] hover:bg-gold/10 transition"
                        >
                            Add First Address
                        </button>
                    </section>
                ) : (
                    <section className="grid md:grid-cols-2 gap-6">
                        {addresses.map((address) => {
                            const addressId = getAddressId(address);

                            return (
                                <article
                                    key={addressId}
                                    className={`relative border bg-panel/40 p-6 md:p-7 transition ${address.isDefault
                                        ? "border-gold/70"
                                        : "border-line hover:border-gold/40"
                                        }`}
                                >
                                    {address.isDefault && (
                                        <span className="absolute top-0 right-0 px-4 py-2 bg-gold text-ink text-[10px] uppercase tracking-[0.2em] font-semibold">
                                            Default
                                        </span>
                                    )}

                                    <div className="flex items-center gap-3 mb-6 pr-20">
                                        <div className="w-11 h-11 border border-gold/40 rounded-full flex items-center justify-center text-gold">
                                            {address.label === "Work"
                                                ? "▣"
                                                : address.label === "Other"
                                                    ? "◇"
                                                    : "⌂"}
                                        </div>

                                        <div>
                                            <span className="block text-[10px] uppercase tracking-[0.22em] text-gold">
                                                {address.label || "Home"}
                                            </span>

                                            <h2 className="font-display text-xl text-warm mt-1">
                                                {address.fullName}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted leading-relaxed">
                                        <p>{address.addressLine1}</p>

                                        {address.addressLine2 && (
                                            <p>{address.addressLine2}</p>
                                        )}

                                        <p>
                                            {address.city}
                                            {address.postalCode
                                                ? `, ${address.postalCode}`
                                                : ""}
                                        </p>

                                        <p>
                                            {address.district}, {address.country}
                                        </p>

                                        <p className="pt-2 text-warm">
                                            {address.phone}
                                        </p>
                                    </div>

                                    <div className="mt-7 pt-5 border-t border-line flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(address)}
                                            className="px-5 py-2.5 border border-line text-[11px] uppercase tracking-[0.16em] text-warm hover:border-gold hover:text-gold transition"
                                        >
                                            Edit
                                        </button>

                                        {!address.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSetDefault(address)
                                                }
                                                disabled={
                                                    defaultUpdatingId === addressId
                                                }
                                                className="px-5 py-2.5 border border-gold/50 text-[11px] uppercase tracking-[0.16em] text-gold hover:bg-gold/10 transition disabled:opacity-50"
                                            >
                                                {defaultUpdatingId === addressId
                                                    ? "Updating..."
                                                    : "Set Default"}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(address)}
                                            disabled={deletingId === addressId}
                                            className="px-5 py-2.5 border border-red-400/30 text-[11px] uppercase tracking-[0.16em] text-red-400 hover:bg-red-400/5 transition disabled:opacity-50"
                                        >
                                            {deletingId === addressId
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}

                <div className="mt-10 pt-7 border-t border-line">
                    <Link
                        to="/profile"
                        className="text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-bright transition"
                    >
                        ← Back to Profile
                    </Link>
                </div>
            </div>
        </main>
    );
}

function FormField({ label, name, error, children }) {
    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor={name}
                className="text-[11px] uppercase tracking-[0.18em] text-gold"
            >
                {label}
            </label>

            {children}

            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}

function getInputClass(error) {
    return `bg-ink border px-4 py-3.5 text-sm text-warm outline-none transition ${error
        ? "border-red-400"
        : "border-line focus:border-gold"
        }`;
}