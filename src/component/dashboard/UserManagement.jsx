// src/component/dashboard/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CONFIG from "../../../src/config";

const UserManagement = ({ showAlert }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('Failed to load users', 'danger');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleDeactivate = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${CONFIG.API_BASE_URL}/api/admin/users/${userId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showAlert('User deactivated successfully', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error deactivating user:', error);
      showAlert('Failed to deactivate user', 'danger');
    }
  };

  const handleActivate = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${CONFIG.API_BASE_URL}/api/admin/users/${userId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showAlert('User activated successfully', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      showAlert('Failed to activate user', 'danger');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${CONFIG.API_BASE_URL}/api/admin/users/${userToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showAlert('User deleted successfully', 'success');
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert('Failed to delete user', 'danger');
    }
  };

  const openDeleteModal = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (user) => {
    if (!user.isActive) {
      return <Badge bg="danger">Deactivated</Badge>;
    }
    
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const lastLogin = new Date(user.lastLogin);
    
    if (lastLogin > fifteenDaysAgo) {
      return <Badge bg="success">Active</Badge>;
    } else {
      return <Badge bg="warning">Inactive</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'admin': { bg: 'dark', text: 'Admin' },
      'user': { bg: 'primary', text: 'User' },
      'insurance agent': { bg: 'info', text: 'Insurance Agent' }
    };
    
    const config = roleConfig[role] || { bg: 'secondary', text: role };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading && users.length === 0) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="success" className="mb-3" />
            <p>Loading users...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark mb-1">User Management</h2>
          <p className="text-muted mb-0">Manage all users and insurance agents</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="admin-table mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="admin" type="submit">
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={4}>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="admin-table">
        <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-people me-2"></i>
            Users ({users.length})
          </h5>
          <Button 
            variant="light" 
            size="sm"
            onClick={fetchUsers}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </Button>
        </Card.Header>
        
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin-dashboard/users/${user._id}`)}>
                  <td>
                    <div>
                      <strong>{user.name}</strong>
                      <div>
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <small>{user.phone}</small>
                      <div>
                        <small className="text-muted">{user.address}</small>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user)}</td>
                  <td>
                    <small>{formatDate(user.lastLogin)}</small>
                  </td>
                  <td>
                    <small>{formatDate(user.createdAt)}</small>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="btn-group">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/admin-dashboard/users/${user._id}`)}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      
                      {user.isActive ? (
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleDeactivate(user._id)}
                        >
                          <i className="bi bi-person-x"></i>
                        </Button>
                      ) : (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleActivate(user._id)}
                        >
                          <i className="bi bi-person-check"></i>
                        </Button>
                      )}
                      
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => openDeleteModal(user._id)}
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
          <p>Are you sure you want to delete this user? This action cannot be undone and will also delete all associated vehicles.</p>
          <Alert variant="warning" className="mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            This action is permanent and irreversible!
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;