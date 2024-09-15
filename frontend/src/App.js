import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import PetForm from './components/PetForm';
import PetList from './components/PetList';
// import Logout from './components/Logout';
import Sidebar from './components/Sidebar'; // Import the Sidebar component
import './styles.css';

const App = () => {
  const [auth, setAuth] = useState({ user: null, isAuthenticated: false });

  return (
    <div className="container">
      <header>
        <h1>Milk and Butter</h1>
      </header>
      <main>
        {auth.isAuthenticated ? (
          <div className="app-content">
            <Sidebar setAuth={setAuth} />
            <div className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/manage-pets" element={<ManagePets />} />
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
        <p>&copy; 2024 Milk and Butter</p>
      </footer>
    </div>
  );
};

// Dummy Dashboard and ManagePets components
const Dashboard = () => (
  <div>
    <h2>Dashboard</h2>
    <p>Welcome to the dashboard!</p>
  </div>
);

const ManagePets = () => (
  <div>
    <h2>Manage Your Pets</h2>
    <PetForm />
    <PetList />
  </div>
);

export default App;
