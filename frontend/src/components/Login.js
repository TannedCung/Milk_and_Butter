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
        <div className="login-container" style={{ padding: '24px', maxWidth: '400px', margin: 'auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
            <Title level={2} style={{ textAlign: 'center', color: '#000' }}>Login</Title>
            <Form onFinish={handleLogin} layout="vertical">
                <Form.Item 
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                    style={{ marginBottom: '10px' }}
                >
                    <Input 
                        placeholder="Username" 
                        style={{ borderColor: '#000', color: '#000' }}
                    />
                </Form.Item>
                <Form.Item 
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                    style={{ marginBottom: '20px' }}
                >
                    <Input.Password 
                        placeholder="Password" 
                        style={{ borderColor: '#000', color: '#000' }}
                    />
                </Form.Item>
                <Form.Item style={{ marginBottom: '20px' }}>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        style={{ width: '100%', backgroundColor: '#000', borderColor: '#000', color: '#fff' }}
                    >
                        Login
                    </Button>
                </Form.Item>
                <Form.Item>
                    <GoogleLoginButton setAuth={setAuth} />
                </Form.Item>
                <Divider style={{ borderColor: '#000' }} />
                <Form.Item>
                    <Link to="/register">
                        <Button type="link" style={{ color: '#000' }}>
                            Don't have an account? Sign up for free
                        </Button>
                    </Link>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
