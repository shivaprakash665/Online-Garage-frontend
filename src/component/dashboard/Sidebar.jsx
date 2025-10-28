import React from "react";
import { Nav, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

function Sidebar() {
  return (
    <Nav className="flex-column">
      <LinkContainer to="/userdashboard">
        <Nav.Link>Dashboard</Nav.Link>
      </LinkContainer>
      <NavDropdown title="Vehicle" id="vehicle-dropdown">
        <LinkContainer to="/userdashboard/vehiclelist">
          <NavDropdown.Item>Vehicle List</NavDropdown.Item>
        </LinkContainer>
        <LinkContainer to="/userdashboard/addvehicle">
          <NavDropdown.Item>Add Vehicle</NavDropdown.Item>
        </LinkContainer>
      </NavDropdown>
      <NavDropdown title="Reminders" id="reminders-dropdown">
        <NavDropdown.Item>Service Remainder</NavDropdown.Item>
        <NavDropdown.Item>Vehicle Renewal</NavDropdown.Item>
        <NavDropdown.Item>Challan Remainder</NavDropdown.Item>
      </NavDropdown>
    </Nav>
  );
}

export default Sidebar;