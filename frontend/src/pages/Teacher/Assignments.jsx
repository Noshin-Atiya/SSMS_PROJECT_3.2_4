import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/CSS/teacher/assignments.css";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ NEW: evaluation loading tracker
  const [evaluating, setEvaluating] = useState(null);

  const teacherEmail = localStorage.getItem("teacherEmail");

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    try {
      if (!teacherEmail) return;

      const res = await axios.get(
        `http://localhost:5000/teacher/dashboard/${teacherEmail}`
      );

      if (res.data.message) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      setCourseId(res.data.course?._id);
      setAssignments(res.data.assignments || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [teacherEmail]);

  // ---------------- CREATE ASSIGNMENT ----------------
  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/teacher/createAssignment", {
        title,
        subject,
        courseId,
        deadline,
        modelAnswer,
      });

      alert("Assignment created!");

      setTitle("");
      setSubject("");
      setDeadline("");
      setModelAnswer("");

      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to create assignment");
    }
  };

  // ---------------- NLP EVALUATION (FIXED) ----------------
  const handleNLPEvaluation = async (assignmentId, submission, modelAnswer) => {
  try {
    setEvaluating(submission.studentId);

    const res = await axios.post("http://localhost:5000/nlp/evaluate", {
      assignmentId,
      studentId: submission.studentId,
      studentText: submission.extractedText,
      modelAnswer,
    });

    const updated = res.data.nlpEvaluation;

    setAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment._id !== assignmentId) return assignment;

        const updatedSubmissions = assignment.studentSubmissions.map((s) => {
          if (s.studentId !== submission.studentId) return s;

          return {
            ...s,
            nlpEvaluation: { ...updated }, // 🔥 force new reference
          };
        });

        return {
          ...assignment,
          studentSubmissions: [...updatedSubmissions], // 🔥 IMPORTANT
        };
      })
    );

  } catch (err) {
    console.error(err);
    alert("Evaluation failed");
  } finally {
    setEvaluating(null);
  }
};
  // ---------------- EDIT MARKS ----------------
  const handleEditMarks = async (assignmentId, studentId) => {
  const marks = prompt("Enter new marks:");
  if (marks === null) return;

  try {
    await axios.post("http://localhost:5000/teacher/editMarks", {
      assignmentId,
      studentId,
      marks: Number(marks),
    });

    alert("Marks updated");

    // 🔥 FORCE FULL REFRESH FROM DB (IMPORTANT FIX)
    await fetchData();

  } catch (err) {
    console.error(err);
    alert("Edit marks failed");
  }
};

  if (loading) return <p>Loading assignments...</p>;

  return (
  <div className="assignments-page">
    <h1>Assignments</h1>

    {/* CREATE FORM */}
    <div className="create-assignment-form">
      <h3 className="form-title">Create Assignment</h3>

      <form onSubmit={handleCreateAssignment}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

        <textarea
          placeholder="Model Answer"
          value={modelAnswer}
          onChange={(e) => setModelAnswer(e.target.value)}
        />

        <button type="submit">Create Assignment</button>
      </form>
    </div>

    {/* ASSIGNMENTS */}
    {assignments.map((a) => (
      <div className="assignment-card" key={a._id}>
        
        {/* HEADER */}
        <div className="assignment-header">
          <div className="assignment-title">{a.title}</div>
          <div className="subject-badge">{a.subject}</div>
        </div>

        <div className="assignment-meta">
  <span className="deadline-badge">
    📅 Due: {new Date(a.deadline).toLocaleDateString()}
  </span>
</div>

        {/* TABLE */}
        <table>
          <thead>
            <tr>
              <th>Roll</th>
              <th>Mark</th>
              <th>Similarity</th>
              <th>Keyword</th>
              <th>Grammar</th>
              <th>Spelling</th>
              <th>Feedback</th>
              <th>Evaluate</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {a.studentSubmissions?.map((s) => (
              <tr key={s.studentId}>
                <td>{s.roll}</td>
                <td>{s.marks ?? s.nlpEvaluation?.final_score ?? 0}</td>
                <td>{s.nlpEvaluation?.similarity_score ?? "-"}</td>
                <td>{s.nlpEvaluation?.keyword_score ?? "-"}</td>
                <td>{s.nlpEvaluation?.grammar_errors ?? "-"}</td>
                <td>{s.nlpEvaluation?.spelling_errors ?? "-"}</td>
                <td>{s.nlpEvaluation?.feedback ?? "-"}</td>

                <td>
                  <button
                    className="nlp-btn"
                    disabled={evaluating === s.studentId}
                    onClick={() => handleNLPEvaluation(a._id, s, a.modelAnswer)}
                  >
                    {evaluating === s.studentId ? "Evaluating..." : "Evaluate"}
                  </button>
                </td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditMarks(a._id, s.studentId)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    ))}
  </div>
);
};

export default Assignments;