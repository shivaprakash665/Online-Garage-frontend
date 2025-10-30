// component/dashboard/EditVehicleModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";
import "./EditVehicleModal.css";

function EditVehicleModal({ show, onHide, vehicle, onVehicleUpdate }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || "",
        model: vehicle.model || "",
        color: vehicle.color || "",
        purchaseDate: vehicle.purchaseDate ? vehicle.purchaseDate.split('T')[0] : "",
        fuelType: vehicle.fuelType || "",
        renewalDate: vehicle.renewalDate ? vehicle.renewalDate.split('T')[0] : "",
        serviceDate: vehicle.serviceDate ? vehicle.serviceDate.split('T')[0] : "",
        insuranceProvider: vehicle.insuranceProvider || "",
        insuranceExpiryDate: vehicle.insuranceExpiryDate ? vehicle.insuranceExpiryDate.split('T')[0] : "",
        insuranceNumber: vehicle.insuranceNumber || "",
        image: null
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.put(
        `http://localhost:5000/api/vehicles/${vehicle._id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onVehicleUpdate(response.data.vehicle);
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleRenewalUpdate = async (type) => {
    const newDate = prompt(`Enter new ${type} expiry date (YYYY-MM-DD):`);
    if (newDate) {
      try {
        const response = await axios.put(
          `http://localhost:5000/api/vehicles/renewal/${vehicle._id}`,
          { type, newDate },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        onVehicleUpdate(response.data.vehicle);
      } catch (err) {
        setError(err.response?.data?.message || "Error updating renewal");
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="edit-vehicle-modal">
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>Edit Vehicle Details</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" className="alert-dismissible fade show">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </Alert>}

          <div className="quick-renewal-section mb-4">
            <h6 className="text-primary mb-3">Quick Renewal Updates</h6>
            <Row>
              <Col md={4}>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="w-100"
                  onClick={() => handleRenewalUpdate('renewal')}
                >
                  Update Renewal
                </Button>
              </Col>
              <Col md={4}>
                <Button 
                  variant="outline-success" 
                  size="sm" 
                  className="w-100"
                  onClick={() => handleRenewalUpdate('service')}
                >
                  Update Service
                </Button>
              </Col>
              <Col md={4}>
                <Button 
                  variant="outline-info" 
                  size="sm" 
                  className="w-100"
                  onClick={() => handleRenewalUpdate('insurance')}
                >
                  Update Insurance
                </Button>
              </Col>
            </Row>
          </div>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vehicle Make</Form.Label>
                <Form.Control
                  type="text"
                  name="make"
                  value={formData.make || ""}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vehicle Model</Form.Label>
                <Form.Control
                  type="text"
                  name="model"
                  value={formData.model || ""}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Color</Form.Label>
                <Form.Control
                  type="text"
                  name="color"
                  value={formData.color || ""}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Purchase Date</Form.Label>
                <Form.Control
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate || ""}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fuel Type</Form.Label>
                <Form.Select
                  name="fuelType"
                  value={formData.fuelType || ""}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                >
                  <option value="">Select Fuel Type</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="lpg">LPG</option>
                  <option value="others">Others</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vehicle Image</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h6 className="text-primary mb-3">Renewal & Service Dates</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Renewal Date</Form.Label>
                <Form.Control
                  type="date"
                  name="renewalDate"
                  value={formData.renewalDate || ""}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Service Date</Form.Label>
                <Form.Control
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate || ""}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h6 className="text-primary mb-3">Insurance Details</h6>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Insurance Provider</Form.Label>
                <Form.Control
                  type="text"
                  name="insuranceProvider"
                  value={formData.insuranceProvider || ""}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Insurance Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  name="insuranceExpiryDate"
                  value={formData.insuranceExpiryDate || ""}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Insurance Number</Form.Label>
                <Form.Control
                  type="text"
                  name="insuranceNumber"
                  value={formData.insuranceNumber || ""}
                  onChange={handleChange}
                  required
                  className="form-control-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          {vehicle?.image && (
            <div className="current-image-section">
              <Form.Label>Current Image</Form.Label>
              <div className="current-image-container">
                <img 
                  src={`http://localhost:5000/${vehicle.image}`} 
                  alt="Current vehicle"
                  className="current-image"
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Vehicle"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditVehicleModal;