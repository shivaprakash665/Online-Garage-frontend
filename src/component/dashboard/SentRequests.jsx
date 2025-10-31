// src/component/dashboard/SentRequests.jsx
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Badge, Modal, Form } from "react-bootstrap";
import axios from "axios";
import "./SentRequests.css";

function SentRequests({ showAlert }) {
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateData, setUpdateData] = useState({
    insuranceProvider: "",
    insuranceNumber: "",
    insuranceExpiryDate: ""
  });

  useEffect(() => {
    fetchSentRequests();
    const interval = setInterval(fetchSentRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSentRequests = async () => {
    try {
      const response = await axios.get("https://online-garage-api-2.onrender.com/api/insurance/agent/requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSentRequests(response.data);
    } catch (err) {
      console.error("Error fetching sent requests:", err);
      showAlert("Error loading sent requests", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInsurance = (request) => {
    if (request.status === 'accepted') {
      setSelectedRequest(request);
      setUpdateData({
        insuranceProvider: request.agentCompany || "",
        insuranceNumber: "",
        insuranceExpiryDate: ""
      });
      setShowUpdateModal(true);
    }
  };

  const handleSubmitUpdate = async () => {
    try {
      await axios.put("https://online-garage-api-2.onrender.com/api/insurance/agent/update-insurance",
        {
          requestId: selectedRequest._id,
          ...updateData
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      showAlert("Insurance details updated successfully!", "success");
      setShowUpdateModal(false);
      fetchSentRequests();
    } catch (err) {
      showAlert(err.response?.data?.message || "Error updating insurance", "danger");
    }
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
      <div className="sent-requests-loading">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sent-requests-container">
      <div className="page-header">
        <h4>Sent Insurance Requests</h4>
        <p className="text-muted">Track your insurance renewal requests and their status</p>
      </div>

      <Row className="g-4">
        {sentRequests.length === 0 ? (
          <Col xs={12}>
            <Card className="no-requests-card">
              <Card.Body className="text-center py-5">
                <i className="bi bi-envelope-open text-muted mb-3" style={{fontSize: '48px'}}></i>
                <h5 className="text-muted">No Requests Sent</h5>
                <p className="text-muted">Send insurance renewal requests to vehicle owners from the Expiring Vehicles page.</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          sentRequests.map(request => (
            <RequestCard 
              key={request._id} 
              request={request} 
              getStatusBadge={getStatusBadge}
              onUpdateInsurance={handleUpdateInsurance}
            />
          ))
        )}
      </Row>

      {/* Update Insurance Modal */}
      <UpdateModal 
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        request={selectedRequest}
        updateData={updateData}
        setUpdateData={setUpdateData}
        onSubmit={handleSubmitUpdate}
      />
    </div>
  );
}

// Request Card Component
const RequestCard = ({ request, getStatusBadge, onUpdateInsurance }) => {
  return (
    <Col key={request._id} xl={6} lg={12}>
      <Card className="request-card">
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
          
          <div className="request-details">
            <div className="detail-row">
              <i className="bi bi-person me-2"></i>
              <span>Owner: <strong>{request.userId?.name}</strong></span>
            </div>
            
            {request.status === 'accepted' && (
              <>
                <div className="detail-row">
                  <i className="bi bi-telephone me-2"></i>
                  <span>Phone: <strong>{request.userId?.phone}</strong></span>
                </div>
                <div className="detail-row">
                  <i className="bi bi-envelope me-2"></i>
                  <span>Email: <strong>{request.userId?.email}</strong></span>
                </div>
                <div className="detail-row">
                  <i className="bi bi-geo-alt me-2"></i>
                  <span>Address: <strong>{request.userId?.address}</strong></span>
                </div>
              </>
            )}
            
            <div className="detail-row">
              <i className="bi bi-currency-dollar me-2"></i>
              <span>Amount: <strong>₹{request.renewalAmount}</strong></span>
            </div>
            <div className="detail-row">
              <i className="bi bi-shield me-2"></i>
              <span>Cover: <strong>{request.insuranceCover}</strong></span>
            </div>
            <div className="detail-row">
              <i className="bi bi-calendar me-2"></i>
              <span>Sent: {new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {request.status === 'accepted' && (
            <Button 
              variant="success" 
              size="sm" 
              onClick={() => onUpdateInsurance(request)}
              className="w-100 mt-3"
            >
              <i className="bi bi-pencil me-1"></i>
              Update Insurance Details
            </Button>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

// Update Modal Component
const UpdateModal = ({ show, onHide, request, updateData, setUpdateData, onSubmit }) => {
  return (
    <Modal show={show} onHide={onHide} centered className="update-modal">
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>
          <i className="bi bi-pencil me-2"></i>
          Update Insurance Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {request && (
          <div className="request-info mb-4">
            <h6>Vehicle: {request.vehicleId?.registrationNumber}</h6>
            <p>Owner: {request.userId?.name} • Phone: {request.userId?.phone}</p>
          </div>
        )}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Insurance Provider</Form.Label>
            <Form.Control
              type="text"
              value={updateData.insuranceProvider}
              onChange={(e) => setUpdateData({...updateData, insuranceProvider: e.target.value})}
              placeholder="Enter insurance provider name"
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Insurance Policy Number</Form.Label>
            <Form.Control
              type="text"
              value={updateData.insuranceNumber}
              onChange={(e) => setUpdateData({...updateData, insuranceNumber: e.target.value})}
              placeholder="Enter new policy number"
              className="form-control-custom"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Expiry Date</Form.Label>
            <Form.Control
              type="date"
              value={updateData.insuranceExpiryDate}
              onChange={(e) => setUpdateData({...updateData, insuranceExpiryDate: e.target.value})}
              className="form-control-custom"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="modal-footer-custom">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="success" onClick={onSubmit}>
          <i className="bi bi-check-circle me-1"></i>
          Update Insurance
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SentRequests;