import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, Tabs, Typography, Avatar, Button, Table, Modal, Form, Input, Select, 
    DatePicker, InputNumber, message, Popconfirm, Space, Tag, Row, Col
} from 'antd';
import { 
    EditOutlined, DeleteOutlined, PlusOutlined, ArrowLeftOutlined, 
    HeartOutlined, CalendarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { 
    fetchPetById, fetchPetAvatar,
    fetchHealthStatus, createHealthStatus, updateHealthStatus, deleteHealthStatus,
    fetchVaccinations, createVaccination, updateVaccination, deleteVaccination
} from '../../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const PetDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Pet data state
    const [pet, setPet] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Health status state with pagination
    const [healthRecords, setHealthRecords] = useState([]);
    const [healthPagination, setHealthPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [healthLoading, setHealthLoading] = useState(false);
    const [healthModalVisible, setHealthModalVisible] = useState(false);
    const [healthForm] = Form.useForm();
    const [editingHealth, setEditingHealth] = useState(null);
    
    // Vaccination state with pagination
    const [vaccinations, setVaccinations] = useState([]);
    const [vaccinationPagination, setVaccinationPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [vaccinationLoading, setVaccinationLoading] = useState(false);
    const [vaccinationModalVisible, setVaccinationModalVisible] = useState(false);
    const [vaccinationForm] = Form.useForm();
    const [editingVaccination, setEditingVaccination] = useState(null);

    // Fetch pet data
    const fetchPetData = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await fetchPetById(id);
            setPet(data);
            
            // Fetch avatar
            try {
                const avatarResponse = await fetchPetAvatar(id);
                const blob = new Blob([avatarResponse.data], { type: avatarResponse.headers['content-type'] });
                const url = URL.createObjectURL(blob);
                setAvatarUrl(url);
            } catch (error) {
                console.error('Error fetching avatar:', error);
            }
        } catch (error) {
            console.error('Error fetching pet:', error);
            message.error('Failed to load pet data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Fetch health records with pagination
    const fetchHealthRecords = useCallback(async (page = 1, pageSize = 10) => {
        try {
            setHealthLoading(true);
            const { data } = await fetchHealthStatus(id, page, pageSize);
            setHealthRecords(data.results || []);
            setHealthPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: data.count || 0
            }));
        } catch (error) {
            console.error('Error fetching health records:', error);
            message.error('Failed to load health records');
        } finally {
            setHealthLoading(false);
        }
    }, [id]);

    // Fetch vaccinations with pagination
    const fetchVaccinationRecords = useCallback(async (page = 1, pageSize = 10) => {
        try {
            setVaccinationLoading(true);
            const { data } = await fetchVaccinations(id, page, pageSize);
            setVaccinations(data.results || []);
            setVaccinationPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: data.count || 0
            }));
        } catch (error) {
            console.error('Error fetching vaccinations:', error);
            message.error('Failed to load vaccinations');
        } finally {
            setVaccinationLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPetData();
        fetchHealthRecords(1, 10);
        fetchVaccinationRecords(1, 10);
    }, [fetchPetData, fetchHealthRecords, fetchVaccinationRecords]);

    // Handle health table pagination change
    const handleHealthTableChange = (pagination) => {
        fetchHealthRecords(pagination.current, pagination.pageSize);
    };

    // Handle vaccination table pagination change
    const handleVaccinationTableChange = (pagination) => {
        fetchVaccinationRecords(pagination.current, pagination.pageSize);
    };

    // Health status management
    const showHealthModal = (record = null) => {
        setEditingHealth(record);
        if (record) {
            healthForm.setFieldsValue({
                ...record,
                measured_at: record.measured_at ? moment(record.measured_at) : moment(),
            });
        } else {
            healthForm.resetFields();
            healthForm.setFieldsValue({ measured_at: moment() });
        }
        setHealthModalVisible(true);
    };

    const handleHealthSubmit = async (values) => {
        try {
            const formattedValues = {
                ...values,
                pet: parseInt(id),
                measured_at: values.measured_at.toISOString(),
            };

            if (editingHealth) {
                await updateHealthStatus(editingHealth.id, formattedValues);
                message.success('Health record updated successfully');
            } else {
                await createHealthStatus(formattedValues);
                message.success('Health record added successfully');
            }

            setHealthModalVisible(false);
            // Refresh current page
            fetchHealthRecords(healthPagination.current, healthPagination.pageSize);
        } catch (error) {
            console.error('Error saving health record:', error);
            message.error('Failed to save health record');
        }
    };

    const handleDeleteHealth = async (recordId) => {
        try {
            await deleteHealthStatus(recordId);
            message.success('Health record deleted successfully');
            // Refresh current page
            fetchHealthRecords(healthPagination.current, healthPagination.pageSize);
        } catch (error) {
            console.error('Error deleting health record:', error);
            message.error('Failed to delete health record');
        }
    };

    // Vaccination management
    const showVaccinationModal = (record = null) => {
        setEditingVaccination(record);
        if (record) {
            vaccinationForm.setFieldsValue({
                ...record,
                schedule_at: record.schedule_at ? moment(record.schedule_at) : null,
                vaccinated_at: record.vaccinated_at ? moment(record.vaccinated_at) : null,
            });
        } else {
            vaccinationForm.resetFields();
        }
        setVaccinationModalVisible(true);
    };

    const handleVaccinationSubmit = async (values) => {
        try {
            const formattedValues = {
                ...values,
                pet: parseInt(id),
                schedule_at: values.schedule_at ? values.schedule_at.format('YYYY-MM-DD') : null,
                vaccinated_at: values.vaccinated_at ? values.vaccinated_at.format('YYYY-MM-DD') : null,
            };

            if (editingVaccination) {
                await updateVaccination(editingVaccination.id, formattedValues);
                message.success('Vaccination updated successfully');
            } else {
                await createVaccination(formattedValues);
                message.success('Vaccination added successfully');
            }

            setVaccinationModalVisible(false);
            // Refresh current page
            fetchVaccinationRecords(vaccinationPagination.current, vaccinationPagination.pageSize);
        } catch (error) {
            console.error('Error saving vaccination:', error);
            message.error('Failed to save vaccination');
        }
    };

    const handleDeleteVaccination = async (recordId) => {
        try {
            await deleteVaccination(recordId);
            message.success('Vaccination deleted successfully');
            // Refresh current page
            fetchVaccinationRecords(vaccinationPagination.current, vaccinationPagination.pageSize);
        } catch (error) {
            console.error('Error deleting vaccination:', error);
            message.error('Failed to delete vaccination');
        }
    };

    // Health status table columns
    const healthColumns = [
        {
            title: 'Attribute',
            dataIndex: 'attribute_name',
            key: 'attribute_name',
        },
        {
            title: 'Value',
            key: 'value',
            render: (_, record) => {
                if (record.attribute_name === 'Mood') return record.mood || '-';
                if (record.attribute_name === 'Coat Condition') return record.coat_condition || '-';
                return record.value ? `${record.value} ${record.unit || ''}` : '-';
            },
        },
        {
            title: 'Measured At',
            dataIndex: 'measured_at',
            key: 'measured_at',
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => showHealthModal(record)}
                    />
                    <Popconfirm
                        title="Are you sure to delete this health record?"
                        onConfirm={() => handleDeleteHealth(record.id)}
                    >
                        <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Vaccination table columns
    const vaccinationColumns = [
        {
            title: 'Vaccination',
            dataIndex: 'vaccination_name',
            key: 'vaccination_name',
        },
        {
            title: 'Status',
            dataIndex: 'vaccination_status',
            key: 'vaccination_status',
            render: (status) => {
                const color = status === 'Completed' ? 'green' : status === 'Pending' ? 'orange' : 'default';
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Scheduled Date',
            dataIndex: 'schedule_at',
            key: 'schedule_at',
            render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-',
        },
        {
            title: 'Completion Date',
            dataIndex: 'vaccinated_at',
            key: 'vaccinated_at',
            render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-',
        },
        {
            title: 'Notes',
            dataIndex: 'vaccination_notes',
            key: 'vaccination_notes',
            render: (notes) => notes || '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => showVaccinationModal(record)}
                    />
                    <Popconfirm
                        title="Are you sure to delete this vaccination?"
                        onConfirm={() => handleDeleteVaccination(record.id)}
                    >
                        <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
    }

    if (!pet) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Pet not found</div>;
    }

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'Unknown';
        const birthDate = moment(dateOfBirth);
        const today = moment();
        return `${today.diff(birthDate, 'years')} years`;
    };

    return (
        <div className="pet-detail-container">
            <div style={{ marginBottom: '20px' }}>
                <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/manage-pets')}
                    style={{ marginBottom: '10px' }}
                >
                    Back to Pet List
                </Button>
            </div>

            {/* Pet Information Card */}
            <Card style={{ marginBottom: '20px' }}>
                <Row gutter={24}>
                    <Col xs={24} sm={8} md={6}>
                        <div style={{ textAlign: 'center' }}>
                            <Avatar 
                                size={120} 
                                src={avatarUrl} 
                                style={{ marginBottom: '16px' }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={16} md={18}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text strong>Name:</Text>
                                <Title level={4} style={{ margin: '4px 0 16px 0' }}>{pet.name}</Title>
                            </Col>
                            <Col span={12}>
                                <Text strong>Species:</Text>
                                <Title level={4} style={{ margin: '4px 0 16px 0' }}>{pet.species}</Title>
                            </Col>
                            <Col span={12}>
                                <Text strong>Age:</Text>
                                <Title level={4} style={{ margin: '4px 0 16px 0' }}>{calculateAge(pet.date_of_birth)}</Title>
                            </Col>
                            <Col span={12}>
                                <Text strong>Gender:</Text>
                                <Title level={4} style={{ margin: '4px 0 16px 0' }}>{pet.gender}</Title>
                            </Col>
                            <Col span={12}>
                                <Text strong>Color:</Text>
                                <Title level={4} style={{ margin: '4px 0 16px 0' }}>{pet.color}</Title>
                            </Col>
                            <Col span={12}>
                                <Text strong>Microchip:</Text>
                                <Title level={4} style={{ margin: '4px 0 16px 0' }}>{pet.microchip_number || 'Not available'}</Title>
                            </Col>
                            <Col span={24}>
                                <Text strong>Medical Conditions:</Text>
                                <Title level={4} style={{ margin: '4px 0 16px 0' }}>{pet.medical_conditions || 'None'}</Title>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            {/* Tabs for Health and Vaccination Management */}
            <Card>
                <Tabs defaultActiveKey="health">
                    <TabPane 
                        tab={
                            <span>
                                <HeartOutlined />
                                Health Status
                            </span>
                        } 
                        key="health"
                    >
                        <div style={{ marginBottom: '16px' }}>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => showHealthModal()}
                            >
                                Add Health Record
                            </Button>
                        </div>
                        <Table
                            columns={healthColumns}
                            dataSource={healthRecords}
                            rowKey="id"
                            loading={healthLoading}
                            pagination={{
                                current: healthPagination.current,
                                pageSize: healthPagination.pageSize,
                                total: healthPagination.total,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} health records`,
                            }}
                            onChange={handleHealthTableChange}
                        />
                    </TabPane>
                    
                    <TabPane 
                        tab={
                            <span>
                                <CalendarOutlined />
                                Vaccinations
                            </span>
                        } 
                        key="vaccinations"
                    >
                        <div style={{ marginBottom: '16px' }}>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => showVaccinationModal()}
                            >
                                Add Vaccination
                            </Button>
                        </div>
                        <Table
                            columns={vaccinationColumns}
                            dataSource={vaccinations}
                            rowKey="id"
                            loading={vaccinationLoading}
                            pagination={{
                                current: vaccinationPagination.current,
                                pageSize: vaccinationPagination.pageSize,
                                total: vaccinationPagination.total,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} vaccinations`,
                            }}
                            onChange={handleVaccinationTableChange}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Health Modal */}
            <Modal
                title={editingHealth ? 'Edit Health Record' : 'Add Health Record'}
                visible={healthModalVisible}
                onCancel={() => setHealthModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={healthForm}
                    onFinish={handleHealthSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        name="attribute_name"
                        label="Attribute"
                        rules={[{ required: true, message: 'Please select an attribute' }]}
                    >
                        <Select placeholder="Select attribute">
                            <Option value="Weight">Weight (kg)</Option>
                            <Option value="Length">Length (cm)</Option>
                            <Option value="Water Intake">Water Intake (ml)</Option>
                            <Option value="Activity Level">Activity Level (minutes)</Option>
                            <Option value="Mood">Mood</Option>
                            <Option value="Bowel Movements">Bowel Movements (times)</Option>
                            <Option value="Urination Frequency">Urination Frequency (times)</Option>
                            <Option value="Coat Condition">Coat Condition</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) =>
                            prevValues.attribute_name !== currentValues.attribute_name
                        }
                    >
                        {({ getFieldValue }) => {
                            const attributeName = getFieldValue('attribute_name');
                            
                            if (attributeName === 'Mood') {
                                return (
                                    <Form.Item
                                        name="mood"
                                        label="Mood"
                                        rules={[{ required: true, message: 'Please select mood' }]}
                                    >
                                        <Select placeholder="Select mood">
                                            <Option value="Normal">Normal</Option>
                                            <Option value="Lethargic">Lethargic</Option>
                                            <Option value="Hyperactive">Hyperactive</Option>
                                            <Option value="Aggressive">Aggressive</Option>
                                            <Option value="Clingy">Clingy</Option>
                                        </Select>
                                    </Form.Item>
                                );
                            }
                            
                            if (attributeName === 'Coat Condition') {
                                return (
                                    <Form.Item
                                        name="coat_condition"
                                        label="Coat Condition"
                                        rules={[{ required: true, message: 'Please select coat condition' }]}
                                    >
                                        <Select placeholder="Select coat condition">
                                            <Option value="Normal">Normal</Option>
                                            <Option value="Shedding">Shedding</Option>
                                            <Option value="Hair Loss">Hair Loss</Option>
                                            <Option value="Dry">Dry</Option>
                                            <Option value="Dull">Dull</Option>
                                        </Select>
                                    </Form.Item>
                                );
                            }
                            
                            return (
                                <Form.Item
                                    name="value"
                                    label="Value"
                                    rules={[{ required: true, message: 'Please enter value' }]}
                                >
                                    <InputNumber 
                                        style={{ width: '100%' }} 
                                        min={0}
                                        step={0.1}
                                        placeholder="Enter value"
                                    />
                                </Form.Item>
                            );
                        }}
                    </Form.Item>

                    <Form.Item
                        name="measured_at"
                        label="Measured At"
                        rules={[{ required: true, message: 'Please select date and time' }]}
                    >
                        <DatePicker 
                            showTime 
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => setHealthModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingHealth ? 'Update' : 'Add'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Vaccination Modal */}
            <Modal
                title={editingVaccination ? 'Edit Vaccination' : 'Add Vaccination'}
                visible={vaccinationModalVisible}
                onCancel={() => setVaccinationModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={vaccinationForm}
                    onFinish={handleVaccinationSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        name="vaccination_name"
                        label="Vaccination Name"
                        rules={[{ required: true, message: 'Please enter vaccination name' }]}
                    >
                        <Input placeholder="e.g., Rabies, DHPP, Bordetella" />
                    </Form.Item>

                    <Form.Item
                        name="vaccination_status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select placeholder="Select status">
                            <Option value="Completed">Completed</Option>
                            <Option value="Pending">Pending</Option>
                            <Option value="Unknown">Unknown</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="schedule_at"
                        label="Scheduled Date"
                        rules={[{ required: true, message: 'Please select scheduled date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="vaccinated_at"
                        label="Completion Date"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="vaccination_notes"
                        label="Notes"
                    >
                        <TextArea 
                            rows={3} 
                            placeholder="Additional notes about the vaccination"
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => setVaccinationModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingVaccination ? 'Update' : 'Add'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PetDetail; 