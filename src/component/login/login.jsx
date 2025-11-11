import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";
import CONFIG from "../../../src/config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${CONFIG.API_BASE_URL}/api/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Login Response:", response.data);

      const { message, token, user } = response.data;

      if (!token || !user) {
        setError("Invalid response from server");
        setLoading(false);
        return;
      }

      // Store authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      setSuccess(message || "Login successful!");

      // Normalize role for comparison
      const role = user.role?.toLowerCase().trim();
      console.log("User Role:", role);

      // Navigate based on role
      switch (role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "insurance agent":
          navigate("/agentdashboard"); 
          break;
        case "user":
          navigate("/userdashboard");
          break;
        default:
          console.error("Unknown role:", role);
          setError("Invalid user role. Please contact administrator.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("Network error. Please try again.");
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h1>Sign in to your account</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="actions">
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/register")}
            >
              Not registered? Create account
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;