import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../assets/CSS/admin/dashboard.css";

export default function Dashboard() {
  const [overview, setOverview] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await axios.get("http://localhost:5000/systemOverview");
      setOverview(res.data);
    } catch {
      setOverview({});
    }
  };

  const stats = [
    {
      label: "Students",
      value: overview.students || 0,
      path: "/admin/students",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
      color: "blue",
    },
    {
      label: "Teachers",
      value: overview.teachers || 0,
      path: " ",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      color: "green",
    },
    {
      label: "Courses",
      value: overview.courses || 0,
      path: "/admin/courses",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
      color: "purple",
    },
    {
      label: "Assignments",
      value: overview.assignments || 0,
      path: null,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
      ),
      color: "amber",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-intro">
        <h2>Dashboard overview</h2>
        <p>A snapshot of your platform at a glance</p>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`stat-card-admin ${s.color} ${s.path ? "clickable" : ""}`}
            onClick={() => s.path && navigate(s.path)}
          >
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}