// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./component/login/login";
import Register from "./component/registration/registration";
import AdminDashboard from "./component/dashboard/AdminDashboard"; // Fixed import path
import AgentDashboard from "./component/dashboard/AgentDashboard";
import ForgotPassword from "./component/forgotpassword/forgotpassword";
import UserDashboard from "./component/dashboard/UserDashboard";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes with role-based access */}
      <Route
        path="/admin-dashboard/*"
        element={
          isAuthenticated && role === "admin" ? 
            <AdminDashboard /> : 
            <Navigate to="/" />
        }
      />
      
      <Route
        path="/userdashboard/*"
        element={
          isAuthenticated && role === "user" ? 
            <UserDashboard /> : 
            <Navigate to="/" />
        }
      />
      
      <Route
        path="/agentdashboard/*"  
        element={
          isAuthenticated && role === "insurance agent" ?
            <AgentDashboard /> : 
            <Navigate to="/" />
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;