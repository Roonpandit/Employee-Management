import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./box/Login";
import Signup from "./box/Signup";
import UserDashboard from "./pages/User/UserDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import EditEmployee from "./pages/Admin/EditEmployee";
import AddEmployee from "./pages/Admin/AddEmployee";
import NewEmployee from "./pages/User/AddEmployees";
import UpdateEmployee from "./pages/User/EditEmployees";
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/edit-employee/:employeeId" element={<EditEmployee />} />
        <Route path="/add-employee" element={< AddEmployee/>} />

        <Route path="/user" element={<UserDashboard />} />
        <Route path="/new-employee" element={<NewEmployee />} />
        <Route path="/update-employee/:employeeId" element={<UpdateEmployee />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
