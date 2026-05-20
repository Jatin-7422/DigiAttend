import "./Sidebar.css";

import { Link } from "react-router-dom";

function Sidebar({ role, isOpen, setIsOpen }) {
  return (
    <div className={`sidebar ${isOpen ? "active" : ""}`}>
      <h2 className="logo">DigiAttend</h2>

      {role === "student" && (
        <>
          <Link to="/student" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>

          <Link to="/scan" onClick={() => setIsOpen(false)}>
            Scan QR
          </Link>

          <Link to="/history" onClick={() => setIsOpen(false)}>
            Attendance History
          </Link>
        </>
      )}

      {role === "teacher" && (
        <>
          <Link to="/teacher" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>

          <Link to="/generate" onClick={() => setIsOpen(false)}>
            Generate QR
          </Link>

          <Link to="/attendance" onClick={() => setIsOpen(false)}>
            Attendance Table
          </Link>
        </>
      )}

      {role === "admin" && (
        <>
          <Link to="/admin" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>

          <Link to="/manage-users" onClick={() => setIsOpen(false)}>
            Manage Users
          </Link>

          <Link to="/reports" onClick={() => setIsOpen(false)}>
            Reports
          </Link>
        </>
      )}
    </div>
  );
}

export default Sidebar;
