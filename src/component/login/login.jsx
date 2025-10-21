import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const [darkMode, setDarkMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const toggleTheme = () => setDarkMode(!darkMode);

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
        "http://localhost:3000/api/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { message, token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess(message);

      const role = user.role?.toLowerCase();
      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "agent") navigate("/agent-dashboard");
      else if (role === "user") navigate("/user-dashboard");
      else setError("Invalid role. Please contact admin.");
    } catch (err) {
      if (err.response && err.response.data) setError(err.response.data.message);
      else setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${darkMode ? "dark" : "light"}`}>
      <button
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          borderRadius: "50%",
          padding: "6px 8px",
          cursor: "pointer",
          fontSize: "20px",
          border: "2px solid currentColor",
          background: "transparent",
          zIndex: 10,
        }}
        onClick={toggleTheme}
      >
        {darkMode ? "🌞" : "🌙"}
      </button>

      <div className="login-box">
        <h1>Sign in to your account</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            <button type="button" className="link-btn">
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
