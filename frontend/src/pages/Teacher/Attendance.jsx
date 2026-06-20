import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../../assets/CSS/teacher/attendance.css";

const API = "http://localhost:5000";

/* ── helpers ──────────────────────────────────────────────── */
function getLight(pct) {
  if (pct >= 90) return { key: "green",  label: "Good",     hex: "#16a34a" };
  if (pct >= 75) return { key: "yellow", label: "Average",  hex: "#ca8a04" };
  return               { key: "red",    label: "Critical", hex: "#dc2626" };
}

function calcPercent(statuses) {
  const vals  = Object.values(statuses);
  if (!vals.length) return 0;
  const pres  = vals.filter(v => v === "present").length;
  return Math.round((pres / vals.length) * 100);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

/* ════════════════════════════════════════════════════════════ */
export default function Attendance() {
  const teacherEmail = localStorage.getItem("teacherEmail") || "teacher@example.com";

  const [courseId,    setCourseId]    = useState("");
  const [courseName,  setCourseName]  = useState("");
  const [dates,       setDates]       = useState([]);      // ["2025-06-01", …]
  const [grid,        setGrid]        = useState([]);      // [{ studentId, roll, name, dateStatuses }]
  const [activeDate,  setActiveDate]  = useState(todayISO());
  const [newDateInput,setNewDateInput]= useState(todayISO());
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState({ text: "", type: "" });
  const [filterLight, setFilterLight] = useState("all");
  const [loading,     setLoading]     = useState(true);

  /* ── 1. fetch course ──────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/teacher/dashboard/${teacherEmail}`);
        if (res.data.course) {
          setCourseId(res.data.course._id);
          setCourseName(res.data.course.courseName || "");
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  /* ── 2. fetch grid once courseId is ready ─────────────────── */
  useEffect(() => {
    if (courseId) fetchGrid();
  }, [courseId]);

  async function fetchGrid() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/teacher/attendanceGrid/${courseId}`);
      const { dates: fetchedDates, grid: fetchedGrid } = res.data;

      // Ensure activeDate column exists in every row
      const allDates = fetchedDates.includes(activeDate)
        ? fetchedDates
        : [...fetchedDates, activeDate].sort();

      const padded = fetchedGrid.map(row => ({
        ...row,
        dateStatuses: {
          ...Object.fromEntries(allDates.map(d => [d, "absent"])),
          ...row.dateStatuses,
        },
      }));

      setDates(allDates);
      setGrid(padded);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* ── 3. toggle a single cell ──────────────────────────────── */
  const toggleCell = useCallback((studentId, date) => {
    setGrid(prev =>
      prev.map(row => {
        if (row.studentId !== studentId) return row;
        const cur = row.dateStatuses[date] || "absent";
        return {
          ...row,
          dateStatuses: {
            ...row.dateStatuses,
            [date]: cur === "present" ? "absent" : "present",
          },
        };
      })
    );
  }, []);

  /* ── 4. add new date column ───────────────────────────────── */
  function addDateColumn() {
    if (!newDateInput) return;
    if (dates.includes(newDateInput)) {
      setActiveDate(newDateInput);
      return;
    }
    const newDates = [...dates, newDateInput].sort();
    setDates(newDates);
    setGrid(prev =>
      prev.map(row => ({
        ...row,
        dateStatuses: { [newDateInput]: "absent", ...row.dateStatuses },
      }))
    );
    setActiveDate(newDateInput);
  }

  /* ── 5. mark all present / absent for activeDate ──────────── */
  function markAll(status) {
    setGrid(prev =>
      prev.map(row => ({
        ...row,
        dateStatuses: { ...row.dateStatuses, [activeDate]: status },
      }))
    );
  }

  /* ── 6. save to backend ───────────────────────────────────── */
  async function handleSave() {
    if (!courseId) return;
    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      const records = grid.map(row => ({
        studentId: row.studentId,
        roll:      row.roll,
        status:    row.dateStatuses[activeDate] || "absent",
      }));

      const res = await axios.post(`${API}/teacher/saveAttendance`, {
        courseId,
        date: activeDate,
        records,
      });

      setMsg({ text: `✅ ${res.data.message}`, type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch (err) {
      setMsg({
        text: `❌ ${err.response?.data?.error || "Save failed"}`,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  /* ── derived ──────────────────────────────────────────────── */
  const enriched = grid.map(row => {
    const pct   = calcPercent(row.dateStatuses);
    const light = getLight(pct);
    return { ...row, pct, light };
  });

  const filtered = filterLight === "all"
    ? enriched
    : enriched.filter(r => r.light.key === filterLight);

  const counts = {
    green:  enriched.filter(r => r.light.key === "green").length,
    yellow: enriched.filter(r => r.light.key === "yellow").length,
    red:    enriched.filter(r => r.light.key === "red").length,
  };

  const presentCount = enriched.filter(
    r => (r.dateStatuses[activeDate] || "absent") === "present"
  ).length;

  /* ── render ───────────────────────────────────────────────── */
  return (
    <div className="att-root">

      {/* Header */}
      <div className="att-header">
        <div>
          <h1 className="att-title">Attendance Manager</h1>
          {courseName && (
            <p className="att-subtitle">
              Course: <strong>{courseName}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="att-cards">
        {[
          { key: "green",  label: "Good",     emoji: "🟢", desc: "≥ 90%",    count: counts.green  },
          { key: "yellow", label: "Average",  emoji: "🟡", desc: "75–89%",   count: counts.yellow },
          { key: "red",    label: "Critical", emoji: "🔴", desc: "< 75%",    count: counts.red    },
        ].map(c => (
          <div
            key={c.key}
            className={`att-card att-card--${c.key} ${filterLight === c.key ? "att-card--active" : ""}`}
            onClick={() => setFilterLight(filterLight === c.key ? "all" : c.key)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && setFilterLight(filterLight === c.key ? "all" : c.key)}
          >
            <span className="att-card-emoji">{c.emoji}</span>
            <span className="att-card-count">{c.count}</span>
            <span className="att-card-label">{c.label}</span>
            <span className="att-card-desc">{c.desc}</span>
          </div>
        ))}
        <div
          className="att-card att-card--total"
          onClick={() => setFilterLight("all")}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && setFilterLight("all")}
        >
          <span className="att-card-emoji">👥</span>
          <span className="att-card-count">{enriched.length}</span>
          <span className="att-card-label">Total</span>
          <span className="att-card-desc">All students</span>
        </div>
      </div>

      {/* Date selector + actions toolbar */}
      <div className="att-toolbar">
        {/* Date tabs */}
        <div className="att-date-tabs">
          {dates.map(d => (
            <button
              key={d}
              className={`att-date-tab ${activeDate === d ? "att-date-tab--active" : ""}`}
              onClick={() => setActiveDate(d)}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Add new date */}
        <div className="att-new-date-row">
          <input
            type="date"
            value={newDateInput}
            onChange={e => setNewDateInput(e.target.value)}
            className="att-date-input"
          />
          <button className="btn-add-date" onClick={addDateColumn}>
            + Add date
          </button>
        </div>
      </div>

      {/* Active date panel */}
      <div className="att-active-panel">
        <div className="att-active-info">
          <span className="att-active-label">Marking attendance for</span>
          <strong className="att-active-date">{activeDate}</strong>
          <span className="att-present-badge">
            {presentCount} / {enriched.length} present
          </span>
        </div>

        <div className="att-bulk-actions">
          <button className="btn-bulk btn-bulk--present" onClick={() => markAll("present")}>
            ✅ Mark all present
          </button>
          <button className="btn-bulk btn-bulk--absent" onClick={() => markAll("absent")}>
            ❌ Mark all absent
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "💾 Save attendance"}
          </button>
        </div>
      </div>

      {msg.text && (
        <div className={`att-msg att-msg--${msg.type}`}>{msg.text}</div>
      )}

      {/* Main grid table */}
      <div className="att-table-panel">
        <div className="att-table-header">
          <h2 className="att-section-title">Attendance Grid</h2>
          {filterLight !== "all" && (
            <button className="btn-clear-filter" onClick={() => setFilterLight("all")}>
              ✕ Clear filter
            </button>
          )}
        </div>

        {loading ? (
          <p className="att-empty">Loading students…</p>
        ) : filtered.length === 0 ? (
          <p className="att-empty">No students found for this filter.</p>
        ) : (
          <div className="att-table-wrap">
            <table className="att-table att-grid-table">
              <thead>
                <tr>
                  <th className="col-hash">#</th>
                  <th className="col-roll">Roll</th>
                  <th className="col-name">Student</th>
                  {dates.map(d => (
                    <th
                      key={d}
                      className={`col-date ${d === activeDate ? "col-date--active" : ""}`}
                      onClick={() => setActiveDate(d)}
                      title={`Switch to ${d}`}
                    >
                      {d.slice(5)} {/* show MM-DD */}
                    </th>
                  ))}
                  <th className="col-pct">%</th>
                  <th className="col-status">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.studentId} className={`att-row att-row--${row.light.key}`}>
                    <td>{i + 1}</td>
                    <td><strong>{row.roll}</strong></td>
                    <td className="col-name-cell">{row.name}</td>

                    {dates.map(d => {
                      const status  = row.dateStatuses[d] || "absent";
                      const isToday = d === activeDate;
                      return (
                        <td
                          key={d}
                          className={`att-cell ${isToday ? "att-cell--active" : ""}`}
                          onClick={() => toggleCell(row.studentId, d)}
                          title={`${row.name} – ${d}: click to toggle`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === "Enter" && toggleCell(row.studentId, d)}
                          aria-label={`${row.name} ${d} ${status}`}
                        >
                          <span className={`att-pill att-pill--${status}`}>
                            {status === "present" ? "P" : "A"}
                          </span>
                        </td>
                      );
                    })}

                    <td className="col-pct-cell">
                      <div className="progress-wrap">
                        <div
                          className={`progress-bar progress-bar--${row.light.key}`}
                          style={{ width: `${row.pct}%` }}
                        />
                        <span className="progress-label">{row.pct}%</span>
                      </div>
                    </td>

                    <td>
                      <div className="traffic-light-col">
                        <span className={`tl-dot tl-dot--${row.light.key}`} />
                        <span className="tl-label" style={{ color: row.light.hex }}>
                          {row.light.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
