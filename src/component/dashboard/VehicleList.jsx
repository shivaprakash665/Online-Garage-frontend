import React, { useState, useEffect } from "react";
import { ListGroup, Modal, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";

function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vehicles", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setVehicles(res.data);
        setFilteredVehicles(res.data);
      } catch (err) {
        console.error("Error fetching vehicles");
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    setFilteredVehicles(
      vehicles.filter((v) =>
        v.registrationNumber.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, vehicles]);

  const handleShowDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  return (
    <div className="mt-4">
      <Form.Control
        type="text"
        placeholder="Search by Registration Number"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />
      <ListGroup>
        {filteredVehicles.map((vehicle) => (
          <ListGroup.Item
            key={vehicle._id}
            action
            onClick={() => handleShowDetails(vehicle)}
          >
            {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Vehicle Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVehicle && (
            <div>
              <Row>
                <Col><strong>Registration Number:</strong> {selectedVehicle.registrationNumber}</Col>
                <Col><strong>Make:</strong> {selectedVehicle.make}</Col>
              </Row>
              <Row>
                <Col><strong>Model:</strong> {selectedVehicle.model}</Col>
                <Col><strong>Color:</strong> {selectedVehicle.color}</Col>
              </Row>
              <Row>
                <Col><strong>Chassis Number:</strong> {selectedVehicle.chassisNumber}</Col>
                <Col><strong>Purchase Date:</strong> {new Date(selectedVehicle.purchaseDate).toLocaleDateString()}</Col>
              </Row>
              <Row>
                <Col><strong>Fuel Type:</strong> {selectedVehicle.fuelType}</Col>
                <Col><strong>Renewal Date:</strong> {selectedVehicle.renewalDate ? new Date(selectedVehicle.renewalDate).toLocaleDateString() : "N/A"}</Col>
              </Row>
              <Row>
                <Col><strong>Service Date:</strong> {selectedVehicle.serviceDate ? new Date(selectedVehicle.serviceDate).toLocaleDateString() : "N/A"}</Col>
              </Row>
              <img src={`http://localhost:5000/${selectedVehicle.image}`} alt="Vehicle" style={{ width: "100%", maxHeight: "300px" }} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default VehicleList;