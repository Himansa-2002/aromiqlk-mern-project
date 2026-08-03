import React from 'react';

const ProfilePage = () => {
    return (
        <div className="profile-page" style={styles.container}>
            <h1 style={styles.title}>Profile</h1>
            {/* Profile details and edit form */}
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        background: 'linear-gradient(135deg, hsl(210, 30%, 96%), hsl(210, 20%, 86%))',
        borderRadius: '1rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(5px)'
    },
    title: {
        fontFamily: "'Inter', sans-serif",
        fontSize: '2rem',
        color: 'hsl(210, 30%, 20%)',
        marginBottom: '1rem'
    }
};

export default ProfilePage;
