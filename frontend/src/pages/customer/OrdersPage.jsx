import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/orders')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                setOrders(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const goToDetails = (orderId) => {
        navigate(`/order-details/${orderId}`);
    };

    return (
        <div className="orders-page" style={styles.container}>
            <h1 style={styles.title}>My Orders</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {orders.length === 0 && !loading && <p>No orders found.</p>}
            {orders.length > 0 && (
                <ul style={styles.list}>
                    {orders.map((order) => (
                        <li key={order.id} style={styles.listItem} onClick={() => goToDetails(order.id)}>
                            Order #{order.id} – ${order.total} – {order.status}
                        </li>
                    ))}
                </ul>
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
    list: {
        width: '100%',
        maxWidth: '800px',
        listStyle: 'none',
        padding: 0,
    },
    listItem: {
        background: 'hsl(210, 30%, 15%)',
        color: 'hsl(30,30%,80%)',
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        borderRadius: '0.5rem',
        cursor: 'pointer',
    },
};

export default OrdersPage;
