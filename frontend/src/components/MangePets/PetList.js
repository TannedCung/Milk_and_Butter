import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchPets, fetchPetById, updatePet, fetchPetAvatar } from '../../services/api';
import { List, Typography, Avatar, Modal, Form, Input, Button } from 'antd';

const { Title } = Typography;

const PetList = () => {
    const [pets, setPets] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [avatarUrls, setAvatarUrls] = useState({});
    const isMounted = useRef(true);
    const avatarUrlsRef = useRef(avatarUrls);

    useEffect(() => {
        avatarUrlsRef.current = avatarUrls;
    }, [avatarUrls]);

    const cleanupAvatarUrls = useCallback(() => {
        Object.values(avatarUrlsRef.current).forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
    }, []);

    const fetchPetsData = useCallback(async () => {
        if (!isMounted.current) return;
        
        console.log('Fetching pets');
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
            cleanupAvatarUrls();
        };
    }, [fetchPetsData, cleanupAvatarUrls]);

    const handlePetClick = async (petId) => {
        try {
            const { data } = await fetchPetById(petId);
            setSelectedPet(data);
            setIsModalVisible(true);
        } catch (error) {
            console.error('Error fetching pet details:', error);
        }
    };

    const handleOk = async (values) => {
        try {
            await updatePet(selectedPet.id, values);
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

    return (
        <div className="pet-list-container" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Title level={3} style={{ color: '#000', marginBottom: '20px' }}>Pet List</Title>
            <List
                itemLayout="horizontal"
                dataSource={pets}
                renderItem={pet => (
                    <List.Item onClick={() => handlePetClick(pet.id)} style={{ cursor: 'pointer' }}>
                        <List.Item.Meta
                            avatar={<Avatar src={avatarUrls[pet.id]} />}
                            title={<span style={{ color: '#000' }}>{pet.name}</span>}
                            description={<span style={{ color: '#000' }}>{pet.species}</span>}
                        />
                    </List.Item>
                )}
                style={{ borderRadius: '8px', border: '1px solid #000' }}
            />

            <Modal
                title="Edit Pet Information"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                {selectedPet && (
                    <Form
                        layout="vertical"
                        initialValues={{
                            name: selectedPet.name,
                            species: selectedPet.species,
                        }}
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
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Update
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default PetList;