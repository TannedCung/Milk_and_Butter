// Dashboard.js
import React, { useState } from 'react';
import HealthStatus from './HealthStatus';
import Vaccination from './Vaccination';
import HealthSuggestions from './HealthSuggestions'; // Import the new HealthSuggestions component
import { Card } from 'antd';

const Dashboard = () => {
    const [selectedPets, setSelectedPets] = useState([]);
    const [filter, setFilter] = useState('last7');

    return (
        <div className="dashboard" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '2 1 50%', minWidth: '300px' }}>
                <Card>
                    <HealthStatus
                        selectedPets={selectedPets}
                        setSelectedPets={setSelectedPets}
                        filter={filter}
                        setFilter={setFilter}
                    />
                </Card>
            </div>
            <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
                <Card>
                    <Vaccination selectedPets={selectedPets} />
                </Card>
            </div>
            <div style={{ flex: '1 2 35%%', minWidth: '100px' }}>
                <Card>
                    <HealthSuggestions />
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
