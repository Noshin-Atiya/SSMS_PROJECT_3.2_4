import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../../assets/CSS/student/sidebar.css";
import { logout } from "../../utils/logout";

export default function StudentSidebar({ isOpen, onClose }) {
  const courseId = localStorage.getItem("currentCourseID");
  const location = useLocation();
  const navigate = useNavigate();
  const passedData = location.state;

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`student-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-section-label">Navigation</div>

        <NavLink to={`/student/course/${courseId}`} end onClick={handleNavClick}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>

        <NavLink to="/student" onClick={handleNavClick}>
          <span className="nav-icon">📚</span> My Courses
        </NavLink>

        <NavLink
          to={`/student/course/${courseId}/notifications`}
          state={passedData}
          onClick={handleNavClick}
        >
          <span className="nav-icon">🔔</span> Notifications
        </NavLink>

        <NavLink
          to={`/student/course/${courseId}/assignments`}
          state={passedData}
          onClick={handleNavClick}
        >
          <span className="nav-icon">📝</span> Assignments
        </NavLink>

        <NavLink
          to={`/student/course/${courseId}/marks`}
          state={passedData}
          onClick={handleNavClick}
        >
          <span className="nav-icon">📈</span> Marks
        </NavLink>

        <NavLink
          to={`/student/course/${courseId}/students`}
          state={passedData}
          onClick={handleNavClick}
        >
          <span className="nav-icon">👥</span> Students
        </NavLink>

        <NavLink
          to={`/student/course/${courseId}/attendance`}
          state={passedData}
          onClick={handleNavClick}
        >
          <span className="nav-icon">🚦</span> Attendance
        </NavLink>
      </div>
    </>
  );
}