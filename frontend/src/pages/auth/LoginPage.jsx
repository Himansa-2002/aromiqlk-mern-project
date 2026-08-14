import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';


export default function LoginPage() {
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
            const res = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }

            // The context handles saving and redirecting based on role
            login(data.user, data.token);

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-6 bg-ink font-body">
            <div className="w-full max-w-md border border-line bg-panel p-8 md:p-10 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl text-warm mb-3">Sign In</h1>
                    <p className="text-sm text-muted">
                        Enter your email and password to access your account.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm italic text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2 relative">
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
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full bg-transparent border border-line text-warm px-4 py-4 pr-12 text-sm focus:outline-none focus:border-gold transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors"
                        >
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-xs mt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-warm transition-colors">
                            <input type="checkbox" className="w-4 h-4 accent-[#c9a961]" />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-gold hover:text-gold-bright underline transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-6 bg-gradient-to-br from-gold-bright to-gold-deep py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink hover:brightness-110 transition disabled:opacity-50 disabled:grayscale"
                    >
                        {submitting ? "Authenticating..." : "Sign In To Account"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-line text-center">
                    <p className="text-sm text-muted">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-gold font-medium hover:text-gold-bright transition-colors px-1">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
