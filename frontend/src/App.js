import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import PetForm from './components/MangePets/PetForm';
import PetList from './components/MangePets/PetList';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard/Dashboard'; // Import the actual Dashboard component
import './styles.css';
import 'antd/dist/reset.css'; // Use 'antd/dist/antd.css' for the default Ant Design styles

const App = () => {
  const [auth, setAuth] = useState({ user: null, isAuthenticated: false });

  return (
    <div className="container full-width-container">
      <header>
        <h1>Milk and Butter</h1>
      </header>
      <main className="full-width-main">
        {auth.isAuthenticated ? (
          <div className="app-content full-width-content">
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

// ManagePets component for pet management
const ManagePets = () => (
  <div className="manage-pets-container">
    <h2>Manage Your Pets</h2>
    <div className="manage-pets-content">
      <PetForm />
      <PetList />
    </div>
  </div>
);

export default App;
