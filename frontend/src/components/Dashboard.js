import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axiosInstance from '../services/axiosInstance';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles.css'; // Import the stylesheet

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

    // Prepare chart data for all selected pets
    const chartData = {
        labels: [], // Populate this with dates
        datasets: selectedPets.flatMap(petId => {
            const petData = healthData[petId] || {};
            console.log('petData:', petData); // For debugging

            return Object.entries(petData).flatMap(([attribute, records]) => {
                if (attribute === 'pet_name') return []; // Skip pet_name attribute

                const recordsArray = Array.isArray(records) ? records : [];
                
                return {
                    label: `${petData.pet_name} - ${attribute}`,
                    data: recordsArray.map(record => ({
                        x: new Date(record.measured_at).toLocaleDateString(),
                        y: record.value
                    })),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1, // Makes the line smooth
                };
            });
        }),
    };

    // To ensure that labels are correctly populated
    if (selectedPets.length > 0) {
        const allDates = selectedPets.flatMap(petId => {
            const petData = healthData[petId] || {};
            return Object.values(petData).flatMap(records => 
                Array.isArray(records) ? records.map(record => new Date(record.measured_at).toLocaleDateString()) : []
            );
        });
        chartData.labels = [...new Set(allDates)]; // Unique dates for x-axis labels
    }

    console.log('Chart data:', chartData); // For debugging

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

            {/* Line Chart for Health Status */}
            {selectedPets.length > 0 && (
                <Line data={chartData} />
            )}
        </div>
    );
};

export default Dashboard;
