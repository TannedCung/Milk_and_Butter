import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Fix import for jwt-decode
import '../styles.css'; // Import the stylesheet
import { Link } from 'react-router-dom'; // Import Link for navigation
import GoogleLoginButton from './GoogleLogin';


const Login = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await loginUser({ username, password });
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            
            const decoded = jwtDecode(data.access);
            setAuth({ user: decoded.username, isAuthenticated: true });
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Username" 
                />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Password" 
                />
                <div className="single-button-container">
                    <button className="center-button">Login</button>
                </div>
                <div className="single-button-container">
                    <GoogleLoginButton setAuth={setAuth} />
                </div>
                
            </form>
            <div className="single-button-container">
                <Link to="/register">
                    <button className="center-button"> Don't have an account? Sign up for free</button>
                </Link>
            </div>
        </div>
    );
};

export default Login;
