import { useEffect, useState } from "react";
import StudentSidebar from "../../Components/Student/StudentSidebar";
import "../../assets/CSS/student/totalStudents.css";


export default function TotalStudents() {
  const courseId = localStorage.getItem("currentCourseID");

  const [students, setStudents] = useState([]);
  const [course, setCourse] = useState({});

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

    // Fetch students
    fetch(`http://localhost:5000/student/courseStudents/${courseId}`)
      .then(res => res.json())
      .then(setStudents)
      .catch(console.error);

  }, [courseId]);

  return (
    <div className="students-container">
      <StudentSidebar />

      <div className="students-content">
        

        {/* 🔥 Course Header */}
        <div className="course-header">
          <h2>{course.courseName || "Course Students"}</h2>
          <p>📘 Code: {course.courseCode || "N/A"}</p>
          <p>👨‍🏫 Teacher: {course.teacher || "N/A"}</p>
        </div>

        {/* 🔥 Table */}
        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>SN</th>
                <th>Student Name</th>
                <th>Roll</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="3">No students found</td>
                </tr>
              ) : (
                students.map((s, index) => (
                  <tr key={s._id}>
                    <td>{index + 1}</td>
                    <td>{s.name}</td>
                    <td>{s.roll}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}