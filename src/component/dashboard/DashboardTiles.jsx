// component/dashboard/DashboardTiles.jsx
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Badge } from "react-bootstrap";
import axios from "axios";
import "./DashboardTiles.css";
import CONFIG from "../../../src/config";

function DashboardTiles() {
  const [counts, setCounts] = useState({ 
    totalVehicles: 0, 
    challanReminders: 0, 
    serviceReminders: 0, 
    insuranceReminders: 0 
  });
  const [reminderVehicles, setReminderVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [countsRes, remindersRes] = await Promise.all([
        axios.get(`${CONFIG.API_BASE_URL}/api/vehicles/counts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${CONFIG.API_BASE_URL}/api/vehicles/reminders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      ]);
      
      setCounts(countsRes.data);
      setReminderVehicles(remindersRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getReminderType = (vehicle) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const types = [];

    if (new Date(vehicle.renewalDate) <= thirtyDaysFromNow) {
      types.push('renewal');
    }
    if (new Date(vehicle.serviceDate) <= thirtyDaysFromNow) {
      types.push('service');
    }
    if (new Date(vehicle.insuranceExpiryDate) <= thirtyDaysFromNow) {
      types.push('insurance');
    }

    return types;
  };

  const getReminderBadge = (type) => {
    const colors = {
      renewal: 'primary',
      service: 'success',
      insurance: 'info'
    };
    
    const icons = {
      renewal: <i className="bi bi-calendar-check me-1"></i>,
      service: <i className="bi bi-tools me-1"></i>,
      insurance: <i className="bi bi-shield-check me-1"></i>
    };

    return (
      <Badge bg={colors[type]} className="reminder-type-badge">
        {icons[type]}
        {type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-tiles-container">
      <div className="dashboard-header">
        <h4>Dashboard Overview</h4>
        <p className="text-muted">Quick overview of your vehicles and upcoming reminders</p>
      </div>

      {/* Tiles Row */}
      <Row className="g-4 mb-5">
        <Col xl={3} lg={6} md={6}>
          <Card className="tile-card total-vehicles">
            <Card.Body>
              <div className="tile-content">
                <div className="tile-icon">
                  <i className="bi bi-car-front-fill"></i>
                </div>
                <div className="tile-info">
                  <h3>{counts.totalVehicles}</h3>
                  <p>Total Vehicles</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="tile-card challan-reminders">
            <Card.Body>
              <div className="tile-content">
                <div className="tile-icon">
                  <i className="bi bi-calendar-date"></i>
                </div>
                <div className="tile-info">
                  <h3>{counts.challanReminders}</h3>
                  <p>Challan Reminders</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="tile-card service-reminders">
            <Card.Body>
              <div className="tile-content">
                <div className="tile-icon">
                  <i className="bi bi-tools"></i>
                </div>
                <div className="tile-info">
                  <h3>{counts.serviceReminders}</h3>
                  <p>Service Reminders</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="tile-card insurance-reminders">
            <Card.Body>
              <div className="tile-content">
                <div className="tile-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div className="tile-info">
                  <h3>{counts.insuranceReminders}</h3>
                  <p>Insurance Alerts</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reminder Vehicles Section */}
      <div className="reminder-vehicles-section">
        <h5 className="section-title">
          <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
          Upcoming Reminders
          {reminderVehicles.length > 0 && (
            <Badge bg="warning" className="ms-2">
              {reminderVehicles.length} vehicle{reminderVehicles.length > 1 ? 's' : ''}
            </Badge>
          )}
        </h5>

        {reminderVehicles.length === 0 ? (
          <Card className="no-reminders-card">
            <Card.Body className="text-center py-4">
              <i className="bi bi-shield-check text-muted mb-3" style={{fontSize: '48px'}}></i>
              <h6 className="text-muted">No upcoming reminders</h6>
              <p className="text-muted small">You're all caught up! No renewals or services due in the next 30 days.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-3">
            {reminderVehicles.map((vehicle) => {
              const reminderTypes = getReminderType(vehicle);
              
              return (
                <Col key={vehicle._id} xl={4} lg={6} md={6}>
                  <Card className="reminder-vehicle-card">
                    <Card.Body>
                      <div className="reminder-vehicle-header">
                        <h6 className="vehicle-registration">
                          {vehicle.registrationNumber}
                        </h6>
                        <div className="reminder-badges">
                          {reminderTypes.map(type => (
                            <span key={type}>
                              {getReminderBadge(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <p className="vehicle-make-model text-muted">
                        {vehicle.make} {vehicle.model}
                      </p>

                      <div className="reminder-dates">
                        {reminderTypes.includes('renewal') && (
                          <div className="date-item">
                            <i className="bi bi-calendar-check me-2 text-primary"></i>
                            <small>Renewal: {new Date(vehicle.renewalDate).toLocaleDateString()}</small>
                          </div>
                        )}
                        {reminderTypes.includes('service') && (
                          <div className="date-item">
                            <i className="bi bi-tools me-2 text-success"></i>
                            <small>Service: {new Date(vehicle.serviceDate).toLocaleDateString()}</small>
                          </div>
                        )}
                        {reminderTypes.includes('insurance') && (
                          <div className="date-item">
                            <i className="bi bi-shield-check me-2 text-info"></i>
                            <small>Insurance: {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}</small>
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
}

export default DashboardTiles;