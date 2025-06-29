import React from 'react';
import { Form, Input, Button, Typography, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Fix import for jwt-decode
import GoogleLoginButton from './GoogleLogin';
import '../styles.css'; // Import the stylesheet

const { Title } = Typography;

const Login = ({ setAuth }) => {
    const handleLogin = async (values) => {
        try {
            const { data } = await loginUser({ username: values.username, password: values.password });
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
            <Title level={2} className="login-title">Login</Title>
            <Form onFinish={handleLogin} layout="vertical" className="login-form">
                <Form.Item 
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                    className="form-group"
                >
                    <Input 
                        placeholder="Username" 
                        className="login-input"
                    />
                </Form.Item>
                <Form.Item 
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                    className="form-group"
                >
                    <Input.Password 
                        placeholder="Password" 
                        className="login-input"
                    />
                </Form.Item>
                <Form.Item className="form-group">
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        className="btn-primary login-button"
                    >
                        Login
                    </Button>
                </Form.Item>
                <Form.Item>
                    <GoogleLoginButton setAuth={setAuth} />
                </Form.Item>
                <Divider className="login-divider" />
                <Form.Item>
                    <Link to="/register">
                        <Button type="link" className="login-link">
                            Don't have an account? Sign up for free
                        </Button>
                    </Link>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
