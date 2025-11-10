// src/component/dashboard/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Nav, NavDropdown, Badge } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import axios from "axios";
import "./Sidebar.css";
import CONFIG from "../../../src/config";

function Sidebar() {
  const [reminderCounts, setReminderCounts] = useState({
    service: 0,
    renewal: 0,
    insurance: 0
  });
  const [insuranceRequests, setInsuranceRequests] = useState(0);

  useEffect(() => {
    fetchReminderCounts();
    fetchInsuranceRequestsCount();
  }, []);

  const fetchReminderCounts = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const vehicles = response.data;
      
      // Count service reminders
      const serviceCount = vehicles.filter(vehicle => 
        new Date(vehicle.serviceDate) <= thirtyDaysFromNow && 
        new Date(vehicle.serviceDate) >= now
      ).length;
      
      // Count renewal reminders
      const renewalCount = vehicles.filter(vehicle => 
        new Date(vehicle.renewalDate) <= thirtyDaysFromNow && 
        new Date(vehicle.renewalDate) >= now
      ).length;
      
      // Count insurance reminders
      const insuranceCount = vehicles.filter(vehicle => 
        new Date(vehicle.insuranceExpiryDate) <= thirtyDaysFromNow && 
        new Date(vehicle.insuranceExpiryDate) >= now
      ).length;
      
      setReminderCounts({
        service: serviceCount,
        renewal: renewalCount,
        insurance: insuranceCount
      });
      
    } catch (err) {
      console.error("Error fetching reminder counts:", err);
    }
  };

  const fetchInsuranceRequestsCount = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/insurance/user-requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      // Count pending insurance requests
      const pendingRequests = response.data.filter(request => 
        request.status === 'pending'
      ).length;
      
      setInsuranceRequests(pendingRequests);
    } catch (err) {
      console.error("Error fetching insurance requests count:", err);
    }
  };

  const totalReminders = reminderCounts.service + reminderCounts.renewal + reminderCounts.insurance;

  return (
    <div className="sidebar-container">
      <Nav className="flex-column sidebar-nav">
        {/* Dashboard Link */}
        <LinkContainer to="/userdashboard">
          <Nav.Link className="sidebar-link">
            <i className="bi bi-speedometer2 sidebar-icon"></i>
            Dashboard
          </Nav.Link>
        </LinkContainer>
        
        {/* NEW: Request Insurance Renewal */}
        <LinkContainer to="/userdashboard/request-renewal">
          <Nav.Link className="sidebar-link">
            <i className="bi bi-send-check sidebar-icon"></i>
            Request Renewal
          </Nav.Link>
        </LinkContainer>
        
        {/* Vehicle Dropdown */}
        <NavDropdown 
          title={
            <span>
              <i className="bi bi-car-front sidebar-icon"></i>
              Vehicle
            </span>
          } 
          id="vehicle-dropdown"
          className="sidebar-dropdown"
        >
          <LinkContainer to="/userdashboard/vehiclelist">
            <NavDropdown.Item className="dropdown-item">
              <i className="bi bi-list-ul me-2"></i>
              Vehicle List
            </NavDropdown.Item>
          </LinkContainer>
          <LinkContainer to="/userdashboard/addvehicle">
            <NavDropdown.Item className="dropdown-item">
              <i className="bi bi-plus-circle me-2"></i>
              Add Vehicle
            </NavDropdown.Item>
          </LinkContainer>
        </NavDropdown>

        {/* Reminders Dropdown */}
        <NavDropdown 
          title={
            <span>
              <i className="bi bi-bell sidebar-icon"></i>
              Reminders
              {totalReminders > 0 && (
                <Badge bg="warning" className="sidebar-badge">
                  {totalReminders}
                </Badge>
              )}
            </span>
          } 
          id="reminders-dropdown"
          className="sidebar-dropdown"
        >
          <LinkContainer to="/userdashboard/service-reminders">
            <NavDropdown.Item className="dropdown-item">
              <i className="bi bi-tools me-2 text-success"></i>
              Service Reminders
              {reminderCounts.service > 0 && (
                <Badge bg="success" className="ms-2">
                  {reminderCounts.service}
                </Badge>
              )}
            </NavDropdown.Item>
          </LinkContainer>
          <LinkContainer to="/userdashboard/renewal-reminders">
            <NavDropdown.Item className="dropdown-item">
              <i className="bi bi-calendar-check me-2 text-primary"></i>
              Vehicle Renewal
              {reminderCounts.renewal > 0 && (
                <Badge bg="primary" className="ms-2">
                  {reminderCounts.renewal}
                </Badge>
              )}
            </NavDropdown.Item>
          </LinkContainer>
          <LinkContainer to="/userdashboard/insurance-reminders">
            <NavDropdown.Item className="dropdown-item">
              <i className="bi bi-shield-check me-2 text-info"></i>
              Insurance Reminders
              {reminderCounts.insurance > 0 && (
                <Badge bg="info" className="ms-2">
                  {reminderCounts.insurance}
                </Badge>
              )}
            </NavDropdown.Item>
          </LinkContainer>
        </NavDropdown>

        {/* Insurance Requests */}
        <LinkContainer to="/userdashboard/insurance-requests">
          <Nav.Link className="sidebar-link">
            <i className="bi bi-shield-plus sidebar-icon"></i>
            Insurance Requests
            {insuranceRequests > 0 && (
              <Badge bg="primary" className="sidebar-badge">
                {insuranceRequests}
              </Badge>
            )}
          </Nav.Link>
        </LinkContainer>

        {/* Profile Dropdown */}
        <NavDropdown 
          title={
            <span>
              <i className="bi bi-person-circle sidebar-icon"></i>
              Profile
            </span>
          } 
          id="profile-dropdown"
          className="sidebar-dropdown"
        >
          <NavDropdown.Item className="dropdown-item">
            <i className="bi bi-person me-2"></i>
            My Profile
          </NavDropdown.Item>
          <NavDropdown.Item className="dropdown-item">
            <i className="bi bi-gear me-2"></i>
            Settings
          </NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item className="dropdown-item text-danger">
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </NavDropdown.Item>
        </NavDropdown>
      </Nav>
    </div>
  );
}

export default Sidebar;