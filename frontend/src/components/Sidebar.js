import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Menu } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, FormOutlined, LogoutOutlined } from '@ant-design/icons';
import Logout from './Logout';

const Sidebar = ({ setAuth }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <Button
                className="sidebar-toggle"
                type="text"
                icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleSidebar}
                style={{ marginBottom: '16px', width: '100%', textAlign: 'left' }}
            />
            <Menu
                mode="inline"
                theme="light"
                inlineCollapsed={isCollapsed}
                style={{ border: 'none', textAlign: 'left' }}
            >
                <Menu.Item key="1" icon={<DashboardOutlined />}>
                    <Link to="/dashboard">
                        <span className="icon"></span>
                        <span className="link-text">Dashboard</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key="2" icon={<FormOutlined />}>
                    <Link to="/manage-pets">
                        <span className="icon"></span>
                        <span className="link-text">Manage Your Pets</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key="3" icon={<LogoutOutlined />}>
                    <Logout setAuth={setAuth}>
                        <span className="icon"></span>
                        <span className="link-text">Logout</span>
                    </Logout>
                </Menu.Item>
            </Menu>
        </div>
    );
};

export default Sidebar;