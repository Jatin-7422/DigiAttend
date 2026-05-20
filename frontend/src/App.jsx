import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import ScanQR from "./pages/student/ScanQR";
import History from "./pages/student/History";

// Teacher
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import GenerateQR from "./pages/teacher/GenerateQR";
import AttendanceTable from "./pages/teacher/AttendanceTable";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import Reports from "./pages/admin/Reports";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/scan" element={<ScanQR />} />
      <Route path="/history" element={<History />} />

      {/* Teacher */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/generate" element={<GenerateQR />} />
      <Route path="/attendance" element={<AttendanceTable />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/manage-users" element={<ManageUsers />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

export default App;