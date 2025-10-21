import { Routes, Route } from "react-router-dom";
import Login from "./component/login/login";
import Register from "./component/registration/registration";
import AdminDashboard from "./component/dashboard/admin";
import UserDashboard from "./component/dashboard/user";
import AgentDashboard from "./component/dashboard/agent";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/agent-dashboard" element={<AgentDashboard />} />


      
    </Routes>
  );
}

export default App;
