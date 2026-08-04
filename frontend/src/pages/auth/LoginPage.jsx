import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Login failed');
            }
            const data = await res.json();
            // Save JWT token for authenticated requests
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            // success
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
        }
    };

    return (
        <div className="login-page" style={styles.container}>
            <h1 style={styles.title}>Login</h1>
            {error && <p className="text-red-500" style={{ marginBottom: '1rem', color: 'red' }}>{error}</p>}
            <form name="loginForm" className="auth-form" style={styles.form} onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="Email" style={styles.input} required />
                <input name="password" type="password" placeholder="Password" style={styles.input} required />
                <button type="submit" style={styles.button}>Login</button>
                <div style={styles.links}>
                    <a href="/register" style={styles.link}>Create account</a>
                    <a href="/forgot-password" style={styles.link}>Forgot password?</a>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        background: 'transparent',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(5px)'
    },
    title: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '2rem',
        marginBottom: '1rem',
        color: 'hsl(30, 30%, 80%)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        maxWidth: '320px',
        marginTop: '1.5rem'
    },
    input: {
        padding: '0.75rem 1rem',
        border: '1px solid hsl(210, 20%, 40%)',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        background: 'hsl(210, 30%, 15%)',
        color: 'hsl(30,30%,80%)'
    },
    button: {
        padding: '0.75rem 1rem',
        background: 'hsl(40, 80%, 45%)',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    links: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.9rem'
    },
    link: {
        color: 'hsl(30,30%,80%)',
        textDecoration: 'underline'
    }
};

export default LoginPage;
