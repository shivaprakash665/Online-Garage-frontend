// src/component/dashboard/IncomingRequests.jsx - FINAL FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import './IncomingRequests.css';
import CONFIG from "../../../src/config";

const IncomingRequests = ({ showAlert }) => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [acceptData, setAcceptData] = useState({
    renewalAmount: '',
    insuranceCover: 'comprehensive',
    coverageDetails: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const fetchIncomingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log("🔍 Fetching incoming requests...");
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/insurance/agent/incoming-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("✅ Incoming requests received:", response.data);
      setIncomingRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching incoming requests:', error);
      
      if (error.response?.status === 403) {
        showAlert('Access denied. Insurance agent role required.', 'warning');
      } else if (error.response?.status === 404) {
        showAlert('No incoming requests found', 'info');
      } else {
        showAlert('Failed to load incoming requests. Please try again.', 'danger');
      }
      setLoading(false);
    }
  };

  const handleAccept = (request) => {
    setSelectedRequest(request);
    // Pre-fill with user's requested details if available
    const userAmount = request.userExpectedAmount || request.renewalAmount || '';
    const userCover = request.userCoverType || request.insuranceCover || 'comprehensive';
    
    setAcceptData({
      renewalAmount: userAmount,
      insuranceCover: userCover,
      coverageDetails: request.coverageDetails || `Insurance renewal for ${request.vehicleId?.registrationNumber}`
    });
    setShowAcceptModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const submitAccept = async () => {
    if (!acceptData.renewalAmount || !acceptData.coverageDetails) {
      showAlert('Please fill all required fields', 'warning');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${CONFIG.API_BASE_URL}/api/insurance/agent/accept-user-request/${selectedRequest._id}`,
        acceptData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Accept response:", response.data);
      showAlert('Request accepted successfully! User will be notified.', 'success');
      setShowAcceptModal(false);
      setSelectedRequest(null);
      fetchIncomingRequests();
    } catch (error) {
      console.error('❌ Error accepting request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to accept request';
      showAlert(errorMessage, 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const submitReject = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${CONFIG.API_BASE_URL}/api/insurance/agent/reject-user-request/${selectedRequest._id}`,
        { rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Reject response:", response.data);
      showAlert('Request rejected successfully', 'info');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchIncomingRequests();
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject request';
      showAlert(errorMessage, 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'warning', text: 'Pending' },
      'accepted': { bg: 'success', text: 'Accepted' },
      'rejected': { bg: 'danger', text: 'Rejected' },
      'completed': { bg: 'info', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
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

  // Display user's requested details
  const displayUserRequestDetails = (request) => {
    // Show details for user_to_agent requests
    if (request.requestType === 'user_to_agent') {
      return (
        <div className="user-request-details mt-2 p-2 bg-light rounded">
          <small>
            <strong>User's Request:</strong><br/>
            • Expected Amount: {formatCurrency(request.userExpectedAmount)}<br/>
            • Cover Type: <Badge bg="primary" className="text-capitalize">{request.userCoverType}</Badge><br/>
            {request.userMessage && `• Message: ${request.userMessage}`}
          </small>
        </div>
      );
    }
    
    // For agent_to_user requests, show basic info
    return (
      <div className="user-request-details mt-2 p-2 bg-light rounded">
        <small>
          <strong>Request Type:</strong> Agent Initiated<br/>
          • Amount: {formatCurrency(request.renewalAmount)}<br/>
          • Cover: <Badge bg="secondary" className="text-capitalize">{request.insuranceCover}</Badge>
        </small>
      </div>
    );
  };

  if (loading) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="success" className="mb-3" />
            <p>Loading incoming requests...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark mb-1">Incoming Renewal Requests</h2>
          <p className="text-muted mb-0">Insurance renewal requests from users</p>
        </div>
        <Button variant="primary" onClick={fetchIncomingRequests}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </Button>
      </div>

      <Card className="admin-table">
        <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-inbox me-2"></i>
            User Requests ({incomingRequests.length})
          </h5>
          <Badge bg="light" text="dark">
            {incomingRequests.filter(r => r.status === 'pending').length} Pending
          </Badge>
        </Card.Header>
        
        {incomingRequests.length === 0 ? (
          <Card.Body className="text-center py-5">
            <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
            <p className="text-muted mb-0">No incoming renewal requests</p>
            <small className="text-muted">Users will appear here when they send you renewal requests</small>
          </Card.Body>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Request Date</th>
                  <th>Customer & Request Details</th>
                  <th>Vehicle</th>
                  <th>Current Insurance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomingRequests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <div>
                        <small className="fw-semibold">{formatDate(request.createdAt)}</small>
                        <br/>
                        <small className="text-muted">
                          {new Date(request.createdAt).toLocaleTimeString('en-IN')}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{request.userId?.name}</strong>
                        <div>
                          <small className="text-muted">{request.userId?.email}</small>
                        </div>
                        <div>
                          <small className="text-muted">{request.userId?.phone}</small>
                        </div>
                        {displayUserRequestDetails(request)}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong className="text-primary">{request.vehicleId?.registrationNumber}</strong>
                        <div>
                          <small className="text-muted">
                            {request.vehicleId?.make} {request.vehicleId?.model}
                          </small>
                        </div>
                        {request.vehicleId?.insuranceExpiryDate && (
                          <div>
                            <small className={new Date(request.vehicleId.insuranceExpiryDate) < new Date() ? 'text-danger' : 'text-warning'}>
                              Expires: {formatDate(request.vehicleId.insuranceExpiryDate)}
                            </small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {request.vehicleId?.insuranceProvider ? (
                        <div>
                          <small>{request.vehicleId.insuranceProvider}</small>
                          {request.vehicleId.insuranceNumber && (
                            <div>
                              <small className="text-muted">
                                Policy: {request.vehicleId.insuranceNumber}
                              </small>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge bg="secondary">No Insurance</Badge>
                      )}
                    </td>
                    <td>
                      {getStatusBadge(request.status)}
                    </td>
                    <td>
                      {request.status === 'pending' && (
                        <div className="d-flex gap-1">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAccept(request)}
                            className="d-flex align-items-center"
                          >
                            <i className="bi bi-check-lg me-1"></i>
                            Accept
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleReject(request)}
                            className="d-flex align-items-center"
                          >
                            <i className="bi bi-x-lg me-1"></i>
                            Reject
                          </Button>
                        </div>
                      )}
                      {request.status === 'accepted' && (
                        <small className="text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Waiting for user
                        </small>
                      )}
                      {request.status === 'rejected' && (
                        <small className="text-muted">Rejected</small>
                      )}
                      {request.status === 'completed' && (
                        <small className="text-info">
                          <i className="bi bi-check-all me-1"></i>
                          Completed
                        </small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Accept Request Modal */}
      <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Accept Insurance Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Customer:</strong> {selectedRequest.userId?.name}
                </Col>
                <Col md={6}>
                  <strong>Vehicle:</strong> {selectedRequest.vehicleId?.registrationNumber}
                </Col>
              </Row>
              
              {/* Show user's original request for user_to_agent */}
              {selectedRequest.requestType === 'user_to_agent' && (
                <div className="alert alert-info mb-3">
                  <h6>User's Original Request</h6>
                  <div className="row">
                    <div className="col-md-4">
                      <strong>Expected Amount:</strong><br/>
                      {formatCurrency(selectedRequest.userExpectedAmount)}
                    </div>
                    <div className="col-md-4">
                      <strong>Cover Type:</strong><br/>
                      <Badge bg="primary">{selectedRequest.userCoverType}</Badge>
                    </div>
                    {selectedRequest.userMessage && (
                      <div className="col-md-12 mt-2">
                        <strong>Message:</strong><br/>
                        {selectedRequest.userMessage}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Row className="mb-4">
                <Col md={6}>
                  <strong>Current Insurance:</strong> {selectedRequest.vehicleId?.insuranceProvider || 'None'}
                </Col>
                <Col md={6}>
                  <strong>Expiry Date:</strong> {selectedRequest.vehicleId?.insuranceExpiryDate ? formatDate(selectedRequest.vehicleId.insuranceExpiryDate) : 'Not insured'}
                </Col>
              </Row>

              <hr/>
              <h6>Your Offer Details</h6>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Renewal Amount (₹) *</Form.Label>
                      <Form.Control
                        type="number"
                        value={acceptData.renewalAmount}
                        onChange={(e) => setAcceptData({...acceptData, renewalAmount: e.target.value})}
                        placeholder="Enter your offered amount"
                        required
                      />
                      {selectedRequest.userExpectedAmount && (
                        <Form.Text className="text-muted">
                          User requested: {formatCurrency(selectedRequest.userExpectedAmount)}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Insurance Cover Type *</Form.Label>
                      <Form.Select
                        value={acceptData.insuranceCover}
                        onChange={(e) => setAcceptData({...acceptData, insuranceCover: e.target.value})}
                      >
                        <option value="comprehensive">Comprehensive</option>
                        <option value="third-party">Third Party</option>
                        <option value="own-damage">Own Damage</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Coverage Details *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={acceptData.coverageDetails}
                    onChange={(e) => setAcceptData({...acceptData, coverageDetails: e.target.value})}
                    placeholder="Describe the coverage details and terms..."
                    required
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={submitAccept}
            disabled={processing || !acceptData.renewalAmount || !acceptData.coverageDetails}
          >
            {processing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Send Offer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Request Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Insurance Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <p>Reject request from <strong>{selectedRequest.userId?.name}</strong> for vehicle <strong>{selectedRequest.vehicleId?.registrationNumber}</strong>?</p>
              
              <Form.Group className="mb-3">
                <Form.Label>Rejection Reason (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={submitReject}
            disabled={processing}
          >
            {processing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-x-lg me-2"></i>
                Reject
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IncomingRequests;