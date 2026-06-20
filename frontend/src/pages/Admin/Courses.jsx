import { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/CSS/admin/courses.css";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/courses");
      setCourses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const createCourse = async () => {
    if (!courseName || !courseCode) return;

    try {
      await axios.post("http://localhost:5000/createCourse", {
        courseName,
        courseCode,
        teacher: "",
        email: "",
      });

      setCourseName("");
      setCourseCode("");

      fetchCourses();
    } catch (err) {
      console.log(err);
    }
  };

  const assignTeacher = async (courseId, teacher, email, teacherId) => {
    try {
      await axios.post("http://localhost:5000/assignTeacher", {
        courseId,
        teacher,
        email,
      });

      setCourses((prev) =>
        prev.map((c) =>
          c._id === courseId
            ? { ...c, teacher, email, teacherId }
            : c
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const initials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div>
          <h2>Courses</h2>
          <p>Create courses and assign teachers</p>
        </div>
      </div>

      {/* Create Course Form */}
      <div className="course-form-card">
        <h3>Create new course</h3>
        <div className="course-form-row">
          <div className="form-field">
            <label>Course name</label>
            <input
              type="text"
              placeholder="e.g. Data Structures"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Course code</label>
            <input
              type="text"
              placeholder="e.g. IIT-3201"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
          </div>

          <button className="btn-create" onClick={createCourse}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Course
          </button>
        </div>
      </div>

      {/* Course List */}
      <div className="courses-grid">
        {courses.length === 0 ? (
          <div className="empty-courses">No courses created yet</div>
        ) : (
          courses.map((c) => (
            <div key={c._id} className="course-card">
              <div className="course-card-top">
                <div className="course-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div>
                  <h4>{c.courseName}</h4>
                  <span className="course-code">{c.courseCode}</span>
                </div>
              </div>

              <div className="course-card-body">
                <label className="select-label">Assign teacher</label>
                <select
                  value={c.teacherId || ""}
                  onChange={(e) => {
                    const teacherId = e.target.value;
                    const selected = users.find((u) => u._id === teacherId);

                    if (selected) {
                      assignTeacher(c._id, selected.name, selected.email, teacherId);
                    }
                  }}
                >
                  <option value="">Select a teacher</option>
                  {users
                    .filter((u) => u.role === "teacher")
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                </select>

                <div className="assigned-teacher">
                  {c.teacher ? (
                    <>
                      <span className="teacher-avatar">{initials(c.teacher)}</span>
                      <div className="teacher-meta">
                        <span className="teacher-name">{c.teacher}</span>
                        <span className="teacher-email">{c.email}</span>
                      </div>
                    </>
                  ) : (
                    <span className="no-teacher">No teacher assigned</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}