import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Card,
  message,
  Checkbox,
  Select,
  Upload,
  Row,
  Col,
  Steps
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  TeamOutlined,
  IdcardOutlined,
  BookOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase/firebase";

const { Title, Text, Link } = Typography;
const { Option } = Select;
const { Step } = Steps;

const Signup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState("");
  const [idProof, setIdProof] = useState(null);
  const [idProofUploading, setIdProofUploading] = useState(false);

  const onFinish = async (values) => {
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
      
      message.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      message.error(error.message || "Signup failed");
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
      setIdProof(file.originFileObj);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Title level={4} style={{ color: "#F4F8D3", marginBottom: '30px' }}>I am a...</Title>
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
              <Col span={12}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card 
                    hoverable 
                    style={{ 
                      border: userType === 'student' ? '2px solid #722ed1' : '1px solid rgba(244, 248, 211, 0.3)',
                      borderRadius: '8px',
                      height: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }}
                    onClick={() => setUserType('student')}
                  >
                    <TeamOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '10px' }} />
                    <Text style={{ color: '#F4F8D3' }} strong>Student</Text>
                  </Card>
                </motion.div>
              </Col>
              <Col span={12}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card 
                    hoverable 
                    style={{ 
                      border: userType === 'faculty' ? '2px solid #1890ff' : '1px solid rgba(244, 248, 211, 0.3)',
                      borderRadius: '8px',
                      height: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }}
                    onClick={() => setUserType('faculty')}
                  >
                    <UserOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '10px' }} />
                    <Text style={{ color: '#F4F8D3' }} strong>Faculty</Text>
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
        );
      case 1:
        return (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="name"
              label={<Text style={{ color: "#F4F8D3" }}>Full Name</Text>}
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: "rgba(244, 248, 211, 0.7)" }} />}
                placeholder="Your full name" 
                style={inputStyle}
              />
            </Form.Item>
            
            <Form.Item
              name="email"
              label={<Text style={{ color: "#F4F8D3" }}>Email</Text>}
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: "rgba(244, 248, 211, 0.7)" }} />}
                placeholder="Email address" 
                style={inputStyle}
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              label={<Text style={{ color: "#F4F8D3" }}>Password</Text>}
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(244, 248, 211, 0.7)" }} />}
                placeholder="Password"
                iconRender={(visible) => (visible ? <EyeTwoTone style={{ color: "#A6D6D6" }} /> : <EyeInvisibleOutlined style={{ color: "rgba(244, 248, 211, 0.5)" }} />)}
                style={inputStyle}
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label={<Text style={{ color: "#F4F8D3" }}>Confirm Password</Text>}
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
                prefix={<LockOutlined style={{ color: "rgba(244, 248, 211, 0.7)" }} />}
                placeholder="Confirm Password"
                iconRender={(visible) => (visible ? <EyeTwoTone style={{ color: "#A6D6D6" }} /> : <EyeInvisibleOutlined style={{ color: "rgba(244, 248, 211, 0.5)" }} />)}
                style={inputStyle}
              />
            </Form.Item>
            
            {userType === 'student' && (
              <Form.Item
                name="studentId"
                label={<Text style={{ color: "#F4F8D3" }}>Student ID</Text>}
                rules={[{ required: true, message: 'Please input your student ID!' }]}
              >
                <Input 
                  prefix={<IdcardOutlined style={{ color: "rgba(244, 248, 211, 0.7)" }} />}
                  placeholder="Student ID" 
                  style={inputStyle}
                />
              </Form.Item>
            )}
            
            {userType === 'faculty' && (
              <>
                <Form.Item
                  name="institution"
                  label={<Text style={{ color: "#F4F8D3" }}>Institution</Text>}
                  rules={[{ required: true, message: 'Please input your institution!' }]}
                >
                  <Input 
                    prefix={<BookOutlined style={{ color: "rgba(244, 248, 211, 0.7)" }} />}
                    placeholder="University/College name" 
                    style={inputStyle}
                  />
                </Form.Item>
                
                <Form.Item
                  name="department"
                  label={<Text style={{ color: "#F4F8D3" }}>Department</Text>}
                  rules={[{ required: true, message: 'Please select your department!' }]}
                >
                  <Select 
                    placeholder="Select your department" 
                    style={inputStyle}
                  >
                    <Option value="cs">Computer Science</Option>
                    <Option value="ece">Electrical & Computer Engineering</Option>
                    <Option value="math">Mathematics</Option>
                    <Option value="physics">Physics</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="facultyId"
                  label={<Text style={{ color: "#F4F8D3" }}>Faculty ID</Text>}
                  rules={[{ required: true, message: 'Please input your faculty ID!' }]}
                >
                  <Input 
                    prefix={<IdcardOutlined style={{ color: "rgba(244, 248, 211, 0.7)" }} />}
                    placeholder="Faculty ID" 
                    style={inputStyle}
                  />
                </Form.Item>
                
                <Form.Item
                  name="idProof"
                  label={<Text style={{ color: "#F4F8D3" }}>Proof of Faculty Status</Text>}
                  rules={[{ required: true, message: 'Please upload proof of faculty status!' }]}
                  extra={<Text style={{ color: "rgba(244, 248, 211, 0.7)" }}>Upload a photo of your faculty ID, official letter, or other proof</Text>}
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
                      style={inputStyle}
                    >
                      Click to upload
                    </Button>
                  </Upload>
                </Form.Item>
              </>
            )}
            
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("You must accept the terms and conditions")
                        ),
                },
              ]}
            >
              <Checkbox style={{ color: "rgba(244, 248, 211, 0.7)" }}>
                I agree to the{" "}
                <Link style={{ color: "#A6D6D6" }}>Terms and Conditions</Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: "48px",
                  background: "linear-gradient(90deg, #A6D6D6 0%, #8E7DBE 100%)",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "#1F2937",
                  marginTop: "8px",
                }}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #8E7DBE 0%, #1F2937 100%)",
        padding: "60px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: "500px",
            borderRadius: "16px",
            boxShadow: "0 12px 48px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Title
                level={2}
                style={{
                  color: "#F4F8D3",
                  marginBottom: "8px",
                  fontWeight: 700,
                }}
              >
                EvanAI
              </Title>
            </motion.div>
            <Text
              style={{
                color: "rgba(244, 248, 211, 0.7)",
                fontSize: "16px",
              }}
            >
              AI-Powered Project Evaluation System
            </Text>
          </div>

          <Steps current={currentStep} style={{ marginBottom: '24px' }}>
            <Step title="Select Role" />
            <Step title="Account Details" />
          </Steps>

          {renderStepContent()}

          {currentStep === 1 && (
            <Button 
              type="link" 
              onClick={() => setCurrentStep(0)}
              style={{ color: "#A6D6D6", marginTop: '16px' }}
            >
              Back to role selection
            </Button>
          )}

          <Divider
            style={{
              borderColor: "rgba(244, 248, 211, 0.2)",
              color: "rgba(244, 248, 211, 0.5)",
            }}
          />

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Text style={{ color: "rgba(244, 248, 211, 0.7)" }}>
              Already have an account?{" "}
              <Link
                onClick={() => navigate("/login")}
                style={{ color: "#A6D6D6", fontWeight: 500 }}
              >
                Login
              </Link>
            </Text>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const inputStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  borderColor: "rgba(244, 248, 211, 0.3)",
  color: "#F4F8D3",
  height: "48px",
  borderRadius: "8px",
};

export default Signup;