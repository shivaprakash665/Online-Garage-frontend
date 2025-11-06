// src/component/dashboard/AgentDashboardTiles.jsx
import React, { useState, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import "./AgentDashboardTiles.css";
import CONFIG from "../../../src/config";

function AgentDashboardTiles({ showAlert }) {
  const [stats, setStats] = useState({
    totalRequests: 0,
    acceptedRequests: 0,
    pendingRequests: 0,
    expiredVehiclesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/insurance/agent/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      showAlert("Error loading dashboard statistics", "danger");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="agent-tiles-loading">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-dashboard-tiles">
      <div className="dashboard-header">
        <h4>Insurance Agent Dashboard</h4>
        <p className="text-muted">Overview of your insurance renewal activities</p>
      </div>

      <Row className="g-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="stat-card total-requests">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">
                  <i className="bi bi-envelope-check"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.totalRequests}</h3>
                  <p>Total Requests Sent</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="stat-card accepted-requests">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.acceptedRequests}</h3>
                  <p>Accepted Requests</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="stat-card pending-requests">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">
                  <i className="bi bi-clock"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.pendingRequests}</h3>
                  <p>Pending Requests</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="stat-card expired-vehicles">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon">
                  <i className="bi bi-car-front"></i>
                </div>
                <div className="stat-info">
                  <h3>{stats.expiredVehiclesCount}</h3>
                  <p>Expiring Vehicles</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Section */}
      <Row className="g-4 mt-4">
        <Col xs={12}>
          <Card className="quick-actions-card">
            <Card.Body>
              <h5 className="mb-4">Quick Actions</h5>
              <Row className="g-3">
                <Col md={6} lg={3}>
                  <div className="quick-action-item text-center">
                    <i className="bi bi-search"></i>
                    <h6>View Expiring Vehicles</h6>
                    <p className="text-muted small">Check vehicles needing insurance renewal</p>
                  </div>
                </Col>
                <Col md={6} lg={3}>
                  <div className="quick-action-item text-center">
                    <i className="bi bi-envelope-plus"></i>
                    <h6>Send New Requests</h6>
                    <p className="text-muted small">Contact vehicle owners for renewal</p>
                  </div>
                </Col>
                <Col md={6} lg={3}>
                  <div className="quick-action-item text-center">
                    <i className="bi bi-list-check"></i>
                    <h6>Manage Requests</h6>
                    <p className="text-muted small">Track sent requests and status</p>
                  </div>
                </Col>
                <Col md={6} lg={3}>
                  <div className="quick-action-item text-center">
                    <i className="bi bi-graph-up"></i>
                    <h6>View Reports</h6>
                    <p className="text-muted small">Analyze your performance</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AgentDashboardTiles;