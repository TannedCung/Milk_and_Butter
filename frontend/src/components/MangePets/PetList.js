import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchPets, fetchPetById, updatePet, fetchPetAvatar } from '../../services/api';
import { List, Typography, Avatar, Modal, Button } from 'antd'; // Removed unused imports
import { Form } from 'antd'; // Removed unused imports
import moment from 'moment';
import PetForm from './PetForm';

const { Title } = Typography;

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
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [avatarUrls, setAvatarUrls] = useState({});
    const [form] = Form.useForm();
    const isMounted = useRef(true);
    const [showPetForm, setShowPetForm] = useState(false);

    const fetchPetsData = useCallback(async (page = 1, pageSize = 5) => {
        if (!isMounted.current) return;
        try {
            const { data } = await fetchPets(page, pageSize);
            if (!isMounted.current) return;
            
            setPets(data.results);
            setPagination((prev) => ({
                ...prev,
                total: data.count,
                current: page,
                pageSize: pageSize,
            }));
            
            const avatarMap = {};
            for (const pet of data.results) {
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
    }, []); // Removed pagination from dependencies

    useEffect(() => {
        fetchPetsData(pagination.current, pagination.pageSize);
        return () => {
            isMounted.current = false;
        };
    }, [fetchPetsData, pagination]); // Added pagination here

    const handlePageChange = (page, pageSize) => {
        fetchPetsData(page, pageSize);
        setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: pageSize,
        }));
    };

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
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: handlePageChange,
                }}
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
                        {/* Form Fields */}
                    </Form>
                )}
            </Modal>

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
