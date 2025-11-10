// src/component/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Navbar, Nav, NavDropdown, Alert } from "react-bootstrap";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import AdminDashboardTiles from "./AdminDashboardTiles";
import UserManagement from "./UserManagement";
import UserDetails from "./UserDetails";
import FeedbackManagement from "./FeedbackManagement";
import "./AdminDashboard.css";
import IncomingRequests from "./IncomingRequests";

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [roleError, setRoleError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const role = userData?.role;
    
    if (role !== "admin") {
      setRoleError(true);
      showAlert("Access denied. Admin role required.", "danger");
      return;
    }
    
    setUser(userData);
  }, []);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  if (roleError) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Alert variant="danger" className="text-center">
          <h4>Access Denied</h4>
          <p>You need to be an administrator to access this dashboard.</p>
          <p>Current role: {localStorage.getItem("role") || "None"}</p>
          <button className="btn btn-primary" onClick={handleLogout}>
            Return to Login
          </button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg" className="admin-navbar">
        <Navbar.Brand className="admin-brand">
          <i className="bi bi-shield-lock me-2"></i>
          Admin Portal
        </Navbar.Brand>
        
        <Navbar.Text className="text-light me-3">
          Welcome, {user?.name || "Admin"}
        </Navbar.Text>

        <Nav className="ms-auto">
          <NavDropdown 
            title={
              <span>
                <i className="bi bi-person-gear me-1"></i>
                Admin
              </span>
            } 
            id="admin-dropdown"
            align="end"
          >
            <NavDropdown.Item onClick={handleLogout} className="text-danger">
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar>

      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.type} className="alert-dismissible fade show admin-alert m-0">
          <div className="container-fluid">
            {alert.message}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setAlert({ show: false, message: "", type: "" })}
            ></button>
          </div>
        </Alert>
      )}

      {/* Main Content */}
      <Container fluid className="admin-main-content">
        <Row className="main-content-row">
          {/* Sidebar */}
          <Col md={3} lg={2} className="sidebar-column">
            <AdminSidebar showAlert={showAlert} />
          </Col>

          {/* Main Content Area */}
          <Col md={9} lg={10} className="main-content-column">
            <div className="content-area">
              <Routes>
                <Route path="/" element={<AdminDashboardTiles showAlert={showAlert} />} />
                <Route path="/users" element={<UserManagement showAlert={showAlert} />} />
                <Route path="/users/:userId" element={<UserDetails showAlert={showAlert} />} />
                <Route path="/feedback" element={<FeedbackManagement showAlert={showAlert} />} />
                <Route path="/incoming-requests" element={<IncomingRequests showAlert={showAlert} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AdminDashboard;