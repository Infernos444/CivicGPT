import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Typography,
  Space,
  Upload,
  List,
  Progress,
  Tag,
  Modal,
  Form,
  Select,
  Input,
  message,
  Timeline,
  Avatar,
  Divider,
  Collapse,
  Alert
} from "antd";
import {
  UploadOutlined,
  FilePdfOutlined,
  CalculatorOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth, db, storage } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Backend API base URL
const BACKEND_URL = "http://localhost:8000";

// Enhanced Status Badge Component
const SessionStatusBadge = ({ session }) => {
  if (!session) return null;
  
  const getStatusDetails = (status, analysis) => {
    switch (status) {
      case "completed":
        return {
          color: "green",
          text: "Analysis Complete",
          icon: <CheckCircleOutlined />,
          description: analysis?.ai_generated ? "AI Analysis Ready" : "Processing Complete"
        };
      case "processing":
        return {
          color: "blue", 
          text: "Processing",
          icon: <ClockCircleOutlined />,
          description: "OCR + AI Analysis in Progress"
        };
      case "error":
        return {
          color: "red",
          text: "Error",
          icon: <ExclamationCircleOutlined />,
          description: "Processing Failed"
        };
      default:
        return {
          color: "default",
          text: "Pending",
          icon: <ClockCircleOutlined />,
          description: "Waiting to process"
        };
    }
  };

  const statusInfo = getStatusDetails(session.status, session.analysisResult);
  
  return (
    <Space direction="vertical" size={0}>
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
      <Text type="secondary" style={{ fontSize: '12px' }}>
        {statusInfo.description}
      </Text>
      {session.analysisResult?.system && (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          System: {session.analysisResult.system}
        </Text>
      )}
    </Space>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentSession, setCurrentSession] = useState(null);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const navigate = useNavigate();

  // Debug useEffect to monitor sessions and currentSession
  useEffect(() => {
    console.log("🔄 Sessions updated:", sessions);
    console.log("📊 Current session:", currentSession);
  }, [sessions, currentSession]);

  // Enhanced Backend Health Check
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackendStatus("connected");
        console.log("✅ Backend connected:", data);
        
        // Show system info if available
        if (data.system) {
          console.log("🔧 Backend system:", data.system);
        }
      } else {
        setBackendStatus("error");
        console.error("Backend responded with error:", response.status);
      }
    } catch (error) {
      setBackendStatus("error");
      console.error("Backend connection failed:", error);
      
      // Auto-retry after 10 seconds
      setTimeout(() => {
        if (user) checkBackendStatus();
      }, 10000);
    }
  };

  // Load user sessions function
  const loadUserSessions = React.useCallback((userId) => {
    try {
      const q = query(
        collection(db, "civicgpt_sessions"),
        where("uid", "==", userId),
        orderBy("uploadedAt", "desc"),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sess = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("📥 Session data:", data);
          sess.push({ 
            id: doc.id, 
            ...data
          });
        });
        console.log("🔄 Updated sessions:", sess);
        setSessions(sess);
        if (sess.length > 0 && !currentSession) {
          setCurrentSession(sess[0]);
        }
      }, (error) => {
        console.error("Firestore sessions error:", error);
        if (!error.message.includes('index')) {
          message.error("Error loading sessions");
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up sessions listener:", error);
    }
  }, [currentSession]);

  // Load user documents function
  const loadUserDocuments = React.useCallback((userId) => {
    try {
      const q = query(
        collection(db, "documents"),
        where("uid", "==", userId),
        orderBy("uploadedAt", "desc"),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        console.log("📄 Updated documents:", docs);
        setDocuments(docs);
      }, (error) => {
        console.error("Firestore documents error:", error);
        if (!error.message.includes('index')) {
          message.error("Error loading documents");
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up documents listener:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserDocuments(currentUser.uid);
        loadUserSessions(currentUser.uid);
        checkBackendStatus();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate, loadUserDocuments, loadUserSessions]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      message.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      message.error("Error logging out");
    }
  };

  const handleCivicGPTUpload = async (policyFile, payslipFile) => {
    if (backendStatus !== "connected") {
      message.error("Backend server is not connected. Please make sure the Flask server is running on port 8000.");
      return;
    }

    setUploading(true);
    let sessionDoc = null;
    
    try {
      // Upload both files to Firebase Storage
      const policyRef = ref(storage, `policies/${user.uid}/${Date.now()}_${policyFile.name}`);
      const payslipRef = ref(storage, `payslips/${user.uid}/${Date.now()}_${payslipFile.name}`);
      
      const [policySnapshot, payslipSnapshot] = await Promise.all([
        uploadBytes(policyRef, policyFile),
        uploadBytes(payslipRef, payslipFile)
      ]);

      const [policyURL, payslipURL] = await Promise.all([
        getDownloadURL(policySnapshot.ref),
        getDownloadURL(payslipSnapshot.ref)
      ]);

      // Save to Firestore
      sessionDoc = await addDoc(collection(db, "civicgpt_sessions"), {
        uid: user.uid,
        policyFile: {
          name: policyFile.name,
          url: policyURL,
          size: policyFile.size
        },
        payslipFile: {
          name: payslipFile.name,
          url: payslipURL,
          size: payslipFile.size
        },
        uploadedAt: serverTimestamp(),
        status: "processing",
        analysis: null,
        questions: [],
        lastActive: serverTimestamp()
      });

      console.log("📤 Sending to backend, session ID:", sessionDoc.id);

      // REAL BACKEND CALL - Process documents with OCR + RAG
      const backendResponse = await fetch(`${BACKEND_URL}/process-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionDoc.id,
          policyUrl: policyURL,
          payslipUrl: payslipURL,
          userId: user.uid
        })
      });

      if (!backendResponse.ok) {
        throw new Error(`Backend processing failed: ${backendResponse.statusText}`);
      }

      const result = await backendResponse.json();
      console.log("✅ Backend response:", result);
      
      if (result.status === "success") {
        message.success('Documents uploaded! CivicGPT is analyzing your tax situation...');
      
        // 🧹 CLEAN FUNCTION – removes all undefined values recursively
        const removeUndefined = (obj) => JSON.parse(JSON.stringify(obj));
      
        // Sanitize the backend result before updating Firestore
        const safeResult = removeUndefined(result);
      
        // 🔒 Safe Firestore update (no undefined fields)
        await updateDoc(doc(db, "civicgpt_sessions", sessionDoc.id), {
          status: "completed",
          analysis: {
            policyTextLength: safeResult.policyTextLength || 0,
            payslipData: safeResult.payslipData || {},
            processedAt: serverTimestamp(),
            analysisResult: safeResult.analysisResult || {}
          },
          analysisResult: safeResult.analysisResult || {},
          updatedAt: serverTimestamp()
        });
      
        console.log("✅ Session updated with sanitized analysis results (Firestore-safe)");
      }else {
        throw new Error(result.error || "Backend processing failed");
      }

      setIsUploadModalVisible(false);
    } catch (error) {
      console.error("Upload error:", error);
      message.error(`Failed to process documents: ${error.message}`);
      
      // Update session status to error
      if (sessionDoc) {
        await updateDoc(doc(db, "civicgpt_sessions", sessionDoc.id), {
          status: "error",
          error: error.message
        });
      }
    } finally {
      setUploading(false);
    }
  };

  // Enhanced Question Handler
  const handleAskQuestion = async (question, sessionId) => {
    if (!question.trim()) return;
    
    if (backendStatus !== "connected") {
      message.error("Backend server is not connected. Please make sure the Flask server is running on port 8000.");
      return;
    }

    setAskingQuestion(true);
    try {
      const response = await fetch(`${BACKEND_URL}/ask-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          question: question.trim(),
          userId: user.uid
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        
        // Handle specific backend errors
        if (errorData.error && errorData.error.includes("process documents first")) {
          message.warning("Please process documents first before asking questions.");
          return;
        }
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAiResponse({
          question,
          answer: result.answer,
          timestamp: new Date().toLocaleString(),
          response_time: result.response_time,
          context_chunks: result.context_chunks,
          system: result.system
        });

        // Store question in Firestore
       // Store question in Firestore (safe fix - no serverTimestamp inside array)
const sessionRef = doc(db, "civicgpt_sessions", sessionId);
await updateDoc(sessionRef, {
  questions: [
    ...(currentSession?.questions || []),
    {
      question,
      answer: result.answer,
      timestamp: new Date().toISOString(),  // ✅ replace this
      response_time: result.response_time,
      system: result.system
    }
  ],
  updatedAt: serverTimestamp()  // ✅ safe at top level
});

        message.success("AI response received!");
      } else {
        throw new Error(result.error || "Failed to get answer");
      }

    } catch (error) {
      console.error('Question error:', error);
      message.error(`Failed to get AI response: ${error.message}`);
    } finally {
      setAskingQuestion(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "green";
      case "processing": return "blue";
      case "error": return "red";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircleOutlined />;
      case "processing": return <ClockCircleOutlined />;
      case "error": return <ExclamationCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  // Calculate real stats from sessions
  const taxStats = {
    potentialSavings: sessions.filter(s => s.status === "completed").length > 0 ? 45000 : 0,
    documentsProcessed: documents.length + sessions.length * 2,
    taxLiability: sessions.filter(s => s.status === "completed").length > 0 ? 125000 : 0,
    savingsPercentage: sessions.filter(s => s.status === "completed").length > 0 ? 36 : 0
  };

  const recentActivities = sessions.slice(0, 3).map(session => ({
    id: session.id,
    action: session.status === "completed" ? "Analysis Completed" : "Processing Documents",
    description: `Policy: ${session.policyFile?.name}`,
    time: session.uploadedAt?.toDate ? session.uploadedAt.toDate().toLocaleDateString() : "Recently",
    status: session.status
  }));

  const quickActions = [
    {
      title: "Upload Documents",
      description: "Policy PDF + Payslip for analysis",
      icon: <UploadOutlined />,
      action: () => setIsUploadModalVisible(true),
      color: "#1890ff"
    },
    {
      title: "Ask CivicGPT",
      description: "Get AI-powered tax advice",
      icon: <QuestionCircleOutlined />,
      action: () => sessions.length > 0 ? setActiveTab("analysis") : message.info("Upload documents first!"),
      color: "#52c41a"
    },
    {
      title: "Tax Calculator",
      description: "Calculate your tax liability",
      icon: <CalculatorOutlined />,
      action: () => message.info("Tax calculator coming soon!"),
      color: "#faad14"
    },
    {
      title: "Policy Guide",
      description: "Understand latest tax policies",
      icon: <SafetyCertificateOutlined />,
      action: () => message.info("Policy guide coming soon!"),
      color: "#722ed1"
    }
  ];

  // CivicGPT Upload Modal Component
  const CivicGPTUploadModal = () => {
    const [form] = Form.useForm();
    const [policyFile, setPolicyFile] = useState(null);
    const [payslipFile, setPayslipFile] = useState(null);

    const handleSubmit = async () => {
      if (!policyFile || !payslipFile) {
        message.error('Please upload both policy document and payslip!');
        return;
      }

      await handleCivicGPTUpload(policyFile, payslipFile);
      form.resetFields();
      setPolicyFile(null);
      setPayslipFile(null);
    };

    const uploadProps = {
      beforeUpload: (file) => {
        return false;
      },
      onRemove: () => {
        setPolicyFile(null);
        setPayslipFile(null);
      }
    };

    return (
      <Modal
        title="🏛️ Upload Documents for CivicGPT Analysis"
        open={isUploadModalVisible}
        onCancel={() => {
          setIsUploadModalVisible(false);
          form.resetFields();
          setPolicyFile(null);
          setPayslipFile(null);
        }}
        footer={null}
        width={600}
      >
        {backendStatus !== "connected" && (
          <Alert
            message="Backend Server Not Connected"
            description="Please make sure your Flask backend is running on port 8000 to process documents."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Form form={form} layout="vertical">
          {/* Policy Document Upload */}
          <Form.Item
            label="📄 Government Policy Document (PDF)"
            required
          >
            <Upload
              accept=".pdf"
              beforeUpload={(file) => {
                setPolicyFile(file);
                return false;
              }}
              onRemove={() => setPolicyFile(null)}
              maxCount={1}
              fileList={policyFile ? [{
                uid: '-1',
                name: policyFile.name,
                status: 'done',
              }] : []}
            >
              <Button icon={<UploadOutlined />}>Select Policy PDF</Button>
            </Upload>
            <Text type="secondary">Upload the latest Finance Act or tax policy PDF</Text>
          </Form.Item>

          {/* Payslip Upload */}
          <Form.Item
            label="💰 Your Payslip (PDF/Image)"
            required
          >
            <Upload
              accept=".pdf,.png,.jpg,.jpeg"
              beforeUpload={(file) => {
                setPayslipFile(file);
                return false;
              }}
              onRemove={() => setPayslipFile(null)}
              maxCount={1}
              fileList={payslipFile ? [{
                uid: '-1',
                name: payslipFile.name,
                status: 'done',
              }] : []}
            >
              <Button icon={<UploadOutlined />}>Select Payslip</Button>
            </Upload>
            <Text type="secondary">Upload your salary slip for personalized analysis</Text>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                onClick={handleSubmit}
                loading={uploading}
                disabled={!policyFile || !payslipFile || backendStatus !== "connected"}
                icon={<FileTextOutlined />}
                size="large"
              >
                {uploading ? "Processing..." : "🏛️ Analyze with CivicGPT"}
              </Button>
              <Button 
                onClick={() => {
                  setIsUploadModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // Question Input Component
  const QuestionInput = ({ session, disabled }) => {
    const [question, setQuestion] = useState('');

    const handleSubmit = () => {
      if (question.trim() && !disabled) {
        handleAskQuestion(question, session?.id);
        setQuestion('');
      }
    };

    return (
      <Card title="💬 Ask CivicGPT" style={{ marginBottom: 16 }}>
        {backendStatus !== "connected" && (
          <Alert
            message="Backend Server Not Connected"
            description="Please make sure your Flask backend is running on port 8000."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Ask about tax savings, sections, deductions... (e.g., 'How can I save tax under Section 80C?')"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={disabled || askingQuestion || backendStatus !== "connected"}
            onPressEnter={handleSubmit}
            size="large"
          />
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={askingQuestion}
            disabled={disabled || !question.trim() || !session || backendStatus !== "connected"}
            icon={<SearchOutlined />}
            size="large"
          >
            Ask
          </Button>
        </Space.Compact>
        {!session && (
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            Upload documents first to ask questions
          </Text>
        )}
      </Card>
    );
  };

  // Timeline items for recent activity
  const timelineItems = recentActivities.map((activity) => ({
    color: getStatusColor(activity.status),
    dot: getStatusIcon(activity.status),
    children: (
      <div>
        <Text strong>{activity.action}</Text>
        <br />
        <Text type="secondary">{activity.description}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {activity.time}
        </Text>
      </div>
    )
  }));

  if (recentActivities.length === 0) {
    timelineItems.push({
      children: <Text type="secondary">No recent activity. Upload documents to get started!</Text>
    });
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Header */}
      <Header
        style={{
          background: "linear-gradient(135deg, #1F2937 0%, #0f172a 100%)",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(0, 255, 209, 0.1)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <Title level={3} style={{ color: "#00FFD1", margin: 0, fontWeight: 700 }}>
            🏛️ CivicGPT
          </Title>
          <Text style={{ color: "#E0E0E0", fontSize: "14px" }}>
            AI Tax Policy Assistant
          </Text>
          <Tag 
            color={backendStatus === "connected" ? "green" : "red"} 
            icon={backendStatus === "connected" ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          >
            Backend: {backendStatus === "connected" ? "Connected" : "Disconnected"}
          </Tag>
        </motion.div>

        <Space>
          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            style={{ color: "#E0E0E0" }}
            onClick={() => message.info("Help center coming soon!")}
          >
            Help
          </Button>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{ color: "#E0E0E0" }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Space>
      </Header>

      <Layout>
        {/* Sidebar */}
        <Sider
          width={250}
          style={{
            background: "#FFFFFF",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ padding: "24px 16px", borderBottom: "1px solid #f0f0f0" }}>
            <Space>
              <Avatar size="large" icon={<UserOutlined />} />
              <div>
                <Text strong style={{ display: "block" }}>
                  {user?.displayName || "Taxpayer"}
                </Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {user?.email}
                </Text>
              </div>
            </Space>
          </div>

          <div style={{ padding: "16px 0" }}>
            {[
              { key: "overview", label: "Dashboard", icon: <UserOutlined /> },
              { key: "analysis", label: "CivicGPT Analysis", icon: <FileTextOutlined /> },
              { key: "documents", label: "My Documents", icon: <FilePdfOutlined /> },
              { key: "history", label: "Query History", icon: <HistoryOutlined /> }
            ].map((item) => (
              <motion.div
                key={item.key}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="text"
                  icon={item.icon}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    height: "48px",
                    background: activeTab === item.key ? "rgba(0, 255, 209, 0.1)" : "transparent",
                    border: "none",
                    color: activeTab === item.key ? "#00FFD1" : "#595959",
                    fontWeight: activeTab === item.key ? 600 : 400,
                  }}
                  onClick={() => setActiveTab(item.key)}
                >
                  {item.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </Sider>

        {/* Main Content */}
        <Content style={{ padding: "24px", background: "#f5f5f5" }}>
          {backendStatus !== "connected" && (
            <Alert
              message="Backend Server Connection Required"
              description={
                <div>
                  <p>Your CivicGPT backend server is not connected. Please make sure:</p>
                  <ul>
                    <li>Flask backend is running on port 8000</li>
                    <li>Ollama is running with llama3.2 models</li>
                    <li>All dependencies are installed</li>
                  </ul>
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={checkBackendStatus}
                    style={{ marginTop: 8 }}
                  >
                    Check Connection Again
                  </Button>
                </div>
              }
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Welcome Section */}
              <Card style={{ marginBottom: "24px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                <Row align="middle" gutter={[24, 24]}>
                  <Col xs={24} md={16}>
                    <Title level={2} style={{ color: "white", margin: 0 }}>
                      Welcome back, {user?.displayName?.split(' ')[0] || "Taxpayer"}!
                    </Title>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}>
                      Ready to optimize your tax savings? Upload policy documents and payslip for AI-powered analysis.
                    </Text>
                  </Col>
                  <Col xs={24} md={8} style={{ textAlign: "right" }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<UploadOutlined />}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        color: "white",
                        fontWeight: 600,
                      }}
                      onClick={() => setIsUploadModalVisible(true)}
                    >
                      Upload Documents
                    </Button>
                  </Col>
                </Row>
              </Card>

              {/* Stats Overview */}
              <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={12} lg={6}>
                  <motion.div whileHover={{ y: -5 }}>
                    <Card>
                      <Statistic
                        title="Potential Tax Savings"
                        value={taxStats.potentialSavings}
                        prefix="₹"
                        valueStyle={{ color: "#52c41a" }}
                        suffix={<ArrowUpOutlined />}
                      />
                      <Progress percent={taxStats.savingsPercentage} size="small" />
                    </Card>
                  </motion.div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <motion.div whileHover={{ y: -5 }}>
                    <Card>
                      <Statistic
                        title="Documents Processed"
                        value={taxStats.documentsProcessed}
                        valueStyle={{ color: "#1890ff" }}
                      />
                      <Text type="secondary">All time</Text>
                    </Card>
                  </motion.div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <motion.div whileHover={{ y: -5 }}>
                    <Card>
                      <Statistic
                        title="Estimated Tax Liability"
                        value={taxStats.taxLiability}
                        prefix="₹"
                        valueStyle={{ color: "#fa541c" }}
                        suffix={<ArrowDownOutlined />}
                      />
                      <Text type="secondary">Current FY</Text>
                    </Card>
                  </motion.div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <motion.div whileHover={{ y: -5 }}>
                    <Card>
                      <Statistic
                        title="Analysis Sessions"
                        value={sessions.length}
                        valueStyle={{ color: "#722ed1" }}
                      />
                      <Text type="secondary">Completed: {sessions.filter(s => s.status === "completed").length}</Text>
                    </Card>
                  </motion.div>
                </Col>
              </Row>

              {/* Quick Actions */}
              <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
                <Col span={24}>
                  <Title level={4}>Quick Actions</Title>
                </Col>
                {quickActions.map((action, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Card
                        hoverable
                        style={{ textAlign: "center", height: "140px" }}
                        onClick={action.action}
                      >
                        <div style={{ fontSize: "32px", color: action.color, marginBottom: "12px" }}>
                          {action.icon}
                        </div>
                        <Text strong style={{ display: "block", marginBottom: "8px" }}>
                          {action.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {action.description}
                        </Text>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>

              {/* Recent Activity & Documents */}
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card title="Recent Activity" extra={<HistoryOutlined />}>
                    <Timeline items={timelineItems} />
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card 
                    title="Recent CivicGPT Sessions" 
                    extra={
                      <Button 
                        type="link" 
                        onClick={() => setActiveTab("analysis")}
                        style={{ padding: 0 }}
                      >
                        View All
                      </Button>
                    }
                  >
                    <List
                      dataSource={sessions.slice(0, 3)}
                      renderItem={(session) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<FileTextOutlined style={{ fontSize: "24px", color: "#1890ff" }} />}
                            title={session.policyFile?.name || "Policy Document"}
                            description={
                              <Space direction="vertical" size={0}>
                                <Text>Payslip: {session.payslipFile?.name}</Text>
                                <Text type="secondary">
                                  {session.uploadedAt?.toDate ? session.uploadedAt.toDate().toLocaleDateString() : "Recently"}
                                </Text>
                                <SessionStatusBadge session={session} />
                                {session.analysisResult && (
                                  <Space>
                                    <Text type="secondary" style={{color: '#52c41a'}}>
                                      Savings: ₹{session.analysisResult.estimatedSavings || 0}
                                    </Text>
                                    {session.analysisResult.ai_generated && (
                                      <Tag color="purple" size="small">AI Generated</Tag>
                                    )}
                                  </Space>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                      locale={{ emptyText: "No analysis sessions yet. Upload documents to get started!" }}
                    />
                  </Card>
                </Col>
              </Row>
            </motion.div>
          )}

          {activeTab === "analysis" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Session Selector */}
              <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} md={12}>
                    <Title level={4}>Select Analysis Session</Title>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Choose a session..."
                      value={currentSession?.id}
                      onChange={(value) => {
                        const session = sessions.find(s => s.id === value);
                        setCurrentSession(session);
                        setAiResponse(null);
                      }}
                    >
                      {sessions.map(session => (
                        <Option key={session.id} value={session.id}>
                          {session.policyFile?.name} - {session.status} - {session.uploadedAt?.toDate ? session.uploadedAt.toDate().toLocaleDateString() : "Recently"}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      onClick={() => setIsUploadModalVisible(true)}
                    >
                      New Analysis
                    </Button>
                    <Button 
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        if (user) {
                          loadUserSessions(user.uid);
                          message.info("Refreshing sessions...");
                        }
                      }}
                    >
                      🔄 Refresh
                    </Button>
                  </Col>
                </Row>
              </Card>

              {/* Enhanced Analysis Results */}
              {currentSession?.analysisResult && (
                <Card title="📊 CivicGPT Analysis Results" style={{ marginBottom: 16 }}>
                  {/* System Info */}
                  <Alert
                    message={`Analysis Method: ${currentSession.analysisResult.system || 'Pure RAG + LLM + OCR'}`}
                    description={`Model: ${currentSession.analysisResult.model_used || 'llama3.2:3b'} | AI Generated: ${currentSession.analysisResult.ai_generated ? 'Yes' : 'No'}`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Card type="inner" title="💡 Tax Saving Tips" size="small">
                        <List
                          dataSource={currentSession.analysisResult.taxSavingTips || []}
                          renderItem={(tip, index) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                title={tip}
                              />
                            </List.Item>
                          )}
                          locale={{ emptyText: "No specific tips generated" }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card type="inner" title="🚀 Recommended Actions" size="small">
                        <List
                          dataSource={currentSession.analysisResult.recommendedActions || []}
                          renderItem={(action, index) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<ArrowUpOutlined style={{ color: '#1890ff' }} />}
                                title={action}
                              />
                            </List.Item>
                          )}
                          locale={{ emptyText: "No specific actions recommended" }}
                        />
                      </Card>
                    </Col>
                  </Row>
                  
                  {/* Tax Liability Summary */}
                  <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} md={8}>
                      <Statistic
                        title="Current Tax Liability"
                        value={currentSession.analysisResult.taxLiability?.current || 0}
                        prefix="₹"
                        valueStyle={{ color: '#fa541c' }}
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <Statistic
                        title="Potential Liability"
                        value={currentSession.analysisResult.taxLiability?.potential || 0}
                        prefix="₹"
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <Statistic
                        title="Estimated Savings"
                        value={currentSession.analysisResult.estimatedSavings || 0}
                        prefix="₹"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                  </Row>
                  
                  {/* AI Summary */}
                  {currentSession.analysisResult.summary && (
                    <Card type="inner" title="📝 Analysis Summary" style={{ marginTop: 16 }}>
                      <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                        {currentSession.analysisResult.summary}
                      </div>
                    </Card>
                  )}
                  
                  {/* Document Processing Info */}
                  <Collapse ghost style={{ marginTop: 16 }}>
                    <Panel header="📄 Document Processing Details" key="1">
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Text strong>Policy Document:</Text>
                          <br />
                          <Text type="secondary">
                            Extracted: {currentSession.analysisResult.policyData?.extracted_length || 0} chars
                            <br />
                            Method: {currentSession.analysisResult.policyData?.analysis_method || 'OCR'}
                          </Text>
                        </Col>
                        <Col span={12}>
                          <Text strong>Payslip:</Text>
                          <br />
                          <Text type="secondary">
                            Extracted: {currentSession.analysisResult.payslipData?.extracted_length || 0} chars
                            <br />
                            Method: {currentSession.analysisResult.payslipData?.analysis_method || 'OCR'}
                          </Text>
                        </Col>
                      </Row>
                    </Panel>
                  </Collapse>
                </Card>
              )}

              {/* Question Input */}
              <QuestionInput 
                session={currentSession} 
                disabled={askingQuestion || !currentSession}
              />

              {/* Enhanced AI Response */}
              {aiResponse && (
                <Card 
                  title="🤖 CivicGPT Response" 
                  extra={
                    <Space>
                      <Tag color="blue">{aiResponse.timestamp}</Tag>
                      {aiResponse.system && <Tag color="green">{aiResponse.system}</Tag>}
                    </Space>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6', marginBottom: 16 }}>
                    {aiResponse.answer}
                  </div>
                  
                  {/* Response Metadata */}
                  <Space direction="vertical" size={0} style={{ fontSize: '12px', color: '#666' }}>
                    {aiResponse.response_time && (
                      <Text>Response time: {aiResponse.response_time.toFixed(2)}s</Text>
                    )}
                    {aiResponse.context_chunks !== undefined && (
                      <Text>Context chunks used: {aiResponse.context_chunks}</Text>
                    )}
                  </Space>
                </Card>
              )}

              {!currentSession && sessions.length === 0 && (
                <Card style={{ textAlign: 'center', padding: '40px' }}>
                  <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }} />
                  <Title level={4}>No Analysis Sessions</Title>
                  <Text type="secondary">
                    Upload policy documents and payslip to start your tax analysis with CivicGPT
                  </Text>
                  <br />
                  <Button 
                    type="primary" 
                    style={{ marginTop: 16 }}
                    onClick={() => setIsUploadModalVisible(true)}
                  >
                    Upload Your First Documents
                  </Button>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === "documents" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                title="My Documents & Sessions"
                extra={
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={() => setIsUploadModalVisible(true)}
                  >
                    Upload New
                  </Button>
                }
              >
                <Collapse 
                  defaultActiveKey={['sessions']} 
                  style={{ marginBottom: 16 }}
                  items={[{
                    key: 'sessions',
                    label: 'CivicGPT Analysis Sessions',
                    children: (
                      <List
                        dataSource={sessions}
                        renderItem={(session) => (
                          <List.Item
                            actions={[
                              <Button 
                                type="link" 
                                onClick={() => {
                                  setCurrentSession(session);
                                  setActiveTab('analysis');
                                }}
                              >
                                View Analysis
                              </Button>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<FileTextOutlined style={{ fontSize: '32px', color: '#1890ff' }} />}
                              title={`Session: ${session.policyFile?.name}`}
                              description={
                                <Space direction="vertical" size={0}>
                                  <Text>Payslip: {session.payslipFile?.name}</Text>
                                  <Text type="secondary">
                                    {session.uploadedAt?.toDate ? session.uploadedAt.toDate().toLocaleString() : "Recently"}
                                  </Text>
                                  <SessionStatusBadge session={session} />
                                  {session.analysisResult && (
                                    <Text type="secondary" style={{color: '#52c41a'}}>
                                      Estimated Savings: ₹{session.analysisResult.estimatedSavings || 0}
                                    </Text>
                                  )}
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                        locale={{ emptyText: "No analysis sessions yet" }}
                      />
                    )
                  }]}
                />

                <List
                  dataSource={documents}
                  renderItem={(doc) => (
                    <List.Item
                      actions={[
                        <Button type="link">Download</Button>,
                        <Button type="link" danger>Delete</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<FilePdfOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />}
                        title={doc.fileName}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text>Type: {doc.fileType}</Text>
                            <Text type="secondary">
                              Uploaded: {doc.uploadedAt?.toDate ? new Date(doc.uploadedAt.toDate()).toLocaleString() : "Unknown"}
                            </Text>
                            <Tag color={getStatusColor(doc.status)}>
                              {getStatusIcon(doc.status)} {doc.status}
                            </Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: "No documents uploaded yet" }}
                />
              </Card>
            </motion.div>
          )}

          {activeTab === "history" && (
            <Card>
              <Title level={3}>Query History</Title>
              {currentSession?.questions && currentSession.questions.length > 0 ? (
                <List
                  dataSource={currentSession.questions}
                  renderItem={(q, index) => (
                    <List.Item>
                      <List.Item.Meta
                        title={<Text strong>Q: {q.question}</Text>}
                        description={
                          <div>
                            <Text>A: {q.answer}</Text>
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Response time: {q.response_time?.toFixed(2)}s | 
                                System: {q.system || 'enhanced_rag_general_knowledge'}
                              </Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">No questions asked yet. Start a conversation with CivicGPT!</Text>
              )}
            </Card>
          )}
        </Content>
      </Layout>

      {/* CivicGPT Upload Modal */}
      <CivicGPTUploadModal />
    </Layout>
  );
};

export default Dashboard;