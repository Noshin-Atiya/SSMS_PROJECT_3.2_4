import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../../assets/CSS/teacher/teacherLayout.css";

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="teacher-wrapper">
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
      />
      <div className="teacher-body">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div
          className="teacher-content"
          onClick={() => sidebarOpen && setSidebarOpen(false)}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}