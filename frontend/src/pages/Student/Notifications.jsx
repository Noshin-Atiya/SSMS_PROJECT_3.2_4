import { useEffect, useState } from "react";
import StudentSidebar from "../../Components/Student/StudentSidebar";
import "../../assets/CSS/student/notification.css";


export default function NotificationPage() {
  const courseId = localStorage.getItem("currentCourseID"); // persist courseId
  const studentId = localStorage.getItem("studentId");
  const [course, setCourse] = useState({});
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    if (!courseId) return;

    // Fetch course info
     fetch(`http://localhost:5000/courses/${courseId}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch course info");
      return res.json();
    })
    .then(setCourse)
    .catch(err => console.error(err));

    // Fetch notices for course
    fetch(`http://localhost:5000/student/notifications/${studentId}/${courseId}`)
  .then(res => res.json())
  .then(setNotices)
  .catch(console.error);
  }, [courseId, studentId]);

  return (
    <div className="notification-container">
      <StudentSidebar /> 

      <div className="notification-content">
        

        {/* Header */}
        <div className="notification-header">
          <h2>{course.courseName || "Course Notifications"}</h2>
          <p>📘 Code: {course.courseCode || "N/A"}</p>
          <p>👨‍🏫 Teacher: {course.teacher || "N/A"}</p>
        </div>

        {/* Notices */}
        <div className="notification-list">
          {notices.length === 0 ? (
            <p>No notifications available.</p>
          ) : (
            notices.map(n => (
              <div key={n._id} className="notification-card">
                <h3>{n.title}</h3>
                <p>{n.description}</p>
                <small>{new Date(n.date).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}