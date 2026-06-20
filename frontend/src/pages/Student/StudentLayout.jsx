import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import StudentSidebar from "./StudentSidebar";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const studentId = localStorage.getItem("studentId");

  const fetchMyCourses = () => {
    if (!studentId) return;
    fetch(`http://localhost:5000/student/courses/${studentId}`)
      .then((res) => res.json())
      .then(setEnrolledCourses)
      .catch(console.error);
  };

  useEffect(() => {
    fetchMyCourses();
  }, [studentId]);

  return (
    <div className="course-wrapper">
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
      />
      <div className="course-body">
        <StudentSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div
          className="course-content"
          onClick={() => sidebarOpen && setSidebarOpen(false)}
        >
          {/* enrolledCourses আর fetchMyCourses Outlet এর context দিয়ে পাঠাচ্ছি */}
          <Outlet context={{ enrolledCourses, fetchMyCourses }} />
        </div>
      </div>
    </div>
  );
}