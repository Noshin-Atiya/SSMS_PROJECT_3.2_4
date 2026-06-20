import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../assets/CSS/student/attendance.css";

const STATUS_CONFIG = {
  green: {
    tag: "Good Standing",
    headline: "You're attending consistently",
    subline: "Keep your attendance above 75% to stay in good standing."
  },
  yellow: {
    tag: "At Risk",
    headline: "Your attendance is slipping",
    subline: "Attend more classes to avoid falling into critical status."
  },
  red: {
    tag: "Critical",
    headline: "Your attendance needs urgent attention",
    subline: "Contact your advisor — low attendance may affect eligibility."
  }
};

const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Attendance() {
  const [data, setData] = useState(null);

  const { courseId } = useParams();
  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    if (!courseId || !studentId) return;

    fetch(`http://localhost:5000/student/attendance/${studentId}/${courseId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [studentId, courseId]);

  // ✅ loading state — কোনো wrapper নেই
  if (!data) {
    return <h2 className="attendance-loading">Loading...</h2>;
  }

  const status = STATUS_CONFIG[data.status] || STATUS_CONFIG.red;
  const percent = Math.max(0, Math.min(100, data.percent));
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  // ✅ শুধু content, কোনো wrapper/Navbar/Sidebar নেই
  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h2>Attendance Report</h2>
          <p>Your course attendance summary</p>
        </div>
      </div>

      <div className={`attendance-card ${data.status}`}>
        <div className="progress-ring">
          <svg viewBox="0 0 140 140">
            <circle className="track" cx="70" cy="70" r={RADIUS} />
            <circle
              className="fill"
              cx="70"
              cy="70"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="ring-label">
            <div className="ring-percent">{percent}%</div>
            <div className="ring-unit">Present</div>
          </div>
        </div>

        <div className="attendance-info">
          <div className="status-tag">
            <span className="dot" />
            {status.tag}
          </div>
          <div className="headline">{status.headline}</div>
          <div className="subline">{status.subline}</div>
        </div>
      </div>

      <div className="attendance-stats">
        <div className="stat-card">
          <div className="stat-value">{data.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card present">
          <div className="stat-value">{data.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card absent">
          <div className="stat-value">{data.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
      </div>
    </div>
  );
}