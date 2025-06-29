import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

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
            
            // Handle routing based on current path and navigation type
            const currentPath = location.pathname;
            const isPageRefresh = sessionStorage.getItem('app_loaded') === 'true';
            
            // Set flag to indicate app has been loaded
            sessionStorage.setItem('app_loaded', 'true');
            
            // If user is on root path and this isn't a refresh, redirect to dashboard
            if (currentPath === '/' && !isPageRefresh) {
              setTimeout(() => {
                navigate('/dashboard');
              }, 100); // Small delay to ensure loading is complete
            }
            // If it's a refresh or user is on a valid authenticated route, stay on current path
            // No redirection needed - user stays where they are
            
          } else {
            // Token is expired, clear localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setAuth({ user: null, isAuthenticated: false });
            // Clear the app loaded flag since user is now unauthenticated
            sessionStorage.removeItem('app_loaded');
          }
        } else {
          // No tokens found
          setAuth({ user: null, isAuthenticated: false });
          // Clear the app loaded flag
          sessionStorage.removeItem('app_loaded');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // If there's an error decoding the token, clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuth({ user: null, isAuthenticated: false });
        sessionStorage.removeItem('app_loaded');
      } finally {
        // Add a minimum loading time for better UX
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };

    checkAuthentication();
  }, [navigate, location.pathname]);

  // Clear app loaded flag when component unmounts (page navigation away from app)
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('app_loaded');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="container full-width-container">
        <div className="loading-container">
          <div className="loading-content animate-scaleIn">
            <div className="loading-spinner"></div>
            <div className="loading-text animate-pulse">Loading MilkandButter...</div>
            <div className="loading-dots">
              <span className="dot animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="dot animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="dot animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
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
          <div className="app-content full-width-content animate-stagger">
            <Sidebar setAuth={setAuth} />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/manage-pets" element={<ManagePets />} />
                <Route path="/pet-detail/:id" element={<PetDetail />} />
                {/* Fallback route for authenticated users */}
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </div>
          </div>
        ) : (
          <div className="auth-pages">
            <Routes>
              <Route path="/" element={<Login setAuth={setAuth} />} />
              <Route path="/register" element={<Register />} />
              {/* Redirect any other route to login for unauthenticated users */}
              <Route path="*" element={<Login setAuth={setAuth} />} />
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
          <h2 className="animate-slideInDown">Manage Your Pets</h2>
          <div className="manage-pets-content animate-stagger">
              <PetList />
          </div>
      </div>
  );
};

export default App;
