// src/component/dashboard/FeedbackManagement.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';
import CONFIG from "../../../src/config";


const FeedbackManagement = ({ showAlert }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const limit = 10;

  useEffect(() => {
    fetchFeedback();
  }, [currentPage, statusFilter]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        status: statusFilter
      });

      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/admin/feedback?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFeedback(response.data.feedback);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      showAlert('Failed to load feedback', 'danger');
      setLoading(false);
    }
  };

  const handleArchive = async (feedbackId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${CONFIG.API_BASE_URL}/api/admin/feedback/${feedbackId}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showAlert('Feedback archived successfully', 'success');
      fetchFeedback();
    } catch (error) {
      console.error('Error archiving feedback:', error);
      showAlert('Failed to archive feedback', 'danger');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${CONFIG.API_BASE_URL}/api/admin/feedback/${feedbackToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showAlert('Feedback deleted successfully', 'success');
      setShowDeleteModal(false);
      setFeedbackToDelete(null);
      fetchFeedback();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      showAlert('Failed to delete feedback', 'danger');
    }
  };

  const openDeleteModal = (feedbackId) => {
    setFeedbackToDelete(feedbackId);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { bg: 'success', text: 'Active' },
      'archived': { bg: 'secondary', text: 'Archived' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  if (loading && feedback.length === 0) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="success" className="mb-3" />
            <p>Loading feedback...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark mb-1">Feedback Management</h2>
          <p className="text-muted mb-0">Manage user feedback and reports</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="admin-table mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="active">Active Feedback</option>
                <option value="archived">Archived Feedback</option>
              </Form.Select>
            </Col>
            <Col md={6} className="text-end">
              <Button variant="admin" onClick={fetchFeedback}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Feedback Table */}
      <Card className="admin-table">
        <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-chat-left-text me-2"></i>
            User Feedback ({feedback.length})
          </h5>
          <Badge bg="light" text="dark">
            {statusFilter === 'active' ? 'Active' : 'Archived'}
          </Badge>
        </Card.Header>
        
        {feedback.length === 0 ? (
          <Card.Body className="text-center py-5">
            <i className="bi bi-chat-left-text fs-1 text-muted mb-3 d-block"></i>
            <p className="text-muted mb-0">
              {statusFilter === 'active' ? 'No active feedback' : 'No archived feedback'}
            </p>
          </Card.Body>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Feedback</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div>
                        <strong>{item.userId?.name || 'Unknown User'}</strong>
                        <div>
                          <small className="text-muted">
                            {item.userId?.email || 'No email'}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '400px' }}>
                        <p className="mb-1" style={{ wordWrap: 'break-word' }}>
                          {item.message}
                        </p>
                      </div>
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <small>{formatDate(item.createdAt)}</small>
                    </td>
                    <td>
                      <div className="btn-group">
                        {item.status === 'active' && (
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleArchive(item._id)}
                            title="Archive Feedback"
                          >
                            <i className="bi bi-archive"></i>
                          </Button>
                        )}
                        
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => openDeleteModal(item._id)}
                          title="Delete Feedback"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Page {currentPage} of {totalPages}
            </small>
            <div>
              <Button
                variant="outline-admin"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="me-2"
              >
                Previous
              </Button>
              <Button
                variant="outline-admin"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this feedback? This action cannot be undone.</p>
          <Alert variant="warning" className="mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            This will permanently remove the feedback from the system.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Feedback
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FeedbackManagement;