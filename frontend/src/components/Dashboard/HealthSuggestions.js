// // HealthSuggestions.js
// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../services/axiosInstance';
// import { Card, Typography, Spin } from 'antd';
import ReactMarkdown from 'react-markdown';

// const { Title } = Typography;

// const HealthSuggestions = () => {
//     const [suggestions, setSuggestions] = useState('');
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchHealthSuggestions = async () => {
//             try {
//                 const response = await axiosInstance.get('/api/pets/health_suggestions');
//                 setSuggestions(response.data); // Assuming the response is in markdown format
//             } catch (error) {
//                 console.error('Failed to fetch health suggestions:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchHealthSuggestions();
//     }, []);

//     if (loading) {
//         return <Spin size="large" />;
//     }

//     return (
//         <Card title="Health Suggestions" style={{ marginTop: '20px', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
//             <Title level={4}>Suggestions for Pet Health:</Title>
//             <ReactMarkdown>{suggestions}</ReactMarkdown>
//         </Card>
//     );
// };

// export default HealthSuggestions;


// ------------ Mock content ------------
// HealthSuggestions.js
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const HealthSuggestions = () => {
    // Mock content for health suggestions
    const suggestions = `
    ## Health Suggestions for Your Pets

    1. **Regular Vet Checkups**: Schedule vet visits at least once a year for routine check-ups.
    
    2. **Balanced Diet**: Ensure your pets are fed a balanced diet appropriate for their age, weight, and health condition.
    
    3. **Exercise**: Make sure your pets get enough exercise daily to maintain a healthy weight.
    
    4. **Grooming**: Regular grooming helps maintain your pet's coat and skin health.
    
    5. **Vaccinations**: Keep up with vaccinations to protect your pets from common diseases.
    
    6. **Dental Care**: Regular dental check-ups and cleanings can prevent dental disease.

    7. **Mental Stimulation**: Engage your pets with toys and activities that stimulate their minds.
    `;

    return (
        <div>
            <Title level={2}>Health Suggestions</Title>
            <ReactMarkdown children={suggestions} />
        </div>
    );
};

export default HealthSuggestions;
