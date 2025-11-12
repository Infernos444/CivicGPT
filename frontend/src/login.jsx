import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Card,
  message,
  Modal,
  Steps
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  ArrowLeftOutlined,
  HomeOutlined,
  BankOutlined,
  IdcardOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./firebase/firebase";

const { Title, Text } = Typography;
const { Step } = Steps;

const Login = () => {
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepOneData, setStepOneData] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Sign in the user
      await signInWithEmailAndPassword(
        auth, 
        values.email, 
        values.password
      );
      
      message.success("Login successful!");
      
      // Redirect to dashboard
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Login error:", error);
      message.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    setIsRegisterModalVisible(true);
    setStepOneData(null);
    setCurrentStep(0);
    registerForm.resetFields();
  };

  const handleRegisterCancel = () => {
    setIsRegisterModalVisible(false);
    setCurrentStep(0);
    setStepOneData(null);
    registerForm.resetFields();
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleStepOneFinish = (values) => {
    setStepOneData(values);
    setCurrentStep(1);
  };

  const handleRegisterSubmit = async (values) => {
    setLoading(true);
    try {
      // Combine data from both steps
      const allData = {
        ...stepOneData,
        ...values
      };

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        allData.email, 
        allData.password
      );
      
      const user = userCredential.user;
      
      // Update user profile with name
      await updateProfile(user, {
        displayName: allData.name
      });
      
      // Prepare user data for Firestore
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: allData.name,
        userType: "taxpayer", // All users are taxpayers
        occupation: allData.occupation,
        panNumber: allData.panNumber || "",
        createdAt: serverTimestamp()
      };
      
      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), userData);
      
      message.success("Registration successful! Please login.");
      
      // Reset form and close modal
      setIsRegisterModalVisible(false);
      setCurrentStep(0);
      setStepOneData(null);
      registerForm.resetFields();
      
    } catch (error) {
      console.error("Registration error:", error);
      message.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    message.info("Password reset functionality would be implemented here");
  };

  const handleTermsClick = () => {
    message.info("Terms of Service would be shown here");
  };

  const handlePrivacyClick = () => {
    message.info("Privacy Policy would be shown here");
  };

  const renderRegisterSteps = () => {
    const steps = [
      {
        title: 'Personal Info',
        content: (
          <Form
            form={registerForm}
            layout="vertical"
            onFinish={handleStepOneFinish}
            initialValues={stepOneData || {}}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Your full name" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email address" />
            </Form.Item>
            
            <Form.Item
              name="occupation"
              label="Occupation"
              rules={[{ required: true, message: 'Please input your occupation!' }]}
            >
              <Input prefix={<BankOutlined />} placeholder="e.g., Software Engineer, Business Owner, etc." />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
              >
                Continue
              </Button>
            </Form.Item>
          </Form>
        )
      },
      {
        title: 'Account Security',
        content: (
          <Form
            layout="vertical"
            onFinish={handleRegisterSubmit}
            initialValues={{ panNumber: stepOneData?.panNumber || '' }}
          >
            <Form.Item
              name="panNumber"
              label="PAN Number (Optional)"
              rules={[
                {
                  pattern: /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
                  message: 'Please enter a valid PAN number!'
                }
              ]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="ABCDE1234F" />
            </Form.Item>
            
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                loading={loading}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>
        )
      }
    ];

    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {currentStep > 0 && (
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{ marginRight: '8px' }}
              />
            )}
            <span>Join CivicGPT</span>
          </div>
        }
        open={isRegisterModalVisible}
        onCancel={handleRegisterCancel}
        footer={null}
        width={500}
        centered
      >
        <Steps current={currentStep} style={{ marginBottom: '24px' }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>
        
        <div>{steps[currentStep].content}</div>
      </Modal>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "24px",
        position: "relative"
      }}
    >
      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          zIndex: 10
        }}
      >
        <Button
          icon={<HomeOutlined />}
          onClick={handleBackToHome}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "#FFFFFF",
            borderRadius: "8px",
            backdropFilter: "blur(10px)"
          }}
        >
          Back to Home
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: "450px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Title
                level={2}
                style={{
                  color: "#00FFD1",
                  marginBottom: "8px",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                CivicGPT
              </Title>
            </motion.div>
            <Text
              style={{
                color: "#595959",
                fontSize: "16px",
              }}
            >
              Your AI-Powered Tax Assistant
            </Text>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                prefix={
                  <MailOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />
                }
                placeholder="Email"
                style={{
                  height: "48px",
                  borderRadius: "8px",
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                {
                  min: 6,
                  message: "Password must be at least 6 characters!",
                },
              ]}
            >
              <Input.Password
                prefix={
                  <LockOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />
                }
                placeholder="Password"
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone style={{ color: "#00FFD1" }} />
                  ) : (
                    <EyeInvisibleOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />
                  )
                }
                style={{
                  height: "48px",
                  borderRadius: "8px",
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: "48px",
                  background: "linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "#1F2937",
                  marginTop: "8px",
                }}
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "right", marginBottom: "24px" }}>
            <Button
              type="link"
              onClick={handleForgotPassword}
              style={{ color: "#1890ff", padding: 0, height: "auto" }}
            >
              Forgot password?
            </Button>
          </div>

          <Divider
            style={{
              borderColor: "rgba(0, 0, 0, 0.1)",
              color: "rgba(0, 0, 0, 0.45)",
            }}
          >
            New to CivicGPT?
          </Divider>

          <Button
            icon={<UserOutlined />}
            block
            onClick={handleRegister}
            style={{
              height: "48px",
              background: "rgba(255, 255, 255, 0.9)",
                  borderColor: "#d9d9d9",
                  color: "#595959",
                  borderRadius: "8px",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                Create an Account
              </Button>

              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <Text style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                  By continuing, you agree to CivicGPT's{" "}
                  <Button type="link" onClick={handleTermsClick} style={{ padding: 0, height: "auto" }}>
                    Terms of Service
                  </Button>{" "}
                  and{" "}
                  <Button type="link" onClick={handlePrivacyClick} style={{ padding: 0, height: "auto" }}>
                    Privacy Policy
                  </Button>
                </Text>
              </div>
            </Card>
          </motion.div>
          
          {renderRegisterSteps()}
        </div>
      );
    };

    export default Login;