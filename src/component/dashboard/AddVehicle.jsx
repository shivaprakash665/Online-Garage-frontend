import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";


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
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      await axios.post("http://localhost:5000/api/vehicles/add", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Vehicle added successfully!");
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
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding vehicle");
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-4">
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Registration Number</Form.Label>
        <Form.Control
          type="text"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Vehicle Make</Form.Label>
        <Form.Control
          type="text"
          name="make"
          value={formData.make}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Vehicle Model</Form.Label>
        <Form.Control
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Color</Form.Label>
        <Form.Control
          type="text"
          name="color"
          value={formData.color}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Chassis Number</Form.Label>
        <Form.Control
          type="text"
          name="chassisNumber"
          value={formData.chassisNumber}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Purchase Date</Form.Label>
        <Form.Control
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Fuel Type</Form.Label>
        <Form.Select
          name="fuelType"
          value={formData.fuelType}
          onChange={handleChange}
          required
        >
          <option value="">Select Fuel Type</option>
          <option value="petrol">Petrol</option>
          <option value="diesel">Diesel</option>
          <option value="cng">CNG</option>
          <option value="lpg">LPG</option>
          <option value="others">Others</option>
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Vehicle Image</Form.Label>
        <Form.Control
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Renewal Date (Optional)</Form.Label>
        <Form.Control
          type="date"
          name="renewalDate"
          value={formData.renewalDate}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Service Date (Optional)</Form.Label>
        <Form.Control
          type="date"
          name="serviceDate"
          value={formData.serviceDate}
          onChange={handleChange}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        Add Vehicle
      </Button>
    </Form>
  );
}

export default AddVehicle;