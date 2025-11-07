// src/component/dashboard/SentRequests.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import './SentRequests.css';
import CONFIG from "../../../src/config";
import CompleteInsuranceModal from './CompleteInsuranceModal'; 

const SentRequests = ({ showAlert }) => {
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchSentRequests();
  }, []);

  const fetchSentRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/insurance/agent/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSentRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      showAlert('Failed to load sent requests', 'danger');
      setLoading(false);
    }
  };

  const handleCompleteInsurance = (request) => {
    setSelectedRequest(request);
    setShowCompleteModal(true);
  };

  const handleCompletionSuccess = () => {
    fetchSentRequests(); // Refresh the list after completion
    showAlert('Insurance completed successfully! Vehicle insurance details updated.', 'success');
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadgeText = (status) => {
    switch (status) {
      case 'pending': return 'PENDING';
      case 'accepted': return 'ACCEPTED';
      case 'rejected': return 'REJECTED';
      case 'completed': return 'COMPLETED';
      default: return status.toUpperCase();
    }
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
      <Row>
        <Col>
          <Card className="sent-requests-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">Sent Insurance Requests</h4>
                <p className="text-muted mb-0 mt-1">
                  Manage your insurance renewal requests and complete accepted ones
                </p>
              </div>
              <Badge bg="primary" pill>{sentRequests.length} requests</Badge>
            </Card.Header>
            <Card.Body>
              {sentRequests.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-envelope-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="text-muted mt-3">No Insurance Requests Sent</h5>
                  <p className="text-muted">
                    You haven't sent any insurance renewal requests yet. 
                    Visit the Expiring Vehicles page to send your first request.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="sent-requests-table">
                    <thead className="table-dark">
                      <tr>
                        <th>Request Date</th>
                        <th>Vehicle Details</th>
                        <th>Customer Information</th>
                        <th>Cover Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Response Details</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sentRequests.map((request) => (
                        <tr key={request._id} className={request.status === 'completed' ? 'table-success' : ''}>
                          <td>
                            <div className="fw-semibold">{formatDate(request.createdAt)}</div>
                            <small className="text-muted">
                              {new Date(request.createdAt).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </small>
                          </td>
                          <td>
                            <div className="fw-bold text-primary">{request.vehicleId.registrationNumber}</div>
                            <div className="small text-muted">
                              {request.vehicleId.make} {request.vehicleId.model}
                            </div>
                            <div className="small">
                              <span className="text-muted">Expiry: </span>
                              <span className={new Date(request.vehicleId.insuranceExpiryDate) < new Date() ? 'text-danger' : 'text-warning'}>
                                {formatDate(request.vehicleId.insuranceExpiryDate)}
                              </span>
                            </div>
                          </td>
                          <td>
                            {request.userId ? (
                              <>
                                <div className="fw-semibold">{request.userId.name}</div>
                                {request.status === 'accepted' || request.status === 'completed' ? (
                                  <>
                                    <div className="small text-muted">
                                      <i className="bi bi-telephone me-1"></i>
                                      {request.userId.phone}
                                    </div>
                                    <div className="small text-muted">
                                      <i className="bi bi-envelope me-1"></i>
                                      {request.userId.email}
                                    </div>
                                    {request.userId.address && (
                                      <div className="small text-muted">
                                        <i className="bi bi-geo-alt me-1"></i>
                                        {request.userId.address.length > 30 
                                          ? `${request.userId.address.substring(0, 30)}...` 
                                          : request.userId.address
                                        }
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="small text-muted">
                                    <i className="bi bi-eye-slash me-1"></i>
                                    Contact details hidden until accepted
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-danger small">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                Customer not found
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {request.insuranceCover}
                            </span>
                          </td>
                          <td>
                            <div className="fw-bold text-success">{formatCurrency(request.renewalAmount)}</div>
                          </td>
                          <td>
                            <Badge bg={getStatusVariant(request.status)} className="status-badge">
                              {getStatusBadgeText(request.status)}
                            </Badge>
                          </td>
                          <td>
                            {request.status === 'pending' && (
                              <div className="text-warning">
                                <i className="bi bi-clock me-1"></i>
                                Waiting for customer response
                              </div>
                            )}
                            {request.status === 'accepted' && (
                              <div className="text-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Accepted on {formatDate(request.updatedAt)}
                              </div>
                            )}
                            {request.status === 'rejected' && (
                              <div className="text-danger">
                                <i className="bi bi-x-circle me-1"></i>
                                Rejected on {formatDate(request.updatedAt)}
                              </div>
                            )}
                            {request.status === 'completed' && (
                              <div className="text-info">
                                <i className="bi bi-check-all me-1"></i>
                                Completed on {formatDate(request.completedAt)}
                                {request.newPolicyNumber && (
                                  <div className="small">
                                    New Policy: {request.newPolicyNumber}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              {request.status === 'accepted' && (
                                <Button 
                                  size="sm" 
                                  variant="success"
                                  onClick={() => handleCompleteInsurance(request)}
                                  className="d-flex align-items-center justify-content-center"
                                >
                                  <i className="bi bi-check-lg me-1"></i>
                                  Complete
                                </Button>
                              )}
                              {request.status === 'completed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline-info" 
                                  disabled
                                  className="d-flex align-items-center justify-content-center"
                                >
                                  <i className="bi bi-check-all me-1"></i>
                                  Completed
                                </Button>
                              )}
                              {(request.status === 'pending' || request.status === 'rejected') && (
                                <Button 
                                  size="sm" 
                                  variant="outline-secondary" 
                                  disabled
                                  className="d-flex align-items-center justify-content-center"
                                >
                                  <i className="bi bi-dash-circle me-1"></i>
                                  No Action
                                </Button>
                              )}
                              
                              {/* View Details Button for all statuses */}
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => handleCompleteInsurance(request)}
                                className="d-flex align-items-center justify-content-center mt-1"
                              >
                                <i className="bi bi-eye me-1"></i>
                                View Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="text-muted">
              <div className="d-flex justify-content-between align-items-center">
                <small>
                  Showing {sentRequests.length} request{sentRequests.length !== 1 ? 's' : ''}
                </small>
                <div className="status-legend">
                  <small>
                    <Badge bg="warning" className="me-2">Pending</Badge>
                    <Badge bg="success" className="me-2">Accepted</Badge>
                    <Badge bg="danger" className="me-2">Rejected</Badge>
                    <Badge bg="info" className="me-2">Completed</Badge>
                  </small>
                </div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Complete Insurance Modal */}
      <CompleteInsuranceModal
        show={showCompleteModal}
        onHide={() => {
          setShowCompleteModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onSuccess={handleCompletionSuccess}
        showAlert={showAlert}
      />
    </Container>
  );
};

export default SentRequests;