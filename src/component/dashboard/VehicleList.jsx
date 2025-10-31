// component/dashboard/VehicleList.jsx
import React, { useState, useEffect } from "react";
import { 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Badge,
  InputGroup 
} from "react-bootstrap";
import axios from "axios";
import EditVehicleModal from "./EditVehicleModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import "./VehicleList.css";

function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    const filtered = vehicles.filter((v) =>
      v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [search, vehicles]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://online-garage-api-2.onrender.com/api/vehicles", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setVehicles(res.data);
      setFilteredVehicles(res.data);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`https://online-garage-api-2.onrender.com/api/vehicles/${vehicleToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      setVehicles(vehicles.filter(v => v._id !== vehicleToDelete._id));
      setShowDeleteModal(false);
      setVehicleToDelete(null);
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      alert("Error deleting vehicle");
    }
  };

  const handleVehicleUpdate = (updatedVehicle) => {
    setVehicles(vehicles.map(v => 
      v._id === updatedVehicle._id ? updatedVehicle : v
    ));
    setShowEditModal(false);
  };

  const getReminderStatus = (vehicle) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const reminders = [];

    if (new Date(vehicle.renewalDate) <= thirtyDaysFromNow && new Date(vehicle.renewalDate) >= now) {
      reminders.push({ type: 'renewal', date: vehicle.renewalDate });
    }
    if (new Date(vehicle.serviceDate) <= thirtyDaysFromNow && new Date(vehicle.serviceDate) >= now) {
      reminders.push({ type: 'service', date: vehicle.serviceDate });
    }
    if (new Date(vehicle.insuranceExpiryDate) <= thirtyDaysFromNow && new Date(vehicle.insuranceExpiryDate) >= now) {
      reminders.push({ type: 'insurance', date: vehicle.insuranceExpiryDate });
    }

    return reminders;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading vehicles...</p>
      </div>
    );
  }

  return (
    <div className="vehicle-list-container">
      <div className="vehicle-list-header">
        <h4>Your Vehicles</h4>
        <p className="text-muted">Manage and view all your registered vehicles</p>
      </div>

      <Card className="search-card">
        <Card.Body>
          <InputGroup className="search-input-group">
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by registration number, make, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {filteredVehicles.length === 0 ? (
        <Card className="no-vehicles-card">
          <Card.Body className="text-center py-5">
            <i className="bi bi-car-front text-muted mb-3" style={{fontSize: '48px'}}></i>
            <h5 className="text-muted">No vehicles found</h5>
            <p className="text-muted">
              {search ? "Try adjusting your search terms" : "Get started by adding your first vehicle"}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredVehicles.map((vehicle) => {
            const reminders = getReminderStatus(vehicle);
            
            return (
              <Col key={vehicle._id} xl={4} lg={6} md={6}>
                <Card className="vehicle-card">
                  <div className="vehicle-card-header">
                    {vehicle.image && (
                      <img 
                        src={`https://online-garage-api-2.onrender.com/${vehicle.image}`} 
                        alt={vehicle.registrationNumber}
                        className="vehicle-image"
                      />
                    )}
                    <div className="vehicle-badges">
                      {reminders.length > 0 && (
                        <Badge bg="warning" className="reminder-badge">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {reminders.length} Reminder{reminders.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Card.Body>
                    <div className="vehicle-info">
                      <h6 className="vehicle-registration">
                        {vehicle.registrationNumber}
                      </h6>
                      <p className="vehicle-make-model">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <div className="vehicle-details">
                        <div className="detail-item">
                          <span className="detail-label">Color:</span>
                          <span className="detail-value">{vehicle.color}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Fuel:</span>
                          <span className="detail-value text-capitalize">{vehicle.fuelType}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Insurance:</span>
                          <span className="detail-value">{vehicle.insuranceProvider}</span>
                        </div>
                      </div>

                      {reminders.length > 0 && (
                        <div className="reminders-section">
                          <h6 className="reminders-title">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Upcoming Reminders
                          </h6>
                          {reminders.map((reminder, index) => (
                            <div key={index} className="reminder-item">
                              <Badge 
                                bg={
                                  reminder.type === 'renewal' ? 'primary' :
                                  reminder.type === 'service' ? 'success' : 'info'
                                }
                                className="me-2"
                              >
                                {reminder.type}
                              </Badge>
                              <small className="text-muted">
                                <i className="bi bi-calendar-check me-1"></i>
                                {new Date(reminder.date).toLocaleDateString()}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card.Body>

                  <Card.Footer className="vehicle-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(vehicle)}
                      className="action-btn"
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(vehicle)}
                      className="action-btn"
                    >
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        vehicle={selectedVehicle}
        onVehicleUpdate={handleVehicleUpdate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        vehicle={vehicleToDelete}
      />
    </div>
  );
}

export default VehicleList;