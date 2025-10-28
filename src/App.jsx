import { Routes, Route,Navigate } from "react-router-dom";
import Login from "./component/login/login";
import Register from "./component/registration/registration";
import AdminDashboard from "./component/dashboard/admin";
import AgentDashboard from "./component/dashboard/agent";
import ForgotPassword from "./component/forgotpassword/forgotpassword";
import UserDashboard from "./component/dashboard/UserDashboard";
import "bootstrap/dist/css/bootstrap.min.css";
  function App() {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/userdashboard/*" element={<UserDashboard />} />
      <Route path="/agent-dashboard" element={<AgentDashboard />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
          path="/userdashboard/*"
          element={isAuthenticated ? <UserDashboard /> : <Navigate to="/" />}
        />
      
    </Routes>
  );
}

export default App;
