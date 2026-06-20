import { NavLink } from "react-router-dom";
import "../../assets/CSS/admin/sidebar.css";

export default function AdminSidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "show" : ""}`} onClick={onClose} />

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-section-label">Navigation</div>

        <NavLink
          to="/admin"
          end
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          onClick={onClose}
        >
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          onClick={onClose}
        >
          <span className="nav-icon">👤</span> Users
        </NavLink>

        <NavLink
          to="/admin/courses"
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          onClick={onClose}
        >
          <span className="nav-icon">📚</span> Courses
        </NavLink>

        <NavLink
          to="/admin/students"
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          onClick={onClose}
        >
          <span className="nav-icon">👥</span> Students
        </NavLink>
      </aside>
    </>
  );
}