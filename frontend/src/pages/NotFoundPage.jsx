import React from 'react';

const NotFoundPage = () => {
    return (
        <div className="notfound-page" style={styles.container}>
            <h1 style={styles.title}>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
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
        background: 'linear-gradient(135deg, hsl(210, 30%, 95%), hsl(210, 20%, 85%))',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(5px)'
    },
    title: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '2.5rem',
        color: 'hsl(210, 30%, 20%)',
        marginBottom: '1rem'
    }
};

export default NotFoundPage;
