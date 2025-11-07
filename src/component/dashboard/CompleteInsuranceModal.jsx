import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import CONFIG from "../../../src/config";

const CompleteInsuranceModal = ({ show, onHide, request, onSuccess, showAlert }) => {
  const [formData, setFormData] = useState({
    newPolicyNumber: '',
    newExpiryDate: '',
    insuranceProvider: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (request && show) {
      // Pre-fill form with current vehicle data
      setFormData({
        newPolicyNumber: '',
        newExpiryDate: '',
        insuranceProvider: request.vehicleId.insuranceProvider || ''
      });
      setError('');
    }
  }, [request, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${CONFIG.API_BASE_URL}/api/insurance/agent/complete-request/${request._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showAlert('Insurance completed successfully!', 'success');
      onSuccess();
      onHide();
    } catch (error) {
      console.error('Error completing insurance:', error);
      setError(error.response?.data?.message || 'Failed to complete insurance');
      showAlert('Failed to complete insurance', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Tomorrow
    return today.toISOString().split('T')[0];
  };

  if (!request) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Complete Insurance Renewal</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="mb-3">
            <Col md={6}>
              <strong>Vehicle:</strong> {request.vehicleId.registrationNumber}
            </Col>
            <Col md={6}>
              <strong>Customer:</strong> {request.userId.name}
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <strong>Current Policy:</strong> {request.vehicleId.insuranceNumber || 'N/A'}
            </Col>
            <Col md={6}>
              <strong>Current Expiry:</strong> {new Date(request.vehicleId.insuranceExpiryDate).toLocaleDateString()}
            </Col>
          </Row>

          <hr />

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>New Policy Number *</Form.Label>
                <Form.Control
                  type="text"
                  name="newPolicyNumber"
                  value={formData.newPolicyNumber}
                  onChange={handleChange}
                  placeholder="Enter new policy number"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Insurance Provider</Form.Label>
                <Form.Control
                  type="text"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  placeholder="Enter insurance provider"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>New Expiry Date *</Form.Label>
            <Form.Control
              type="date"
              name="newExpiryDate"
              value={formData.newExpiryDate}
              onChange={handleChange}
              min={calculateMinDate()}
              required
            />
            <Form.Text className="text-muted">
              Select the new insurance expiry date (must be future date)
            </Form.Text>
          </Form.Group>

          <div className="bg-light p-3 rounded">
            <h6>Renewal Summary</h6>
            <Row>
              <Col md={6}>
                <strong>Cover Type:</strong> {request.insuranceCover}
              </Col>
              <Col md={6}>
                <strong>Renewal Amount:</strong> ₹{request.renewalAmount}
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            type="submit" 
            disabled={loading || !formData.newPolicyNumber || !formData.newExpiryDate}
          >
            {loading ? 'Completing...' : 'Complete Insurance'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CompleteInsuranceModal;