import React from 'react';
import { Form, Input, Button, DatePicker, Select, Typography, Upload, message } from 'antd';
import { createPet } from '../../services/api';
import { UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const PetForm = () => {
    const [form] = Form.useForm();
    const [avatarFile, setAvatarFile] = React.useState(null);

    const handleAvatarChange = (info) => {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
            setAvatarFile(info.file.originFileObj); // Store the uploaded file
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    };

    const handleSubmit = async (values) => {
        const petData = { 
            name: values.name, 
            species: values.species,
            date_of_birth: values.date_of_birth?.format('YYYY-MM-DD'), 
            gender: values.gender,
            color: values.color,
            medical_conditions: values.medical_conditions,
            microchip_number: values.microchip_number,
        };

        if (avatarFile) {
            const formData = new FormData();
            formData.append('petData', JSON.stringify(petData));
            formData.append('avatar', avatarFile);

            await createPet(formData);
        } else {
            await createPet(petData);
        }

        form.resetFields();
        setAvatarFile(null);
    };

    return (
        <div className="form-container" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px' }}>
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
                    <Input style={{ borderColor: '#000', borderRadius: '15px' }} />
                </Form.Item>

                <Form.Item
                    label="Species"
                    name="species"
                    rules={[{ required: true, message: 'Please select the species!' }]}
                >
                    <Select placeholder="Select species" style={{ borderColor: '#000', borderRadius: '15px' }}>
                        <Option value="Dog">Dog</Option>
                        <Option value="Cat">Cat</Option>
                        <Option value="Fish">Fish</Option>
                        <Option value="Bird">Bird</Option>
                        <Option value="Rabbit">Rabbit</Option>
                        <Option value="Hamster">Hamster</Option>
                        <Option value="Guinea Pig">Guinea Pig</Option>
                        <Option value="Turtle">Turtle</Option>
                        <Option value="Lizard">Lizard</Option>
                        <Option value="Snake">Snake</Option>
                        <Option value="Ferret">Ferret</Option>
                        <Option value="Hedgehog">Hedgehog</Option>
                        <Option value="Chicken">Chicken</Option>
                        <Option value="Rat">Rat</Option>
                        <Option value="Hermit Crab">Hermit Crab</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Date of Birth" name="date_of_birth">
                    <DatePicker style={{ borderColor: '#000', borderRadius: '15px' }} />
                </Form.Item>

                <Form.Item label="Gender" name="gender">
                    <Select placeholder="Select gender" style={{ borderColor: '#000', borderRadius: '15px' }}>
                        <Option value="Male">Male</Option>
                        <Option value="Female">Female</Option>
                        <Option value="Unknown">Unknown</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Color" name="color">
                    <Input style={{ borderColor: '#000', borderRadius: '15px' }} />
                </Form.Item>

                <Form.Item label="Medical Conditions" name="medical_conditions">
                    <Input.TextArea rows={4} style={{ borderColor: '#000', borderRadius: '15px' }} />
                </Form.Item>

                <Form.Item label="Microchip Number" name="microchip_number">
                    <Input style={{ borderColor: '#000', borderRadius: '15px' }} />
                </Form.Item>

                <Form.Item label="Pet Avatar" name="avatar">
                    <Upload
                        name="avatar"
                        onChange={handleAvatarChange}
                        beforeUpload={() => false}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />} style={{ borderColor: '#000', borderRadius: '15px' }}>
                            Upload Avatar
                        </Button>
                    </Upload>
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
