import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import Register from './components/Register';
import PetList from './components/MangePets/PetList';
import PetDetail from './components/MangePets/PetDetail';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard/Dashboard'; // Import the actual Dashboard component
import './styles.css';
import 'antd/dist/reset.css'; // Use 'antd/dist/antd.css' for the default Ant Design styles

const App = () => {
  const [auth, setAuth] = useState({ user: null, isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app mount
  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (accessToken && refreshToken) {
          // Decode the token to get user info and check if it's expired
          const decoded = jwtDecode(accessToken);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp > currentTime) {
            // Token is valid
            setAuth({ user: decoded.username, isAuthenticated: true });
          } else {
            // Token is expired, clear localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setAuth({ user: null, isAuthenticated: false });
          }
        } else {
          // No tokens found
          setAuth({ user: null, isAuthenticated: false });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // If there's an error decoding the token, clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuth({ user: null, isAuthenticated: false });
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="container full-width-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column' 
        }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#666' }}>Loading MilkandButter...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container full-width-container">
      <header>
        <div className="header-content">
          <img src="/logo.jpg" alt="MilkandButter Logo" className="app-logo" />
          <h1>MilkandButter</h1>
        </div>
      </header>
      <main className="full-width-main">
        {auth.isAuthenticated ? (
          <div className="app-content full-width-content">
            <Sidebar setAuth={setAuth} />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/manage-pets" element={<ManagePets />} />
                <Route path="/pet-detail/:id" element={<PetDetail />} />
              </Routes>
            </div>
          </div>
        ) : (
          <div className="auth-pages">
            <Routes>
              <Route path="/" element={<Login setAuth={setAuth} />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        )}
      </main>
      <footer>
        <p>&copy; 2024 MilkandButter</p>
      </footer>
    </div>
  );
};

// ManagePets component for pet management
const ManagePets = () => {
  return (
      <div className="manage-pets-container">
          <h2>Manage Your Pets</h2>
          <div className="manage-pets-content">
              <PetList />
    
          </div>
      </div>
  );
};

export default App;
