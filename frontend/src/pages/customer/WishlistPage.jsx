import React, { useEffect, useState } from 'react';

const WishlistPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/wishlist')
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                setItems(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="wishlist-page" style={styles.container}>
            <h1 style={styles.title}>My Wishlist</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {items.length === 0 && !loading && <p>Your wishlist is empty.</p>}
            {items.length > 0 && (
                <ul style={styles.list}>
                    {items.map((item) => (
                        <li key={item.id} style={styles.listItem}>
                            {item.name} - ${item.price}
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
        maxWidth: '600px',
        listStyle: 'none',
        padding: 0,
    },
    listItem: {
        background: 'hsl(210, 30%, 15%)',
        color: 'hsl(30,30%,80%)',
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        borderRadius: '0.5rem',
    },
};

export default WishlistPage;
