import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const form = e.target;
        const firstName = form.firstName.value;
        const lastName = form.lastName.value;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
            const res = await fetch(`${baseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            // success – navigate to login page
            navigate('/login', { state: { message: "Account created successfully. Please sign in." } });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-[85vh] flex items-center justify-center p-6 bg-ink font-body">
            <div className="w-full max-w-lg border border-line bg-panel p-8 md:p-10 shadow-2xl my-8">
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl text-warm mb-3">Create Account</h1>
                    <p className="text-sm text-muted">
                        Join aromiq.lk to experience luxury fragrances.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm italic text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 relative">
                            <label className="text-[10px] uppercase tracking-widest text-gold font-semibold bg-panel px-1 absolute -top-2 left-3">
                                First Name
                            </label>
                            <input
                                name="firstName"
                                type="text"
                                required
                                className="w-full bg-transparent border border-line text-warm px-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2 relative mt-4 md:mt-0">
                            <label className="text-[10px] uppercase tracking-widest text-gold font-semibold bg-panel px-1 absolute -top-2 left-3">
                                Last Name
                            </label>
                            <input
                                name="lastName"
                                type="text"
                                required
                                className="w-full bg-transparent border border-line text-warm px-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 relative mt-2">
                        <label className="text-[10px] uppercase tracking-widest text-gold font-semibold bg-panel px-1 absolute -top-2 left-3">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-transparent border border-line text-warm px-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2 relative mt-2">
                        <label className="text-[10px] uppercase tracking-widest text-gold font-semibold bg-panel px-1 absolute -top-2 left-3">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-transparent border border-line text-warm px-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors"
                        />
                        <p className="text-[10px] text-muted text-right mt-1">Must be at least 6 characters</p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-2 bg-gradient-to-br from-gold-bright to-gold-deep py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink hover:brightness-110 transition disabled:opacity-50 disabled:grayscale"
                    >
                        {submitting ? "Processing..." : "Create Account"}
                    </button>

                    <p className="text-center text-[10px] text-muted">
                        By registering, you agree to our <span className="underline cursor-pointer hover:text-gold">Terms of Service</span> and <span className="underline cursor-pointer hover:text-gold">Privacy Policy</span>.
                    </p>
                </form>

                <div className="mt-8 pt-6 border-t border-line text-center">
                    <p className="text-sm text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="text-gold font-medium hover:text-gold-bright transition-colors px-1">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
