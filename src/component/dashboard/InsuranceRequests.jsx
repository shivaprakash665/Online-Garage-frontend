// src/component/dashboard/InsuranceRequests.jsx
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Badge, Alert, Modal } from "react-bootstrap";
import axios from "axios";
import "./InsuranceRequests.css";

function InsuranceRequests() {
  const [insuranceRequests, setInsuranceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchInsuranceRequests();
    const interval = setInterval(fetchInsuranceRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchInsuranceRequests = async () => {
    try {
      const response = await axios.get("https://online-garage-api-2.onrender.com/api/insurance/user-requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInsuranceRequests(response.data);
    } catch (err) {
      console.error("Error fetching insurance requests:", err);
      showAlert("Error loading insurance requests", "danger");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.put(`https://online-garage-api-2.onrender.com/api/insurance/accept-request/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      showAlert("Insurance request accepted! Agent will contact you soon.", "success");
      fetchInsuranceRequests();
    } catch (err) {
      showAlert(err.response?.data?.message || "Error accepting request", "danger");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`https://online-garage-api-2.onrender.com/api/insurance/reject-request/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      showAlert("Insurance request rejected", "info");
      fetchInsuranceRequests();
    } catch (err) {
      showAlert(err.response?.data?.message || "Error rejecting request", "danger");
    }
  };

  const handleShowDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: "warning", text: "PENDING" },
      accepted: { bg: "success", text: "ACCEPTED" },
      rejected: { bg: "danger", text: "REJECTED" },
      completed: { bg: "info", text: "COMPLETED" }
    };
    const config = variants[status];
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="insurance-requests-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="insurance-requests-container">
      <div className="page-header">
        <h4>Insurance Renewal Requests</h4>
        <p className="text-muted">Manage insurance renewal requests from agents</p>
      </div>

      {alert.show && (
        <Alert variant={alert.type} className="alert-dismissible fade show">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false, message: "", type: "" })}></button>
        </Alert>
      )}

      <Row className="g-4">
        {insuranceRequests.length === 0 ? (
          <Col xs={12}>
            <Card className="no-requests-card">
              <Card.Body className="text-center py-5">
                <i className="bi bi-shield-check text-muted mb-3" style={{fontSize: '48px'}}></i>
                <h5 className="text-muted">No Insurance Requests</h5>
                <p className="text-muted">You don't have any pending insurance renewal requests.</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          insuranceRequests.map(request => (
            <Col key={request._id} xl={6} lg={12}>
              <Card className="insurance-request-card">
                <Card.Body>
                  <div className="request-header">
                    <div>
                      <h6 className="vehicle-registration">{request.vehicleId?.registrationNumber}</h6>
                      <p className="vehicle-details mb-1">
                        {request.vehicleId?.make} {request.vehicleId?.model}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="agent-info">
                    <div className="agent-details">
                      <i className="bi bi-person-badge me-2"></i>
                      <strong>{request.agentName}</strong> from {request.agentCompany}
                    </div>
                    <div className="request-date">
                      <i className="bi bi-calendar me-2"></i>
                      Sent: {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="offer-details">
                    <div className="offer-item">
                      <i className="bi bi-currency-dollar me-2"></i>
                      <span>Renewal Amount: <strong>₹{request.renewalAmount}</strong></span>
                    </div>
                    <div className="offer-item">
                      <i className="bi bi-shield me-2"></i>
                      <span>Cover Type: <strong>{request.insuranceCover}</strong></span>
                    </div>
                  </div>

                  {request.message && (
                    <div className="agent-message">
                      <i className="bi bi-chat-left-text me-2"></i>
                      <em>"{request.message}"</em>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="request-actions mt-3">
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleAcceptRequest(request._id)}
                        className="me-2"
                      >
                        <i className="bi bi-check-circle me-1"></i>
                        Accept
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRejectRequest(request._id)}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Reject
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleShowDetails(request)}
                        className="ms-2"
                      >
                        <i className="bi bi-info-circle me-1"></i>
                        Details
                      </Button>
                    </div>
                  )}

                  {request.status === 'accepted' && (
                    <div className="accepted-info mt-3">
                      <Badge bg="success" className="mb-2">
                        <i className="bi bi-check-circle me-1"></i>
                        Request Accepted
                      </Badge>
                      <p className="text-muted small mb-0">
                        The insurance agent will contact you soon to complete the renewal process.
                      </p>
                    </div>
                  )}

                  {request.status === 'completed' && (
                    <div className="completed-info mt-3">
                      <Badge bg="info" className="mb-2">
                        <i className="bi bi-shield-check me-1"></i>
                        Insurance Updated
                      </Badge>
                      <p className="text-muted small mb-0">
                        Your vehicle insurance has been successfully renewed.
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Insurance Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div className="request-details">
              <div className="detail-section">
                <h6>Vehicle Information</h6>
                <p><strong>Registration:</strong> {selectedRequest.vehicleId?.registrationNumber}</p>
                <p><strong>Make & Model:</strong> {selectedRequest.vehicleId?.make} {selectedRequest.vehicleId?.model}</p>
                <p><strong>Insurance Expiry:</strong> {new Date(selectedRequest.vehicleId?.insuranceExpiryDate).toLocaleDateString()}</p>
              </div>

              <div className="detail-section">
                <h6>Agent Information</h6>
                <p><strong>Agent Name:</strong> {selectedRequest.agentName}</p>
                <p><strong>Company:</strong> {selectedRequest.agentCompany}</p>
              </div>

              <div className="detail-section">
                <h6>Insurance Offer</h6>
                <p><strong>Renewal Amount:</strong> ₹{selectedRequest.renewalAmount}</p>
                <p><strong>Cover Type:</strong> {selectedRequest.insuranceCover}</p>
                <p><strong>Coverage Details:</strong> {selectedRequest.coverageDetails}</p>
              </div>

              {selectedRequest.message && (
                <div className="detail-section">
                  <h6>Agent's Message</h6>
                  <p className="message-text">"{selectedRequest.message}"</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InsuranceRequests;