import React, { useState } from 'react';
import { createPet } from '../services/api';

const PetForm = () => {
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const petData = { name, species };
        await createPet(petData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Pet Name" />
            <input type="text" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="Species" />
            <button type="submit">Add Pet</button>
        </form>
    );
};

export default PetForm;
