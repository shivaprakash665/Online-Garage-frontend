// src/component/dashboard/AgentDashboard.jsx - UPDATE
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Navbar, Nav, NavDropdown, Alert, Button } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import AgentSidebar from "./AgentSidebar";
import AgentDashboardTiles from "./AgentDashboardTiles";
import ExpiringVehicles from "./ExpiringVehicles";
import SentRequests from "./SentRequests";
import IncomingRequests from "./IncomingRequests"; // ADD THIS IMPORT
import "./AgentDashboard.css";

function AgentDashboard() {
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [roleError, setRoleError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    console.log("🔍 Dashboard - Stored role:", role);
    
    // More flexible role checking
    const isAgent = role === "insurance agent" || 
                   role === "insurance_agent" || 
                   role === "agent" ||
                   role === "insurance";
    
    if (!isAgent) {
      console.log("⚠️ Role mismatch - Stored:", role, "Expected insurance agent");
      setRoleError(true);
      showAlert(`Access denied. Insurance agent role required. Your role: ${role}`, "danger");
      return;
    }
    
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ 
          name: payload.name || "insurance agent",
          id: payload.id 
        });
      } catch (err) {
        console.error("Invalid token");
      }
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (roleError) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Alert variant="danger" className="text-center">
          <h4>Access Denied</h4>
          <p>You need to be an insurance agent to access this dashboard.</p>
          <p>Current role: {localStorage.getItem("role") || "None"}</p>
          <Button variant="primary" onClick={handleLogout}>
            Return to Login
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="agent-dashboard-container">
      <Navbar bg="dark" variant="dark" expand="lg" className="agent-navbar">
        <Navbar.Brand className="agent-brand">
          <i className="bi bi-shield-check me-2"></i>
          Insurance Agent Portal
        </Navbar.Brand>
        
        <Nav className="ms-auto">
          <NavDropdown 
            title={
              <span>
                <i className="bi bi-person-circle me-1"></i>
                {user?.name || "Agent"}
              </span>
            } 
            id="profile-dropdown"
            align="end"
          >
            <NavDropdown.Item onClick={handleLogout} className="text-danger">
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar>

      {alert.show && (
        <Alert variant={alert.type} className="alert-dismissible fade show agent-alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false, message: "", type: "" })}></button>
        </Alert>
      )}

      <Container fluid className="agent-main-content">
        <Row className="main-content-row">
          <Col md={3} lg={2} className="sidebar-column">
            <AgentSidebar showAlert={showAlert} />
          </Col>

          <Col md={9} lg={10} className="main-content-column">
            <div className="content-area">
              <Routes>
                <Route path="/" element={<AgentDashboardTiles showAlert={showAlert} />} />
                <Route path="/expiring-vehicles" element={<ExpiringVehicles showAlert={showAlert} />} />
                <Route path="/sent-requests" element={<SentRequests showAlert={showAlert} />} />
                <Route path="/incoming-requests" element={<IncomingRequests showAlert={showAlert} />} /> {/* ADD THIS */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AgentDashboard;