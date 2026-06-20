import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import "../../assets/CSS/student/dashboard.css";

export default function Dashboard() {
  const { enrolledCourses, fetchMyCourses } = useOutletContext();
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [roll, setRoll] = useState("");
  const [studentName, setStudentName] = useState("");
  const navigate = useNavigate();
  const studentId = localStorage.getItem("studentId");
  const studentEmail = localStorage.getItem("studentEmail");

  // Fetch student name
  useEffect(() => {
    if (!studentEmail) return;
    fetch("http://localhost:5000/users")
      .then(res => res.json())
      .then(users => {
        const student = users.find(u => u.email === studentEmail);
        if (student) setStudentName(student.name);
      });
  }, [studentEmail]);

  // Fetch all courses
  useEffect(() => {
    fetch("http://localhost:5000/student/allCourses")
      .then(res => res.json())
      .then(setCourses);
  }, []);

  // Join course
  const joinCourse = async () => {
    if (!roll) {
      alert("Please enter your roll number");
      return;
    }

    await fetch("http://localhost:5000/student/joinCourse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId: selected._id, roll })
    });

    alert("Joined successfully!");
    setSelected(null);
    setRoll("");
    fetchMyCourses(); // Refresh enrolled courses

    // Remove joined course from available courses
    setCourses(prev => prev.filter(c => c._id !== selected._id));
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
  <div>
    <p>STUDENT PORTAL</p>

    <h1>
      Welcome, {studentName || "Student"} 🎓
    </h1>

    <p>
      Continue your learning journey
    </p>
  </div>

  <div className="stat-card">
  <h3 style={{ color: "blue" }}>
    {enrolledCourses.length}
  </h3>
  <p style={{ color: "#66b3ff" }}>
    Joined Courses
  </p>
</div>
</div>

      {/* My Courses */}
      <h2 className="section-title">My Courses</h2>
      <div className="grid">
        {enrolledCourses.map(c => (
  <div
  key={c._id}
  className="card"
  onClick={() => {
    localStorage.setItem("currentCourseID", c._id);
    navigate(`/student/course/${c._id}`);
  }}
>
  <div className="card__eyebrow">
    Enrolled Course
  </div>

  <h3>{c.courseName}</h3>

  <div className="course-info">
    <p><strong>Code:</strong> {c.courseCode}</p>
    <p><strong>Teacher:</strong> {c.teacher || "Not assigned"}</p>
  </div>
</div>
))}
        
      </div>

      {/* Available Courses */}
      <h2 className="section-title">
  Available Courses
</h2>
      <div className="grid">
        
      {courses.filter(c =>
  !enrolledCourses.some(ec => ec._id === c._id)
).length === 0 && (
  <p className="empty-message">No courses available.</p>
)}
        {courses.map(c => {
          const alreadyJoined = enrolledCourses.some(ec => ec._id === c._id);
          if (alreadyJoined) return null; // remove joined courses
          return (
       <div key={c._id} className="card">
  <div className="card__eyebrow">
    Available Course
  </div>

  <h3>{c.courseName}</h3>

  <div className="course-info">
    <p><strong>Code:</strong> {c.courseCode}</p>
    <p><strong>Teacher:</strong> {c.teacher || "Not assigned"}</p>
  </div>

  <button
    className="btn btn--primary join-btn"
    onClick={() => setSelected(c)}
  >
    Join Course
  </button>
</div>
          );
        })}
      </div>

      {/* Modal for roll number */}
      {selected && (
        <div className="modal">
          <div className="modal-box">
            <h3>Enter Roll Number for {selected.courseName}</h3>
            <input
              value={roll}
              onChange={e => setRoll(e.target.value)}
              placeholder="Your Roll Number"
            />
           <div className="modal-box__actions">
  <button className="btn btn--primary" onClick={joinCourse}>
    Submit
  </button>

  <button className="btn" onClick={() => setSelected(null)}>
    Cancel
  </button>
</div>
          </div>
        </div>
      )}
    </div>
  );
}