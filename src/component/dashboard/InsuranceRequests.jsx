// src/component/dashboard/InsuranceRequests.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import './InsuranceRequests.css';

const InsuranceRequests = () => {
  const [insuranceRequests, setInsuranceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchInsuranceRequests();
  }, []);

  const fetchInsuranceRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/insurance/user-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInsuranceRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching insurance requests:', error);
      showAlert('Failed to load insurance requests', 'danger');
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/insurance/accept-request/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert('Insurance request accepted! The agent will contact you soon.', 'success');
      fetchInsuranceRequests(); // Refresh the list
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error accepting request:', error);
      showAlert('Failed to accept request', 'danger');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/insurance/reject-request/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert('Insurance request rejected', 'info');
      fetchInsuranceRequests(); // Refresh the list
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error rejecting request:', error);
      showAlert('Failed to reject request', 'danger');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'completed': return 'info';
      default: return 'warning';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      {alert.show && (
        <Alert variant={alert.type} className="alert-dismissible fade show">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false, message: '', type: '' })}></button>
        </Alert>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Insurance Renewal Requests</h4>
            </Card.Header>
            <Card.Body>
              {insuranceRequests.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No insurance renewal requests received.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Received Date</th>
                        <th>Vehicle</th>
                        <th>Insurance Agent</th>
                        <th>Cover Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insuranceRequests.map((request) => (
                        <tr key={request._id}>
                          <td>{formatDate(request.createdAt)}</td>
                          <td>
                            <strong>{request.vehicleId.registrationNumber}</strong>
                            <div>
                              <small className="text-muted">
                                {request.vehicleId.make} {request.vehicleId.model}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>{request.agentId.name}</div>
                            <small className="text-muted">
                              {request.agentId.company || 'Insurance Company'}
                            </small>
                            {request.agentId.phone && (
                              <div>
                                <small className="text-muted">Phone: {request.agentId.phone}</small>
                              </div>
                            )}
                          </td>
                          <td>{request.insuranceCover}</td>
                          <td>{formatCurrency(request.renewalAmount)}</td>
                          <td>
                            <Badge bg={getStatusVariant(request.status)}>
                              {request.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td>
                            {request.status === 'pending' && (
                              <div className="btn-group">
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => handleViewDetails(request)}
                                >
                                  View & Respond
                                </Button>
                              </div>
                            )}
                            {request.status !== 'pending' && (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleViewDetails(request)}
                              >
                                View Details
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Request Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Insurance Renewal Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Vehicle:</strong> {selectedRequest.vehicleId.registrationNumber}
                </Col>
                <Col md={6}>
                  <strong>Make & Model:</strong> {selectedRequest.vehicleId.make} {selectedRequest.vehicleId.model}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Insurance Agent:</strong> {selectedRequest.agentId.name}
                </Col>
                <Col md={6}>
                  <strong>Company:</strong> {selectedRequest.agentId.company || 'Insurance Company'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Cover Type:</strong> {selectedRequest.insuranceCover}
                </Col>
                <Col md={6}>
                  <strong>Renewal Amount:</strong> {formatCurrency(selectedRequest.renewalAmount)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <strong>Coverage Details:</strong>
                  <p className="mt-1">{selectedRequest.coverageDetails}</p>
                </Col>
              </Row>
              {selectedRequest.message && (
                <Row className="mb-3">
                  <Col>
                    <strong>Agent's Message:</strong>
                    <p className="mt-1">{selectedRequest.message}</p>
                  </Col>
                </Row>
              )}
              <Row className="mb-3">
                <Col>
                  <strong>Current Insurance Expiry:</strong>
                  <p className="mt-1">
                    {formatDate(selectedRequest.vehicleId.insuranceExpiryDate)}
                  </p>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedRequest && selectedRequest.status === 'pending' && (
            <>
              <Button 
                variant="danger" 
                onClick={() => handleRejectRequest(selectedRequest._id)}
              >
                Reject Request
              </Button>
              <Button 
                variant="success" 
                onClick={() => handleAcceptRequest(selectedRequest._id)}
              >
                Accept Request
              </Button>
            </>
          )}
          {selectedRequest && selectedRequest.status !== 'pending' && (
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InsuranceRequests;