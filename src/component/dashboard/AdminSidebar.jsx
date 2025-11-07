// src/component/dashboard/AdminSidebar.jsx
import React from "react";
import { Nav } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = ({ showAlert }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: "/admin-dashboard",
      icon: "bi-speedometer2",
      label: "Dashboard",
      exact: true
    },
    {
      path: "/admin-dashboard/users",
      icon: "bi-people",
      label: "User Management"
    },
    {
      path: "/admin-dashboard/feedback",
      icon: "bi-chat-left-text",
      label: "Feedback Management"
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h5>Admin Panel</h5>
      </div>
      
      <Nav className="flex-column sidebar-nav">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.path}
            className={`sidebar-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <i className={`${item.icon} me-2`}></i>
            {item.label}
            {isActive(item.path, item.exact) && (
              <div className="active-indicator"></div>
            )}
          </Nav.Link>
        ))}
      </Nav>
      
      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-indicator online"></div>
          <small>System Online</small>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;