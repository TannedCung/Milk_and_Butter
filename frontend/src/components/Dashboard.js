import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axiosInstance from '../services/axiosInstance';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Checkbox, Select, Card, Typography, Space } from 'antd';
import '../styles.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { Option } = Select;
const { Title: AntTitle } = Typography;

// Define a color palette for pets
const petColors = [
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

const getPetColor = (index) => petColors[index % petColors.length];

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

    const handlePetChange = (checkedValues) => {
        setSelectedPets(checkedValues);
    };

    const handleFilterChange = (value) => {
        setFilter(value);
    };

    const createChartData = (attribute) => {
        return {
            labels: [], // Populate this with dates
            datasets: selectedPets.map((petId, index) => {
                const petData = healthData[petId] || {};
                console.log(`petData for ${petId}:`, petData); // For debugging

                const recordsArray = petData[attribute] || [];
                
                return {
                    label: `${petData.pet_name}`,
                    data: recordsArray.map(record => ({
                        x: new Date(record.measured_at).toLocaleDateString(),
                        y: record.value
                    })),
                    borderColor: getPetColor(index),
                    backgroundColor: getPetColor(index),
                    borderWidth: 2,
                    fill: false, // No fill
                    tension: 0.1, // Makes the line smooth
                };
            }),
        };
    };

    const allDates = selectedPets.flatMap(petId => {
        const petData = healthData[petId] || {};
        return Object.values(petData).flatMap(records => 
            Array.isArray(records) ? records.map(record => new Date(record.measured_at).toLocaleDateString()) : []
        );
    });
    const uniqueDates = [...new Set(allDates)]; // Unique dates for x-axis labels

    return (
        <div className="main-content">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <AntTitle level={1}>Pet Health Dashboard</AntTitle>

                <div className="filters">
                    <div>
                        <AntTitle level={4}>Select Pets</AntTitle>
                        <Checkbox.Group
                            options={pets.map(pet => ({ label: pet.name, value: pet.id }))}
                            onChange={handlePetChange}
                            value={selectedPets}
                        />
                    </div>

                    <div>
                        <AntTitle level={4}>Time Duration</AntTitle>
                        <Select
                            value={filter}
                            onChange={handleFilterChange}
                            style={{ width: '100%' }}
                        >
                            <Option value="last7">Last 7 Days</Option>
                            <Option value="last30">Last 30 Days</Option>
                            <Option value="all">Since Birth</Option>
                        </Select>
                    </div>
                </div>

                <div className="charts">
                    {['weight', 'length'].map(attribute => (
                        <Card
                            key={attribute}
                            title={attribute.charAt(0).toUpperCase() + attribute.slice(1)}
                            className="graph-container"
                        >
                            <Line
                                data={{ ...createChartData(attribute), labels: uniqueDates }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(tooltipItem) {
                                                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw.y}`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: {
                                            ticks: {
                                                maxRotation: 90,
                                                minRotation: 45,
                                            },
                                        },
                                        y: {
                                            beginAtZero: true,
                                        },
                                    },
                                }}
                            />
                        </Card>
                    ))}
                </div>
            </Space>
        </div>
    );
};

export default Dashboard;
