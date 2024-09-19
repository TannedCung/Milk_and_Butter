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
        
        // Clear authentication state
        setAuth({ user: null, isAuthenticated: false });

        // Optionally redirect to login page or home page
        navigate('/'); // Use navigate to redirect
    };

    return (
        <Button 
            onClick={handleLogout} 
            type="default" 
            style={{ 
                backgroundColor: '#fff', 
                borderColor: '#000', 
                color: '#000',
                borderRadius: '4px',
                margin: '16px 0'
            }}
        >
            Logout
        </Button>
    );
};

export default Logout;
