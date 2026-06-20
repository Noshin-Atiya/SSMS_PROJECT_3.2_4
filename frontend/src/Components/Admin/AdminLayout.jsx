import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AdminSidebar from "./AdminSidebar";
import "../../assets/CSS/admin/adminLayout.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-wrapper">
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
      />
      <div className="admin-body">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div
          className="admin-content"
          onClick={() => sidebarOpen && setSidebarOpen(false)}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}