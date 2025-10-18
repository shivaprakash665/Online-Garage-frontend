import React, { useState } from "react";
import "./registration.css";

const Register = () => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    console.log("Registration Data:", formData);
    alert("✅ Registration successful!");
  };

  return (
    <div className={`main-container ${darkMode ? "dark" : "light"}`}>
      {/* Theme Toggle Button */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? "🌞" : "🌙"}
      </button>

      <div className="register-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join our community — it's quick and easy!</p>

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

          {/* Elegant Dropdown */}
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

        <p className="login-text">
          Already have an account? <a href="#">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
