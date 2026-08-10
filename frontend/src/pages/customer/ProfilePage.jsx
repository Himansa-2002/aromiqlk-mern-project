import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getUserProfile,
    updateUserProfile,
} from "../../api/userApi.js";

const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
};

const formatDate = (dateValue) => {
    if (!dateValue) {
        return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString("en-LK", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const getInitials = (firstName, lastName) => {
    const firstInitial = firstName?.trim()?.charAt(0) || "";
    const lastInitial = lastName?.trim()?.charAt(0) || "";

    return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
};

export default function ProfilePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [originalForm, setOriginalForm] = useState(EMPTY_FORM);
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [pageError, setPageError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        const loadProfile = async () => {
            const token = sessionStorage.getItem("token");

            if (!token) {
                navigate("/login", {
                    replace: true,
                    state: {
                        message: "Please sign in to view your profile.",
                    },
                });

                return;
            }

            try {
                setLoading(true);
                setPageError("");

                const response = await getUserProfile();
                const profile = response?.user;

                if (!profile) {
                    throw new Error("Profile information was not found.");
                }

                const profileForm = {
                    firstName: profile.firstName || "",
                    lastName: profile.lastName || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                };

                setUser(profile);
                setForm(profileForm);
                setOriginalForm(profileForm);

                syncUserToLocalStorage(profile);
            } catch (error) {
                if (error.status === 401) {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("user");

                    navigate("/login", {
                        replace: true,
                        state: {
                            message: "Your session has expired. Please sign in again.",
                        },
                    });

                    return;
                }

                setPageError(
                    error.message || "Unable to load your profile."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    const syncUserToLocalStorage = (updatedUser) => {
        try {
            const storedUser = JSON.parse(
                sessionStorage.getItem("user") || "{}"
            );

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...storedUser,
                    ...updatedUser,
                })
            );

            window.dispatchEvent(new Event("user-updated"));
        } catch {
            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));

        setFieldErrors((previousErrors) => ({
            ...previousErrors,
            [name]: "",
        }));

        setPageError("");
        setSuccessMessage("");
    };

    const validateForm = () => {
        const errors = {};

        const firstName = form.firstName.trim();
        const lastName = form.lastName.trim();
        const phone = form.phone.trim();

        if (!firstName) {
            errors.firstName = "First name is required.";
        } else if (firstName.length < 2) {
            errors.firstName =
                "First name must contain at least 2 characters.";
        } else if (firstName.length > 50) {
            errors.firstName =
                "First name cannot exceed 50 characters.";
        }

        if (!lastName) {
            errors.lastName = "Last name is required.";
        } else if (lastName.length < 2) {
            errors.lastName =
                "Last name must contain at least 2 characters.";
        } else if (lastName.length > 50) {
            errors.lastName =
                "Last name cannot exceed 50 characters.";
        }

        if (
            phone &&
            !/^[0-9+\-()\s]{7,20}$/.test(phone)
        ) {
            errors.phone =
                "Please enter a valid phone number.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSuccessMessage("");
        setPageError("");

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const response = await updateUserProfile({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phone: form.phone.trim(),
            });

            const updatedUser = response?.user;

            if (!updatedUser) {
                throw new Error(
                    "The server did not return the updated profile."
                );
            }

            const updatedForm = {
                firstName: updatedUser.firstName || "",
                lastName: updatedUser.lastName || "",
                email: updatedUser.email || "",
                phone: updatedUser.phone || "",
            };

            setUser(updatedUser);
            setForm(updatedForm);
            setOriginalForm(updatedForm);

            syncUserToLocalStorage(updatedUser);

            setSuccessMessage(
                response.message || "Profile updated successfully."
            );
        } catch (error) {
            if (error.status === 401) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");

                navigate("/login", {
                    replace: true,
                    state: {
                        message: "Your session has expired. Please sign in again.",
                    },
                });

                return;
            }

            setPageError(
                error.message || "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setForm(originalForm);
        setFieldErrors({});
        setPageError("");
        setSuccessMessage("");
    };

    const hasChanges =
        form.firstName !== originalForm.firstName ||
        form.lastName !== originalForm.lastName ||
        form.phone !== originalForm.phone;

    if (loading) {
        return (
            <main className="min-h-[75vh] bg-ink py-16">
                <div className="max-w-6xl mx-auto px-6 md:px-8">
                    <div className="animate-pulse">
                        <div className="h-3 w-28 bg-panel mb-4" />
                        <div className="h-10 w-64 bg-panel mb-10" />

                        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
                            <div className="h-[420px] border border-line bg-panel" />
                            <div className="h-[520px] border border-line bg-panel" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (pageError && !user) {
        return (
            <main className="min-h-[75vh] bg-ink py-20">
                <div className="max-w-xl mx-auto px-6 text-center">
                    <div className="border border-red-400/30 bg-red-400/5 p-10">
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-red-400/40 flex items-center justify-center text-red-400 text-xl">
                            !
                        </div>

                        <h1 className="font-display text-3xl text-warm mb-3">
                            Unable to Load Profile
                        </h1>

                        <p className="text-sm text-muted mb-7">
                            {pageError}
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="px-7 py-3 border border-gold text-gold text-xs uppercase tracking-[0.2em] hover:bg-gold/10 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    const initials = getInitials(
        user?.firstName,
        user?.lastName
    );

    return (
        <main className="min-h-[75vh] bg-ink py-12 md:py-16">
            <div className="max-w-6xl mx-auto px-6 md:px-8">
                <div className="mb-10">
                    <span className="text-[11px] uppercase tracking-[0.35em] text-gold">
                        My Account
                    </span>

                    <h1 className="font-display text-3xl md:text-4xl text-warm mt-3">
                        Personal Profile
                    </h1>

                    <p className="text-sm text-muted mt-3 max-w-2xl leading-relaxed">
                        Manage your personal details and keep your
                        contact information up to date.
                    </p>
                </div>

                <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-8">
                    <aside className="border border-line bg-panel/50 h-fit">
                        <div className="p-7 text-center border-b border-line">
                            <div className="w-24 h-24 mx-auto rounded-full border border-gold/50 bg-gradient-to-br from-gold/20 to-ink flex items-center justify-center overflow-hidden">
                                {user?.avatar?.url ? (
                                    <img
                                        src={user.avatar.url}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="font-display text-3xl text-gold-bright">
                                        {initials}
                                    </span>
                                )}
                            </div>

                            <h2 className="font-display text-2xl text-warm mt-5">
                                {user?.firstName} {user?.lastName}
                            </h2>

                            <p className="text-xs text-muted mt-2 break-all">
                                {user?.email}
                            </p>

                            <span className="inline-flex mt-4 px-3 py-1 border border-gold/40 text-gold text-[10px] uppercase tracking-[0.2em]">
                                {user?.role || "Customer"}
                            </span>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <span className="block text-[10px] uppercase tracking-[0.2em] text-gold mb-1">
                                    Account Status
                                </span>

                                <span
                                    className={`text-sm ${user?.isActive
                                        ? "text-green-400"
                                        : "text-red-400"
                                        }`}
                                >
                                    ●{" "}
                                    {user?.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </div>

                            <div>
                                <span className="block text-[10px] uppercase tracking-[0.2em] text-gold mb-1">
                                    Member Since
                                </span>

                                <span className="text-sm text-muted">
                                    {formatDate(user?.createdAt)}
                                </span>
                            </div>

                            <div>
                                <span className="block text-[10px] uppercase tracking-[0.2em] text-gold mb-1">
                                    Saved Addresses
                                </span>

                                <span className="text-sm text-muted">
                                    {user?.addresses?.length || 0} address
                                    {(user?.addresses?.length || 0) === 1
                                        ? ""
                                        : "es"}
                                </span>
                            </div>

                            <div className="pt-4 border-t border-line space-y-3">
                                <Link
                                    to="/address"
                                    className="block w-full text-center px-5 py-3 border border-line text-xs uppercase tracking-[0.18em] text-warm hover:border-gold hover:text-gold transition"
                                >
                                    Manage Addresses
                                </Link>

                                <Link
                                    to="/orders"
                                    className="block w-full text-center px-5 py-3 border border-line text-xs uppercase tracking-[0.18em] text-warm hover:border-gold hover:text-gold transition"
                                >
                                    View Orders
                                </Link>
                            </div>
                        </div>
                    </aside>

                    <section className="border border-line bg-panel/40">
                        <div className="px-6 md:px-8 py-6 border-b border-line">
                            <h2 className="font-display text-2xl text-warm">
                                Profile Information
                            </h2>

                            <p className="text-xs text-muted mt-2">
                                Fields marked with an asterisk are required.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-6 md:p-8"
                            noValidate
                        >
                            {successMessage && (
                                <div
                                    role="status"
                                    className="mb-6 border border-green-400/30 bg-green-400/5 px-4 py-3 text-sm text-green-400"
                                >
                                    {successMessage}
                                </div>
                            )}

                            {pageError && user && (
                                <div
                                    role="alert"
                                    className="mb-6 border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-400"
                                >
                                    {pageError}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="firstName"
                                        className="text-[11px] uppercase tracking-[0.18em] text-gold"
                                    >
                                        First Name *
                                    </label>

                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        maxLength={50}
                                        autoComplete="given-name"
                                        className={`bg-ink border px-4 py-3.5 text-sm text-warm outline-none transition ${fieldErrors.firstName
                                            ? "border-red-400"
                                            : "border-line focus:border-gold"
                                            }`}
                                    />

                                    {fieldErrors.firstName && (
                                        <p className="text-xs text-red-400">
                                            {fieldErrors.firstName}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="lastName"
                                        className="text-[11px] uppercase tracking-[0.18em] text-gold"
                                    >
                                        Last Name *
                                    </label>

                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        maxLength={50}
                                        autoComplete="family-name"
                                        className={`bg-ink border px-4 py-3.5 text-sm text-warm outline-none transition ${fieldErrors.lastName
                                            ? "border-red-400"
                                            : "border-line focus:border-gold"
                                            }`}
                                    />

                                    {fieldErrors.lastName && (
                                        <p className="text-xs text-red-400">
                                            {fieldErrors.lastName}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="email"
                                        className="text-[11px] uppercase tracking-[0.18em] text-gold"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        readOnly
                                        autoComplete="email"
                                        className="bg-black/30 border border-line px-4 py-3.5 text-sm text-muted outline-none cursor-not-allowed"
                                    />

                                    <p className="text-[11px] text-muted">
                                        Email changes are currently unavailable.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="phone"
                                        className="text-[11px] uppercase tracking-[0.18em] text-gold"
                                    >
                                        Phone Number
                                    </label>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        maxLength={20}
                                        autoComplete="tel"
                                        placeholder="+94 77 123 4567"
                                        className={`bg-ink border px-4 py-3.5 text-sm text-warm outline-none transition ${fieldErrors.phone
                                            ? "border-red-400"
                                            : "border-line focus:border-gold"
                                            }`}
                                    />

                                    {fieldErrors.phone && (
                                        <p className="text-xs text-red-400">
                                            {fieldErrors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-7 border-t border-line flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={!hasChanges || saving}
                                    className="px-7 py-3.5 border border-line text-xs uppercase tracking-[0.18em] text-muted hover:border-gold hover:text-gold transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Cancel Changes
                                </button>

                                <button
                                    type="submit"
                                    disabled={!hasChanges || saving}
                                    className="px-8 py-3.5 bg-gradient-to-br from-gold-bright to-gold-deep text-ink text-xs uppercase tracking-[0.18em] font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}