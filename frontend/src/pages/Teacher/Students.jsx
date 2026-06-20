import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/CSS/teacher/students.css";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const teacherEmail = localStorage.getItem("teacherEmail");

  // ---------------- FETCH STUDENTS ----------------
  const fetchStudents = async () => {
    try {
      if (!teacherEmail) {
  setLoading(false);
  return;
}

      const res = await axios.get(
        `http://localhost:5000/teacher/dashboard/${teacherEmail}`
      );

      if (res.data.message) {
        setStudents([]);
      } else {
        setStudents(res.data.students || []);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
  if (teacherEmail) {
    fetchStudents();
  }
}, [teacherEmail]);

  // ---------------- FILTER ----------------
  const filteredStudents = (students || []).filter((s) =>
  s?.name?.toLowerCase().includes(search.toLowerCase()) ||
  s?.email?.toLowerCase().includes(search.toLowerCase()) ||
  s?.roll?.toString().includes(search)
);

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="students-page">

      <h1>Students</h1>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search by name, email or roll..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="students-search"
      />

      {/* TABLE */}
      <div className="students-card">
        {filteredStudents.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Roll</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>{student.roll}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Students;