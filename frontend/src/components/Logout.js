import React from 'react';
import { useNavigate } from 'react-router-dom'; // Updated import for React Router v6
import { Button } from 'antd';
import '../styles.css'; // Import the stylesheet

const Logout = ({ setAuth, children, className = '', onClick }) => {
    const navigate = useNavigate(); // Use navigate for redirection

    const handleLogout = () => {
        // Remove tokens from local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Clear the app loaded flag to ensure proper routing on next login
        sessionStorage.removeItem('app_loaded');
        
        // Clear authentication state
        setAuth({ user: null, isAuthenticated: false });

        // Call the onClick prop if provided (for closing mobile menu)
        if (onClick) {
            onClick();
        }

        // Redirect to login page
        navigate('/');
    };

    // If children are provided, render as a clickable element (for sidebar menu)
    if (children) {
        return (
            <div 
                onClick={handleLogout} 
                className={className}
                style={{ cursor: 'pointer', width: '100%' }}
            >
                {children}
            </div>
        );
    }

    // Otherwise, render as a button (for traditional usage)
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
