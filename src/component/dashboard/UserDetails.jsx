// src/component/dashboard/UserDetails.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CONFIG from "../../../src/config";

const UserDetails = ({ showAlert }) => {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${CONFIG.API_BASE_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.user);
      setVehicles(response.data.vehicles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
      showAlert('Failed to load user details', 'danger');
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${CONFIG.API_BASE_URL}/api/admin/users/${userId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showAlert('User deactivated successfully', 'success');
      fetchUserDetails();
    } catch (error) {
      console.error('Error deactivating user:', error);
      showAlert('Failed to deactivate user', 'danger');
    }
  };

  const handleActivate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${CONFIG.API_BASE_URL}/api/admin/users/${userId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showAlert('User activated successfully', 'success');
      fetchUserDetails();
    } catch (error) {
      console.error('Error activating user:', error);
      showAlert('Failed to activate user', 'danger');
    }
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

  const getInsuranceStatus = (expiryDate) => {
    if (!expiryDate) return { badge: 'secondary', text: 'No Insurance' };
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { badge: 'danger', text: 'Expired' };
    if (daysUntilExpiry <= 30) return { badge: 'warning', text: 'Expiring Soon' };
    return { badge: 'success', text: 'Active' };
  };

  if (loading) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="success" className="mb-3" />
            <p>Loading user details...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container>
        <Alert variant="danger">
          <h5>Error</h5>
          <p>{error || 'User not found'}</p>
          <Button variant="primary" onClick={() => navigate('/admin-dashboard/users')}>
            Back to Users
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button 
            variant="outline-admin" 
            onClick={() => navigate('/admin-dashboard/users')}
            className="mb-2"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Users
          </Button>
          <h2 className="text-dark mb-1">User Details</h2>
          <p className="text-muted mb-0">Complete information for {user.name}</p>
        </div>
        
        <div>
          {user.isActive ? (
            <Button variant="warning" onClick={handleDeactivate}>
              <i className="bi bi-person-x me-2"></i>
              Deactivate User
            </Button>
          ) : (
            <Button variant="success" onClick={handleActivate}>
              <i className="bi bi-person-check me-2"></i>
              Activate User
            </Button>
          )}
        </div>
      </div>

      <Row>
        {/* User Information */}
        <Col lg={4} className="mb-4">
          <Card className="admin-table h-100">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                User Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Name:</strong>
                <p className="mb-0">{user.name}</p>
              </div>
              
              <div className="mb-3">
                <strong>Email:</strong>
                <p className="mb-0">{user.email}</p>
              </div>
              
              <div className="mb-3">
                <strong>Phone:</strong>
                <p className="mb-0">{user.phone}</p>
              </div>
              
              <div className="mb-3">
                <strong>Address:</strong>
                <p className="mb-0">{user.address}</p>
              </div>
              
              <div className="mb-3">
                <strong>Role:</strong>
                <div>{getRoleBadge(user.role)}</div>
              </div>
              
              <div className="mb-3">
                <strong>Status:</strong>
                <div>{getStatusBadge(user)}</div>
              </div>
              
              <div className="mb-3">
                <strong>Last Login:</strong>
                <p className="mb-0">{formatDate(user.lastLogin)}</p>
              </div>
              
              <div>
                <strong>Member Since:</strong>
                <p className="mb-0">{formatDate(user.createdAt)}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Vehicles */}
        <Col lg={8}>
          <Card className="admin-table">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-car-front me-2"></i>
                Vehicles ({vehicles.length})
              </h5>
              <Badge bg="light" text="dark">
                {vehicles.length} vehicles
              </Badge>
            </Card.Header>
            
            {vehicles.length === 0 ? (
              <Card.Body className="text-center py-5">
                <i className="bi bi-car-front fs-1 text-muted mb-3 d-block"></i>
                <p className="text-muted mb-0">No vehicles registered</p>
              </Card.Body>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Details</th>
                      <th>Insurance</th>
                      <th>Renewal</th>
                      <th>Service</th>
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
                                <small>Chassis: {vehicle.chassisNumber}</small>
                              </div>
                              <div>
                                <small>Fuel: {vehicle.fuelType}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <Badge bg={insuranceStatus.badge}>
                                {insuranceStatus.text}
                              </Badge>
                              {vehicle.insuranceProvider && (
                                <div>
                                  <small className="text-muted">
                                    {vehicle.insuranceProvider}
                                  </small>
                                </div>
                              )}
                              {vehicle.insuranceExpiryDate && (
                                <div>
                                  <small>
                                    Until: {formatDate(vehicle.insuranceExpiryDate)}
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {vehicle.renewalDate ? (
                              <small>{formatDate(vehicle.renewalDate)}</small>
                            ) : (
                              <small className="text-muted">Not set</small>
                            )}
                          </td>
                          <td>
                            {vehicle.serviceDate ? (
                              <small>{formatDate(vehicle.serviceDate)}</small>
                            ) : (
                              <small className="text-muted">Not set</small>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDetails;