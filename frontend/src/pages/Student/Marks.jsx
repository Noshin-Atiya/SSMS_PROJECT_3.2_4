import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import "../../assets/CSS/student/marks.css";

export default function Marks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { courseId } = useParams();

  const studentId = useMemo(() => localStorage.getItem("studentId"), []);

  useEffect(() => {
    if (!studentId || !courseId) return;

    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);

        const [marksRes, assignRes] = await Promise.all([
          fetch(`http://localhost:5000/student/marks/${studentId}`, {
            signal: controller.signal
          }),
          fetch(`http://localhost:5000/student/assignments/${studentId}/${courseId}`, {
            signal: controller.signal
          })
        ]);

        const marksData = await marksRes.json();
        const assignments = await assignRes.json();

        const titleSet = new Set(
          assignments.map(a => a.title?.toLowerCase().trim())
        );

        const filtered = marksData.filter(m =>
          titleSet.has(m.title?.toLowerCase().trim())
        );

        setMarks(filtered);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => controller.abort();
  }, [studentId, courseId]);

  // ✅ শুধু content, কোনো wrapper/Navbar/Sidebar নেই
  return (
    <>
      {loading ? (
        <h2 className="loading">Loading marks...</h2>
      ) : (
        <div className="marks-page">
          <div className="marks-header">
            <div>
              <h2>Academic Marks</h2>
              <p>Course-specific assignment results</p>
            </div>
          </div>

          {marks.length === 0 ? (
            <div className="no-marks">
              No marks available for this course yet.
            </div>
          ) : (
            <div className="marks-grid">
              {marks.map((m, i) => (
                <div key={i} className="mark-card">
                  <div className="subject-name">{m.title}</div>
                  <div className="mark-score">{m.marks}</div>
                  <div className="mark-label">Marks Obtained</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}