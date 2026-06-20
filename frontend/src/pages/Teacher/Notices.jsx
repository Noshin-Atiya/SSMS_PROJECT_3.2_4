import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/CSS/teacher/notices.css"

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
const teacherEmail = localStorage.getItem("teacherEmail") ; // replace with logged-in teacher email
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
  const fetchNotices = async () => {
    try {
      if (!teacherEmail) return; // ✅ wait for email

      const res = await axios.get(
        `http://localhost:5000/teacher/dashboard/${teacherEmail}`
      );

      console.log("NOTICE DATA:", res.data); // 🔍 debug

      if (res.data.message) {
        setNotices([]);
        return;
      }

      const course = res.data.course;

      if (course) {
        setCourseId(course._id);
      }

      setNotices(res.data.notices || []); // ✅ ALWAYS set

    } catch (err) {
      console.error(err);
    }
  };

  fetchNotices();
}, [teacherEmail]); // ✅ VERY IMPORTANT

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!title || !description) return alert("Please fill all fields");
    try {
      await axios.post(`http://localhost:5000/teacher/postNotice`, {
        courseId,
        title,
        description,
      });
      alert("Notice posted!");
      setTitle("");
      setDescription("");

      const res = await axios.get(`http://localhost:5000/teacher/dashboard/${teacherEmail}`);
      setNotices(res.data.notices || []);
    } catch (err) {
      console.error(err);
      alert("Failed to post notice");
    }
  };

  return (
    <div className="notices-page">
      <h1>Notices</h1>

      <form className="notice-form" onSubmit={handlePostNotice}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}></textarea>
        <button type="submit">Post Notice</button>
      </form>

      <div className="notice-list">
        {notices.length === 0 && <p>No notices yet.</p>}
        {notices.map((n) => (
          <div key={n._id} className="notice-card">
            <h3>{n.title}</h3>
            <p>{n.description}</p>
            <small>{new Date(n.date).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notices;