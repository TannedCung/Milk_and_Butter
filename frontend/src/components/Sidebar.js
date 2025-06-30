import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Menu, Drawer } from 'antd';
import { 
    MenuFoldOutlined, 
    MenuUnfoldOutlined, 
    DashboardOutlined, 
    PetsOutlined, 
    LogoutOutlined,
    CloseOutlined
} from '@ant-design/icons';
import Logout from './Logout';

const Sidebar = ({ setAuth }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile && mobileDrawerVisible) {
                setMobileDrawerVisible(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileDrawerVisible]);

    const toggleSidebar = () => {
        if (isMobile) {
            setMobileDrawerVisible(!mobileDrawerVisible);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    const closeMobileDrawer = () => {
        setMobileDrawerVisible(false);
    };

    const getSelectedKey = () => {
        const path = location.pathname;
        if (path === '/' || path === '/dashboard') return '1';
        if (path === '/manage-pets') return '2';
        return '1';
    };

    const menuItems = [
        {
            key: '1',
            icon: <DashboardOutlined />,
            label: (
                <Link to="/dashboard" onClick={closeMobileDrawer}>
                    Dashboard
                </Link>
            ),
        },
        {
            key: '2',
            icon: <PetsOutlined />,
            label: (
                <Link to="/manage-pets" onClick={closeMobileDrawer}>
                    Manage Pets
                </Link>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: '3',
            icon: <LogoutOutlined />,
            label: (
                <Logout setAuth={setAuth} onClick={closeMobileDrawer}>
                    Logout
                </Logout>
            ),
            danger: true,
        },
    ];

    const SidebarContent = () => (
        <div className="sidebar-content">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/logo.jpg" alt="Logo" className="sidebar-logo-img" />
                    {(!isCollapsed || isMobile) && (
                        <span className="sidebar-title">MilkandButter</span>
                    )}
                </div>
                {!isMobile && (
                    <Button
                        type="text"
                        icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={toggleSidebar}
                        className="sidebar-toggle-btn"
                    />
                )}
                {isMobile && (
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={closeMobileDrawer}
                        className="sidebar-close-btn"
                    />
                )}
            </div>
            
            <div className="sidebar-menu">
                <Menu
                    mode="inline"
                    theme="light"
                    selectedKeys={[getSelectedKey()]}
                    inlineCollapsed={isCollapsed && !isMobile}
                    items={menuItems}
                    className="sidebar-menu-items"
                />
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-user-info">
                    {(!isCollapsed || isMobile) && (
                        <div className="user-welcome">
                            <span>Welcome back!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <>
                <Button
                    type="text"
                    icon={<MenuUnfoldOutlined />}
                    onClick={toggleSidebar}
                    className="mobile-sidebar-trigger"
                />
                <Drawer
                    title={null}
                    placement="left"
                    closable={false}
                    onClose={closeMobileDrawer}
                    open={mobileDrawerVisible}
                    width={280}
                    className="mobile-sidebar-drawer"
                    bodyStyle={{ padding: 0 }}
                >
                    <SidebarContent />
                </Drawer>
            </>
        );
    }

    return (
        <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <SidebarContent />
        </div>
    );
};

export default Sidebar;