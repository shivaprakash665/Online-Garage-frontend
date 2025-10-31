import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Container, Row, Col, Navbar, Nav, NavDropdown, Button, Modal, Form } from "react-bootstrap";
import Sidebar from "./Sidebar";
import DashboardTiles from "./DashboardTiles";
import AddVehicle from "./AddVehicle";
import VehicleList from "./VehicleList"; 
import ServiceReminders from "./ServiceReminders";
import VehicleRenewal from "./VehicleRenewal";
import InsuranceReminders from "./InsuranceReminders";
import axios from "axios";


function UserDashboard() {
  const [user, setUser] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ name: payload.name || "User" }); // Assuming 'name' is in JWT payload
      } catch (err) {
        console.error("Invalid token");
        navigate("/"); // Redirect if token is invalid
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleFeedbackSubmit = async () => {
    try {
      await axios.post("https://online-garage-api-2.onrender.com/api/feedback", { message: feedback }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Feedback submitted!");
      setShowFeedback(false);
      setFeedback("");
    } catch (err) {
      alert("Error submitting feedback");
    }
  };

  return (
    <Container fluid>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand>Welcome, {user?.name}</Navbar.Brand>
        <Nav className="ml-auto">
          <Button variant="outline-light" onClick={() => setShowFeedback(true)}>Feedback/Report</Button>
          <NavDropdown title="Profile" id="profile-dropdown">
            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar>
      <Row>
        <Col md={2}>
          <Sidebar />
        </Col>
        <Col md={10}>
          <Routes>
            <Route path="/" element={<DashboardTiles />} />
            <Route path="/addvehicle" element={<AddVehicle />} />
            <Route path="/vehiclelist" element={<VehicleList />} />
            <Route path="/service-reminders" element={<ServiceReminders />} />
            <Route path="/renewal-reminders" element={<VehicleRenewal />} />
            <Route path="/insurance-reminders" element={<InsuranceReminders />} />
          </Routes>
        </Col>
      </Row>

      <Modal show={showFeedback} onHide={() => setShowFeedback(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback..."
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeedback(false)}>Close</Button>
          <Button variant="primary" onClick={handleFeedbackSubmit}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default UserDashboard;