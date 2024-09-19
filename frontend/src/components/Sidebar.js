import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Logout from './Logout';

const Sidebar = ({ setAuth }) => {
    const [isOpen, setIsOpen] = useState(true); // State to manage sidebar visibility

    const toggleSidebar = () => {
        setIsOpen(!isOpen); // Toggle sidebar visibility
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <Button
                className="sidebar-toggle"
                type="text"
                icon={isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                onClick={toggleSidebar}
                style={{ marginBottom: '16px' }}
            />
            {isOpen && (
                <Menu
                    mode="inline"
                    theme="light"
                    style={{ width: 256 }}
                >
                    <Menu.Item key="1">
                        <Link to="/">Dashboard</Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <Link to="/manage-pets">Manage Your Pets</Link>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <Logout setAuth={setAuth} />
                    </Menu.Item>
                </Menu>
            )}
        </div>
    );
};

export default Sidebar;
