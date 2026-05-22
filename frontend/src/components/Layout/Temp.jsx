import { useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar"

import "./DashboardLayout.css";

function DashboardLayout({ role, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dashboard">
      <Sidebar role={role} isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="main-content">
        <Navbar setIsOpen={setIsOpen} />

        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;
