import React, { useEffect, useState } from 'react';
import { fetchPets } from '../../services/api';
import { List, Typography, Avatar } from 'antd';

const { Title } = Typography;

const PetList = () => {
    const [pets, setPets] = useState([]);

    useEffect(() => {
        const getPets = async () => {
            const { data } = await fetchPets();
            setPets(data);
        };
        getPets();
    }, []);

    return (
        <div className="pet-list-container" style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Title level={3} style={{ color: '#000', marginBottom: '20px' }}>Pet List</Title>
            <List
                itemLayout="horizontal"
                dataSource={pets}
                renderItem={pet => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={pet.avatar} />}
                            title={<span style={{ color: '#000' }}>{pet.name}</span>}
                            description={<span style={{ color: '#000' }}>{pet.species}</span>}
                        />
                    </List.Item>
                )}
                style={{ borderRadius: '8px', border: '1px solid #000' }}
            />
        </div>
    );
};

export default PetList;
