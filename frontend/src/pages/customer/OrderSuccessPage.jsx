import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const OrderSuccessPage = () => {
    const location = useLocation();
    const orderId = location.state?.orderId || 'N/A';

    return (
        <div className="order-success-page" style={styles.container}>
            <h1 style={styles.title}>Order Placed Successfully!</h1>
            <p style={styles.message}>Your order ID is <strong>{orderId}</strong>.</p>
            <p>Thank you for shopping with us.</p>
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
    message: {
        fontSize: '1.2rem',
        color: 'hsl(30,30%,80%)',
        marginBottom: '1rem',
    },
};

export default OrderSuccessPage;
