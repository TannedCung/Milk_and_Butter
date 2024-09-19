import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axiosInstance from '../services/axiosInstance';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles.css'; // Import the stylesheet

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const pastelColors = [
    '#FA7F72',
    '#3D7EA6',
    '#FFF0D1',
    '#795757',
    '#664343',
    '#3B3030',
    '#C96868',
    '#FADFA1',
    '#FFF4EA',
    '#7EACB5',
    '#C0C78C',
    '#A6B37D',
    '#B99470',
    '#E7CCCC',
    '#254336',


];

const getPetColor = (index) => {
    return pastelColors[index % pastelColors.length];
};

const getPetBorderColor = (index) => {
    return pastelColors[index % pastelColors.length];
};

const Dashboard = () => {
    const [selectedPets, setSelectedPets] = useState([]);
    const [filter, setFilter] = useState('last7');
    const [pets, setPets] = useState([]);
    const [healthData, setHealthData] = useState({});

    useEffect(() => {
        fetchPets();
    }, []);

    useEffect(() => {
        if (selectedPets.length > 0) {
            fetchHealthStatus(selectedPets, filter);
        }
    }, [selectedPets, filter]);

    const fetchPets = async () => {
        try {
            const response = await axiosInstance.get(`/api/pets/`);
            setPets(response.data);
        } catch (error) {
            console.error('Failed to fetch pets:', error);
        }
    };

    const fetchHealthStatus = async (pets, filter) => {
        try {
            const response = await axiosInstance.get(`/api/dashboard/overview/`, {
                params: { pets: pets.join(','), filter }
            });
            console.log('Health data response:', response.data); // For debugging
            setHealthData(response.data);
        } catch (error) {
            console.error('Failed to fetch health data:', error);
        }
    };

    const handlePetChange = (event) => {
        const petId = event.target.value;
        setSelectedPets(prevSelectedPets => 
            prevSelectedPets.includes(petId)
                ? prevSelectedPets.filter(id => id !== petId)
                : [...prevSelectedPets, petId]
        );
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    // Prepare chart data for each attribute type
    const createChartData = (attribute) => {
        return {
            labels: [], // Populate this with dates
            datasets: selectedPets.flatMap((petId, index) => {
                const petData = healthData[petId] || {};
                console.log(`petData for ${petId}:`, petData); // For debugging

                const recordsArray = petData[attribute] || [];
                
                return {
                    label: `${petData.pet_name}`,
                    data: recordsArray.map(record => ({
                        x: new Date(record.measured_at).toLocaleDateString(),
                        y: record.value
                    })),
                    borderColor: getPetBorderColor(index),
                    backgroundColor: getPetColor(index),
                    borderWidth: 2,
                    fill: false, // Set to false to avoid filling area under line
                    tension: 0.1, // Makes the line smooth
                };
            }),
        };
    };

    // To ensure that labels are correctly populated
    const allDates = selectedPets.flatMap(petId => {
        const petData = healthData[petId] || {};
        return Object.values(petData).flatMap(records => 
            Array.isArray(records) ? records.map(record => new Date(record.measured_at).toLocaleDateString()) : []
        );
    });
    const uniqueDates = [...new Set(allDates)]; // Unique dates for x-axis labels

    return (
        <div>
            <h1>Pet Health Dashboard</h1>

            {/* Checkboxes for Selecting Pets */}
            <div>
                {pets.map((pet) => (
                    <label key={pet.id}>
                        <input
                            type="checkbox"
                            value={pet.id}
                            checked={selectedPets.includes(pet.id)}
                            onChange={handlePetChange}
                        />
                        {pet.name}
                    </label>
                ))}
            </div>

            {/* Selection Box for Time Duration */}
            <div>
                <label>
                    <select value={filter} onChange={handleFilterChange}>
                        <option value="last7">Last 7 Days</option>
                        <option value="last30">Last 30 Days</option>
                        <option value="all">Since Birth</option>
                    </select>
                </label>
            </div>

            {/* Line Charts for Each Attribute */}
            <div>
                {['weight', 'length'].map(attribute => (
                    <div key={attribute}>
                        <h2>{attribute.charAt(0).toUpperCase() + attribute.slice(1)}</h2>
                        <Line data={{ ...createChartData(attribute), labels: uniqueDates }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
