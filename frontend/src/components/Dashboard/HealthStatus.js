// HealthStatus.js
import React, { useEffect, useState, useCallback } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import axiosInstance from '../../services/axiosInstance';
import { Checkbox, Select, Card, Typography, Space, Tabs } from 'antd';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import '../../styles.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const { Option } = Select;
const { Title: AntTitle } = Typography;
const { TabPane } = Tabs;

const petColors = ['#FA7F72', '#3D7EA6', '#FFF0D1', '#795757', '#664343'];

const getPetColor = (index) => petColors[index % petColors.length];

const HealthStatus = ({ selectedPets, filter, setSelectedPets, setFilter }) => {
    const [pets, setPets] = useState([]);
    const [healthData, setHealthData] = useState({});

    const fetchPets = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/api/pets/`);
            setPets(response.data.results);
            setSelectedPets(response.data.results.map(pet => pet.id));
            setFilter('all');
        } catch (error) {
            console.error('Failed to fetch pets:', error);
        }
    }, [setSelectedPets, setFilter]);

    useEffect(() => {
        fetchPets();
    }, [fetchPets]);

    const fetchHealthData = useCallback(async (selectedPetIds, filter) => {
        try {
            const petData = {};
            selectedPetIds.forEach(petId => {
                const pet = pets.find(p => p.id === petId);
                if (pet && pet.health_attributes) {
                    petData[petId] = pet.health_attributes;
                }
            });
        
            setHealthData(petData);
            console.log("Updated Health Data:", petData);
        } catch (error) {
            console.error('Failed to fetch health data:', error);
        }
    }, [pets]);

    useEffect(() => {
        if (selectedPets.length > 0) {
            fetchHealthData(selectedPets, filter);
        }
    }, [selectedPets, filter, fetchHealthData]);

    const handlePetChange = (checkedValues) => {
        setSelectedPets(checkedValues);
    };

    const handleFilterChange = (value) => {
        setFilter(value);
    };

    // Define the createChartData function here
    const createChartData = (attribute) => {
        return {
            labels: [],
            datasets: selectedPets.map((petId, index) => {
                const petData = healthData[petId] || [];
                const records = petData
                    .filter(attr => attr.attribute_name === attribute)
                    .sort((a, b) => new Date(a.measured_at) - new Date(b.measured_at));
    
                return {
                    label: pets.find(pet => pet.id === petId)?.name || '',
                    data: records.map(record => ({
                        x: new Date(record.measured_at).toLocaleDateString(),
                        y: record.value
                    })),
                    borderColor: getPetColor(index),
                    backgroundColor: getPetColor(index),
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                };
            }),
        };
    };

    const createMoodData = () => {
        const moodData = {};
        selectedPets.forEach(petId => {
            const petData = healthData[petId] || [];
            petData.forEach(record => {
                if (record.attribute_name === 'Mood' && record.mood) {
                    moodData[record.mood] = (moodData[record.mood] || 0) + 1;
                }
            });
        });
    
        return {
            labels: Object.keys(moodData),
            datasets: [{
                data: Object.values(moodData),
                backgroundColor: petColors.slice(0, Object.keys(moodData).length),
            }],
        };
    };

    const createCoatConditionData = () => {
        const coatConditionData = {};
        selectedPets.forEach(petId => {
            const petData = healthData[petId] || [];
            petData.forEach(record => {
                if (record.attribute_name === 'Coat Condition' && record.coat_condition) {
                    coatConditionData[record.coat_condition] = (coatConditionData[record.coat_condition] || 0) + 1;
                }
            });
        });

        return {
            labels: Object.keys(coatConditionData),
            datasets: [{
                data: Object.values(coatConditionData),
                backgroundColor: petColors.slice(0, Object.keys(coatConditionData).length),
            }],
        };
    };

    const createActivityLevelData = () => {
        const activityLevelData = {};
        selectedPets.forEach(petId => {
            const petData = healthData[petId] || [];
            petData.forEach(record => {
                if (record.attribute_name === 'Activity Level' && record.value) {
                    activityLevelData[record.value] = (activityLevelData[record.value] || 0) + 1;
                }
            });
        });

        return {
            labels: Object.keys(activityLevelData),
            datasets: [{
                data: Object.values(activityLevelData),
                backgroundColor: petColors.slice(0, Object.keys(activityLevelData).length),
            }],
        };
    };

    return (
        <div className="main-content" style={{ padding: '0px', backgroundColor: '#fff', borderRadius: '12px' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <AntTitle level={1}>Pet Wellness</AntTitle>

                <div className="filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '45%' }}>
                        <AntTitle level={4}>Select Pets</AntTitle>
                        <Checkbox.Group
                            options={pets.map(pet => ({ label: pet.name, value: pet.id }))}
                            onChange={handlePetChange}
                            value={selectedPets}
                        />
                    </div>

                    <div style={{ width: '45%' }}>
                        <AntTitle level={4}>Time Duration</AntTitle>
                        <Select
                            value={filter}
                            onChange={handleFilterChange}
                            style={{ width: '50%', marginLeft: 'auto' }}
                        >
                            <Option value="last7">Last 7 Days</Option>
                            <Option value="last30">Last 30 Days</Option>
                            <Option value="all">Since Birth</Option>
                        </Select>
                    </div>
                </div>

                <Card title="Metrics Overview" className="graph-container">
                    <Tabs defaultActiveKey="weight">
                        <TabPane tab="Weight" key="weight">
                            <Line
                                data={createChartData('Weight')}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'top' },
                                        tooltip: {
                                            callbacks: {
                                                label: function (tooltipItem) {
                                                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw.y}`;
                                                }
                                            }
                                        }
                                    },
                                    scales: { x: { ticks: { maxRotation: 90, minRotation: 45 } }, y: { 
                                        beginAtZero: true,
                                        grid: {
                                            color: "rgba(225, 255, 255, 0.02)", // Grid line color
                                            lineWidth: 2 // Width of the grid lines
                                        }
                                    } },
                                    elements: {
                                        point: {
                                            radius: 5, // Radius of the data points
                                            borderWidth: 1 // Border width of the data points
                                        },
                                        line: {
                                            borderWidth: 3, // Width of the line
                                            tension: 0.8 // Smooth line effect
                                        }
                                    }
                                }}
                            />
                        </TabPane>
                        <TabPane tab="Length" key="length">
                            <Line
                                data={createChartData('Length')}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'top' },
                                        tooltip: {
                                            callbacks: {
                                                label: function (tooltipItem) {
                                                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw.y}`;
                                                }
                                            }
                                        }
                                    },
                                    scales: { x: { ticks: { maxRotation: 90, minRotation: 45 } }, y: { 
                                        beginAtZero: true,
                                        grid: {
                                            color: "rgba(225, 255, 255, 0.02)", // Grid line color
                                            lineWidth: 2 // Width of the grid lines
                                        }
                                    } },
                                    elements: {
                                        point: {
                                            radius: 5, // Radius of the data points
                                            borderWidth: 2 // Border width of the data points
                                        },
                                        line: {
                                            borderWidth: 3, // Width of the line
                                            tension: 0.8 // Smooth line effect
                                        }
                                    }
                                }}
                            />
                        </TabPane>
                    </Tabs>
                </Card>

                <Card title="Health Indicators" className="graph-container" style={{ marginTop: '20px' }}>
                    <Tabs defaultActiveKey="mood">
                        <TabPane tab="Mood" key="mood">
                            {Object.keys(createMoodData().datasets[0].data).length > 0 ? (
                                <Pie
                                    data={createMoodData()}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' },
                                        },
                                    }}
                                />
                            ) : (
                                <p>No data available for Mood.</p>
                            )}
                        </TabPane>
                        <TabPane tab="Coat Condition" key="coat_condition">
                            {Object.keys(createCoatConditionData().datasets[0].data).length > 0 ? (
                                <Pie
                                    data={createCoatConditionData()}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' },
                                        },
                                    }}
                                />
                            ) : (
                                <p>No data available for Coat Condition.</p>
                            )}
                        </TabPane>
                        <TabPane tab="Activity Level" key="activity_level">
                            {Object.keys(createActivityLevelData().datasets[0].data).length > 0 ? (
                                <Pie
                                    data={createActivityLevelData()}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' },
                                        },
                                    }}
                                />
                            ) : (
                                <p>No data available for Activity Level.</p>
                            )}
                        </TabPane>
                    </Tabs>
                </Card>
            </Space>
        </div>
    );
};

export default HealthStatus;