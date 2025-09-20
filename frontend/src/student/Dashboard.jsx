import React from 'react';
import { Layout, Card, Row, Col, Typography, Button, Space, Avatar, Dropdown } from 'antd';
import { 
  BookOutlined, 
  FileTextOutlined, 
  TrophyOutlined, 
  LogoutOutlined,
  UserOutlined,
  DownOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser; // Get current user from Firebase
  const displayName = user?.displayName || 'Student';

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
            EvanAI
          </Title>
          
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <Button type="text" style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center' }}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>Hi, {displayName}</span>
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
            Welcome back, {displayName}! 👋
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Ready to continue your learning journey with AI-powered feedback?
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
                  background: 'linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <BookOutlined style={{ fontSize: '24px', color: '#FFFFFF' }} />
                </div>
                <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Current Assignments</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  View and work on your assignments with AI assistance
                </Text>
                <Button 
                  type="primary" 
                  style={{
                    background: 'linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    marginTop: '16px'
                  }}
                >
                  View Assignments
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
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <FileTextOutlined style={{ fontSize: '24px', color: '#FFFFFF' }} />
                </div>
                <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>My Submissions</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  Review your submitted work and AI feedback
                </Text>
                <Button 
                  type="primary" 
                  style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    marginTop: '16px'
                  }}
                >
                  View Submissions
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
                  background: 'linear-gradient(135deg, #A8FF78 0%, #78FFD6 100%)',
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <TrophyOutlined style={{ fontSize: '24px', color: '#1F2937' }} />
                </div>
                <Title level={4} style={{ color: '#FFFFFF', margin: 0 }}>Performance</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  Track your progress and improvement over time
                </Text>
                <Button 
                  type="primary" 
                  style={{
                    background: 'linear-gradient(135deg, #A8FF78 0%, #78FFD6 100%)',
                    border: 'none',
                    color: '#1F2937',
                    borderRadius: '8px',
                    marginTop: '16px'
                  }}
                >
                  View Performance
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default StudentDashboard;