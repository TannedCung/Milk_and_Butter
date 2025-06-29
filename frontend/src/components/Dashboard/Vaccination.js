import React, { useEffect, useState, useCallback } from 'react';
import { Table, Typography } from 'antd';
import axiosInstance from '../../services/axiosInstance';
import Calendar from 'react-calendar'; // Import the Calendar component
import './Calendar.css';

const { Title } = Typography;

const Vaccination = ({ selectedPets }) => {
    const [vaccinations, setVaccinations] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(new Date()); // State for selected date

    const fetchVaccinations = useCallback(async (page, pageSize) => {
        setLoading(true);
        try {
            const endpoint = `/api/vaccination/?page=${page}&page_size=${pageSize}`;
            const response = await axiosInstance.get(endpoint);
            setVaccinations(response.data.results);
            setPagination(prev => ({
                ...prev,
                total: response.data.count,
                current: page,
            }));
        } catch (error) {
            console.error('Error fetching vaccinations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVaccinations(1, 5); // Reset to first page when selectedPets changes
    }, [fetchVaccinations, selectedPets]);

    const handleTableChange = (paginationInfo) => {
        setPagination(prev => ({
            ...prev,
            current: paginationInfo.current,
            pageSize: paginationInfo.pageSize,
        }));
        fetchVaccinations(paginationInfo.current, paginationInfo.pageSize);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'vaccination_name',
            key: 'vaccination_name',
        },
        {
            title: 'Status',
            dataIndex: 'vaccination_status',
            key: 'vaccination_status',
            render: (text) => <span>{text || 'Unknown'}</span>,
        },
        {
            title: 'Scheduled Date',
            dataIndex: 'schedule_at',
            key: 'schedule_at',
            render: (date) => <span>{date ? new Date(date).toLocaleDateString() : 'Not Scheduled'}</span>,
        },
        {
            title: 'Completion Date',
            dataIndex: 'vaccinated_at',
            key: 'vaccinated_at',
            render: (date) => <span>{date ? new Date(date).toLocaleDateString() : 'Pending'}</span>,
        },
        {
            title: 'Notes',
            dataIndex: 'vaccination_notes',
            key: 'vaccination_notes',
            render: (text) => <span>{text || '-'}</span>,
        },
    ];

    // Get scheduled vaccinations for the selected date
    const getScheduledVaccinationsForDate = (date) => {
        return vaccinations.filter(vaccination => {
            const scheduledDate = new Date(vaccination.schedule_at);
            return scheduledDate.toDateString() === date.toDateString();
        });
    };

    return (
        <div style={{ padding: '0px', backgroundColor: '#fff', borderRadius: '12px' }}>
            <Title level={2}>Vaccinations Schedule</Title>

            <Table
                columns={columns}
                dataSource={vaccinations}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                }}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }} // Adjust table width to fit container
                style={{ width: '100%' }}
            />

            {/* Calendar Component */}
            <div style={{ padding: '0px', backgroundColor: '#fff', borderRadius: '12px' }}>
                <Calendar
                    onChange={setDate}
                    value={date}
                />
                <div style={{ marginTop: '10px' }}>
                    <h3>Scheduled Vaccinations on {date.toLocaleDateString()}:</h3>
                    {getScheduledVaccinationsForDate(date).length > 0 ? (
                        <ul>
                            {getScheduledVaccinationsForDate(date).map(vaccination => (
                                <li key={vaccination.id}>
                                    {vaccination.vaccination_name} - {vaccination.vaccination_status || 'Unknown'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No vaccinations scheduled for this date.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Vaccination;
