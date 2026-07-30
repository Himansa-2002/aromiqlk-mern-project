import React from 'react';

const UnauthorizedPage = () => {
    return (
        <div className="unauthorized-page" style={styles.container}>
            <h1 style={styles.title}>Unauthorized</h1>
            <p>You do not have permission to view this page.</p>
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
        background: 'linear-gradient(135deg, hsl(0, 30%, 95%), hsl(0, 20%, 85%))',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(5px)'
    },
    title: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '2.5rem',
        color: 'hsl(0, 30%, 20%)',
        marginBottom: '1rem'
    }
};

export default UnauthorizedPage;
