import React from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Divider,
  Space,
  message,
} from "antd";
import { motion } from "framer-motion";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Adjust the path to your firebase config

const { Title, Text, Paragraph } = Typography;

const Contact = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Add a new document with a generated id
      const docRef = await addDoc(collection(db, "contactSubmissions"), {
        ...values,
        createdAt: serverTimestamp(),
        status: "new",
      });
      
      console.log("Document written with ID: ", docRef.id);
      messageApi.success("Message sent successfully! We'll get back to you soon.");
      form.resetFields();
    } catch (error) {
      console.error("Error adding document: ", error);
      messageApi.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: <MailOutlined style={{ fontSize: 24, color: "#00FFD1" }} />,
      title: "Email Us",
      content: "support@evalai.com",
      action: "mailto:support@evalai.com",
    },
    {
      icon: <PhoneOutlined style={{ fontSize: 24, color: "#00FFD1" }} />,
      title: "Call Us",
      content: "+1 (555) 123-EDU1",
      action: "tel:+15551233831",
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: 24, color: "#00FFD1" }} />,
      title: "Visit Us",
      content: "456 Education Hub, San Francisco, CA",
      action: "https://maps.google.com",
    },
  ];

  const socialLinks = [
    {
      icon: <LinkedinOutlined style={{ fontSize: 20 }} />,
      url: "https://linkedin.com/company/evalai",
      color: "#0A66C2",
    },
    {
      icon: <TwitterOutlined style={{ fontSize: 20 }} />,
      url: "https://twitter.com/evalai",
      color: "#1DA1F2",
    },
    {
      icon: <GithubOutlined style={{ fontSize: 20 }} />,
      url: "https://github.com/evalai",
      color: "#333",
    },
  ];

  return (
    <>
      {contextHolder}
      <motion.div
        id="contact"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)",
        }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ width: "100%", maxWidth: "1200px" }}
        >
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Text
                style={{
                  color: "#00FFD1",
                  fontSize: "1rem",
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 16,
                  display: "block",
                }}
              >
                GET IN TOUCH
              </Text>
            </motion.div>
            <Title
              level={2}
              style={{
                color: "#1F2937",
                fontWeight: 800,
                marginBottom: 16,
                fontSize: "2.8rem",
              }}
            >
              Let's Transform Education Together
            </Title>
            <Text
              style={{
                display: "block",
                textAlign: "center",
                color: "#4A5568",
                fontSize: "1.1rem",
                maxWidth: 600,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Ready to revolutionize how you evaluate projects? Our team is here to help you implement AI-powered assessment in your institution.
            </Text>
          </div>

          <Row gutter={[48, 48]} justify="center">
            <Col xs={24} lg={12}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                style={{ height: "100%" }}
              >
                <Card
                  style={{
                    borderRadius: 16,
                    border: "none",
                    height: "100%",
                    background: "#FFFFFF",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                  }}
                  bodyStyle={{ padding: 40 }}
                >
                  <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <SendOutlined style={{ color: "#FFFFFF", fontSize: 18 }} />
                      </div>
                      <Title level={3} style={{ color: "#1F2937", fontWeight: 700, margin: 0 }}>
                        Send Us a Message
                      </Title>
                    </div>
                    <Text style={{ color: "#4A5568", fontSize: "1rem" }}>
                      Have questions about integrating EvalAI into your curriculum? We're here to help.
                    </Text>
                  </Space>

                  <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                      name="name"
                      rules={[{ required: true, message: "Please enter your name" }]}
                    >
                      <Input
                        prefix={<UserOutlined style={{ color: "#00FFD1" }} />}
                        placeholder="Your Name"
                        size="large"
                        style={{
                          padding: "12px 16px",
                          borderRadius: 10,
                          borderColor: "#E2E8F0",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: "Please enter your email" },
                        { type: "email", message: "Please enter a valid email" },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined style={{ color: "#00FFD1" }} />}
                        type="email"
                        placeholder="Your Email"
                        size="large"
                        style={{
                          padding: "12px 16px",
                          borderRadius: 10,
                          borderColor: "#E2E8F0",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="institution"
                    >
                      <Input
                        prefix={<BookOutlined style={{ color: "#00FFD1" }} />}
                        placeholder="Your Institution (Optional)"
                        size="large"
                        style={{
                          padding: "12px 16px",
                          borderRadius: 10,
                          borderColor: "#E2E8F0",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="role"
                    >
                      <Input
                        prefix={<TeamOutlined style={{ color: "#00FFD1" }} />}
                        placeholder="Your Role (Instructor/Student/Admin)"
                        size="large"
                        style={{
                          padding: "12px 16px",
                          borderRadius: 10,
                          borderColor: "#E2E8F0",
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="message"
                      rules={[{ required: true, message: "Please enter your message" }]}
                    >
                      <Input.TextArea
                        rows={5}
                        placeholder="Tell us about your project evaluation needs..."
                        style={{
                          padding: "12px 16px",
                          borderRadius: 10,
                          borderColor: "#E2E8F0",
                          resize: "none",
                        }}
                      />
                    </Form.Item>

                    <Form.Item>
                      <motion.div 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }}
                        style={{ width: "100%" }}
                      >
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SendOutlined />}
                          size="large"
                          loading={loading}
                          style={{
                            background: "linear-gradient(90deg, #00FFD1 0%, #3A7BD5 100%)",
                            color: "#1F2937",
                            fontWeight: 600,
                            fontSize: "1rem",
                            padding: "16px 32px",
                            borderRadius: 10,
                            width: "100%",
                            height: "auto",
                            border: "none",
                            boxShadow: "0 4px 15px rgba(0, 255, 209, 0.3)",
                          }}
                        >
                          {loading ? "Sending..." : "Send Message"}
                        </Button>
                      </motion.div>
                    </Form.Item>
                  </Form>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} lg={12}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                style={{ height: "100%" }}
              >
                <Card
                  style={{
                    borderRadius: 16,
                    border: "none",
                    height: "100%",
                    background: "#1F2937",
                    color: "#FFFFFF",
                  }}
                  bodyStyle={{ padding: 40 }}
                >
                  <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <SendOutlined style={{ color: "#1F2937", fontSize: 18, fontWeight: "bold" }} />
                      </div>
                      <Title level={3} style={{ color: "#FFFFFF", fontWeight: 700, margin: 0 }}>
                        Contact Information
                      </Title>
                    </div>
                    <Text style={{ color: "#E0E0E0", fontSize: "1rem" }}>
                      Multiple ways to reach our education technology specialists.
                    </Text>
                  </Space>

                  <Space direction="vertical" size={20} style={{ width: "100%" }}>
                    {contactMethods.map((method, index) => (
                      <motion.div 
                        key={index} 
                        whileHover={{ x: 5 }} 
                        transition={{ duration: 0.3 }}
                        style={{ width: "100%" }}
                      >
                        <Button
                          type="text"
                          href={method.action}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            padding: "16px 20px",
                            width: "100%",
                            textAlign: "left",
                            height: "auto",
                            background: "rgba(0, 255, 209, 0.1)",
                            borderRadius: 10,
                            border: "1px solid rgba(0, 255, 209, 0.2)",
                          }}
                        >
                          {method.icon}
                          <div>
                            <Text
                              style={{
                                display: "block",
                                color: "#00FFD1",
                                fontWeight: 600,
                                fontSize: "1rem",
                              }}
                            >
                              {method.title}
                            </Text>
                            <Text
                              style={{
                                display: "block",
                                color: "#E0E0E0",
                                fontSize: "0.95rem",
                              }}
                            >
                              {method.content}
                            </Text>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </Space>

                  <Divider
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      margin: "40px 0",
                    }}
                  />

                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Title level={4} style={{ color: "#FFFFFF", fontWeight: 600, margin: 0 }}>
                      Follow Our Journey
                    </Title>
                    <Text style={{ color: "#E0E0E0", fontSize: "1rem" }}>
                      Stay updated with the latest in AI-powered education assessment.
                    </Text>
                    
                    <Space size={16}>
                      {socialLinks.map((social, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ y: -3, scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            type="text"
                            href={social.url}
                            target="_blank"
                            icon={social.icon}
                            style={{
                              color: "#FFFFFF",
                              background: social.color,
                              width: 45,
                              height: 45,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            }}
                          />
                        </motion.div>
                      ))}
                    </Space>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Contact;