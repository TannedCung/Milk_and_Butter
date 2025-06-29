import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPets, fetchPetById, updatePet, deletePet, createPet, fetchPetAvatar } from '../../services/api';
import { Table, Typography, Avatar, Modal, Button, Pagination, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import PetForm from './PetForm';

const { Title } = Typography;

const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';
    
    const birthDate = moment(dateOfBirth);
    if (!birthDate.isValid()) return 'Invalid Date';
    const today = moment();
    return `${today.diff(birthDate, 'years')} years`;
};

const PetList = () => {
    const navigate = useNavigate();
    const [pets, setPets] = useState([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [avatarUrls, setAvatarUrls] = useState({});
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [loading, setLoading] = useState(false);

    const fetchPetsData = useCallback(async (page = 1, pageSize = 5) => {
        setLoading(true);
        try {
            const { data } = await fetchPets(page, pageSize);
            setPets(data.results);
            
            const avatarMap = {};
            for (const pet of data.results) {
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
            setAvatarUrls(avatarMap);
        } catch (error) {
            console.error('Error fetching pets:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {   
        fetchPetsData(pagination.current, pagination.pageSize);
    }, [fetchPetsData, pagination]);

    const handlePageChange = (page, pageSize) => {
        setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize,
        }));
    };

    const handleEditClick = async (petId) => {
        try {
            const { data } = await fetchPetById(petId);
            setSelectedPet(data);
            setIsEditModalVisible(true);
        } catch (error) {
            console.error('Error fetching pet details:', error);
        }
    };

    const handleEditOk = async (formData) => {
        try {
            console.log("Updating pet with FormData");
            const response = await updatePet(selectedPet.id, formData);
            console.log("Pet updated successfully:", response);
            
            // Refresh the pets list
            fetchPetsData(pagination.current, pagination.pageSize);
            setIsEditModalVisible(false);
            setSelectedPet(null);
            message.success("Pet updated successfully!");
        } catch (error) {
            console.error('Error updating pet:', error);
            if (error.response && error.response.data) {
                console.error('Validation errors:', error.response.data);
                const errorMessages = Object.values(error.response.data).flat();
                message.error(`Failed to update pet: ${errorMessages.join(', ')}`);
            } else {
                message.error("Failed to update pet. Please try again.");
            }
        }
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setSelectedPet(null);
    };

    const handleAddPet = () => {
        setSelectedPet(null); // Reset selectedPet for adding a new pet
        setIsAddModalVisible(true);
    };

    const handleAddOk = async (formData) => {
        try {
            console.log("Adding pet with FormData");
            const response = await createPet(formData);
            console.log("Pet created successfully:", response);
            
            // Refresh the pets list
            fetchPetsData(pagination.current, pagination.pageSize);
            setIsAddModalVisible(false);
            message.success("Pet added successfully!");
        } catch (error) {
            console.error('Error adding pet:', error);
            if (error.response && error.response.data) {
                console.error('Validation errors:', error.response.data);
                const errorMessages = Object.values(error.response.data).flat();
                message.error(`Failed to add pet: ${errorMessages.join(', ')}`);
            } else {
                message.error("Failed to add pet. Please try again.");
            }
        }
    };

    const handleDelete = async (petId) => {
        try {
            await deletePet(petId);
            message.success("Pet deleted successfully.");
            setPets(pets.filter(pet => pet.id !== petId));
        } catch (error) {
            console.error('Error deleting pet:', error);
            message.error("Failed to delete pet.");
        }
    };

    const columns = [
        {
            title: 'Avatar',
            dataIndex: 'id',
            key: 'avatar',
            render: (id) => <Avatar src={avatarUrls[id]} />,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Species',
            dataIndex: 'species',
            key: 'species',
        },
        {
            title: 'Age',
            dataIndex: 'date_of_birth',
            key: 'age',
            render: (date) => calculateAge(date),
        },
        {
            title: 'Color',
            dataIndex: 'color',
            key: 'color',
        },
        {
            title: 'Medical Conditions',
            dataIndex: 'medical_conditions',
            key: 'medical_conditions',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, pet) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => navigate(`/pet-detail/${pet.id}`)}
                        title="View Details"
                    />
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEditClick(pet.id)} />
                    <Popconfirm title="Are you sure to delete this pet?" onConfirm={() => handleDelete(pet.id)}>
                        <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="pet-list-container">
            <Title level={3} className="pet-list-title">Pet List</Title>
            
            <Button type="primary" onClick={handleAddPet} icon={<PlusOutlined />} className="btn-primary pet-list-add-btn">
                Add New Pet
            </Button>

            <Table
                columns={columns}
                dataSource={pets}
                rowKey="id"
                loading={loading}
                pagination={false}
                style={{ borderRadius: '8px', border: '1px solid #000' }}
            />

            <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                style={{ marginTop: '20px', textAlign: 'center' }}
            />

            <Modal
                title="Edit Pet Information"
                open={isEditModalVisible}
                onCancel={handleEditCancel}
                footer={null}
                centered
            >
                <PetForm 
                    initialValues={selectedPet ? {
                        name: selectedPet.name,
                        species: selectedPet.species,
                        date_of_birth: selectedPet.date_of_birth ? moment(selectedPet.date_of_birth) : null,
                        gender: selectedPet.gender,
                        color: selectedPet.color,
                        medical_conditions: selectedPet.medical_conditions,
                        microchip_number: selectedPet.microchip_number,
                    } : {}}
                    onSubmit={handleEditOk}
                />
            </Modal>

            <Modal
                title="Add New Pet"
                open={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                footer={null}
                centered
            >
                <PetForm onSubmit={handleAddOk} />
            </Modal>
        </div>
    );
};

export default PetList;
