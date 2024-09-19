import React from 'react';
import { useNavigate } from 'react-router-dom'; // Updated import for React Router v6
import { registerUser } from '../services/api';
import GoogleLoginButton from './GoogleLogin';
import { Form, Input, Button, Typography, Space, Divider } from 'antd';
import 'antd/dist/reset.css'; // Ensure Ant Design styles are imported

const { Title } = Typography;

const Register = ({ setAuth }) => {
    const navigate = useNavigate(); // Use navigate for redirection

    const handleRegister = async (values) => {
        try {
            await registerUser({ username: values.username, email: values.email, password: values.password });
            alert('User registered successfully!');
            navigate('/'); // Redirect after successful registration
        } catch (error) {
            console.error("Registration failed", error);
        }
    };

    return (
        <div className="register-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <Title level={2} style={{ color: 'black' }}>Register</Title>
            <Form 
                onFinish={handleRegister} 
                layout="vertical"
            >
                <Form.Item 
                    name="username" 
                    // label={<span style={{ color: 'black' }}>Username</span>}
                    rules={[{ required: true, message: 'Please input your username!' }]}
                    style={{ marginBottom: '10px' }}
                >
                    <Input placeholder="Username" style={{ borderColor: '#000', color: '#000', borderRadius: '10px' }} />
                </Form.Item>
                
                <Form.Item 
                    name="email" 
                    // label={<span style={{ color: 'black' }}>Email</span>}
                    rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'The input is not valid E-mail!' }]}
                    style={{ marginBottom: '10px' }}
                >
                    <Input type="email" placeholder="Email" style={{ borderColor: '#000', color: '#000', borderRadius: '10px' }} />
                </Form.Item>
                
                <Form.Item 
                    name="password" 
                    // label={<span style={{ color: 'black' }}>Password</span>}
                    rules={[{ required: true, message: 'Please input your password!' }]}
                    style={{ marginBottom: '20px' }}
                >
                    <Input.Password placeholder="Password" style={{ borderColor: '#000', color: '#000', borderRadius: '10px' }} />
                </Form.Item>
                
                <Form.Item  style={{ marginBottom: '20px' }}>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        style={{ width: '100%', backgroundColor: '#000', borderColor: '#000', color: '#fff', borderRadius: '15px' }}
                    >
                        Register
                    </Button>
                </Form.Item>
            </Form>
            
            <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
                <GoogleLoginButton setAuth={setAuth} />
                <Divider style={{ borderColor: '#000' }} />
                <Button 
                    type="link" style={{ color: '#000' }}
                    onClick={() => navigate('/')} 
                >
                    Back to Login
                </Button>
            </Space>
        </div>
    );
};

export default Register;
