import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // get token from URL query string

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!token) {
            setError("Invalid or missing reset token");
            return;
        }

        setSubmitting(true);

        try {
            const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
            const res = await fetch(`${baseUrl}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            navigate('/login', { state: { message: "Password reset successfully. You can now login." } });
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
                    <h1 className="font-display text-4xl text-warm mb-3">Reset Password</h1>
                    <p className="text-sm text-muted">
                        Enter your new password below.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm italic text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-[10px] uppercase tracking-widest text-gold font-semibold bg-panel px-1 absolute -top-2 left-3">
                            New Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-transparent border border-line text-warm px-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2 relative mt-2">
                        <label className="text-[10px] uppercase tracking-widest text-gold font-semibold bg-panel px-1 absolute -top-2 left-3">
                            Confirm Password
                        </label>
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            className="w-full bg-transparent border border-line text-warm px-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-2 bg-gradient-to-br from-gold-bright to-gold-deep py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink hover:brightness-110 transition disabled:opacity-50 disabled:grayscale"
                    >
                        {submitting ? "Updating..." : "Set New Password"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-line text-center">
                    <Link to="/login" className="text-sm text-muted hover:text-gold uppercase tracking-widest transition-colors px-1">
                        Cancel & Return to Login
                    </Link>
                </div>
            </div>
        </main>
    );
}
