import React, { useState, useEffect } from "react";
import axios from "axios";
import "./vehicle.css";

export default function AddVehicleForm({ onAdded }) {
  const [form, setForm] = useState({
    registrationNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    color: "",
    chassisNumber: "",
    purchaseDate: "",
    fuelType: "",
    image: null,
  });
  const [fuelTypes, setFuelTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch fuel types from backend
  useEffect(() => {
    const fetchFuelTypes = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE || "http://localhost:4500/api/vehicles/fueltypes"}`
        );
        setFuelTypes(res.data || []);
      } catch (err) {
        console.error("Failed to fetch fuel types:", err);
        setFuelTypes(["Petrol", "Diesel", "EV", "LPG", "CNG"]); // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchFuelTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      for (let key in form) formData.append(key, form[key]);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE || "http://localhost:4500/api/vehicles/add"}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Vehicle added successfully!");
      onAdded(res.data);
      setForm({
        registrationNumber: "",
        vehicleMake: "",
        vehicleModel: "",
        color: "",
        chassisNumber: "",
        purchaseDate: "",
        fuelType: "",
        image: null,
      });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add vehicle");
    }
  };

  return (
    <div className="vehicle-form-container">
      <h4 className="form-title">Add New Vehicle</h4>
      <form onSubmit={handleSubmit} className="vehicle-form shadow-sm">
        <div className="row g-3">
          <div className="col-md-6">
            <label>Registration Number</label>
            <input
              name="registrationNumber"
              className="form-control"
              value={form.registrationNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label>Vehicle Make</label>
            <input
              name="vehicleMake"
              className="form-control"
              value={form.vehicleMake}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label>Vehicle Model</label>
            <input
              name="vehicleModel"
              className="form-control"
              value={form.vehicleModel}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label>Color</label>
            <input
              name="color"
              className="form-control"
              value={form.color}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label>Chassis Number</label>
            <input
              name="chassisNumber"
              className="form-control"
              value={form.chassisNumber}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label>Purchase Date</label>
            <input
              name="purchaseDate"
              type="date"
              className="form-control"
              value={form.purchaseDate}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label>Fuel Type</label>
            <select
              name="fuelType"
              className="form-select"
              value={form.fuelType}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading..." : "Select Fuel Type"}
              </option>
              {fuelTypes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label>Vehicle Image</label>
            <input
              name="image"
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="text-end mt-4">
          <button type="submit" className="btn btn-primary px-4">
            Add Vehicle
          </button>
        </div>
      </form>
    </div>
  );
}
