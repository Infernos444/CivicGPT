import React from "react";
import { 
  Button, 
  Row, 
  Col, 
  Typography, 
  Card, 
  Space,
  Statistic,
  Avatar,
  Carousel
} from "antd";
import { 
  motion
} from "framer-motion";
import { 
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  CloudSyncOutlined,
  CheckCircleFilled,
  StarFilled,
  HeartFilled,
  ThunderboltFilled,
  UserOutlined,
  RocketOutlined,
  CrownOutlined,
  TrophyOutlined,
  GlobalOutlined,
  BankOutlined,
  FilePdfOutlined,
  TranslationOutlined,
  CalculatorOutlined
} from "@ant-design/icons";
import GlitchText from "../assets/GlitchText";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (userType) => {
    navigate("/login", { state: { userType } });
  };

  // Feature data - Updated for CivicGPT
  const features = [
    {
      icon: <FilePdfOutlined />,
      title: "Smart Policy Document Analysis",
      description: "Upload official government tax documents and get instant, clear explanations in simple language you can understand.",
      color: "#1890ff",
      stats: [
        { value: 100, suffix: "%", label: "Accurate" },
        { value: 30, suffix: "sec", label: "Analysis" }
      ]
    },
    {
      icon: <CalculatorOutlined />,
      title: "Personalized Tax Savings",
      description: "Get customized tax saving recommendations based on your actual salary and financial situation from your payslip.",
      color: "#ff4d4f",
      stats: [
        { value: 50, suffix: "%+", label: "Savings" },
        { value: 95, suffix: "%", label: "Accuracy" }
      ]
    },
    {
      icon: <BankOutlined />,
      title: "24/7 Tax Assistant",
      description: "Get instant answers to your tax questions anytime, without waiting for CA appointments or office hours.",
      color: "#52c41a",
      stats: [
        { value: 24, suffix: "/7", label: "Available" },
        { value: 1, suffix: "min", label: "Response Time" }
      ]
    },
    {
      icon: <TranslationOutlined />,
      title: "Multilingual Explanations",
      description: "Understand complex tax rules in your preferred language - English, Hindi, Tamil, and more regional languages.",
      color: "#722ed1",
      stats: [
        { value: 10, suffix: "+", label: "Languages" },
        { value: 100, suffix: "%", label: "Clarity" }
      ]
    }
  ];

  // Testimonials data - Updated for CivicGPT
  const testimonials = [
    {
      id: 1,
      quote: "CivicGPT saved me ₹45,000 in taxes this year! I finally understood Section 80C and 80D without needing a CA. The personalized advice was spot on.",
      author: "Priya Sharma",
      role: "Software Engineer",
      rating: 5,
      avatarColor: "#1890ff"
    },
    {
      id: 2,
      quote: "As a salaried employee, I always struggled with tax planning. CivicGPT explained everything in simple terms and showed me exactly where to invest. Game changer!",
      author: "Rahul Verma",
      role: "Marketing Manager",
      rating: 5,
      avatarColor: "#ff4d4f"
    },
    {
      id: 3,
      quote: "The document upload feature is brilliant. I uploaded my payslip and Finance Act PDF, and got instant personalized tax saving suggestions with exact section numbers.",
      author: "Anita Desai",
      role: "Teacher",
      rating: 4,
      avatarColor: "#52c41a"
    }
  ];

  // Stats data - Updated for CivicGPT
  const stats = [
    { 
      icon: <CloudSyncOutlined style={{ fontSize: 36 }} />,
      value: 15000,
      suffix: "+",
      label: "Tax Queries Solved",
      color: "#1890ff"
    },
    { 
      icon: <BarChartOutlined style={{ fontSize: 36 }} />,
      value: 87,
      suffix: "%",
      label: "User Satisfaction",
      color: "#ff4d4f"
    },
    { 
      icon: <CalculatorOutlined style={{ fontSize: 36 }} />,
      value: 25000000,
      suffix: "+",
      label: "Tax Saved",
      color: "#52c41a"
    },
    { 
      icon: <SafetyCertificateOutlined style={{ fontSize: 36 }} />,
      value: 4.7,
      precision: 1,
      label: "Average Rating",
      color: "#722ed1"
    }
  ];

  const orbitIcons = [
    FilePdfOutlined,
    CalculatorOutlined,
    BankOutlined,
    TranslationOutlined
  ];

  const floatingIcons = [
    <CheckCircleFilled />,
    <StarFilled />,
    <HeartFilled />,
    <ThunderboltFilled />,
    <RocketOutlined />,
    <CrownOutlined />,
    <TrophyOutlined />,
    <GlobalOutlined />
  ];
  

  return (
    <div id='home' style={{ overflowX: "hidden" }}>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          background: "linear-gradient(135deg, #0f172a 0%, #1F2937 100%)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Animated Background Elements */}
        {floatingIcons.map((icon, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
              y: [0, -30, 0],
              x: Math.random() * 100 - 50,
              rotate: Math.random() * 360
            }}
            transition={{ 
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
            style={{
              position: "absolute",
              fontSize: 20 + Math.random() * 15,
              color: "rgba(0, 255, 209, 0.2)",
              zIndex: 1,
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`
            }}
          >
            {icon}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            maxWidth: 1200,
            width: "100%",
            zIndex: 2,
            padding: "0 24px",
          }}
        >
          <Row align="middle" gutter={[48, 48]} style={{ width: "100%" }}>
            {/* Left Column - Text Content */}
            <Col xs={24} md={12}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Text
                  style={{
                    color: "#00FFD1",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    marginBottom: 20,
                    display: "block"
                  }}
                >
                  AI-POWERED TAX ASSISTANT
                </Text>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <Title
                  level={1}
                  style={{
                    color: "#FFFFFF",
                    fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: 24
                  }}
                >
                  <motion.span
                    style={{ display: "block" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Understand Complex
                  </motion.span>
                  <motion.span
                    style={{ display: "block" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    Tax Rules in
                  </motion.span>
                  <motion.span
                    style={{ 
                      display: "block", 
                      color: "#00FFD1",
                      background: "linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    Simple Language
                  </motion.span>
                </Title>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Paragraph
                  style={{
                    color: "#E0E0E0",
                    fontSize: "1.1rem",
                    marginBottom: 40,
                    lineHeight: 1.6
                  }}
                >
                  Upload your payslip and tax documents. Get instant, personalized tax saving 
                  advice with clear explanations of government policies that apply to you.
                </Paragraph>
              </motion.div>

              {/* CTA Buttons */}
              <Space size={16} style={{ marginTop: 16 }} wrap>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => handleNavigation("taxpayer")}
                    style={{
                      background: "linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)",
                      color: "#1F2937",
                      fontWeight: 600,
                      height: 50,
                      padding: "0 32px",
                      border: "none",
                      borderRadius: 8,
                      boxShadow: "0 4px 15px rgba(0, 255, 209, 0.3)"
                    }}
                    icon={<ArrowRightOutlined />}
                  >
                    Get Started Free
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="large"
                    onClick={() => handleNavigation("demo")}
                    style={{
                      background: "transparent",
                      color: "#FFFFFF",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      fontWeight: 600,
                      height: 50,
                      padding: "0 32px",
                      borderRadius: 8,
                      borderWidth: 2
                    }}
                  >
                    See Demo
                  </Button>
                </motion.div>
              </Space>
            </Col>

            {/* Right Column - Animation */}
            <Col xs={24} md={12}>
              <motion.div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  height: "400px",
                  perspective: "1000px"
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
              >
                {/* Animated Rings */}
                {[1, 2, 3].map((ring) => {
                  const size = 180 + ring * 40;
                  const thickness = 1 + ring * 0.5;
                  const color = ["rgba(0, 255, 209, 0.6)", "rgba(58, 123, 213, 0.4)", "rgba(114, 46, 209, 0.3)"][ring - 1];
                  
                  return (
                    <motion.div
                      key={ring}
                      style={{
                        position: "absolute",
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        border: `${thickness}px solid ${color}`,
                        zIndex: 1,
                      }}
                      animate={{ 
                        rotateX: 360,
                        rotateY: 360,
                        rotateZ: ring % 2 === 0 ? 360 : -360
                      }}
                      transition={{
                        duration: 20 + ring * 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      {/* Orbiting elements */}
                      {[0, 1, 2, 3].map((i) => {
                        const angle = (i / 4) * 2 * Math.PI;
                        const x = (size / 2) * Math.cos(angle);
                        const y = (size / 2) * Math.sin(angle);
                        
                        return (
                          <motion.div
                            key={i}
                            style={{
                              position: "absolute",
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: color,
                              zIndex: 2,
                              transform: `translate(${x}px, ${y}px)`
                            }}
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                              duration: 2 + i,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        );
                      })}
                    </motion.div>
                  );
                })}

                {/* Center Logo */}
                <motion.div
                  style={{ 
                    position: "relative", 
                    zIndex: 2,
                    transformStyle: "preserve-3d",
                  }}
                  animate={{ 
                    y: [0, -10, 0],
                    rotateY: 360
                  }}
                  transition={{ 
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    rotateY: { duration: 10, repeat: Infinity, ease: "linear" }
                  }}
                >
                  <GlitchText
                    speed={0.8}
                    enableShadows={true}
                    enableOnHover={true}
                    style={{
                      fontSize: "clamp(3rem, 8vw, 4.5rem)",
                      fontWeight: 800,
                      lineHeight: 1,
                      color: "#FFFFFF",
                    }}
                  >
                    CivicGPT
                  </GlitchText>
                </motion.div>

                {/* Orbiting Icons */}
                <motion.div
                  style={{
                    position: "absolute",
                    width: "240px",
                    height: "240px",
                  }}
                  animate={{ 
                    rotate: 360
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {orbitIcons.map((IconComponent, index) => {
                    const angle = (index / orbitIcons.length) * 2 * Math.PI;
                    const radius = 120;
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);
                    
                    return (
                      <motion.div
                        key={index}
                        style={{
                          position: "absolute",
                          fontSize: "24px",
                          color: "#00FFD1",
                          zIndex: 3,
                          transform: `translate(${x}px, ${y}px)`
                        }}
                        animate={{
                          rotate: -360,
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      >
                        <IconComponent />
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        padding: "100px 24px",
        background: "#FFFFFF"
      }}>
        <Row gutter={[48, 48]} justify="center">
          {stats.map((stat, index) => (
            <Col key={index} xs={24} sm={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  hoverable
                  style={{ 
                    borderRadius: 16,
                    border: "none",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                    textAlign: "center",
                    height: "100%",
                    transition: "all 0.3s ease"
                  }}
                  bodyStyle={{ padding: "40px 24px" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      color: stat.color,
                      fontSize: 42,
                      marginBottom: 20
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                  <Statistic
                    value={stat.value}
                    suffix={stat.suffix}
                    precision={stat.precision}
                    valueStyle={{ 
                      fontSize: "2.8rem",
                      fontWeight: 800,
                      color: "#1F2937"
                    }}
                  />
                  <Text style={{ 
                    fontSize: "1.1rem",
                    color: "#718096",
                    marginTop: 12,
                    display: "block",
                    fontWeight: 500
                  }}>
                    {stat.label}
                  </Text>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: "100px 24px",
        background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%)"
      }}>
        <div id='about' style={{ 
          maxWidth: 800,
          margin: "0 auto 80px",
          textAlign: "center"
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Text style={{
              color: "#00FFD1",
              fontSize: "1.1rem",
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 20,
              display: "block"
            }}>
              SMART TAX ASSISTANT
            </Text>
            <Title level={2} style={{ 
              color: "#1F2937",
              fontSize: "2.8rem",
              fontWeight: 800,
              marginBottom: 20
            }}>
              Your Personal Tax Advisor
            </Title>
            <Paragraph style={{ 
              color: "#718096",
              fontSize: "1.2rem",
              lineHeight: 1.6
            }}>
              AI-powered analysis of your financial documents to provide personalized tax saving 
              recommendations and clear explanations of government policies.
            </Paragraph>
          </motion.div>
        </div>

        <Row gutter={[32, 32]} style={{ maxWidth: 1200, margin: "0 auto" }}>
          {features.map((feature, index) => (
            <Col key={index} xs={24} sm={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{ height: "100%" }}
              >
                <Card
                  hoverable
                  style={{ 
                    borderRadius: 20,
                    border: "none",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                    height: "100%",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease"
                  }}
                  bodyStyle={{ padding: 0, flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                      background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}99 100%)`,
                      height: 140,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexShrink: 0
                    }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      style={{ 
                        background: "rgba(255, 255, 255, 0.2)",
                        width: 70,
                        height: 70,
                        borderRadius: "20%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backdropFilter: "blur(10px)"
                      }}
                    >
                      <div style={{ 
                        color: "white",
                        fontSize: 28
                      }}>
                        {feature.icon}
                      </div>
                    </motion.div>
                  </motion.div>

                  <div style={{ padding: "30px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <Title level={4} style={{ 
                      color: "#1F2937",
                      marginBottom: 16,
                      minHeight: "64px",
                      fontSize: "1.4rem"
                    }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ 
                      color: "#718096",
                      marginBottom: 24,
                      flex: 1,
                      fontSize: "1rem",
                      lineHeight: 1.6
                    }}>
                      {feature.description}
                    </Paragraph>

                    <Row gutter={16} style={{ marginTop: "auto" }}>
                      {feature.stats.map((stat, i) => (
                        <Col key={i} span={12}>
                          <Statistic
                            value={stat.value}
                            suffix={stat.suffix}
                            valueStyle={{ 
                              fontSize: "1.8rem",
                              fontWeight: 700,
                              color: feature.color
                            }}
                          />
                          <Text style={{ 
                            fontSize: "0.9rem",
                            color: "#718096",
                            fontWeight: 500
                          }}>
                            {stat.label}
                          </Text>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </section>

      {/* Testimonials Section */}
      <section style={{ 
        padding: "100px 24px",
        background: "linear-gradient(135deg, #1F2937 0%, #0f172a 100%)"
      }}>
        <div style={{ 
          maxWidth: 800,
          margin: "0 auto 80px",
          textAlign: "center"
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Text style={{
              color: "#00FFD1",
              fontSize: "1.1rem",
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 20,
              display: "block"
            }}>
              USER SUCCESS STORIES
            </Text>
            <Title level={2} style={{ 
              color: "#FFFFFF",
              fontSize: "2.8rem",
              fontWeight: 800,
              marginBottom: 20
            }}>
              What Taxpayers Are Saying...
            </Title>
            <Paragraph style={{ 
              color: "#E0E0E0",
              fontSize: "1.2rem",
              lineHeight: 1.6
            }}>
              Join thousands of taxpayers who are saving money and understanding tax rules better
            </Paragraph>
          </motion.div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Carousel
            autoplay
            autoplaySpeed={5000}
            effect="fade"
            dotPosition="bottom"
            dots={{ 
              className: "testimonial-dots",
              style: { bottom: -40 }
            }}
            style={{ paddingBottom: 60 }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} style={{ padding: "0 24px" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Card
                    style={{ 
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 20,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      padding: "50px"
                    }}
                  >
                    <div style={{ 
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center"
                    }}>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Avatar 
                          size={90}
                          style={{ 
                            backgroundColor: testimonial.avatarColor,
                            marginBottom: 24
                          }}
                          icon={<UserOutlined />}
                        />
                      </motion.div>
                      
                      <div style={{ marginBottom: 24 }}>
                        {[...Array(5)].map((_, i) => (
                          <StarFilled 
                            key={i} 
                            style={{ 
                              color: i < testimonial.rating ? "#FFD700" : "#4A5568",
                              fontSize: 24,
                              margin: "0 4px"
                            }} 
                          />
                        ))}
                      </div>
                      
                      <Paragraph style={{ 
                        color: "#FFFFFF",
                        fontSize: "1.3rem",
                        fontStyle: "italic",
                        marginBottom: 32,
                        maxWidth: 800,
                        lineHeight: 1.6
                      }}>
                        "{testimonial.quote}"
                      </Paragraph>
                      
                      <Title level={4} style={{ 
                        color: "#FFFFFF",
                        marginBottom: 8,
                        fontSize: "1.4rem"
                      }}>
                        {testimonial.author}
                      </Title>
                      
                      <Text style={{ 
                        color: "#00FFD1",
                        fontSize: "1rem",
                        fontWeight: 500
                      }}>
                        {testimonial.role}
                      </Text>
                    </div>
                  </Card>
                </motion.div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>
    </div>
  );
};

export default Home;