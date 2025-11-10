// src/component/dashboard/UserRenewalRequest.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import './UserRenewalRequest.css';
import CONFIG from "../../../src/config";

const UserRenewalRequest = () => {
  const [vehicles, setVehicles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  // Add new state variables for the required fields
  const [coverageDetails, setCoverageDetails] = useState('');
  const [insuranceCover, setInsuranceCover] = useState('comprehensive');
  const [renewalAmount, setRenewalAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch user's vehicles
      const vehiclesResponse = await axios.get(`${CONFIG.API_BASE_URL}/api/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Try to fetch insurance agents, but handle if endpoint doesn't exist
      let agentsData = [];
      try {
        const agentsResponse = await axios.get(`${CONFIG.API_BASE_URL}/api/insurance/insurance-agents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        agentsData = agentsResponse.data;
      } catch (agentError) {
        console.warn('Insurance agents endpoint not available:', agentError.message);
        agentsData = [];
      }

      setVehicles(vehiclesResponse.data);
      setAgents(agentsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert('Failed to load data', 'danger');
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  // Define handleSendRequest BEFORE it's used in JSX
  const handleSendRequest = (vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedAgent('');
    setMessage('');
    setCoverageDetails(`Insurance renewal for ${vehicle.registrationNumber}`);
    setInsuranceCover('comprehensive');
    setRenewalAmount('');
    setShowRequestModal(true);
  };

  // Define handleSubmitRequest BEFORE it's used in JSX
  // In UserRenewalRequest.jsx - UPDATE handleSubmitRequest
const handleSubmitRequest = async () => {
  if (!selectedAgent || !coverageDetails || !insuranceCover || !renewalAmount) {
    showAlert('Please fill all required fields', 'warning');
    return;
  }

  try {
    setSending(true);
    const token = localStorage.getItem('token');
    
    const requestData = {
      agentId: selectedAgent, // Send agent ID
      vehicleId: selectedVehicle._id, // Send vehicle ID
      message: message || `Insurance renewal request for ${selectedVehicle.registrationNumber}`,
      // Include the additional fields your model needs
      renewalAmount: parseFloat(renewalAmount),
      insuranceCover: insuranceCover,
      coverageDetails: coverageDetails,
      agentName: agents.find(a => a._id === selectedAgent)?.name,
      agentCompany: agents.find(a => a._id === selectedAgent)?.company
    };

    await axios.post(`${CONFIG.API_BASE_URL}/api/insurance/user/send-request`, 
      requestData, 
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    showAlert('Insurance renewal request sent successfully!', 'success');
    setShowRequestModal(false);
    // Reset form
    setSelectedVehicle(null);
    setSelectedAgent('');
    setMessage('');
    setCoverageDetails('');
    setInsuranceCover('comprehensive');
    setRenewalAmount('');
  } catch (error) {
    console.error('Error sending request:', error);
    showAlert(error.response?.data?.message || 'Failed to send request', 'danger');
  } finally {
    setSending(false);
  }
};
  const getInsuranceStatus = (expiryDate) => {
    if (!expiryDate) return { badge: 'secondary', text: 'No Insurance' };
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { badge: 'danger', text: 'Expired' };
    if (daysUntilExpiry <= 30) return { badge: 'warning', text: 'Expiring Soon' };
    return { badge: 'success', text: 'Active' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="success" className="mb-3" />
            <p>Loading vehicles and agents...</p>
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark mb-1">Request Insurance Renewal</h2>
          <p className="text-muted mb-0">Send renewal requests to insurance agents for your vehicles</p>
        </div>
      </div>

      {/* Vehicles List */}
      <Card className="admin-table">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-car-front me-2"></i>
            Your Vehicles ({vehicles.length})
          </h5>
        </Card.Header>
        
        {vehicles.length === 0 ? (
          <Card.Body className="text-center py-5">
            <i className="bi bi-car-front fs-1 text-muted mb-3 d-block"></i>
            <p className="text-muted mb-0">No vehicles registered</p>
            <Button variant="primary" className="mt-3" onClick={() => window.location.href = '/userdashboard/addvehicle'}>
              Add Your First Vehicle
            </Button>
          </Card.Body>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Details</th>
                  <th>Insurance Status</th>
                  <th>Current Expiry</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const insuranceStatus = getInsuranceStatus(vehicle.insuranceExpiryDate);
                  return (
                    <tr key={vehicle._id}>
                      <td>
                        <div>
                          <strong>{vehicle.registrationNumber}</strong>
                          <div>
                            <small className="text-muted">
                              {vehicle.make} {vehicle.model}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <small>Color: {vehicle.color}</small>
                          <div>
                            <small>Fuel: {vehicle.fuelType}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={insuranceStatus.badge}>
                          {insuranceStatus.text}
                        </Badge>
                      </td>
                      <td>
                        {vehicle.insuranceExpiryDate ? (
                          <small>{formatDate(vehicle.insuranceExpiryDate)}</small>
                        ) : (
                          <small className="text-muted">Not insured</small>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSendRequest(vehicle)}
                        >
                          <i className="bi bi-send me-1"></i>
                          Request Renewal
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Send Request Modal */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Send Insurance Renewal Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVehicle && (
            <>
              <Row className="mb-4">
                <Col>
                  <h6>Vehicle Details</h6>
                  <Card className="bg-light">
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <strong>Registration:</strong> {selectedVehicle.registrationNumber}
                        </Col>
                        <Col md={6}>
                          <strong>Make & Model:</strong> {selectedVehicle.make} {selectedVehicle.model}
                        </Col>
                      </Row>
                      <Row className="mt-2">
                        <Col md={6}>
                          <strong>Current Insurance:</strong> {selectedVehicle.insuranceProvider || 'None'}
                        </Col>
                        <Col md={6}>
                          <strong>Expiry Date:</strong> {selectedVehicle.insuranceExpiryDate ? formatDate(selectedVehicle.insuranceExpiryDate) : 'Not insured'}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Select Insurance Agent *</Form.Label>
                  <Form.Select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    required
                  >
                    <option value="">Choose an agent...</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} - {agent.company} ({agent.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Coverage Details *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={coverageDetails}
                    onChange={(e) => setCoverageDetails(e.target.value)}
                    placeholder="Describe the coverage details you need..."
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Insurance Cover Type *</Form.Label>
                      <Form.Select
                        value={insuranceCover}
                        onChange={(e) => setInsuranceCover(e.target.value)}
                        required
                      >
                        <option value="comprehensive">Comprehensive</option>
                        <option value="third-party">Third Party</option>
                        <option value="Own Damage">Fire & Theft</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expected Renewal Amount (₹) *</Form.Label>
                      <Form.Control
                        type="number"
                        value={renewalAmount}
                        onChange={(e) => setRenewalAmount(e.target.value)}
                        placeholder="Enter expected amount"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Additional Message (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add any specific requirements or notes for the agent..."
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
            disabled={!selectedAgent || sending || !coverageDetails || !insuranceCover || !renewalAmount}
          >
            {sending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              <>
                <i className="bi bi-send me-2"></i>
                Send Request
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserRenewalRequest;