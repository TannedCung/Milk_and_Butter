import React from 'react';
import { Form, Input, Button, Typography, Divider, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import '../styles.css';

const { Title } = Typography;

const Register = () => {
    const navigate = useNavigate();

    const handleRegister = async (values) => {
        try {
            await registerUser({
                username: values.username,
                email: values.email,
                password: values.password,
            });
            message.success('Registration successful! Please login.');
            navigate('/');
        } catch (error) {
            message.error('Registration failed. Please try again.');
        }
    };

    return (
        <div className="register-container">
            <Title level={2} className="register-title">Create Account</Title>
            <Form onFinish={handleRegister} layout="vertical" className="register-form">
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                    className="form-group"
                >
                    <Input placeholder="Username" className="register-input" />
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                    className="form-group"
                >
                    <Input type="email" placeholder="Email" className="register-input" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Please input your password!' },
                        { min: 6, message: 'Password must be at least 6 characters!' }
                    ]}
                    className="form-group"
                >
                    <Input.Password placeholder="Password" className="register-input" />
                </Form.Item>
                <Form.Item className="form-group">
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        className="btn-primary register-button"
                    >
                        Create Account
                    </Button>
                </Form.Item>
                <Divider className="register-divider" />
                <Form.Item>
                    <Link to="/">
                        <Button type="link" className="register-link">
                            Already have an account? Sign in
                        </Button>
                    </Link>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Register;
