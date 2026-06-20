import { useEffect, useState } from "react";
import StudentSidebar from "../../Components/Student/StudentSidebar";
import "../../assets/CSS/student/assignments.css";

export default function AssignmentPage() {
  const courseId = localStorage.getItem("currentCourseID");
  const studentId = localStorage.getItem("studentId");

  const [assignments, setAssignments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch assignments
  const fetchAssignments = () => {
    fetch(`http://localhost:5000/student/assignments/${studentId}/${courseId}`)
      .then(res => res.json())
      .then(setAssignments)
      .catch(console.error);
  };

  useEffect(() => {
    if (!courseId) return;
    fetchAssignments();
  }, [courseId]);

  const handleUpload = async (assignmentId) => {
    if (!selectedFile) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("assignmentId", assignmentId);
    formData.append("studentId", studentId);

    try {
      const res = await fetch("http://localhost:5000/student/uploadAssignment", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      alert(data.message);

      // Refresh assignments after upload
      fetchAssignments();
      setSelectedFile(null); // reset file input
    } catch (err) {
      console.error(err);
      alert("Failed to upload assignment");
    }
  };
  

  return (
    <div className="assignment-container">
      <StudentSidebar />

      <div className="assignment-content">
        <h2>Assignments</h2>

        {assignments.length === 0 ? (
          <p>No assignments yet</p>
        ) : (
          assignments.map(a => {
            const submitted = a.studentSubmissions.find(s => s.studentId === studentId);

            return (
              <div key={a._id} className="assignment-card">
                <h3>{a.title}</h3>
                <p>Subject: {a.subject}</p>
                <p>Deadline: {new Date(a.deadline).toLocaleString()}</p>
                <p>Status: {submitted ? "Submitted ✅" : "Pending ⏳"}</p>
                {submitted && (
                  <p>Marks: {submitted.marks !== null ? submitted.marks : "Not graded yet"}</p>
                )}

                {!submitted && (
                  <>
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <button onClick={() => handleUpload(a._id)}>Upload</button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}