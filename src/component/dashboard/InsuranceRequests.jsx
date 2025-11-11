// src/component/dashboard/InsuranceRequests.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import './InsuranceRequests.css';
import CONFIG from "../../../src/config";

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
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/insurance/user-requests`, {
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

  // Accept agent's offer (when status is 'offer_sent')
  const handleAcceptOffer = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${CONFIG.API_BASE_URL}/api/insurance/accept-offer/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert('Insurance offer accepted! Agent will complete the process.', 'success');
      fetchInsuranceRequests();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error accepting offer:', error);
      showAlert(error.response?.data?.message || 'Failed to accept offer', 'danger');
    }
  };

  // Reject agent's offer (when status is 'offer_sent')
  const handleRejectOffer = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${CONFIG.API_BASE_URL}/api/insurance/reject-offer/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert('Insurance offer rejected', 'info');
      fetchInsuranceRequests();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error rejecting offer:', error);
      showAlert(error.response?.data?.message || 'Failed to reject offer', 'danger');
    }
  };

  // Accept initial request (when user sent request to agent)
  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${CONFIG.API_BASE_URL}/api/insurance/accept-request/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert('Insurance request accepted! The agent will contact you soon.', 'success');
      fetchInsuranceRequests();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error accepting request:', error);
      showAlert('Failed to accept request', 'danger');
    }
  };

  // Reject initial request (when user sent request to agent)
  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${CONFIG.API_BASE_URL}/api/insurance/reject-request/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert('Insurance request rejected', 'info');
      fetchInsuranceRequests();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error rejecting request:', error);
      showAlert('Failed to reject request', 'danger');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'offer_sent': return 'info'; // NEW STATUS
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'completed': return 'primary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status, requestType) => {
    switch (status) {
      case 'pending':
        return requestType === 'user_to_agent' ? 'SENT TO AGENT' : 'PENDING';
      case 'offer_sent':
        return 'OFFER RECEIVED'; // Agent sent an offer
      case 'accepted':
        return requestType === 'user_to_agent' ? 'ACCEPTED BY YOU' : 'ACCEPTED';
      case 'rejected':
        return 'REJECTED';
      case 'completed':
        return 'COMPLETED';
      default:
        return status.toUpperCase();
    }
  };

  const getActionButtonText = (status, requestType) => {
    switch (status) {
      case 'pending':
        return requestType === 'user_to_agent' ? 'View Details' : 'View & Respond';
      case 'offer_sent':
        return 'Review Offer'; // Agent sent an offer - user needs to respond
      case 'accepted':
        return 'View Details';
      case 'rejected':
        return 'View Details';
      case 'completed':
        return 'View Details';
      default:
        return 'View Details';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // Show user's original request details for user_to_agent requests
  const displayUserRequestDetails = (request) => {
    if (request.requestType === 'user_to_agent') {
      return (
        <div className="user-original-request mt-2 p-2 bg-light rounded">
          <small>
            <strong>Your Original Request:</strong><br/>
            • Expected Amount: {formatCurrency(request.userExpectedAmount)}<br/>
            • Cover Type: <Badge bg="secondary" className="text-capitalize">{request.userCoverType}</Badge><br/>
            {request.userMessage && `• Message: ${request.userMessage}`}
          </small>
        </div>
      );
    }
    return null;
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
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Insurance Renewal Requests</h4>
              <Badge bg="primary" pill>
                {insuranceRequests.length} request{insuranceRequests.length !== 1 ? 's' : ''}
              </Badge>
            </Card.Header>
            <Card.Body>
              {insuranceRequests.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-shield-check text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">No insurance renewal requests received.</p>
                  <small className="text-muted">
                    You'll see requests here when agents send you offers or you request renewals.
                  </small>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Date</th>
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
                        <tr key={request._id} className={request.status === 'completed' ? 'table-success' : ''}>
                          <td>
                            <div className="fw-semibold">{formatDate(request.createdAt)}</div>
                            <small className="text-muted">
                              {new Date(request.createdAt).toLocaleTimeString('en-IN')}
                            </small>
                          </td>
                          <td>
                            <strong>{request.vehicleId.registrationNumber}</strong>
                            <div>
                              <small className="text-muted">
                                {request.vehicleId.make} {request.vehicleId.model}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div className="fw-semibold">{request.agentId.name}</div>
                            <small className="text-muted">
                              {request.agentId.company || 'Insurance Company'}
                            </small>
                            {request.agentId.phone && (
                              <div>
                                <small className="text-muted">{request.agentId.phone}</small>
                              </div>
                            )}
                          </td>
                          <td>
                            <Badge bg="light" text="dark" className="text-capitalize">
                              {request.insuranceCover}
                            </Badge>
                          </td>
                          <td>
                            <div className="fw-bold text-success">
                              {formatCurrency(request.renewalAmount)}
                            </div>
                            {/* Show user's expected amount if different */}
                            {request.requestType === 'user_to_agent' && 
                             request.userExpectedAmount && 
                             request.userExpectedAmount !== request.renewalAmount && (
                              <small className="text-muted">
                                You expected: {formatCurrency(request.userExpectedAmount)}
                              </small>
                            )}
                          </td>
                          <td>
                            <Badge bg={getStatusVariant(request.status)}>
                              {getStatusText(request.status, request.requestType)}
                            </Badge>
                            {request.status === 'offer_sent' && (
                              <div className="mt-1">
                                <small className="text-warning">
                                  <i className="bi bi-exclamation-circle me-1"></i>
                                  Action Required
                                </small>
                              </div>
                            )}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant={
                                request.status === 'offer_sent' ? 'warning' : 
                                request.status === 'pending' ? 'outline-success' : 'outline-primary'
                              }
                              onClick={() => handleViewDetails(request)}
                              className="w-100"
                            >
                              <i className={
                                request.status === 'offer_sent' ? 'bi bi-envelope-exclamation me-1' :
                                request.status === 'pending' ? 'bi bi-eye me-1' : 'bi bi-info-circle me-1'
                              }></i>
                              {getActionButtonText(request.status, request.requestType)}
                            </Button>
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
          <Modal.Title>
            {selectedRequest?.status === 'offer_sent' ? 'Review Insurance Offer' : 'Insurance Request Details'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              {/* Request Type Badge */}
              <div className="mb-3">
                <Badge bg={
                  selectedRequest.requestType === 'user_to_agent' ? 'info' : 'primary'
                }>
                  {selectedRequest.requestType === 'user_to_agent' ? 'You requested renewal' : 'Agent sent request'}
                </Badge>
              </div>

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

              {/* Show user's original request for user_to_agent */}
              {selectedRequest.requestType === 'user_to_agent' && selectedRequest.userExpectedAmount && (
                <div className="alert alert-info mb-3">
                  <h6>
                    <i className="bi bi-person me-2"></i>
                    Your Original Request
                  </h6>
                  <Row>
                    <Col md={6}>
                      <strong>Expected Amount:</strong><br/>
                      {formatCurrency(selectedRequest.userExpectedAmount)}
                    </Col>
                    <Col md={6}>
                      <strong>Cover Type:</strong><br/>
                      <Badge bg="secondary" className="text-capitalize">
                        {selectedRequest.userCoverType}
                      </Badge>
                    </Col>
                    {selectedRequest.userMessage && (
                      <Col md={12} className="mt-2">
                        <strong>Your Message:</strong><br/>
                        {selectedRequest.userMessage}
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Cover Type:</strong> 
                  <Badge bg="primary" className="ms-2 text-capitalize">
                    {selectedRequest.insuranceCover}
                  </Badge>
                </Col>
                <Col md={6}>
                  <strong>Renewal Amount:</strong> 
                  <div className="fw-bold text-success">
                    {formatCurrency(selectedRequest.renewalAmount)}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <strong>Coverage Details:</strong>
                  <p className="mt-1 p-2 bg-light rounded">{selectedRequest.coverageDetails}</p>
                </Col>
              </Row>

              {selectedRequest.message && (
                <Row className="mb-3">
                  <Col>
                    <strong>Agent's Message:</strong>
                    <p className="mt-1 p-2 bg-light rounded">{selectedRequest.message}</p>
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

              {/* Show completion details if completed */}
              {selectedRequest.status === 'completed' && (
                <div className="alert alert-success">
                  <h6>
                    <i className="bi bi-check-circle me-2"></i>
                    Insurance Completed
                  </h6>
                  <Row>
                    {selectedRequest.newPolicyNumber && (
                      <Col md={6}>
                        <strong>New Policy No:</strong> {selectedRequest.newPolicyNumber}
                      </Col>
                    )}
                    {selectedRequest.newExpiryDate && (
                      <Col md={6}>
                        <strong>New Expiry:</strong> {formatDate(selectedRequest.newExpiryDate)}
                      </Col>
                    )}
                    {selectedRequest.insuranceProvider && (
                      <Col md={12} className="mt-2">
                        <strong>Provider:</strong> {selectedRequest.insuranceProvider}
                      </Col>
                    )}
                  </Row>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedRequest && selectedRequest.status === 'pending' && selectedRequest.requestType === 'agent_to_user' && (
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

          {selectedRequest && selectedRequest.status === 'offer_sent' && (
            <>
              <Button 
                variant="danger" 
                onClick={() => handleRejectOffer(selectedRequest._id)}
              >
                <i className="bi bi-x-circle me-1"></i>
                Reject Offer
              </Button>
              <Button 
                variant="success" 
                onClick={() => handleAcceptOffer(selectedRequest._id)}
              >
                <i className="bi bi-check-circle me-1"></i>
                Accept Offer
              </Button>
            </>
          )}

          {(selectedRequest && 
            (selectedRequest.status === 'accepted' || 
             selectedRequest.status === 'rejected' || 
             selectedRequest.status === 'completed' ||
             (selectedRequest.status === 'pending' && selectedRequest.requestType === 'user_to_agent'))
          ) && (
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