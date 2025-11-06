




import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./user.css";
import AddVehicleForm from "../vehicle/AddVehicleForm";
import { getVehiclesByUser } from "../../services/vehicleService";
import VehicleList from "../vehicle/vehicleList";
import CONFIG from "../../../src/config";

export default function UserDashboard({ authUser }) {
  const userId = authUser?.id || authUser?._id || "demoUserId";
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState("dashboard");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      console.log("fetching data")
      const data = await getVehiclesByUser(userId);
      console.log("data from API ",data)
      setVehicles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const onAdded = (vehicle) => {
    setVehicles((prev) => [vehicle, ...prev]);
  };

  return (
    <div className="user-dashboard-container d-flex">
      {/* Sidebar */}
      <div className="sidebar bg-dark text-white p-3">
        <h4 className="fw-bold text-center mb-4">Online Garage</h4>

        <div
          className={`menu-item ${selected === "dashboard" ? "active" : ""}`}
          onClick={() => setSelected("dashboard")}
        >
          <i className="bi bi-speedometer2 me-2"></i> Dashboard
        </div>

        <Dropdown className="dropdown-section">
          <Dropdown.Toggle variant="dark" className="w-100 text-start">
            <i className="bi bi-car-front me-2"></i> Vehicles
          </Dropdown.Toggle>
          <Dropdown.Menu variant="dark" className="w-100">
            <Dropdown.Item onClick={() => setSelected("vehicleList")}>
              Vehicle List
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSelected("addVehicle")}>
              Add Vehicle
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown className="dropdown-section">
          <Dropdown.Toggle variant="dark" className="w-100 text-start">
            <i className="bi bi-bell me-2"></i> Reminders
          </Dropdown.Toggle>
          <Dropdown.Menu variant="dark" className="w-100">
            <Dropdown.Item onClick={() => setSelected("serviceReminder")}>
              Service Reminder
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSelected("renewals")}>
              Vehicle Renewal
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSelected("challanReminder")}>
              Challan Reminder
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Main Content */}
      <div className="main-content flex-grow-1">
        {/* Topbar */}
        <div className="topbar d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm">
          <h5 className="m-0">
            Welcome, <span className="text-primary">{authUser?.name || "User"}</span>
          </h5>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-secondary btn-sm shadow-sm">
              <i className="bi bi-chat-left-text me-1"></i> Report / Feedback
            </button>
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" className="border-0">
                <i className="bi bi-person-circle fs-4"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Profile</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item className="text-danger">Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Page Content */}
        <div className="content p-4">
          {/* Dashboard Section */}
          {selected === "dashboard" && (
            <>
              <div className="row g-4 mb-4">
                <div className="col-md-3 col-sm-6">
                  <div className="tile border-start border-primary border-4">
                    <div>
                      <h6>Vehicle Renewals</h6>
                      <p>Active vehicles to renew</p>
                      <h3 className="text-primary">3</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="tile border-start border-warning border-4">
                    <div>
                      <h6>Service Reminder</h6>
                      <p>Upcoming Services</p>
                      <h3 className="text-warning">2</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="tile border-start border-danger border-4">
                    <div>
                      <h6>Challan Reminder</h6>
                      <p>Pending Challans</p>
                      <h3 className="text-danger">1</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="tile border-start border-success border-4">
                    <div>
                      <h6>Total Vehicles</h6>
                      <p>In your garage</p>
                      <h3 className="text-success">{vehicles.length}</h3>
                    </div>
                  </div>
                </div>
              </div>

              <h5 className="mb-3">Your Vehicles</h5>
              <div className="row g-3">
                {vehicles.length === 0 && (
                  <div className="col-12 text-muted text-center">
                    <em>No vehicles yet</em>
                  </div>
                )}
                {vehicles.map((v) => (
                  <div key={v._id} className="col-md-4 col-sm-6">
                    <div className="card h-100 shadow-sm border-0">
                      {v.imagePath ? (
                        <img
                          src={`${
                            import.meta.env.VITE_API_BASE?.replace?.("/api/vehicles", "") ||
                            "${CONFIG.API_BASE_URL}"
                          }${v.imagePath}`}
                          className="card-img-top"
                          alt="vehicle"
                          style={{ height: 150, objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ height: 150, background: "#f5f5f5" }} />
                      )}
                      <div className="card-body">
                        <h6 className="card-title">{v.registrationNumber}</h6>
                        <p className="mb-1">
                          {v.make} - {v.model}
                        </p>
                        <p className="mb-0 text-muted small">
                          {v.fuelType} • {v.color}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Vehicle List Section */}
          {selected === "vehicleList" && <VehicleList vehicles={vehicles} />}

          {/* Add Vehicle Section */}
          {selected === "addVehicle" && (
            <AddVehicleForm userId={userId} onAdded={onAdded} />
          )}

          {/* Reminders (Coming Soon) */}
          {["serviceReminder", "renewals", "challanReminder"].includes(selected) && (
            <div className="card p-4 shadow-sm">
              <h5 className="text-capitalize">{selected.replace(/([A-Z])/g, " $1")}</h5>
              <p>Feature coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





