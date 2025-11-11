// src/component/dashboard/IncomingRequests.jsx - UPDATED WITH COMPLETE FLOW
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
    // Pre-fill with user's requested details
    const userAmount = request.userExpectedAmount || '';
    const userCover = request.userCoverType || 'comprehensive';
    
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
      showAlert('Insurance offer sent to user successfully! Waiting for user acceptance.', 'success');
      setShowAcceptModal(false);
      setSelectedRequest(null);
      fetchIncomingRequests();
    } catch (error) {
      console.error('❌ Error sending offer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send offer';
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

  const getStatusBadge = (status, requestType) => {
    const statusConfig = {
      'pending': { bg: 'warning', text: 'PENDING' },
      'offer_sent': { bg: 'info', text: 'OFFER SENT' }, // NEW STATUS
      'accepted': { bg: 'success', text: 'ACCEPTED BY USER' },
      'rejected': { bg: 'danger', text: 'REJECTED' },
      'completed': { bg: 'primary', text: 'COMPLETED' }
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
    if (request.requestType === 'user_to_agent') {
      return (
        <div className="user-request-details mt-2 p-2 bg-light rounded">
          <small>
            <strong>User's Original Request:</strong><br/>
            • Expected Amount: {formatCurrency(request.userExpectedAmount)}<br/>
            • Cover Type: <Badge bg="primary" className="text-capitalize">{request.userCoverType}</Badge><br/>
            {request.userMessage && `• Message: ${request.userMessage}`}
          </small>
        </div>
      );
    }
    return null;
  };

  // Get action buttons based on status
  const getActionButtons = (request) => {
    switch (request.status) {
      case 'pending':
        return (
          <div className="d-flex gap-1">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleAccept(request)}
              className="d-flex align-items-center"
            >
              <i className="bi bi-check-lg me-1"></i>
              Send Offer
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
        );
      
      case 'offer_sent':
        return (
          <small className="text-info">
            <i className="bi bi-clock me-1"></i>
            Waiting for user response
          </small>
        );
      
      case 'accepted':
        return (
          <small className="text-success">
            <i className="bi bi-check-circle me-1"></i>
            User accepted - Ready to complete
          </small>
        );
      
      case 'rejected':
        return (
          <small className="text-muted">
            <i className="bi bi-x-circle me-1"></i>
            Rejected by user
          </small>
        );
      
      case 'completed':
        return (
          <small className="text-primary">
            <i className="bi bi-check-all me-1"></i>
            Completed
          </small>
        );
      
      default:
        return <small className="text-muted">No actions</small>;
    }
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
          <div className="d-flex gap-2">
            <Badge bg="warning" text="dark">
              {incomingRequests.filter(r => r.status === 'pending').length} Pending
            </Badge>
            <Badge bg="info" text="dark">
              {incomingRequests.filter(r => r.status === 'offer_sent').length} Offers Sent
            </Badge>
            <Badge bg="success" text="dark">
              {incomingRequests.filter(r => r.status === 'accepted').length} Accepted
            </Badge>
          </div>
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
                  <tr key={request._id} className={
                    request.status === 'completed' ? 'table-success' : 
                    request.status === 'accepted' ? 'table-warning' : ''
                  }>
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
                      {getStatusBadge(request.status, request.requestType)}
                      {request.status === 'accepted' && (
                        <div className="mt-1">
                          <small className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Ready to complete
                          </small>
                        </div>
                      )}
                    </td>
                    <td>
                      {getActionButtons(request)}
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
          <Modal.Title>
            <i className="bi bi-send-check me-2"></i>
            Send Insurance Offer to User
          </Modal.Title>
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
                  <h6>
                    <i className="bi bi-person me-2"></i>
                    User's Original Request
                  </h6>
                  <Row>
                    <div className="col-md-4">
                      <strong>Expected Amount:</strong><br/>
                      {formatCurrency(selectedRequest.userExpectedAmount)}
                    </div>
                    <div className="col-md-4">
                      <strong>Cover Type:</strong><br/>
                      <Badge bg="primary" className="text-capitalize">
                        {selectedRequest.userCoverType}
                      </Badge>
                    </div>
                    {selectedRequest.userMessage && (
                      <div className="col-md-12 mt-2">
                        <strong>Message:</strong><br/>
                        {selectedRequest.userMessage}
                      </div>
                    )}
                  </Row>
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
              <h6 className="text-success">
                <i className="bi bi-currency-exchange me-2"></i>
                Your Insurance Offer
              </h6>
              <Alert variant="warning" className="small">
                <i className="bi bi-info-circle me-2"></i>
                User will need to accept this offer before you can complete the insurance.
              </Alert>
              
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
                    placeholder="Describe the coverage details, terms, and benefits..."
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
                Sending Offer...
              </>
            ) : (
              <>
                <i className="bi bi-send-check me-2"></i>
                Send Offer to User
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Request Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-x-circle me-2"></i>
            Reject Insurance Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Alert variant="warning">
                <p>Are you sure you want to reject the insurance request from <strong>{selectedRequest.userId?.name}</strong> for vehicle <strong>{selectedRequest.vehicleId?.registrationNumber}</strong>?</p>
              </Alert>
              
              <Form.Group className="mb-3">
                <Form.Label>Rejection Reason (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection. This will be sent to the user..."
                />
                <Form.Text className="text-muted">
                  The user will be notified that their request was rejected.
                </Form.Text>
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
                Reject Request
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IncomingRequests;