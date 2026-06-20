import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../assets/CSS/student/courseDashboard.css";

export default function CourseDashboard() {
  const { courseId } = useParams();
  const [course, setCourse] = useState({});
  const [studentsCount, setStudentsCount] = useState(0);
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState([]); // ✅ missing state add করা হয়েছে

  useEffect(() => {
    if (!courseId) return;

    fetch(`http://localhost:5000/courses/${courseId}`)
      .then(res => res.json())
      .then(setCourse)
      .catch(console.error);

    fetch(`http://localhost:5000/dashboard/${courseId}`)
      .then(res => res.json())
      .then(data => {
        setStudentsCount(data.totalStudents);
        setNotices(data.notices);
        setAssignments(data.assignments);
      })
      .catch(console.error);

    fetch(`http://localhost:5000/student/attendance/${localStorage.getItem("studentId")}/${courseId}`)
      .then(res => res.json())
      .then(setAttendance)
      .catch(console.error);

    const studentId = localStorage.getItem("studentId");
    fetch(`http://localhost:5000/student/marks/${studentId}`)
      .then(res => res.json())
      .then(data => {
        fetch(`http://localhost:5000/student/assignments/${studentId}/${courseId}`)
          .then(res => res.json())
          .then(assignments => {
            const titles = assignments.map(a => a.title);
            setMarks(data.filter(m => titles.includes(m.title)));
          });
      })
      .catch(console.error);
  }, [courseId]);

  const displayName = course.courseName || "Course Dashboard";
  const displayCode = course.courseCode || "N/A";
  const displayTeacher = course.teacher || "N/A";

  // ✅ শুধু content, কোনো wrapper div নেই
  return (
    <>
      <div className="course-header">
        <h2>{displayName}</h2>
        <p>📘 Code: {displayCode}</p>
        <p>👨‍🏫 Teacher: {displayTeacher}</p>
      </div>

      <div className="course-grid">
        <div className="card" onClick={() => navigate(`/student/course/${courseId}/notifications`)}>
          <div className="card-icon notice-icon">📢</div>
          <h3>Notices <span className="badge">{notices.length}</span></h3>
          <ul>{notices.map(n => <li key={n._id}>{n.title}</li>)}</ul>
        </div>

        <div className="card" onClick={() => navigate(`/student/course/${courseId}/assignments`)}>
          <div className="card-icon assign-icon">📝</div>
          <h3>Assignments <span className="badge">{assignments.length}</span></h3>
          <ul>{assignments.map(a => <li key={a._id}>{a.title}</li>)}</ul>
        </div>

        <div className="card" onClick={() => navigate(`/student/course/${courseId}/students`)}>
          <div className="card-icon student-icon">👥</div>
          <h3>Total Students</h3>
          <p className="big-number">{studentsCount}</p>
        </div>

        <div className="card" onClick={() => navigate(`/student/course/${courseId}/marks`)}>
          <div className="card-icon marks-icon">📊</div>
          <h3>Marks <span className="badge">{marks.length}</span></h3>
          {marks.length === 0 ? (
            <p>No marks yet</p>
          ) : (
            <ul>{marks.map((m, i) => <li key={i}>{m.title}: <strong>{m.marks}</strong></li>)}</ul>
          )}
        </div>

        <div className="card" onClick={() => navigate(`/student/course/${courseId}/attendance`)}>
          <div className="card-icon attend-icon">🚦</div>
          <h3>Attendance</h3>
          {attendance ? (
            <>
              <p className={`big-number attendance-${attendance.status}`}>
                {attendance.percent}%
              </p>
              <small>Present: {attendance.present} / {attendance.total}</small>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </>
  );
}