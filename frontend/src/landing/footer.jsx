import React from "react";
import { Layout, Row, Col, Typography, Space, Button } from "antd";
import {
  LinkedinOutlined,
  TwitterOutlined,
  GithubOutlined,
  MailOutlined,
  RocketOutlined,
  CodeOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Footer } = Layout;
const { Title, Text } = Typography;

const FooterSection = () => {
  const socialLinks = [
    {
      icon: <LinkedinOutlined />,
      url: "https://linkedin.com/company/civicgpt",
      color: "#0A66C2",
    },
    {
      icon: <TwitterOutlined />,
      url: "https://twitter.com/civicgpt",
      color: "#1DA1F2",
    },
    {
      icon: <GithubOutlined />,
      url: "https://github.com/civicgpt",
      color: "#000000",
    },
    {
      icon: <MailOutlined />,
      url: "mailto:support@civicgpt.com",
      color: "#FFB703",
    },
  ];

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navigateToLogin = () => {
    // This would typically use React Router navigation
    window.location.href = "/login";
  };

  return (
    <Footer
      style={{
        background: "linear-gradient(135deg, #1F2937 0%, #0f172a 100%)",
        color: "#E0E0E0",
        padding: "80px 20px 30px",
        borderTop: "1px solid rgba(0, 255, 209, 0.1)",
      }}
    >
      <Row justify="space-between" gutter={[48, 48]}>
        <Col xs={24} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Space direction="vertical" size="middle">
              <Title
                level={3}
                style={{
                  color: "#00FFD1",
                  fontWeight: 700,
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <RocketOutlined />
                CivicGPT
              </Title>
              <Text style={{ color: "#E0E0E0", lineHeight: 1.6 }}>
                Your AI-powered tax assistant that simplifies complex government policies. 
                Upload your payslip and tax documents to get personalized tax saving advice 
                in simple language you can understand.
              </Text>
              <Space size="middle" style={{ marginTop: 16 }}>
                {socialLinks.map((social, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="text"
                      href={social.url}
                      target="_blank"
                      icon={social.icon}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 45,
                        height: 45,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        border: `1px solid ${social.color}30`,
                      }}
                    />
                  </motion.div>
                ))}
              </Space>
            </Space>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Title level={4} style={{ color: "#00FFD1", fontWeight: 600, marginBottom: 20 }}>
              <CodeOutlined style={{ marginRight: 10 }} />
              Quick Links
            </Title>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              {[
                { label: "Home", id: "home" },
                { label: "About", id: "about" },
                { label: "Contact", id: "contact" },
              ].map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    type="link"
                    onClick={() => scrollToSection(item.id)}
                    style={{
                      color: "#E0E0E0",
                      padding: "8px 0",
                      height: "auto",
                      textAlign: "left",
                      display: "block",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#00FFD1")}
                    onMouseLeave={(e) => (e.target.style.color = "#E0E0E0")}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ marginTop: 10 }}
              >
                <Button
                  type="primary"
                  onClick={navigateToLogin}
                  style={{
                    background: "linear-gradient(90deg, #00FFD1 0%, #3A7BD5 100%)",
                    color: "#1F2937",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 6,
                    marginTop: 10,
                  }}
                >
                  Get Started
                </Button>
              </motion.div>
            </Space>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Title level={4} style={{ color: "#00FFD1", fontWeight: 600, marginBottom: 20 }}>
              <TeamOutlined style={{ marginRight: 10 }} />
              Start Saving Tax
            </Title>
            <Space direction="vertical" size="middle">
              <Text style={{ color: "#E0E0E0" }}>
                Ready to understand your taxes better and save money legally?
              </Text>
              <Space>
                <Button
                  type="primary"
                  size="large"
                  style={{
                    background: "linear-gradient(90deg, #00FFD1 0%, #3A7BD5 100%)",
                    color: "#1F2937",
                    fontWeight: 600,
                    border: "none",
                  }}
                  onClick={navigateToLogin}
                >
                  Upload Documents
                </Button>
                <Button
                  size="large"
                  style={{
                    background: "transparent",
                    color: "#00FFD1",
                    borderColor: "#00FFD1",
                    fontWeight: 500,
                  }}
                  onClick={navigateToLogin}
                >
                  See Demo
                </Button>
              </Space>
            </Space>
          </motion.div>
        </Col>
      </Row>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          marginTop: 60,
          borderTop: "1px solid rgba(0, 255, 209, 0.2)",
          paddingTop: 24,
          textAlign: "center",
          color: "#999",
          fontSize: "0.9rem",
        }}
      >
        © {new Date().getFullYear()} CivicGPT. All rights reservedd.
      </motion.div>
    </Footer>
  );
};

export default FooterSection;