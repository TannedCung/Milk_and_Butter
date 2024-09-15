import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logout from './Logout';

const Sidebar = ({ setAuth }) => {
    const [isOpen, setIsOpen] = useState(true); // State to manage sidebar visibility

    const toggleSidebar = () => {
        setIsOpen(!isOpen); // Toggle sidebar visibility
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                {isOpen ? '◀' : '▶'} {/* Toggle icon */}
            </button>
            {isOpen && (
                <ul>
                    <li>
                        <Link to="/">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/manage-pets">Manage Your Pets</Link>
                    </li>
                    <li>
                        <Logout setAuth={setAuth} />
                    </li>
                </ul>
            )}
        </div>
    );
};

export default Sidebar;
