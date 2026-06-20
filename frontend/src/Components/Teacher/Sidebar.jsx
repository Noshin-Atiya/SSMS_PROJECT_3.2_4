import { NavLink } from "react-router-dom";
import "../../assets/CSS/teacher/sidebar.css";

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "show" : ""}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-section-label">Navigation</div>

        <NavLink to="/teacher/dashboard" className="sidebar-link" onClick={onClose}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/teacher/students" className="sidebar-link" onClick={onClose}>
          <span className="nav-icon">👥</span> Students
        </NavLink>
        <NavLink to="/teacher/assignments" className="sidebar-link" onClick={onClose}>
          <span className="nav-icon">📝</span> Assignments
        </NavLink>
        <NavLink to="/teacher/notices" className="sidebar-link" onClick={onClose}>
          <span className="nav-icon">📢</span> Notices
        </NavLink>
        <NavLink to="/teacher/attendance" className="sidebar-link" onClick={onClose}>
          <span className="nav-icon">🚦</span> Attendance
        </NavLink>
      </aside>
    </>
  );
}