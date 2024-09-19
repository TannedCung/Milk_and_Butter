import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { createPet } from '../services/api';

const { Title } = Typography;

const PetForm = () => {
    const [form] = Form.useForm();
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('');

    const handleSubmit = async (values) => {
        // Use form values for submission
        const petData = { name: values.name, species: values.species };
        await createPet(petData);
        // Reset form after submission
        form.resetFields();
    };

    return (
        <div className="form-container" style={{ backgroundColor: '#fff', color: '#000', padding: '20px', borderRadius: '8px' }}>
            <Title level={3} style={{ color: '#000' }}>You have a new pet?</Title>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ maxWidth: '400px', margin: '0 auto' }}
            >
                <Form.Item
                    label="Pet Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter the pet name!' }]}
                >
                    <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        style={{ borderColor: '#000', borderRadius: '15px' }} 
                    />
                </Form.Item>

                <Form.Item
                    label="Species"
                    name="species"
                    rules={[{ required: true, message: 'Please enter the species!' }]}
                >
                    <Input 
                        value={species} 
                        onChange={(e) => setSpecies(e.target.value)} 
                        style={{ borderColor: '#000', borderRadius: '15px' }} 
                    />
                </Form.Item>

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        style={{ backgroundColor: '#000', borderColor: '#000', color: '#fff' }}
                    >
                        Add Pet
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default PetForm;
