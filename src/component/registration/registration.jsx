import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./registration.css";
import CONFIG from "../../../src/config";

const Register = () => {
  const navigate = useNavigate(); // hook for navigation
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(`${CONFIG.API_BASE_URL}/api/register`, {
        ...formData,
      });
      alert("✅ Registration successful!");
      localStorage.setItem("token", res.data.token);
      navigate("/"); // Redirect to login after successful registration
    } catch (err) {
      alert(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className={`main-container ${darkMode ? "dark" : "light"}`}>
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? "🌞" : "🌙"}
      </button>

      <div className="register-card">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <div className="custom-select-wrapper">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="custom-select"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="insurance agent">Insurance Agent</option>
            </select>
          </div>

          <button type="submit" className="register-btn">
            Register
          </button>
        </form>

        {/* Button to go to login page */}
        <button
          className="login-btn"
          onClick={() => navigate("/")}
          style={{
            marginTop: "12px",
            background: "transparent",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "14px",
          }}
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default Register;
