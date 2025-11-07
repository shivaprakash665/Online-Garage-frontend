// src/component/dashboard/AdminDashboardTiles.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


import CONFIG from "../../../src/config";

const AdminDashboardTiles = ({ showAlert }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    activeUsers: 0,
    activeAgents: 0,
    totalVehicles: 0,
    totalFeedback: 0,
    inactiveUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/admin/dashboard-stats`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
      showAlert('Failed to load dashboard statistics', 'danger');
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Col xl={3} lg={4} md={6} className="mb-4">
      <Card 
        className={`stats-card h-100 border-0 bg-${color} text-white`}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
        onClick={onClick}
      >
        <Card.Body className="d-flex align-items-center">
          <div className="flex-grow-1">
            <h3 className="mb-1">{loading ? '...' : value}</h3>
            <p className="mb-0 small opacity-75">{title}</p>
          </div>
          <div className="flex-shrink-0 ms-3">
            <i className={`${icon} fs-1 opacity-75`}></i>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="success" className="mb-3" />
            <p>Loading dashboard statistics...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">
          <h5>Error loading dashboard</h5>
          <p>{error}</p>
          <button className="btn btn-admin" onClick={fetchDashboardStats}>
            Retry
          </button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="mb-4">
        <h2 className="text-dark mb-2">Admin Dashboard</h2>
        <p className="text-muted">Overview of system statistics and user management</p>
      </div>

      <Row>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="bi-people"
          color="primary"
          onClick={() => navigate('/admin-dashboard/users')}
        />
        
        <StatCard
          title="Insurance Agents"
          value={stats.totalAgents}
          icon="bi-shield-check"
          color="info"
        />
        
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon="bi-person-check"
          color="success"
        />
        
        <StatCard
          title="Inactive Users"
          value={stats.inactiveUsers}
          icon="bi-person-x"
          color="warning"
        />
        
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          icon="bi-car-front"
          color="secondary"
        />
        
        <StatCard
          title="Pending Feedback"
          value={stats.totalFeedback}
          icon="bi-chat-left-text"
          color="dark"
          onClick={() => navigate('/admin-dashboard/feedback')}
        />
      </Row>

      {/* Quick Actions */}
      <Row className="mt-5">
        <Col>
          <Card className="admin-table">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="justify-content-center">
                <Col md={6} className="mb-3">
                  <button 
                    className="btn btn-admin w-100 py-3"
                    onClick={() => navigate('/admin-dashboard/users')}
                  >
                    <i className="bi bi-people me-2"></i>
                    Manage All Users
                  </button>
                </Col>
                <Col md={6} className="mb-3">
                  <button 
                    className="btn btn-outline-admin w-100 py-3"
                    onClick={() => navigate('/admin-dashboard/feedback')}
                  >
                    <i className="bi bi-chat-left-text me-2"></i>
                    View Feedback
                  </button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* System Status section has been completely removed */}
    </Container>
  );
};

export default AdminDashboardTiles;