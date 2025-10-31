// component/dashboard/ServiceReminders.jsx
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Badge } from "react-bootstrap";
import axios from "axios";
import "./Reminders.css";

function ServiceReminders() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceReminders();
  }, []);

  const fetchServiceReminders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://online-garage-api-2.onrender.com/api/vehicles", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // Filter vehicles with service due in next 30 days
      const serviceVehicles = response.data.filter(vehicle => 
        new Date(vehicle.serviceDate) <= thirtyDaysFromNow && 
        new Date(vehicle.serviceDate) >= now
      );
      
      // Sort by service date (earliest first)
      serviceVehicles.sort((a, b) => new Date(a.serviceDate) - new Date(b.serviceDate));
      
      setVehicles(serviceVehicles);
    } catch (err) {
      console.error("Error fetching service reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilService = (serviceDate) => {
    const today = new Date();
    const service = new Date(serviceDate);
    const diffTime = service - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyBadge = (days) => {
    if (days <= 7) return <Badge bg="danger">Urgent</Badge>;
    if (days <= 14) return <Badge bg="warning">Soon</Badge>;
    return <Badge bg="info">Upcoming</Badge>;
  };

  if (loading) {
    return (
      <div className="reminders-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="reminders-container">
      <div className="reminders-header">
        <h4>
          <i className="bi bi-tools me-2 text-success"></i>
          Service Reminders
        </h4>
        <p className="text-muted">Vehicles requiring service in the next 30 days</p>
      </div>

      {vehicles.length === 0 ? (
        <Card className="no-reminders-card">
          <Card.Body className="text-center py-5">
            <i className="bi bi-check-circle text-muted mb-3" style={{fontSize: '48px'}}></i>
            <h5 className="text-muted">No Service Reminders</h5>
            <p className="text-muted">All vehicles are up to date with their service schedule.</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="reminders-summary mb-4">
            <Card className="summary-card">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <div className="summary-item text-center">
                      <h3 className="text-danger">{vehicles.filter(v => getDaysUntilService(v.serviceDate) <= 7).length}</h3>
                      <p className="text-muted mb-0">Urgent (Within 7 days)</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="summary-item text-center">
                      <h3 className="text-warning">{vehicles.filter(v => getDaysUntilService(v.serviceDate) > 7 && getDaysUntilService(v.serviceDate) <= 14).length}</h3>
                      <p className="text-muted mb-0">Soon (8-14 days)</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="summary-item text-center">
                      <h3 className="text-info">{vehicles.filter(v => getDaysUntilService(v.serviceDate) > 14).length}</h3>
                      <p className="text-muted mb-0">Upcoming (15-30 days)</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>

          <Row className="g-4">
            {vehicles.map((vehicle) => {
              const daysUntilService = getDaysUntilService(vehicle.serviceDate);
              
              return (
                <Col key={vehicle._id} xl={6} lg={6} md={12}>
                  <Card className="reminder-card service-reminder">
                    <Card.Body>
                      <div className="reminder-card-header">
                        <div>
                          <h6 className="vehicle-registration">
                            {vehicle.registrationNumber}
                          </h6>
                          <p className="vehicle-make-model text-muted mb-1">
                            {vehicle.make} {vehicle.model} • {vehicle.color}
                          </p>
                        </div>
                        {getUrgencyBadge(daysUntilService)}
                      </div>
                      
                      <div className="reminder-details">
                        <div className="detail-row">
                          <i className="bi bi-calendar-check me-2 text-success"></i>
                          <span>Service Due: <strong>{new Date(vehicle.serviceDate).toLocaleDateString()}</strong></span>
                        </div>
                        <div className="detail-row">
                          <i className="bi bi-clock me-2 text-primary"></i>
                          <span>Due in: <strong>{daysUntilService} day{daysUntilService !== 1 ? 's' : ''}</strong></span>
                        </div>
                        {vehicle.lastServiced && (
                          <div className="detail-row">
                            <i className="bi bi-check-circle me-2 text-muted"></i>
                            <span>Last Serviced: {new Date(vehicle.lastServiced).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="reminder-actions mt-3">
                        <small className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Consider scheduling service appointment
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </div>
  );
}

export default ServiceReminders;