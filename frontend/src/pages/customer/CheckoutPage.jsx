import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/cart')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                setCart(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handlePlaceOrder = () => {
        // In a real app you would POST the order to the backend.
        // Here we simply navigate to the success page.
        navigate('/order-success', { state: { orderId: '12345' } });
    };

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="checkout-page" style={styles.container}>
            <h1 style={styles.title}>Checkout</h1>
            {loading && <p>Loading cart...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && (
                <>
                    <ul style={styles.list}>
                        {cart.map((item) => (
                            <li key={item.id} style={styles.listItem}>
                                {item.name} - ${item.price} (Qty: {item.quantity})
                            </li>
                        ))}
                    </ul>
                    <p style={styles.total}>Total: ${total.toFixed(2)}</p>
                    <button style={styles.button} onClick={handlePlaceOrder}>Place Order</button>
                </>
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
        maxWidth: '600px',
        listStyle: 'none',
        padding: 0,
        marginBottom: '1rem',
    },
    listItem: {
        background: 'hsl(210, 30%, 15%)',
        color: 'hsl(30,30%,80%)',
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        borderRadius: '0.5rem',
    },
    total: {
        fontSize: '1.2rem',
        marginBottom: '1rem',
        color: 'hsl(30,30%,80%)',
    },
    button: {
        padding: '0.75rem 1.5rem',
        background: 'hsl(40, 80%, 45%)',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
};

export default CheckoutPage;
