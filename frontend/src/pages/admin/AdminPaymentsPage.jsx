import React from 'react';

const AdminPaymentsPage = () => {
    return (
        <div className="admin-payments" style={styles.container}>
            <h1 style={styles.title}>Admin Payments</h1>
            {/* List and manage payments */}
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        background: 'linear-gradient(135deg, hsl(340, 30%, 95%), hsl(340, 20%, 85%))',
        borderRadius: '1rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(5px)'
    },
    title: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '2.2rem',
        color: 'hsl(340, 30%, 20%)'
    }
};

export default AdminPaymentsPage;
