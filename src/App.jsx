// src/App.jsx - UPDATED
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./component/login/login";
import Register from "./component/registration/registration";
import AdminDashboard from "./component/dashboard/AdminDashboard";
import AgentDashboard from "./component/dashboard/AgentDashboard";
import ForgotPassword from "./component/forgotpassword/forgotpassword";
import UserDashboard from "./component/dashboard/UserDashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // ADD THIS
import Home from "./component/Home/Home";

function App() {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} /> {/* CHANGED FROM LOGIN TO HOME */}
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes with role-based access */}
      <Route
        path="/admin-dashboard/*"
        element={
          isAuthenticated && role === "admin" ? 
            <AdminDashboard /> : 
            <Navigate to="/login" />
        }
      />
      
      <Route
        path="/userdashboard/*"
        element={
          isAuthenticated && role === "user" ? 
            <UserDashboard /> : 
            <Navigate to="/login" />
        }
      />
      
      <Route
        path="/agentdashboard/*"  
        element={
          isAuthenticated && role === "insurance agent" ?
            <AgentDashboard /> : 
            <Navigate to="/login" />
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;