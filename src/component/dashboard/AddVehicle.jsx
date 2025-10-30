// component/dashboard/AddVehicle.jsx
import React, { useState } from "react";
import { Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import "./AddVehicle.css";

function AddVehicle() {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    make: "",
    model: "",
    color: "",
    chassisNumber: "",
    purchaseDate: "",
    fuelType: "",
    image: null,
    renewalDate: "",
    serviceDate: "",
    insuranceProvider: "",
    insuranceExpiryDate: "",
    insuranceNumber: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Format registration number to uppercase as user types
    if (name === "registrationNumber") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: files ? files[0] : value });
    }
  };

  const validateForm = () => {
    // Registration number validation (KL-12-B-3456 format)
    const regNumberRegex = /^[A-Z]{2}-\d{2}(-[A-Z]{1,2})?-\d{4}$/;
    if (!regNumberRegex.test(formData.registrationNumber)) {
      setError("Invalid registration number format. Use format like KL-12-B-3456");
      return false;
    }

    // Check if all mandatory fields are filled
    const mandatoryFields = [
      'registrationNumber', 'make', 'model', 'color', 'chassisNumber',
      'purchaseDate', 'fuelType', 'renewalDate', 'serviceDate',
      'insuranceProvider', 'insuranceExpiryDate', 'insuranceNumber'
    ];

    for (let field of mandatoryFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      const response = await axios.post("http://localhost:5000/api/vehicles/add", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      setSuccess("Vehicle added successfully!");
      setFormData({
        registrationNumber: "",
        make: "",
        model: "",
        color: "",
        chassisNumber: "",
        purchaseDate: "",
        fuelType: "",
        image: null,
        renewalDate: "",
        serviceDate: "",
        insuranceProvider: "",
        insuranceExpiryDate: "",
        insuranceNumber: ""
      });
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
      
    } catch (err) {
      setError(err.response?.data?.message || "Error adding vehicle");
    }
  };

  return (
    <div className="add-vehicle-container">
      <Card className="add-vehicle-card">
        <Card.Header className="add-vehicle-header">
          <h4 className="mb-0">Add New Vehicle</h4>
          <p className="text-muted mb-0">Fill in all the mandatory vehicle details</p>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger" className="alert-dismissible fade show">
              {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </Alert>}
            
            {success && <Alert variant="success" className="alert-dismissible fade show">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
            </Alert>}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Registration Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="KL-12-B-3456"
                    required
                    className="form-control-custom"
                  />
                  <Form.Text className="text-muted">
                    Format: KL-12-B-3456 (Two letters, two numbers, optional letter, four numbers)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Chassis Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle Make <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle Model <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Color <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Purchase Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fuel Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="fuelType"
                    value={formData.fuelType}
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
              <Col md={4}>
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

            <hr className="my-4" />
            <h6 className="text-primary mb-3">Renewal & Service Dates</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Renewal Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="renewalDate"
                    value={formData.renewalDate}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Service Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />
            <h6 className="text-primary mb-3">Insurance Details</h6>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Insurance Provider <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Insurance Expiry Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="insuranceExpiryDate"
                    value={formData.insuranceExpiryDate}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Insurance Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="insuranceNumber"
                    value={formData.insuranceNumber}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
              <Button 
                variant="outline-secondary" 
                type="button"
                onClick={() => {
                  setFormData({
                    registrationNumber: "", make: "", model: "", color: "", chassisNumber: "",
                    purchaseDate: "", fuelType: "", image: null, renewalDate: "", serviceDate: "",
                    insuranceProvider: "", insuranceExpiryDate: "", insuranceNumber: ""
                  });
                  setError("");
                  setSuccess("");
                }}
                className="me-md-2"
              >
                Clear Form
              </Button>
              <Button variant="primary" type="submit" className="px-4">
                Add Vehicle
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AddVehicle;