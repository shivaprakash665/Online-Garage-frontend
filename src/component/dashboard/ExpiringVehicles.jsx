// src/component/dashboard/ExpiringVehicles.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import './ExpiringVehicles.css';
import CONFIG from "../../../src/config";

const ExpiringVehicles = ({ showAlert }) => {
  const [expiringVehicles, setExpiringVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [requestData, setRequestData] = useState({
    renewalAmount: '',
    insuranceCover: 'Comprehensive',
    coverageDetails: '',
    message: ''
  });

  useEffect(() => {
    fetchExpiringVehicles();
  }, []);

  const fetchExpiringVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/insurance/agent/expiring-vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpiringVehicles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expiring vehicles:', error);
      showAlert('Failed to load expiring vehicles', 'danger');
      setLoading(false);
    }
  };

  const handleSendRequest = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${CONFIG.API_BASE_URL}/api/insurance/agent/send-request`, {
        vehicleId: selectedVehicle._id,
        ...requestData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showAlert('Insurance request sent successfully!', 'success');
      setShowRequestModal(false);
      setSelectedVehicle(null);
      setRequestData({
        renewalAmount: '',
        insuranceCover: 'Comprehensive',
        coverageDetails: '',
        message: ''
      });
      fetchExpiringVehicles(); // Refresh the list
    } catch (error) {
      console.error('Error sending request:', error);
      showAlert(error.response?.data?.message || 'Failed to send request', 'danger');
    }
  };

  const getExpiryStatus = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { text: 'Expired', variant: 'danger' };
    if (daysUntilExpiry <= 7) return { text: 'Urgent', variant: 'danger' };
    if (daysUntilExpiry <= 30) return { text: 'Expiring Soon', variant: 'warning' };
    return { text: 'Active', variant: 'success' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
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
              <h4 className="mb-0">Expiring Vehicles</h4>
              <Badge bg="primary">{expiringVehicles.length} vehicles</Badge>
            </Card.Header>
            <Card.Body>
              {expiringVehicles.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No vehicles with expiring insurance found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Vehicle Number</th>
                        <th>Make & Model</th>
                        <th>Current Insurance</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringVehicles.map((vehicle) => {
                        const status = getExpiryStatus(vehicle.insuranceExpiryDate);
                        return (
                          <tr key={vehicle._id}>
                            <td>
                              <strong>{vehicle.registrationNumber}</strong>
                            </td>
                            <td>
                              {vehicle.make} {vehicle.model}
                            </td>
                            <td>
                              {vehicle.insuranceProvider || 'No insurance'}
                              {vehicle.insuranceNumber && (
                                <div>
                                  <small className="text-muted">Policy: {vehicle.insuranceNumber}</small>
                                </div>
                              )}
                            </td>
                            <td>
                              {formatDate(vehicle.insuranceExpiryDate)}
                            </td>
                            <td>
                              <Badge bg={status.variant}>{status.text}</Badge>
                            </td>
                            <td>
                              {vehicle.userId ? (
                                <>
                                  <div>{vehicle.userId.name}</div>
                                  <small className="text-muted">
                                    {vehicle.userId.phone ? `Phone: ${vehicle.userId.phone}` : 'Phone not available'}
                                  </small>
                                </>
                              ) : (
                                <span className="text-muted">Owner details not available</span>
                              )}
                            </td>
                            <td>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleSendRequest(vehicle)}
                                disabled={!vehicle.userId}
                              >
                                Send Request
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Send Request Modal */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Send Insurance Renewal Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVehicle && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Vehicle:</strong> {selectedVehicle.registrationNumber}
                </Col>
                <Col md={6}>
                  <strong>Make & Model:</strong> {selectedVehicle.make} {selectedVehicle.model}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Current Expiry:</strong> {formatDate(selectedVehicle.insuranceExpiryDate)}
                </Col>
                <Col md={6}>
                  <strong>Owner:</strong> {selectedVehicle.userId?.name || 'N/A'}
                </Col>
              </Row>
              
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Renewal Amount (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        value={requestData.renewalAmount}
                        onChange={(e) => setRequestData({...requestData, renewalAmount: e.target.value})}
                        placeholder="Enter amount"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Insurance Cover Type</Form.Label>
                      <Form.Select
                        value={requestData.insuranceCover}
                        onChange={(e) => setRequestData({...requestData, insuranceCover: e.target.value})}
                      >
                        <option value="Comprehensive">Comprehensive</option>
                        <option value="Third Party">Third Party</option>
                        <option value="Own Damage">Own Damage</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Coverage Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={requestData.coverageDetails}
                    onChange={(e) => setRequestData({...requestData, coverageDetails: e.target.value})}
                    placeholder="Describe the coverage details..."
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Additional Message (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={requestData.message}
                    onChange={(e) => setRequestData({...requestData, message: e.target.value})}
                    placeholder="Any additional message for the user..."
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitRequest}
            disabled={!requestData.renewalAmount || !requestData.coverageDetails}
          >
            Send Request
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ExpiringVehicles;