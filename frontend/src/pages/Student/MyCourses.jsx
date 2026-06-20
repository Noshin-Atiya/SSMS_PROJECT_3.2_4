export default function MyCourses({ courses }) {
  return (
    <div>
      <h2>My Courses</h2>
      <div className="grid">
        {courses.length === 0 ? (
          <p>No courses joined yet.</p>
        ) : (
          courses.map(c => (
            <div key={c._id} className="card">
              <h3>{c.courseName}</h3>
              <p>{c.courseCode}</p>
              <p>Teacher: {c.teacher || "Not assigned"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}