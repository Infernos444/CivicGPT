import React, { useState } from "react";
import { Layout, Button, Drawer } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Header } = Layout;

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();

  const toggleDrawer = () => setVisible(!visible);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
      setVisible(false);
    }
  };

  const navItems = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" }
  ];

  return (
    <>
      {/* Navbar Header */}
      <Layout style={{ background: "transparent" }}>
        <Header
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 1000,
            padding: "0 40px",
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(0, 255, 209, 0.1)",
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              color: "#00FFD1",
              fontSize: "28px",
              fontWeight: "bold",
              fontFamily: "Poppins, sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => scrollToSection("home")}
          >
            <div style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)",
            }} />
            EvalAI
          </motion.div>

          <div className="nav-links" style={{ display: "flex", gap: 8 }}>
            <div className="desktop-menu" style={{ display: "flex", gap: 4 }}>
              {navItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Button
                    type="text"
                    style={{
                      color: activeSection === item.id ? "#00FFD1" : "#E0E0E0",
                      fontWeight: 600,
                      fontSize: "16px",
                      height: 45,
                      padding: "0 20px",
                      border: "none",
                      background: activeSection === item.id ? "rgba(0, 255, 209, 0.1)" : "transparent",
                      borderRadius: 8,
                    }}
                    onClick={() => scrollToSection(item.id)}
                    onMouseEnter={(e) => {
                      if (activeSection !== item.id) {
                        e.target.style.color = "#00FFD1";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== item.id) {
                        e.target.style.color = "#E0E0E0";
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  onClick={() => navigate("/login")}
                  style={{
                    background: "linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)",
                    color: "#1F2937",
                    fontWeight: 700,
                    fontSize: "16px",
                    border: "none",
                    height: 45,
                    padding: "0 24px",
                    borderRadius: 8,
                    boxShadow: "0 4px 15px rgba(0, 255, 209, 0.3)",
                  }}
                >
                  Login
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="mobile-menu-icon" style={{ display: "none" }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MenuOutlined
                onClick={toggleDrawer}
                style={{ 
                  color: "#00FFD1", 
                  fontSize: 24, 
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: 6,
                  background: "rgba(0, 255, 209, 0.1)"
                }}
              />
            </motion.div>
          </div>
        </Header>
      </Layout>

      {/* Mobile Drawer */}
      <Drawer
        placement="right"
        onClose={toggleDrawer}
        open={visible}
        closable={false}
        bodyStyle={{ 
          backgroundColor: "#0f172a",
          padding: "24px 16px",
          background: "linear-gradient(135deg, #0f172a 0%, #1F2937 100%)"
        }}
        headerStyle={{ 
          border: "none",
          background: "transparent"
        }}
        title={
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            padding: "16px 0"
          }}>
            <div style={{
              color: "#00FFD1",
              fontSize: "24px",
              fontWeight: "bold",
              fontFamily: "Poppins, sans-serif",
            }}>
              EvalAI
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <CloseOutlined
                onClick={toggleDrawer}
                style={{ 
                  color: "#00FFD1", 
                  fontSize: 20, 
                  cursor: "pointer",
                  padding: 4
                }}
              />
            </motion.div>
          </div>
        }
      >
        <div style={{ padding: "20px 0" }}>
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                onClick={() => scrollToSection(item.id)}
                style={{
                  padding: "20px 16px",
                  fontSize: "18px",
                  color: activeSection === item.id ? "#00FFD1" : "#E0E0E0",
                  cursor: "pointer",
                  fontWeight: 600,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  background: activeSection === item.id ? "rgba(0, 255, 209, 0.1)" : "transparent",
                  borderRadius: 8,
                  marginBottom: 8,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== item.id) {
                    e.target.style.color = "#00FFD1";
                    e.target.style.background = "rgba(0, 255, 209, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== item.id) {
                    e.target.style.color = "#E0E0E0";
                    e.target.style.background = "transparent";
                  }
                }}
              >
                {item.label}
              </div>
            </motion.div>
          ))}

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: 24 }}
          >
            <Button
              type="primary"
              block
              size="large"
              style={{
                background: "linear-gradient(135deg, #00FFD1 0%, #3A7BD5 100%)",
                color: "#1F2937",
                fontWeight: 700,
                fontSize: "16px",
                height: 50,
                border: "none",
                borderRadius: 8,
                boxShadow: "0 4px 15px rgba(0, 255, 209, 0.3)",
              }}
              onClick={() => {
                setVisible(false);
                navigate("/login");
              }}
            >
              Login
            </Button>
          </motion.div>
        </div>
      </Drawer>

      {/* Responsive + Scroll Behavior */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-menu {
              display: none !important;
            }
            .mobile-menu-icon {
              display: block !important;
            }
          }

          @media (max-width: 480px) {
            .ant-layout-header {
              padding: 0 20px !important;
            }
          }

          html {
            scroll-behavior: smooth;
          }

          /* Custom scrollbar for the drawer */
          .ant-drawer-body::-webkit-scrollbar {
            width: 4px;
          }

          .ant-drawer-body::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
          }

          .ant-drawer-body::-webkit-scrollbar-thumb {
            background: #00FFD1;
            border-radius: 2px;
          }
        `}
      </style>
    </>
  );
};

export default Navbar;