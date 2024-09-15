import React from 'react';
import { useNavigate } from 'react-router-dom'; // Updated import for React Router v6

const Logout = ({ setAuth }) => {
    const navigate = useNavigate(); // Use navigate for redirection

    const handleLogout = () => {
        // Remove tokens from local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Clear authentication state
        setAuth({ user: null, isAuthenticated: false });

        // Optionally redirect to login page or home page
        navigate('/'); // Use navigate to redirect
    };

    return (
        <button onClick={handleLogout} className="logout-button">Logout</button>
    );
};

export default Logout;
