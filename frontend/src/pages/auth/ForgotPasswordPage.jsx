import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setSubmitting(true);

        const email = e.target.email.value;

        try {
            const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
            const res = await fetch(`${baseUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error sending reset email');
            }

            setMessage(data.message || 'If an account exists, a reset link will be sent to your email.');
            e.target.reset();
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
                    <h1 className="font-display text-4xl text-warm mb-3">Forgot Password</h1>
                    <p className="text-sm text-muted">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {message && (
                    <div className="mb-6 p-4 border border-green-500/30 bg-green-500/10 text-green-400 text-sm italic text-center">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm italic text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-2 bg-gradient-to-br from-gold-bright to-gold-deep py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink hover:brightness-110 transition disabled:opacity-50 disabled:grayscale"
                    >
                        {submitting ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-line text-center">
                    <p className="text-sm text-muted">
                        Remember your password?{' '}
                        <Link to="/login" className="text-gold font-medium hover:text-gold-bright transition-colors px-1">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
