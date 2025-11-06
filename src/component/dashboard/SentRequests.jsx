// src/component/dashboard/SentRequests.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import axios from 'axios';
import './SentRequests.css';

const SentRequests = ({ showAlert }) => {
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentRequests();
  }, []);

  const fetchSentRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/insurance/agent/requests', {
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
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Sent Insurance Requests</h4>
              <Badge bg="primary">{sentRequests.length} requests</Badge>
            </Card.Header>
            <Card.Body>
              {sentRequests.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No insurance requests sent yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Request Date</th>
                        <th>Vehicle</th>
                        <th>Customer</th>
                        <th>Cover Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Customer Response</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sentRequests.map((request) => (
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
                            {request.userId ? (
                              <>
                                <div>{request.userId.name}</div>
                                {request.status === 'accepted' || request.status === 'completed' ? (
                                  <>
                                    <small className="text-muted">Phone: {request.userId.phone}</small>
                                    <br />
                                    <small className="text-muted">Email: {request.userId.email}</small>
                                    {request.userId.address && (
                                      <>
                                        <br />
                                        <small className="text-muted">Address: {request.userId.address}</small>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <small className="text-muted">Contact details hidden</small>
                                )}
                              </>
                            ) : (
                              <span className="text-muted">Customer not found</span>
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
                              <small className="text-muted">Waiting for response</small>
                            )}
                            {request.status === 'accepted' && (
                              <small className="text-success">
                                Accepted on {formatDate(request.updatedAt)}
                              </small>
                            )}
                            {request.status === 'rejected' && (
                              <small className="text-danger">
                                Rejected on {formatDate(request.updatedAt)}
                              </small>
                            )}
                            {request.status === 'completed' && (
                              <small className="text-info">
                                Completed on {formatDate(request.completedAt)}
                              </small>
                            )}
                          </td>
                          <td>
                            {request.status === 'accepted' && (
                              <Button size="sm" variant="outline-success">
                                Complete Insurance
                              </Button>
                            )}
                            {request.status === 'completed' && (
                              <Button size="sm" variant="outline-info" disabled>
                                Completed
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
    </Container>
  );
};

export default SentRequests;