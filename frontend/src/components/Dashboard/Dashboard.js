// Dashboard.js
import React, { useState } from 'react';
import HealthStatus from './HealthStatus';
import { Row, Col } from 'antd';

const Dashboard = () => {
    const [selectedPets, setSelectedPets] = useState([]);
    const [filter, setFilter] = useState('last7');

    return (
        <div className="dashboard" >
            <Row gutter={16}>
                <Col span={16}>
                    <HealthStatus
                        selectedPets={selectedPets}
                        setSelectedPets={setSelectedPets}
                        filter={filter}
                        setFilter={setFilter}
                    />
                </Col>
                <Col span={8}>
                    {/* Placeholder for other components */}
                    <div className="other-components">
                        <h2>Additional Components Area</h2>
                        {/* Add your other components here */}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
