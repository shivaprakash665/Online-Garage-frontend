import React, { useState } from "react";
import axios from "axios";
import "./forgotpassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const API_BASE = "http://localhost:4500/api"; // backend URL

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/forgot-password`, { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/verify-otp`, { email, otp });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid OTP");
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/reset-password`, {
        email,
        otp,
        newPassword,
      });
      setMessage(res.data.message);
      setStep(4);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h1>Forgot Password</h1>
        {message && <p className="msg">{message}</p>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <label>Enter OTP</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit">Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
          </form>
        )}

        {step === 4 && (
          <div className="success">
            <p>Password reset successful 🎉</p>
            <a href="/login">Back to Login</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
