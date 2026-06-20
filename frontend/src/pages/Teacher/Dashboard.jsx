import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../assets/CSS/teacher/dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const teacherEmail = localStorage.getItem("teacherEmail");

  useEffect(() => {
    if (!teacherEmail) {
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:5000/teacher/dashboard/${teacherEmail}`)
      .then(res => {
        if (res.data.message) {
          setData(null);
        } else {
          setData(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  }, [teacherEmail]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No course assigned yet.</p>;

  return (
    <div className="dashboard-page">
      <h1>Welcome, {data.course?.teacher}</h1>
      <h2>Course: {data.course?.courseName} ({data.course?.courseCode})</h2>

      <div className="cards">

        <div
          className="card"
          onClick={() => navigate(`/teacher/students`)}
        >
          <h3>Total Students</h3>
          <p>{data.students.length}</p>
        </div>

        <div
          className="card"
          onClick={() => navigate(`/teacher/assignments`)}
        >
          <h3>Total Assignments</h3>
          <p>{data.assignments.length}</p>
        </div>

        <div
          className="card"
          onClick={() => navigate(`/teacher/notices`)}
        >
          <h3>Total Notices</h3>
          <p>{data.notices.length}</p>
        </div>

      </div>

      <div className="students-list">
        <h3>Enrolled Students:</h3>

        {data.students.length === 0 ? (
          <p>No students enrolled yet.</p>
        ) : (
          <ul>
            {data.students.map(student => (
              <li key={student._id}>
                {student.name} ({student.email})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;