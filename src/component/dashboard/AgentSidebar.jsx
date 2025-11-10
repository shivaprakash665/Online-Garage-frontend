// src/component/dashboard/AgentSidebar.jsx
import React, { useState, useEffect } from "react";
import { Nav, NavDropdown, Badge } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import axios from "axios";
import "./AgentSidebar.css";
import CONFIG from "../../../src/config";

function AgentSidebar() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    expiredVehiclesCount: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [incomingRequestsCount, setIncomingRequestsCount] = useState(0);

  useEffect(() => {
    fetchSidebarData();
    const interval = setInterval(fetchSidebarData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSidebarData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [statsRes, notificationsRes, incomingRes] = await Promise.all([
        axios.get(`${CONFIG.API_BASE_URL}/api/insurance/agent/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${CONFIG.API_BASE_URL}/api/insurance/agent/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        // Fetch incoming requests count
        axios.get(`${CONFIG.API_BASE_URL}/api/insurance/agent/incoming-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setStats(statsRes.data);
      setNotifications(notificationsRes.data);
      
      // Count pending incoming requests
      const pendingIncoming = incomingRes.data.filter(
        request => request.status === 'pending'
      ).length;
      setIncomingRequestsCount(pendingIncoming);
      
    } catch (err) {
      console.error("Error fetching sidebar data:", err);
    }
  };

  return (
    <div className="agent-sidebar-container">
      <Nav className="flex-column agent-sidebar-nav">
        {/* Dashboard Link */}
        <LinkContainer to="/agentdashboard">
          <Nav.Link className="sidebar-link">
            <i className="bi bi-speedometer2 sidebar-icon"></i>
            Dashboard
          </Nav.Link>
        </LinkContainer>
        
        {/* NEW: Incoming Requests */}
        <LinkContainer to="/agentdashboard/incoming-requests">
          <Nav.Link className="sidebar-link">
            <i className="bi bi-inbox sidebar-icon"></i>
            Incoming Requests
            {incomingRequestsCount > 0 && (
              <Badge bg="primary" className="sidebar-badge">
                {incomingRequestsCount}
              </Badge>
            )}
          </Nav.Link>
        </LinkContainer>
        
        {/* Expiring Vehicles */}
        <LinkContainer to="/agentdashboard/expiring-vehicles">
          <Nav.Link className="sidebar-link">
            <i className="bi bi-car-front sidebar-icon"></i>
            Expiring Vehicles
            {stats.expiredVehiclesCount > 0 && (
              <Badge bg="danger" className="sidebar-badge">
                {stats.expiredVehiclesCount}
              </Badge>
            )}
          </Nav.Link>
        </LinkContainer>

        {/* Sent Requests */}
        <LinkContainer to="/agentdashboard/sent-requests">
          <Nav.Link className="sidebar-link">
            <i className="bi bi-envelope sidebar-icon"></i>
            Sent Requests
            {stats.pendingRequests > 0 && (
              <Badge bg="warning" className="sidebar-badge">
                {stats.pendingRequests}
              </Badge>
            )}
          </Nav.Link>
        </LinkContainer>

        {/* Notifications Dropdown */}
        <NavDropdown 
          title={
            <span>
              <i className="bi bi-bell sidebar-icon"></i>
              Notifications
              {notifications.length > 0 && (
                <Badge bg="primary" className="sidebar-badge">
                  {notifications.length}
                </Badge>
              )}
            </span>
          } 
          id="notifications-dropdown"
          className="sidebar-dropdown"
        >
          <NavDropdown.Header>Recent Notifications</NavDropdown.Header>
          {notifications.length === 0 ? (
            <NavDropdown.ItemText className="text-muted small px-3">
              No new notifications
            </NavDropdown.ItemText>
          ) : (
            notifications.slice(0, 5).map(notification => (
              <NavDropdown.Item key={notification._id} className="notification-dropdown-item">
                <div className="notification-preview">
                  <strong>{notification.userId?.name}</strong>
                  <div className="notification-text">
                    {notification.status === 'accepted' 
                      ? 'accepted your insurance request' 
                      : 'insurance updated successfully'
                    }
                  </div>
                  <small className="text-muted">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </NavDropdown.Item>
            ))
          )}
        </NavDropdown>
      </Nav>
    </div>
  );
}

export default AgentSidebar;