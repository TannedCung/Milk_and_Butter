import React, { useEffect, useState } from 'react';
import { fetchPets } from '../services/api';

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
        <ul>
            {pets.map((pet) => (
                <li key={pet.id}>{pet.name} - {pet.species}</li>
            ))}
        </ul>
    );
};

export default PetList;
