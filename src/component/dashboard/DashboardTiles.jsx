import React, { useState, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";
import axios from "axios";

function DashboardTiles() {
  const [counts, setCounts] = useState({ totalVehicles: 0, challanReminders: 0, serviceRenewals: 0, serviceReminders: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vehicles/counts", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCounts(res.data);
      } catch (err) {
        console.error("Error fetching counts");
      }
    };
    fetchCounts();
  }, []);

  return (
    <Row className="mt-4">
      <Col md={3}>
        <Card>
          <Card.Body>
            <Card.Title>Number of Vehicles</Card.Title>
            <Card.Text>{counts.totalVehicles}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card>
          <Card.Body>
            <Card.Title>Challan Reminder</Card.Title>
            <Card.Text>{counts.challanReminders}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card>
          <Card.Body>
            <Card.Title>Service Renewals</Card.Title>
            <Card.Text>{counts.serviceRenewals}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card>
          <Card.Body>
            <Card.Title>Service Reminder</Card.Title>
            <Card.Text>{counts.serviceReminders}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default DashboardTiles;