import React from 'react';
import { Layout, Card, Row, Col, Typography, Button, Space, Avatar, Dropdown } from 'antd';
import { 
  PlusOutlined, 
  TeamOutlined, 
  FileSearchOutlined, 
  LogoutOutlined,
  UserOutlined,
  DownOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser; // Get current user from Firebase
  const displayName = user?.displayName || 'Professor';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Header style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1F2937 100%)', 
        padding: '0 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          height: '100%'
        }}>
          <Title level={3} style={{ 
            margin: 0, 
            color: '#00FFD1',
            background: 'linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            EvanAI - Faculty Portal
          </Title>
          
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <Button type="text" style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center' }}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>Welcome, {displayName}</span>
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        {/* Welcome Message */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(114, 46, 209, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%)',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Title level={2} style={{ color: '#FFFFFF', margin: 0 }}>
            Good to see you, {displayName}! 🎓
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Manage your courses and leverage AI to enhance student learning
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card 
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <PlusOutlined style={{ fontSize: '24px', color: '#FFFFFF' }} />
                </div>
                <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Create Assignment</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  Create AI-powered assignments for your students
                </Text>
                <Button 
                  type="primary" 
                  style={{
                    background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    marginTop: '16px'
                  }}
                >
                  Create New
                </Button>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card 
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #a0d911 100%)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <TeamOutlined style={{ fontSize: '24px', color: '#FFFFFF' }} />
                </div>
                <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Student Management</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  Manage your students and monitor their progress
                </Text>
                <Button 
                  type="primary" 
                  style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #a0d911 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    marginTop: '16px'
                  }}
                >
                  Manage Students
                </Button>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card 
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #faad14 0%, #fadb14 100%)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <FileSearchOutlined style={{ fontSize: '24px', color: '#1F2937' }} />
                </div>
                <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Grade Submissions</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  Review and grade student submissions with AI assistance
                </Text>
                <Button 
                  type="primary" 
                  style={{
                    background: 'linear-gradient(135deg, #faad14 0%, #fadb14 100%)',
                    border: 'none',
                    color: '#1F2937',
                    borderRadius: '8px',
                    marginTop: '16px'
                  }}
                >
                  Grade Work
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default FacultyDashboard;