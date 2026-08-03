import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`/api/orders/${orderId}`)
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                setOrder(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [orderId]);

    return (
        <div className="order-details-page" style={styles.container}>
            <h1 style={styles.title}>Order Details</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {order && (
                <div style={styles.content}>
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Total:</strong> ${order.total}</p>
                    <p><strong>Items:</strong></p>
                    <ul>
                        {order.items.map((item) => (
                            <li key={item.id}>{item.name} - ${item.price} (Qty: {item.quantity})</li>
                        ))}
                    </ul>
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
        color: 'hsl(30,30%,80%)',
    },
    content: {
        width: '100%',
        maxWidth: '600px',
        background: 'hsl(210,30%,15%)',
        padding: '1rem',
        borderRadius: '0.5rem',
        color: 'hsl(30,30%,80%)',
    },
};

export default OrderDetailsPage;
