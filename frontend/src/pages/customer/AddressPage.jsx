import React, { useEffect, useState } from 'react';

const AddressPage = () => {
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/address')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                setAddress(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="address-page" style={styles.container}>
            <h1 style={styles.title}>My Addresses</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {address && (
                <div style={styles.content}>
                    {/* Render address details; adjust based on backend response */}
                    <p><strong>Street:</strong> {address.street}</p>
                    <p><strong>City:</strong> {address.city}</p>
                    <p><strong>State:</strong> {address.state}</p>
                    <p><strong>Zip:</strong> {address.zip}</p>
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

export default AddressPage;
