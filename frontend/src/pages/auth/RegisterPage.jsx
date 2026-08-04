import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const firstName = form.firstName.value;
        const lastName = form.lastName.value;
        const email = form.email.value;
        const password = form.password.value;
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Registration failed');
            }
            // success – navigate to login page
            navigate('/login');
        } catch (err) {
            console.error('Register error:', err);
            setError(err.message);
        }
    };

    return (
        <div className="register-page" style={styles.container}>
            <h1 style={styles.title}>Register</h1>
            {error && <p className="text-red-500" style={{ marginBottom: '1rem' }}>{error}</p>}
            <form name="registerForm" className="auth-form" style={styles.form} onSubmit={handleSubmit}>
                <input name="firstName" type="text" placeholder="First Name" style={styles.input} required />
                <input name="lastName" type="text" placeholder="Last Name" style={styles.input} required />
                <input name="email" type="email" placeholder="Email" style={styles.input} required />
                <input name="password" type="password" placeholder="Password" style={styles.input} required />
                <button type="submit" style={styles.button}>Register</button>
                <div style={styles.links}>
                    <a href="/login" style={styles.link}>Already have an account?</a>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        background: 'transparent',
    },
    title: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '2rem',
        marginBottom: '1rem',
        color: 'hsl(30, 30%, 80%)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        maxWidth: '320px',
        marginTop: '1.5rem',
    },
    input: {
        padding: '0.75rem 1rem',
        border: '1px solid hsl(210, 20%, 40%)',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        background: 'hsla(210, 29%, 6%, 1.00)',
        color: 'hsl(30,30%,80%)',
    },
    button: {
        padding: '0.75rem 1rem',
        background: 'hsl(40, 80%, 45%)',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    links: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.9rem',
    },
    link: {
        color: 'hsl(30,30%,80%)',
        textDecoration: 'underline',
    },
};

export default RegisterPage;
