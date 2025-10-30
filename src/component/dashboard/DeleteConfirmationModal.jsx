// component/dashboard/DeleteConfirmationModal.jsx
import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import "./DeleteConfirmationModal.css";

function DeleteConfirmationModal({ show, onHide, onConfirm, vehicle }) {
  return (
    <Modal show={show} onHide={onHide} centered className="delete-confirmation-modal">
      <Modal.Header closeButton className="delete-modal-header">
        <Modal.Title>
          <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
          Confirm Deletion
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="delete-modal-body">
        <div className="warning-icon">
          <i className="bi bi-trash text-danger" style={{fontSize: '48px'}}></i>
        </div>
        <h5 className="text-center mb-3">Are you sure you want to delete this vehicle?</h5>
        
        {vehicle && (
          <Alert variant="warning" className="vehicle-details-alert">
            <strong>{vehicle.registrationNumber}</strong><br />
            {vehicle.make} {vehicle.model} • {vehicle.color}
          </Alert>
        )}

        <div className="warning-message">
          <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
          This action cannot be undone. All vehicle data including reminders and insurance information will be permanently deleted.
        </div>
      </Modal.Body>
      <Modal.Footer className="delete-modal-footer">
        <Button variant="outline-secondary" onClick={onHide} className="cancel-btn">
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} className="confirm-btn">
          <i className="bi bi-trash me-1"></i>
          Yes, Delete Vehicle
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteConfirmationModal;