import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchPets, fetchPetById, updatePet, fetchPetAvatar } from '../../services/api';
import { List, Typography, Avatar, Modal, Button } from 'antd';
import { Form, Input, DatePicker, Select } from 'antd';
import moment from 'moment';
import PetForm from './PetForm'; // Import PetForm

const { Title } = Typography;
const { Option } = Select; // Destructure Option from Select

const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    
    const birthDate = moment(dateOfBirth);
    if (!birthDate.isValid()) return 'Invalid Date';
    const today = moment();
    const age = today.diff(birthDate, 'years');
    return `${age} years`;
};

const PetList = () => {
    const [pets, setPets] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [avatarUrls, setAvatarUrls] = useState({});
    const [form] = Form.useForm();
    const isMounted = useRef(true);
    const [showPetForm, setShowPetForm] = useState(false); // State to control PetForm visibility

    const fetchPetsData = useCallback(async () => {
        if (!isMounted.current) return;
        try {
            const { data } = await fetchPets();
            if (!isMounted.current) return;
            setPets(data);
            
            const avatarMap = {};
            for (const pet of data) {
                if (!isMounted.current) return;
                try {
                    const response = await fetchPetAvatar(pet.id);
                    const blob = new Blob([response.data], { type: response.headers['content-type'] });
                    const url = URL.createObjectURL(blob);
                    avatarMap[pet.id] = url;
                } catch (error) {
                    console.error('Error fetching avatar:', error);
                    avatarMap[pet.id] = '/path/to/default/avatar.png';
                }
            }
            if (!isMounted.current) return;
            setAvatarUrls(avatarMap);
        } catch (error) {
            console.error('Error fetching pets:', error);
        }
    }, []);

    useEffect(() => {
        fetchPetsData();
        return () => {
            isMounted.current = false;
        };
    }, [fetchPetsData]);

    const handlePetClick = async (petId) => {
        try {
            const { data } = await fetchPetById(petId);
            setSelectedPet(data);
            setIsModalVisible(true);
            form.setFieldsValue({
                name: data.name,
                species: data.species,
                date_of_birth: data.date_of_birth ? moment(data.date_of_birth) : null,
                gender: data.gender,
                color: data.color,
                medical_conditions: data.medical_conditions,
                microchip_number: data.microchip_number,
            });
        } catch (error) {
            console.error('Error fetching pet details:', error);
        }
    };

    const handleOk = async (values) => {
        try {
            const formattedValues = {
                ...values,
                date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
            };
            await updatePet(selectedPet.id, formattedValues);
            setIsModalVisible(false);
            const updatedPets = pets.map(pet => (pet.id === selectedPet.id ? { ...pet, ...values } : pet));
            setPets(updatedPets);
        } catch (error) {
            console.error('Error updating pet:', error);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleAddPet = () => {
        setShowPetForm(true);
    };

    return (
        <div className="pet-list-container" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Title level={3} style={{ color: '#000', marginBottom: '20px' }}>Pet List</Title>
            
            {/* Button to open PetForm */}
            <Button type="primary" onClick={handleAddPet} style={{ marginBottom: '20px', backgroundColor: '#000', borderColor: '#000', color: '#fff' }}>
                Add New Pet
            </Button>
            
            <List
                itemLayout="horizontal"
                dataSource={pets}
                renderItem={pet => (
                    <List.Item onClick={() => handlePetClick(pet.id)} style={{ cursor: 'pointer' }}>
                        <List.Item.Meta
                            avatar={<Avatar src={avatarUrls[pet.id]} />}
                            title={<span style={{ color: '#000', fontWeight: 'bold' }}>{pet.name}</span>}
                            description={
                                <div style={{ display: 'flex', alignItems: 'center', color: '#000' }}>
                                    <span style={{ marginRight: '16px' }}>{pet.species}</span>
                                    <span style={{ marginRight: '16px' }}>Age: {calculateAge(pet.date_of_birth)}</span>
                                    <span style={{ marginRight: '16px' }}>Color: {pet.color}</span>
                                    <span>Medical Conditions: {pet.medical_conditions || 'None'}</span>
                                </div>
                            }
                        />
                    </List.Item>
                )}
                style={{ borderRadius: '8px', border: '1px solid #000' }}
            />

            <Modal
                title="Edit Pet Information"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
            >
                {selectedPet && (
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <Avatar 
                            size={100} 
                            src={avatarUrls[selectedPet.id]} 
                            alt="Pet Avatar" 
                        />
                    </div>
                )}
                {selectedPet && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleOk}
                    >
                        <Form.Item
                            label="Pet Name"
                            name="name"
                            rules={[{ required: true, message: 'Please input the pet name!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Species"
                            name="species"
                            rules={[{ required: true, message: 'Please input the species!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Date of Birth"
                            name="date_of_birth"
                        >
                            <DatePicker />
                        </Form.Item>
                        <Form.Item
                            label="Gender"
                            name="gender"
                        >
                            <Select>
                                <Option value="Male">Male</Option>
                                <Option value="Female">Female</Option>
                                <Option value="Unknown">Unknown</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Color"
                            name="color"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Medical Conditions"
                            name="medical_conditions"
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>
                        <Form.Item
                            label="Microchip Number"
                            name="microchip_number"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ marginBottom: '20px', backgroundColor: '#000', borderColor: '#000', color: '#fff' }}>
                                Save Changes
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Modal>

            {/* Conditional rendering of PetForm */}
            <Modal
                title="Add New Pet"
                open={showPetForm}
                onCancel={() => setShowPetForm(false)}
                footer={null}
                centered
            >
                <PetForm />
            </Modal>
        </div>
    );
};

export default PetList;
