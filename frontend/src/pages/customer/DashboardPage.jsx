import React, { useEffect, useState } from 'react';

const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/dashboard')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                setSummary(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="dashboard-page" style={styles.container}>
            <h1 style={styles.title}>Dashboard</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {summary && (
                <div style={styles.content}>
                    {/* Example summary fields */}
                    <p><strong>Total Orders:</strong> {summary.totalOrders}</p>
                    <p><strong>Total Spend:</strong> ${summary.totalSpend}</p>
                    {/* Add more summary info as needed */}
                </div>
            )}
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
        boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(5px)',
    },
    title: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '2rem',
        marginBottom: '1rem',
        color: 'hsl(30, 30%, 80%)',
    },
    content: {
        width: '100%',
        maxWidth: '600px',
        background: 'hsl(210, 30%, 15%)',
        padding: '1rem',
        borderRadius: '0.5rem',
        color: 'hsl(30,30%,80%)',
    },
};

export default DashboardPage;
