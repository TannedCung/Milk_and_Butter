import React from 'react';
import { useNavigate } from 'react-router-dom'; // Updated import for React Router v6
import { Button } from 'antd';
import '../styles.css'; // Import the stylesheet

const Logout = ({ setAuth }) => {
    const navigate = useNavigate(); // Use navigate for redirection

    const handleLogout = () => {
        // Remove tokens from local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Clear the app loaded flag to ensure proper routing on next login
        sessionStorage.removeItem('app_loaded');
        
        // Clear authentication state
        setAuth({ user: null, isAuthenticated: false });

        // Redirect to login page
        navigate('/');
    };

    return (
        <Button 
            onClick={handleLogout} 
            type="default" 
            className="btn-secondary logout-button"
        >
            Logout
        </Button>
    );
};

export default Logout;
