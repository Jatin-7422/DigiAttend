import { useNavigate } from "react-router-dom";
import "./Navbar.css";


function Navbar({ setIsOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Later we’ll clear auth here

    navigate("/");
  };

  return (
    <div className="navbar">
      <button className="menu-btn" onClick={() => setIsOpen(true)}>
        ☰
      </button>

      <h3>DigiAttend Dashboard</h3>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;
