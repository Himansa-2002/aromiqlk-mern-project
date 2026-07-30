import React, { useEffect, useState } from 'react';

const OrderTrackingPage = () => {
    const [trackingInfo, setTrackingInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Replace with the actual backend endpoint for order tracking
        fetch('/api/order-tracking')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                setTrackingInfo(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="order-tracking-page" style={styles.container}>
            <h1 style={styles.title}>Order Tracking</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {trackingInfo && (
                <div style={styles.content}>
                    {/* Render tracking details; adjust fields based on backend response */}
                    <p><strong>Order ID:</strong> {trackingInfo.orderId}</p>
                    <p><strong>Status:</strong> {trackingInfo.status}</p>
                    <p><strong>Estimated Delivery:</strong> {trackingInfo.estimatedDelivery}</p>
                    {/* Add more details as needed */}
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
        maxWidth: '500px',
        background: 'hsl(210, 30%, 15%)',
        padding: '1rem',
        borderRadius: '0.5rem',
        color: 'hsl(30,30%,80%)',
    },
};

export default OrderTrackingPage;
