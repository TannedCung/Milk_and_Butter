import React, { useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, Typography, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const PetForm = ({ initialValues, onSubmit }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = React.useState([]); // Update state for file list

    // Populate form with initial values for editing
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                date_of_birth: initialValues.date_of_birth ? moment(initialValues.date_of_birth) : null,
            });
            // Set fileList for existing avatar
            if (initialValues.avatar) {
                setFileList([{
                    uid: '-1', // Unique id for the uploaded file
                    name: initialValues.avatar.name || 'Uploaded Avatar', // The file name
                    status: 'done', // Status of the file upload
                    url: initialValues.avatar.url || initialValues.avatar, // URL for displaying the uploaded image
                }]);
            }
        }
    }, [initialValues, form]);

    const handleAvatarChange = (info) => {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
            setFileList([info.file]); // Store the uploaded file
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        } else {
            setFileList(info.fileList); // Manage the file list
        }
    };

    const handleSubmit = async (values) => {
        console.log("Form values:", values);
        
        // Validate required fields before proceeding
        if (!values.name || !values.species || !values.gender) {
            message.error('Please fill in all required fields marked with *');
            return;
        }
        
        const formData = new FormData();
    
        // Append avatar file if it exists
        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append('avatar', fileList[0].originFileObj);
        }
    
        // Append required fields
        formData.append('name', values.name.trim());
        formData.append('species', values.species);
        formData.append('gender', values.gender || 'Unknown'); // Default to 'Unknown' if not selected
        
        // Append optional fields only if they have values
        if (values.date_of_birth) {
            formData.append('date_of_birth', values.date_of_birth.format('YYYY-MM-DD'));
        }
        if (values.color && values.color.trim()) {
            formData.append('color', values.color.trim());
        }
        if (values.medical_conditions && values.medical_conditions.trim()) {
            formData.append('medical_conditions', values.medical_conditions.trim());
        }
        if (values.microchip_number && values.microchip_number.trim()) {
            formData.append('microchip_number', values.microchip_number.trim());
        }
        
        // Log the contents of formData for debugging
        console.log("FormData contents:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
    
        try {
            await onSubmit(formData);
            // Reset the form fields after successful submission
            form.resetFields();
            setFileList([]);
            message.success('Pet saved successfully!');
        } catch (error) {
            console.error('Error submitting form:', error);
            
            // Handle specific validation errors from backend
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                if (errorData.name) {
                    message.error(`Name: ${errorData.name[0]}`);
                } else if (errorData.species) {
                    message.error(`Species: ${errorData.species[0]}`);
                } else if (errorData.gender) {
                    message.error(`Gender: ${errorData.gender[0]}`);
                } else {
                    message.error('Failed to save pet. Please check your input and try again.');
                }
            } else {
                message.error('Failed to save pet. Please check your input and try again.');
            }
        }
    };

    return (
        <div className="form-container">
            <Title level={3} className="form-title">{initialValues ? 'Edit Pet' : 'Add New Pet'}</Title>
            <p className="form-description">
                Fields marked with <span style={{color: 'red'}}>*</span> are required
            </p>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ maxWidth: '400px', margin: '0 auto' }}
            >
                <Form.Item
                    label={<span>Pet Name <span style={{color: 'red'}}>*</span></span>}
                    name="name"
                    rules={[{ required: true, message: 'Please enter the pet name!' }]}
                >
                    <Input className="pet-form-input" />
                </Form.Item>

                <Form.Item
                    label={<span>Species <span style={{color: 'red'}}>*</span></span>}
                    name="species"
                    rules={[{ required: true, message: 'Please select the species!' }]}
                >
                    <Select placeholder="Select species" className="pet-form-select">
                        <Option value="Dog">Dog</Option>
                        <Option value="Cat">Cat</Option>
                        <Option value="Fish">Fish</Option>
                        {/* Add more species options as needed */}
                    </Select>
                </Form.Item>

                <Form.Item label="Date of Birth" name="date_of_birth">
                    <DatePicker className="pet-form-datepicker" />
                </Form.Item>

                <Form.Item 
                    label={<span>Gender <span style={{color: 'red'}}>*</span></span>}
                    name="gender"
                    initialValue="Unknown"
                    rules={[{ required: true, message: 'Please select gender!' }]}
                >
                    <Select placeholder="Select gender" className="pet-form-select">
                        <Option value="Male">Male</Option>
                        <Option value="Female">Female</Option>
                        <Option value="Unknown">Unknown</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Color" name="color">
                    <Input className="pet-form-input" />
                </Form.Item>

                <Form.Item label="Medical Conditions" name="medical_conditions">
                    <Input.TextArea rows={4} className="pet-form-textarea" />
                </Form.Item>

                <Form.Item label="Microchip Number" name="microchip_number">
                    <Input className="pet-form-input" />
                </Form.Item>

                <Form.Item label="Pet Avatar">
                    <Upload
                        fileList={fileList} // Use fileList instead of value
                        onChange={handleAvatarChange}
                        beforeUpload={() => false} // Prevent automatic upload
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />} className="pet-form-upload-btn">
                            Upload Avatar
                        </Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        className="btn-primary pet-form-submit"
                    >
                        {initialValues ? 'Update Pet' : 'Add Pet'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default PetForm;
