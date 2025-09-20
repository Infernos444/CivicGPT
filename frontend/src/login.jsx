import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Card,
  message,
  Select,
  Upload,
  Modal,
  Steps,
  Row,
  Col
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  IdcardOutlined,
  BookOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  HomeOutlined
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
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { auth, db, storage } from "./firebase/firebase";

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState("student");
  const [idProof, setIDProof] = useState(null);
  const [idProofUploading, setIdProofUploading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        values.email, 
        values.password
      );
      
      const user = userCredential.user;
      
      // Get user data from Firestore to determine user type
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userType = userData.userType;
        
        message.success("Login successful!");
        
        // Redirect based on user type
        if (userType === "student") {
          navigate("/student-dashboard");
        } else if (userType === "faculty") {
          navigate("/faculty-dashboard");
        } else {
          // Default fallback
          navigate("/dashboard");
        }
      } else {
        message.error("User data not found. Please contact support.");
        console.error("User document does not exist in Firestore");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    setIsRegisterModalVisible(true);
  };

  const handleRegisterCancel = () => {
    setIsRegisterModalVisible(false);
    setCurrentStep(0);
    setUserType("student");
    setIDProof(null);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleRegisterSubmit = async (values) => {
    setLoading(true);
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        values.email, 
        values.password
      );
      
      const user = userCredential.user;
      
      // Update user profile with name
      await updateProfile(user, {
        displayName: values.name
      });
      
      // Prepare user data for Firestore
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: values.name,
        userType: userType,
        createdAt: serverTimestamp()
      };
      
      // Add user type specific data
      if (userType === 'student') {
        userData.studentId = values.studentId;
      } else if (userType === 'faculty') {
        userData.institution = values.institution;
        userData.department = values.department;
        userData.facultyId = values.facultyId;
        userData.verified = false; // Faculty needs verification
        
        // Upload ID proof if available
        if (idProof) {
          try {
            setIdProofUploading(true);
            const idProofUrl = await uploadIDProof(user.uid, idProof);
            userData.idProofUrl = idProofUrl;
            message.success("ID proof uploaded successfully!");
          } catch (uploadError) {
            console.error("ID proof upload error:", uploadError);
            message.warning("User created but ID proof upload failed. Please upload it later.");
          } finally {
            setIdProofUploading(false);
          }
        }
      }
      
      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), userData);
      
      message.success("Registration successful! Please login.");
      
      // Reset form and close modal
      setIsRegisterModalVisible(false);
      setCurrentStep(0);
      setUserType("student");
      setIDProof(null);
      
    } catch (error) {
      console.error("Registration error:", error);
      message.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const uploadIDProof = async (userId, file) => {
    try {
      // Create a storage reference
      const storageRef = ref(storage, `id-proofs/${userId}/${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading ID proof:", error);
      throw error;
    }
  };

  const handleIDProofUpload = (info) => {
    const { file } = info;
    
    if (file.status === 'uploading') {
      setIdProofUploading(true);
      return;
    }
    
    if (file.status === 'done') {
      setIDProof(file.originFileObj);
      setIdProofUploading(false);
      message.success(`${file.name} file uploaded successfully`);
    } else if (file.status === 'error') {
      setIdProofUploading(false);
      message.error(`${file.name} file upload failed.`);
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || 
                       file.type === 'image/png' || 
                       file.type === 'application/pdf';
    
    if (!isJpgOrPng) {
      message.error('You can only upload JPG, PNG, or PDF files!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };

  const customUploadRequest = ({ file, onSuccess, onError }) => {
    // Simulate upload process
    setTimeout(() => {
      onSuccess("ok");
    }, 1000);
  };

  const renderRegisterSteps = () => {
    const steps = [
      {
        title: 'Select Role',
        content: (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Title level={4}>I am a...</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
              <Col span={12}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card 
                    hoverable 
                    style={{ 
                      border: userType === 'student' ? '2px solid #722ed1' : '1px solid #d9d9d9',
                      borderRadius: '8px',
                      height: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onClick={() => setUserType('student')}
                  >
                    <TeamOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '10px' }} />
                    <Text strong>Student</Text>
                  </Card>
                </motion.div>
              </Col>
              <Col span={12}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card 
                    hoverable 
                    style={{ 
                      border: userType === 'faculty' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      borderRadius: '8px',
                      height: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onClick={() => setUserType('faculty')}
                  >
                    <UserOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '10px' }} />
                    <Text strong>Faculty</Text>
                  </Card>
                </motion.div>
              </Col>
            </Row>
            <Button 
              type="primary" 
              style={{ marginTop: '30px' }} 
              onClick={() => setCurrentStep(1)}
              disabled={!userType}
            >
              Continue
            </Button>
          </div>
        )
      },
      {
        title: 'Account Details',
        content: (
          <Form
            layout="vertical"
            onFinish={(values) => {
              if (userType === 'faculty') {
                setCurrentStep(2);
              } else {
                handleRegisterSubmit(values);
              }
            }}
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
            
            {userType === 'student' && (
              <Form.Item
                name="studentId"
                label="Student ID"
                rules={[{ required: true, message: 'Please input your student ID!' }]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="Student ID" />
              </Form.Item>
            )}
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                loading={loading}
              >
                {userType === 'faculty' ? 'Continue to Verification' : 'Register'}
              </Button>
            </Form.Item>
          </Form>
        )
      },
      {
        title: 'Faculty Verification',
        content: (
          <Form
            layout="vertical"
            onFinish={handleRegisterSubmit}
          >
            <Form.Item
              name="institution"
              label="Institution"
              rules={[{ required: true, message: 'Please input your institution!' }]}
            >
              <Input prefix={<BookOutlined />} placeholder="University/College name" />
            </Form.Item>
            
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: 'Please select your department!' }]}
            >
              <Select placeholder="Select your department">
                <Option value="cs">Computer Science</Option>
                <Option value="ece">Electrical & Computer Engineering</Option>
                <Option value="math">Mathematics</Option>
                <Option value="physics">Physics</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="facultyId"
              label="Faculty ID"
              rules={[{ required: true, message: 'Please input your faculty ID!' }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Faculty ID" />
            </Form.Item>
            
            <Form.Item
              name="idProof"
              label="Proof of Faculty Status"
              rules={[{ required: true, message: 'Please upload proof of faculty status!' }]}
              extra="Upload a photo of your faculty ID, official letter, or other proof"
            >
              <Upload
                name="idProof"
                listType="picture"
                beforeUpload={beforeUpload}
                onChange={handleIDProofUpload}
                maxCount={1}
                customRequest={customUploadRequest}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={idProofUploading}
                >
                  Click to upload
                </Button>
              </Upload>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
              >
                Complete Registration
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
            <span>Register for EvanAI</span>
          </div>
        }
        visible={isRegisterModalVisible}
        onCancel={handleRegisterCancel}
        footer={null}
        width={600}
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
                  color: "#722ed1",
                  marginBottom: "8px",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #722ed1 0%, #1890ff 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                EvanAI
              </Title>
            </motion.div>
            <Text
              style={{
                color: "#595959",
                fontSize: "16px",
              }}
            >
              AI-Powered Project Evaluation System
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
                    <EyeTwoTone style={{ color: "#722ed1" }} />
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
                  background: "linear-gradient(135deg, #722ed1 0%, #1890ff 100%)",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "#fff",
                  marginTop: "8px",
                }}
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "right", marginBottom: "24px" }}>
            <a
              onClick={() => message.info("Password reset functionality would be implemented here")}
              style={{ color: "#1890ff", cursor: "pointer" }}
            >
              Forgot password?
            </a>
          </div>

          <Divider
            style={{
              borderColor: "rgba(0, 0, 0, 0.1)",
              color: "rgba(0, 0, 0, 0.45)",
            }}
          >
            New to EvanAI?
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
              By continuing, you agree to EvanAI's{" "}
              <a style={{ color: "#1890ff" }}>Terms of Service</a> and{" "}
              <a style={{ color: "#1890ff" }}>Privacy Policy</a>
            </Text>
          </div>
        </Card>
      </motion.div>
      
      {renderRegisterSteps()}
    </div>
  );
};

export default Login;