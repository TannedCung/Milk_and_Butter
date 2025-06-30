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
    const [loading, setLoading] = useState(false);

    const fetchPetsWithHealthData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/pets/`);
            const petsData = response.data.results || response.data;
            
            setPets(petsData);
            setSelectedPets(petsData.map(pet => pet.id));
            setFilter('all');
            
            // Process health data from the pets response
            const healthDataMap = {};
            petsData.forEach(pet => {
                if (pet.health_attributes && pet.health_attributes.length > 0) {
                    healthDataMap[pet.id] = pet.health_attributes;
                }
            });
            
            setHealthData(healthDataMap);
            console.log("Pets with health data:", petsData);
            console.log("Processed health data:", healthDataMap);
        } catch (error) {
            console.error('Failed to fetch pets with health data:', error);
        } finally {
            setLoading(false);
        }
    }, [setSelectedPets, setFilter]);

    useEffect(() => {
        fetchPetsWithHealthData();
    }, [fetchPetsWithHealthData]);

    // Filter health data based on time duration
    const getFilteredHealthData = useCallback((petHealthData, filterType) => {
        if (!petHealthData || petHealthData.length === 0) return [];
        
        const now = new Date();
        let filterDate;
        
        switch (filterType) {
            case 'last7':
                filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'last30':
                filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                return petHealthData;
        }
        
        return petHealthData.filter(record => 
            new Date(record.measured_at || record.created_at) >= filterDate
        );
    }, []);

    const handlePetChange = (checkedValues) => {
        setSelectedPets(checkedValues);
    };

    const handleFilterChange = (value) => {
        setFilter(value);
    };

    // Define the createChartData function with proper data filtering
    const createChartData = (attribute) => {
        const allLabels = new Set();
        
        const datasets = selectedPets.map((petId, index) => {
            const petData = healthData[petId] || [];
            const filteredData = getFilteredHealthData(petData, filter);
            const records = filteredData
                .filter(attr => attr.attribute_name === attribute && attr.value !== null && attr.value !== undefined)
                .sort((a, b) => new Date(a.measured_at || a.created_at) - new Date(b.measured_at || b.created_at));
            
            // Add labels to the set
            records.forEach(record => {
                const date = new Date(record.measured_at || record.created_at).toLocaleDateString();
                allLabels.add(date);
            });

            return {
                label: pets.find(pet => pet.id === petId)?.name || `Pet ${petId}`,
                data: records.map(record => ({
                    x: new Date(record.measured_at || record.created_at).toLocaleDateString(),
                    y: record.value
                })),
                borderColor: getPetColor(index),
                backgroundColor: getPetColor(index),
                borderWidth: 2,
                fill: false,
                tension: 0.1,
            };
        });

        return {
            labels: Array.from(allLabels).sort(),
            datasets: datasets.filter(dataset => dataset.data.length > 0), // Only include datasets with data
        };
    };

    const createMoodData = () => {
        const moodData = {};
        selectedPets.forEach(petId => {
            const petData = healthData[petId] || [];
            const filteredData = getFilteredHealthData(petData, filter);
            filteredData.forEach(record => {
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
            const filteredData = getFilteredHealthData(petData, filter);
            filteredData.forEach(record => {
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
            const filteredData = getFilteredHealthData(petData, filter);
            filteredData.forEach(record => {
                if (record.attribute_name === 'Activity Level' && record.value) {
                    const activityRange = record.value < 60 ? 'Low (< 60 min)' : 
                                        record.value < 120 ? 'Medium (60-120 min)' : 
                                        'High (> 120 min)';
                    activityLevelData[activityRange] = (activityLevelData[activityRange] || 0) + 1;
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

    // Helper function to check if chart has data
    const hasChartData = (chartData) => {
        return chartData.datasets && chartData.datasets.some(dataset => 
            dataset.data && dataset.data.length > 0
        );
    };

    const hasPieData = (pieData) => {
        return pieData.datasets && pieData.datasets[0] && 
               pieData.datasets[0].data && pieData.datasets[0].data.length > 0;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading health data...</div>;
    }

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
                            {hasChartData(createChartData('Weight')) ? (
                                <Line
                                    data={createChartData('Weight')}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'top' },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (tooltipItem) {
                                                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw.y} kg`;
                                                    }
                                                }
                                            }
                                        },
                                        scales: { 
                                            x: { 
                                                ticks: { maxRotation: 90, minRotation: 45 },
                                                title: { display: true, text: 'Date' }
                                            }, 
                                            y: { 
                                                beginAtZero: false,
                                                title: { display: true, text: 'Weight (kg)' },
                                                grid: {
                                                    color: "rgba(225, 255, 255, 0.02)",
                                                    lineWidth: 2
                                                }
                                            } 
                                        },
                                        elements: {
                                            point: {
                                                radius: 5,
                                                borderWidth: 1
                                            },
                                            line: {
                                                borderWidth: 3,
                                                tension: 0.1
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    <p>No weight data available for the selected pets and time period.</p>
                                </div>
                            )}
                        </TabPane>
                        <TabPane tab="Length" key="length">
                            {hasChartData(createChartData('Length')) ? (
                                <Line
                                    data={createChartData('Length')}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'top' },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (tooltipItem) {
                                                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw.y} cm`;
                                                    }
                                                }
                                            }
                                        },
                                        scales: { 
                                            x: { 
                                                ticks: { maxRotation: 90, minRotation: 45 },
                                                title: { display: true, text: 'Date' }
                                            }, 
                                            y: { 
                                                beginAtZero: false,
                                                title: { display: true, text: 'Length (cm)' },
                                                grid: {
                                                    color: "rgba(225, 255, 255, 0.02)",
                                                    lineWidth: 2
                                                }
                                            } 
                                        },
                                        elements: {
                                            point: {
                                                radius: 5,
                                                borderWidth: 2
                                            },
                                            line: {
                                                borderWidth: 3,
                                                tension: 0.1
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    <p>No length data available for the selected pets and time period.</p>
                                </div>
                            )}
                        </TabPane>
                    </Tabs>
                </Card>

                <Card title="Health Indicators" className="graph-container" style={{ marginTop: '20px' }}>
                    <Tabs defaultActiveKey="mood">
                        <TabPane tab="Mood" key="mood">
                            {hasPieData(createMoodData()) ? (
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
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    <p>No mood data available for the selected pets and time period.</p>
                                </div>
                            )}
                        </TabPane>
                        <TabPane tab="Coat Condition" key="coat_condition">
                            {hasPieData(createCoatConditionData()) ? (
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
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    <p>No coat condition data available for the selected pets and time period.</p>
                                </div>
                            )}
                        </TabPane>
                        <TabPane tab="Activity Level" key="activity_level">
                            {hasPieData(createActivityLevelData()) ? (
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
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    <p>No activity data available for the selected pets and time period.</p>
                                </div>
                            )}
                        </TabPane>
                    </Tabs>
                </Card>
            </Space>
        </div>
    );
};

export default HealthStatus;