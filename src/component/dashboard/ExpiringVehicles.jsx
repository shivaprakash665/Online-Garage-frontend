// src/component/dashboard/ExpiringVehicles.jsx
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Badge, Modal, Form } from "react-bootstrap";
import axios from "axios";
import "./ExpiringVehicles.css";

function ExpiringVehicles({ showAlert }) {
  const [expiringVehicles, setExpiringVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [requestData, setRequestData] = useState({
    renewalAmount: "",
    insuranceCover: "Comprehensive",
    coverageDetails: "",
    message: ""
  });

  useEffect(() => {
    fetchExpiringVehicles();
    const interval = setInterval(fetchExpiringVehicles, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchExpiringVehicles = async () => {
    try {
      const response = await axios.get("https://online-garage-api-2.onrender.com/api/insurance/agent/expiring-vehicles", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setExpiringVehicles(response.data);
    } catch (err) {
      console.error("Error fetching expiring vehicles:", err);
      showAlert("Error loading expiring vehicles", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = (vehicle) => {
    setSelectedVehicle(vehicle);
    setRequestData({
      renewalAmount: "",
      insuranceCover: "Comprehensive",
      coverageDetails: "",
      message: ""
    });
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    try {
      await axios.post("https://online-garage-api-2.onrender.com/api/insurance/agent/send-request", 
        {
          vehicleId: selectedVehicle._id,
          ...requestData
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      showAlert("Insurance request sent successfully!", "success");
      setShowRequestModal(false);
      fetchExpiringVehicles();
    } catch (err) {
      showAlert(err.response?.data?.message || "Error sending request", "danger");
    }
  };

  const getUrgencyLevel = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { level: "expired", label: "Expired", badge: "danger" };
    if (diffDays <= 7) return { level: "urgent", label: "Urgent", badge: "danger" };
    if (diffDays <= 15) return { level: "soon", label: "Soon", badge: "warning" };
    return { level: "upcoming", label: "Upcoming", badge: "info" };
  };

  const groupVehiclesByUrgency = () => {
    const groups = {
      expired: [],
      urgent: [],
      soon: [],
      upcoming: []
    };

    expiringVehicles.forEach(vehicle => {
      const urgency = getUrgencyLevel(vehicle.insuranceExpiryDate);
      groups[urgency.level].push(vehicle);
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="expiring-vehicles-loading">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const vehicleGroups = groupVehiclesByUrgency();

  return (
    <div className="expiring-vehicles-container">
      <div className="page-header">
        <h4>Expiring Vehicles</h4>
        <p className="text-muted">Vehicles with insurance expiring in the next 30 days</p>
      </div>

      <Row className="g-4">
        {/* Expired Vehicles */}
        {vehicleGroups.expired.length > 0 && (
          <Col xs={12}>
            <div className="urgency-section">
              <h5 className="urgency-title text-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Expired ({vehicleGroups.expired.length})
              </h5>
              <Row className="g-3">
                {vehicleGroups.expired.map(vehicle => (
                  <VehicleCard 
                    key={vehicle._id} 
                    vehicle={vehicle} 
                    urgency="expired" 
                    onSendRequest={handleSendRequest}
                  />
                ))}
              </Row>
            </div>
          </Col>
        )}

        {/* Other urgency groups... */}
        {vehicleGroups.urgent.length > 0 && (
          <Col xs={12}>
            <div className="urgency-section">
              <h5 className="urgency-title text-warning">
                <i className="bi bi-exclamation-circle me-2"></i>
                Urgent - Expiring within 7 days ({vehicleGroups.urgent.length})
              </h5>
              <Row className="g-3">
                {vehicleGroups.urgent.map(vehicle => (
                  <VehicleCard 
                    key={vehicle._id} 
                    vehicle={vehicle} 
                    urgency="urgent" 
                    onSendRequest={handleSendRequest}
                  />
                ))}
              </Row>
            </div>
          </Col>
        )}

        {vehicleGroups.soon.length > 0 && (
          <Col xs={12}>
            <div className="urgency-section">
              <h5 className="urgency-title text-info">
                <i className="bi bi-clock me-2"></i>
                Soon - Expiring in 8-15 days ({vehicleGroups.soon.length})
              </h5>
              <Row className="g-3">
                {vehicleGroups.soon.map(vehicle => (
                  <VehicleCard 
                    key={vehicle._id} 
                    vehicle={vehicle} 
                    urgency="soon" 
                    onSendRequest={handleSendRequest}
                  />
                ))}
              </Row>
            </div>
          </Col>
        )}

        {vehicleGroups.upcoming.length > 0 && (
          <Col xs={12}>
            <div className="urgency-section">
              <h5 className="urgency-title text-primary">
                <i className="bi bi-calendar me-2"></i>
                Upcoming - Expiring in 16-30 days ({vehicleGroups.upcoming.length})
              </h5>
              <Row className="g-3">
                {vehicleGroups.upcoming.map(vehicle => (
                  <VehicleCard 
                    key={vehicle._id} 
                    vehicle={vehicle} 
                    urgency="upcoming" 
                    onSendRequest={handleSendRequest}
                  />
                ))}
              </Row>
            </div>
          </Col>
        )}

        {expiringVehicles.length === 0 && (
          <Col xs={12}>
            <Card className="no-vehicles-card">
              <Card.Body className="text-center py-5">
                <i className="bi bi-check-circle text-muted mb-3" style={{fontSize: '48px'}}></i>
                <h5 className="text-muted">No Expiring Vehicles</h5>
                <p className="text-muted">All vehicles have valid insurance coverage.</p>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Send Request Modal */}
      <RequestModal 
        show={showRequestModal}
        onHide={() => setShowRequestModal(false)}
        vehicle={selectedVehicle}
        requestData={requestData}
        setRequestData={setRequestData}
        onSubmit={handleSubmitRequest}
      />
    </div>
  );
}

// Vehicle Card Component
const VehicleCard = ({ vehicle, urgency, onSendRequest }) => {
  const urgencyConfig = {
    expired: { badge: "danger", label: "EXPIRED", button: "danger" },
    urgent: { badge: "warning", label: "URGENT", button: "warning" },
    soon: { badge: "info", label: "SOON", button: "info" },
    upcoming: { badge: "primary", label: "UPCOMING", button: "primary" }
  };

  const config = urgencyConfig[urgency];

  return (
    <Col xl={4} lg={6} md={6}>
      <Card className={`vehicle-card ${urgency}`}>
        <Card.Body>
          <div className="vehicle-header">
            <h6 className="vehicle-registration">{vehicle.registrationNumber}</h6>
            <Badge bg={config.badge}>{config.label}</Badge>
          </div>
          <p className="vehicle-details">
            {vehicle.make} {vehicle.model} • {vehicle.color}
          </p>
          <div className="vehicle-info">
            <div className="info-item">
              <i className="bi bi-calendar-x me-2"></i>
              {urgency === 'expired' ? 'Expired: ' : 'Expires: '}
              {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}
            </div>
            <div className="info-item">
              <i className="bi bi-person me-2"></i>
              Owner: {vehicle.userId?.name}
            </div>
            {urgency === 'expired' && (
              <div className="info-item">
                <i className="bi bi-telephone me-2"></i>
                Phone: {vehicle.userId?.phone}
              </div>
            )}
          </div>
          <Button 
            variant={config.button} 
            size="sm" 
            onClick={() => onSendRequest(vehicle)}
            className="w-100 mt-2"
          >
            <i className="bi bi-send me-1"></i>
            Send Renewal Request
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

// Request Modal Component
const RequestModal = ({ show, onHide, vehicle, requestData, setRequestData, onSubmit }) => {
  return (
    <Modal show={show} onHide={onHide} centered className="request-modal">
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>
          <i className="bi bi-send me-2"></i>
          Send Insurance Request
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {vehicle && (
          <div className="selected-vehicle-info mb-4">
            <h6>Vehicle Details</h6>
            <p className="mb-1"><strong>{vehicle.registrationNumber}</strong></p>
            <p className="mb-1">{vehicle.make} {vehicle.model} • {vehicle.color}</p>
            <p className="mb-0 text-muted">
              Insurance expires: {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}
            </p>
          </div>
        )}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Renewal Amount (₹)</Form.Label>
            <Form.Control
              type="number"
              value={requestData.renewalAmount}
              onChange={(e) => setRequestData({...requestData, renewalAmount: e.target.value})}
              placeholder="Enter renewal amount"
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Insurance Cover Type</Form.Label>
            <Form.Select
              value={requestData.insuranceCover}
              onChange={(e) => setRequestData({...requestData, insuranceCover: e.target.value})}
              className="form-control-custom"
            >
              <option value="Comprehensive">Comprehensive</option>
              <option value="Third Party">Third Party</option>
              <option value="Own Damage">Own Damage</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Coverage Details</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={requestData.coverageDetails}
              onChange={(e) => setRequestData({...requestData, coverageDetails: e.target.value})}
              placeholder="Describe the coverage details..."
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Message to Vehicle Owner (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={requestData.message}
              onChange={(e) => setRequestData({...requestData, message: e.target.value})}
              placeholder="Add a personal message..."
              className="form-control-custom"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onSubmit}>
          <i className="bi bi-send me-1"></i>
          Send Request
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExpiringVehicles;