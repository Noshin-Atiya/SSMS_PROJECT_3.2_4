import { useEffect, useState } from "react";
 import "../../assets//CSS/admin/students.css"

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/student/allStudents")
      .then((res) => res.json())
      .then(setStudents)
      .catch(console.error);
  }, []);

  const generateReport = (student) => {
    setLoadingId(student._id);

    const url = `http://localhost:5000/admin/downloadReport/${student._id}`;

    // 1️⃣ OPEN IN NEW TAB (VIEW)
    window.open(`${url}?mode=view`, "_blank");

    // 2️⃣ FORCE DOWNLOAD
    const link = document.createElement("a");
    link.href = `${url}?mode=download`;
    link.download = `${student.name}_Report.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setLoadingId(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Students</h2>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.roll || "N/A"}</td>
              <td>{s.name}</td>
              <td>{s.email}</td>

              <td>
                <button
                  onClick={() => generateReport(s)}
                  disabled={loadingId === s._id}
                >
                  {loadingId === s._id ? "Generating..." : "Generate Report"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}