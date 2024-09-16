import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Updated import for React Router v6
import { registerUser } from '../services/api';
import GoogleLoginButton from './GoogleLogin';

const Register = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Use navigate for redirection

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await registerUser({ username, email, password });
            alert('User registered successfully!');
            navigate('/'); // Use navigate to redirect
        } catch (error) {
            console.error("Registration failed", error);
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <div className="single-button-container">
                <button className="center-button">Register</button>
            </div>
            <div className="single-button-container">
                <GoogleLoginButton setAuth={setAuth} />
            </div>
        </form>
    );
};

export default Register;
