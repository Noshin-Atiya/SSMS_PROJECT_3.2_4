const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-parse"); // For PDF text extraction
const mammoth = require("mammoth");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const PDFDocument = require("pdfkit");
const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- DB CONNECTION ---------------- */
mongoose.connect(
  "mongodb+srv://Akash:mongodb123@loginandregister.dqxbwkd.mongodb.net/loginDB?retryWrites=true&w=majority&appName=LoginandRegister"
);

/* ---------------- MODELS ---------------- */

/* USER */
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  role: String,
  active: { type: Boolean, default: true }
});

/* COURSE */
const Course = mongoose.model("Course", {
  courseName: String,
  courseCode: String,
  teacher: String,
  email: String
});

/* ENROLLMENT */
const Enrollment = mongoose.model("Enrollment", {
  studentId: String,
  courseId: String,
  roll: String   // ✅ ADD THIS
});

/* ASSIGNMENT */
const Assignment = mongoose.model("Assignment", {
  title: String,
  subject: String,
  deadline: Date,
  courseId: String,

  modelAnswer: String,   // ✅ teacher answer

  studentSubmissions: [
    {
      studentId: String,
      roll: String,              // ✅ IMPORTANT
      fileLink: String,
      extractedText: String,     // NLP ready text
      submittedAt: Date,
      marks: Number,

      nlpEvaluation: {
      final_score: Number,
      similarity_score: Number,
      keyword_score: Number,
      grammar_errors: Number,
      spelling_errors: Number,
      feedback: String
    }
    }
  ]
});

/* NOTICE */
const Notice = mongoose.model("Notice", {
  courseId: String,
  title: String,
  description: String,
  date: { type: Date, default: Date.now }
});

/* ATTENDANCE */
const Attendance = mongoose.model("Attendance", {
  courseId: String,
  studentId: String,
    roll: String,    //added
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["present", "absent"], default: "present" }
});


/* ---------------- AUTH ---------------- */

app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const user = new User({ name, email, password, role });
  await user.save();

  res.send({ message: "Registered successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });

  if (!user) {
    return res.send({ message: "Invalid email or password" });
  }

  res.send({
    id: user._id,
    email: user.email,
    role: user.role
  });
});

/* ---------------- ADMIN ---------------- */

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

app.delete("/deleteUser/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send({ message: "User deleted" });
});

app.post("/toggleUser", async (req, res) => {
  const { id, active } = req.body;
  await User.findByIdAndUpdate(id, { active });
  res.send({ message: "User updated" });
});

/* ---------------- COURSES ---------------- */

app.get("/courses", async (req, res) => {
  const courses = await Course.find();
  res.send(courses);
});

app.post("/createCourse", async (req, res) => {
  const { courseName, courseCode, teacher, email } = req.body;

  const course = new Course({ courseName, courseCode, teacher, email });
  await course.save();

  res.send({ message: "Course created" });
});

app.post("/assignTeacher", async (req, res) => {
  const { courseId, teacher, email } = req.body;

  await Course.findByIdAndUpdate(courseId, { teacher, email });

  res.send({ message: "Teacher assigned" });
});

const width = 500;
const height = 300;

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function generateChart(attendancePercent, avgMarks) {
  const configuration = {
    type: "bar",
    data: {
      labels: ["Attendance %", "Average Marks"],
      datasets: [
        {
          label: "Performance Score",
          data: [attendancePercent, avgMarks],
          backgroundColor: ["#22c55e", "#3b82f6"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Student Performance Overview",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

/* ---------------- STUDENT ---------------- */

/* ALL COURSES (FOR JOIN) */
app.get("/student/allCourses", async (req, res) => {
  const courses = await Course.find();
  res.send(courses);
});

/* JOIN COURSE */
app.post("/student/joinCourse", async (req, res) => {
  const { studentId, courseId, roll } = req.body;

  const exists = await Enrollment.findOne({ studentId, courseId });
  if (exists) return res.send({ message: "Already joined" });

  const enroll = new Enrollment({ studentId, courseId, roll });
  await enroll.save();

  res.send({ message: "Course joined successfully" });
});

/* MY COURSES */
app.get("/student/courses/:studentId", async (req, res) => {
  const enrollments = await Enrollment.find({
    studentId: req.params.studentId
  });

  const courseIds = enrollments.map(e => e.courseId);

  const courses = await Course.find({
    _id: { $in: courseIds }
  });

  res.send(courses);
});
/* COURSE DETAILS */
app.get("/courses/:courseId", async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  res.send(course);
});
/*Notifications for course dashboard*/
app.get("/student/notifications/:studentId/:courseId", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Check enrollment
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(403).send({ error: "Not enrolled" });
    }

    const notices = await Notice.find({ courseId }).sort({ date: -1 });

    res.send(notices);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch notifications" });
  }
});

//Assignment upload handling and stroing
// Ensure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // timestamp + extension
  },
});

const upload = multer({ storage });

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

/* GET ASSIGNMENTS FOR A COURSE */
app.get("/student/assignments/:studentId/:courseId", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Check if student is enrolled
    const enrolled = await Enrollment.findOne({ studentId, courseId });
    if (!enrolled) return res.status(403).send({ error: "Not enrolled in this course" });

    // Fetch assignments
    const assignments = await Assignment.find({ courseId }).sort({ deadline: 1 });

    res.send(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch assignments" });
  }
});
/* UPLOAD ASSIGNMENT */
app.post("/student/uploadAssignment", upload.single("file"), async (req, res) => {
  try {
    const { assignmentId, studentId } = req.body;

    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).send({ error: "Assignment not found" });
    }

    const already = assignment.studentSubmissions.find(
      (s) => s.studentId === studentId
    );

    if (already) {
      return res.send({ message: "Already submitted" });
    }

    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: assignment.courseId,
    });

    const fullPath = path.join(__dirname, "uploads", req.file.filename);

    const ext = path.extname(req.file.originalname).toLowerCase();

    let extractedText = "";

    // 📄 PDF extraction
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(fullPath);
      const pdfData = await pdf(dataBuffer);
      extractedText = pdfData.text;
    }

    // 📝 DOCX extraction
    else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: fullPath });
      extractedText = result.value;
    }

    // fallback (txt)
    else {
      extractedText = fs.readFileSync(fullPath, "utf-8");
    }

    assignment.studentSubmissions.push({
      studentId,
      roll: enrollment?.roll || "N/A",

      fileLink: req.file.filename,
      extractedText,   // ✅ NLP READY TEXT

      submittedAt: new Date(),
      marks: null,

      nlpEvaluation: {
        score: null,
        feedback: "",
      },
    });

    await assignment.save();

    res.send({
      message: "Assignment uploaded successfully",
      extractedPreview: extractedText.slice(0, 200), // optional debug
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Failed to upload assignment",
    });
  }
});
/* MARKS */
app.get("/student/marks/:studentId", async (req, res) => {
  const assignments = await Assignment.find({
    "studentSubmissions.studentId": req.params.studentId
  });

  const result = assignments.map(a => {
    const sub = a.studentSubmissions.find(
      s => s.studentId === req.params.studentId
    );

    return {
      title: a.title,
      subject: a.subject,
      marks: sub?.marks || 0
    };
  });

  res.send(result);
});

/* ATTENDANCE */
app.get("/student/attendance/:studentId/:courseId", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    console.log("Student ID:", studentId);
    console.log("Course ID:", courseId);

    const records = await Attendance.find({
      courseId,
      studentId
    });

    console.log("Attendance Records:", records);

    const total = await Attendance.countDocuments({
      courseId,
      studentId
    });

    const present = await Attendance.countDocuments({
      courseId,
      studentId,
      status: "present"
    });

    const absent = total - present;

    const percent = total
      ? Number(((present / total) * 100).toFixed(1))
      : 0;

    let status = "red";

    if (percent >= 90) status = "green";
    else if (percent >= 75) status = "yellow";

    res.json({
      percent,
      total,
      present,
      absent,
      status
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch attendance"
    });
  }
});
/* STUDENT ALL COURSES ATTENDANCE */
app.get("/student/allAttendance/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const enrollments = await Enrollment.find({ studentId }).lean();

    const result = [];

    for (const enrollment of enrollments) {
      const course = await Course.findById(enrollment.courseId).lean();

      const total = await Attendance.countDocuments({
        courseId: enrollment.courseId,
        studentId,
      });

      const present = await Attendance.countDocuments({
        courseId: enrollment.courseId,
        studentId,
        status: "present",
      });

      const percent = total
        ? Math.round((present / total) * 100)
        : 0;

      let status = "red";

      if (percent >= 90) status = "green";
      else if (percent >= 75) status = "yellow";

      result.push({
        courseId: enrollment.courseId,
        courseName: course?.courseName || "Unknown",
        courseCode: course?.courseCode || "",
        roll: enrollment.roll,
        totalClasses: total,
        presentClasses: present,
        attendancePercent: percent,
        status,
      });
    }

    res.send(result);

  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Failed to fetch attendance"
    });
  }
});

/* CLASSMATES */
app.get("/student/courseStudents/:courseId", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      courseId: req.params.courseId
    }).lean();

    const studentIds = enrollments.map(e => e.studentId);

    const users = await User.find({
      _id: { $in: studentIds },
      role: "student"
    }).lean();

    // 🔥 merge name + roll
    const result = enrollments.map(e => {
      const user = users.find(
        u => u._id.toString() === e.studentId
      );

      return {
        _id: user?._id,
        name: user?.name,
        roll: e.roll
      };
    });

    res.send(result);

  } catch (err) {
    res.status(500).send({ error: "Failed to fetch classmates" });
  }
});



 /* COURSE DASHBOARD DATA */
app.get("/dashboard/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const students = await Enrollment.find({ courseId });
    const notices = await Notice.find({ courseId });
    const assignments = await Assignment.find({ courseId });

    res.send({
      totalStudents: students.length,
      notices,
      assignments
    });

  } catch (error) {
    res.status(500).send({ error: "Dashboard fetch failed" });
  }
});
/* ---------------- TEACHER ---------------- */

app.get("/teacher/courses/:email", async (req, res) => {
  const courses = await Course.find({ email: req.params.email });
  res.send(courses);
});

app.get("/teacher/dashboard/:email", async (req, res) => {
  try {
    const course = await Course.findOne({ email: req.params.email });

    if (!course) {
      return res.send({ message: "No course assigned" });
    }

    const enrollments = await Enrollment.find({
      courseId: course._id.toString()
    });

    const studentIds = enrollments.map(e => e.studentId);

    const users = await User.find({
      _id: { $in: studentIds },
      role: "student",
      active: true
    });

    const students = enrollments.map(enrollment => {
      const user = users.find(
        u => u._id.toString() === enrollment.studentId
      );

      return {
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        roll: enrollment.roll
      };
    });

    const assignments = await Assignment.find({
      courseId: course._id
    });

    const notices = await Notice.find({
      courseId: course._id
    });

    res.send({
      course,
      students,
      assignments,
      notices
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch dashboard" });
  }
});
/* CREATE ASSIGNMENT */
app.post("/teacher/createAssignment", async (req, res) => {
  const { title, subject, courseId, deadline, modelAnswer } = req.body;

  const assignment = new Assignment({
    title,
    subject,
    courseId,
    deadline,
    modelAnswer
  });

  await assignment.save();

  res.send({ message: "Assignment created successfully" });
});
/* POST NOTICE */
app.post("/teacher/postNotice", async (req, res) => {
  const { courseId, title, description } = req.body;

  const notice = new Notice({
    courseId,
    title,
    description
  });

  await notice.save();

  res.send({ message: "Notice posted" });
});

/* EDIT MARKS */
app.post("/teacher/editMarks", async (req, res) => {
  try {
    const { assignmentId, studentId, marks } = req.body;

    const result = await Assignment.updateOne(
      {
        _id: assignmentId,
        "studentSubmissions.studentId": studentId
      },
      {
        $set: {
          "studentSubmissions.$.marks": marks
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({
        message: "No matching student submission found"
      });
    }

    res.send({
      message: "Marks updated successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Edit marks failed" });
  }
});


/**
 * GET /teacher/attendanceDates/:courseId
 * Returns every unique date that has attendance records for this course.
 */
app.get("/teacher/attendanceDates/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const records = await Attendance.find({ courseId }).lean();

    // Collect unique dates (ISO date strings: "YYYY-MM-DD")
    const dateSet = new Set(
      records.map(r => new Date(r.date).toISOString().split("T")[0])
    );

    res.json({ dates: [...dateSet].sort() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dates" });
  }
});

/**
 * GET /teacher/attendanceGrid/:courseId
 * Returns a 2D grid of { studentId, roll, name, dateStatuses: { "YYYY-MM-DD": "present"|"absent" } }
 */
app.get("/teacher/attendanceGrid/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({ courseId }).lean();
    console.log("========== ATTENDANCE GRID ==========");
console.log("COURSE ID:", courseId);
console.log("ENROLLMENTS COUNT:", enrollments.length);
console.log("ENROLLMENTS:", enrollments);

    const studentIds  = enrollments.map(e => e.studentId);
    const users       = await User.find({ _id: { $in: studentIds } }).lean();
    console.log("STUDENT IDS:", studentIds);
console.log("USERS COUNT:", users.length);
console.log("USERS:", users);
    const records     = await Attendance.find({ courseId }).lean();

    // Build { studentId+date → status } lookup
    const lookup = {};
    for (const r of records) {
      const dateKey = new Date(r.date).toISOString().split("T")[0];
      lookup[`${r.studentId}__${dateKey}`] = r.status;
    }

    // Unique sorted dates
    const dateSet = new Set(records.map(r => new Date(r.date).toISOString().split("T")[0]));
    const dates   = [...dateSet].sort();

    const grid = enrollments.map(enr => {
      const user   = users.find(u => u._id.toString() === enr.studentId);
      const statuses = {};
      for (const d of dates) {
        statuses[d] = lookup[`${enr.studentId}__${d}`] || "absent";
      }
      return {
        studentId:    enr.studentId,
        roll:         enr.roll || "—",
        name:         user?.name || "Unknown",
        dateStatuses: statuses,
      };
    });

    res.json({ dates, grid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch grid" });
  }
});

/**
 * POST /teacher/saveAttendance
 * Body: { courseId, date, records: [{ studentId, roll, status }] }
 *
 * Upserts one Attendance doc per student for the given date.
 * If a record already exists (same courseId + studentId + date) it is
 * updated; otherwise a new one is inserted.
 */
app.post("/teacher/saveAttendance", async (req, res) => {
  try {
    const { courseId, date, records } = req.body;

    if (!courseId) return res.status(400).json({ error: "courseId required" });
    if (!date)     return res.status(400).json({ error: "date required"     });
    if (!Array.isArray(records) || records.length === 0)
      return res.status(400).json({ error: "records array required"         });

    const targetDate = new Date(date);
    if (isNaN(targetDate)) return res.status(400).json({ error: "Invalid date" });

    // Normalise to midnight UTC so date-only comparisons work
    targetDate.setUTCHours(0, 0, 0, 0);

    let upserted = 0;
    for (const rec of records) {
      const { studentId, roll, status } = rec;
      if (!studentId) continue;

      await Attendance.findOneAndUpdate(
        {
          courseId,
          studentId,
          // Match records whose date falls on the same UTC day
          date: {
            $gte: targetDate,
            $lt:  new Date(targetDate.getTime() + 86_400_000),
          },
        },
        { $set: { courseId, studentId, roll, status, date: targetDate } },
        { upsert: true, new: true }
      );
      upserted++;
    }

    res.json({ message: `${upserted} record(s) saved`, upserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Save failed" });
  }
});

/* ATTENDANCE ANALYTICS */
app.get("/teacher/attendanceAnalytics/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({ courseId }).lean();
    const studentIds  = enrollments.map(e => e.studentId);
    const users       = await User.find({ _id: { $in: studentIds } }).lean();

    const data = [];

    for (const enr of enrollments) {
      const user = users.find(u => u._id.toString() === enr.studentId);

      const total   = await Attendance.countDocuments({ courseId, studentId: enr.studentId });
      const present = await Attendance.countDocuments({ courseId, studentId: enr.studentId, status: "present" });
      const percent = total ? Math.round((present / total) * 100) : 0;

      let color = "red";
      if (percent >= 90) color = "green";
      else if (percent >= 75) color = "yellow";

      data.push({
        studentId:         enr.studentId,
        name:              user?.name || "Unknown",
        roll:              enr.roll   || "—",
        total,
        present,
        absent:            total - present,
        attendancePercent: percent,   // ✅ matches Attendance.jsx
        status:            color,
      });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/*............... 1. System Overview API...................*/

app.get("/systemOverview", async (req, res) => {
  try {
    const students = await User.countDocuments({ role: "student" });
    const teachers = await User.countDocuments({ role: "teacher" });
    const courses = await Course.countDocuments();
    const assignments = await Assignment.countDocuments();

    res.json({
      students,
      teachers,
      courses,
      assignments
    });
  } catch (err) {
    res.status(500).json({ error: "System overview failed" });
  }
});

/*................2. Admin Analytics API.............*/
app.get("/analytics", async (req, res) => {
  try {
    const activeStudents = await User.countDocuments({
      role: "student",
      active: true
    });

    const pendingAssignments = await Assignment.countDocuments({
      "studentSubmissions.marks": null
    });

    const totalStudents = await User.countDocuments({ role: "student" });
    const submissionRate = totalStudents
      ? (activeStudents / totalStudents) * 100
      : 0;

    res.json({
      activeStudents,
      pendingAssignments,
      submissionRate: submissionRate.toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ error: "Analytics failed" });
  }
});

/*...........................3. Performance Report API.........................*/
app.get("/admin/performanceReport/:studentId", async (req, res) => {
  try {
    const data = await generateStudentPerformance(req.params.studentId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Report failed" });
  }
});
async function generateStudentPerformance(studentId) {
  const student = await User.findById(studentId);

  const enrollmentList = await Enrollment.find({ studentId });

  const courseIds = enrollmentList.map(e => e.courseId);

  const courses = await Course.find({ _id: { $in: courseIds } });

  const attendanceRecords = await Attendance.find({ studentId });

  const assignments = await Assignment.find({
    "studentSubmissions.studentId": studentId
  });

  const courseReports = [];

  for (const enroll of enrollmentList) {
    const courseId = enroll.courseId;

    const course = courses.find(c => c._id.toString() === courseId);

    // attendance per course
    const courseAttendance = attendanceRecords.filter(
      a => a.courseId === courseId
    );

    const total = courseAttendance.length;
    const present = courseAttendance.filter(a => a.status === "present").length;
    const percent = total ? (present / total) * 100 : 0;

    // assignment per course
    let totalMarks = 0;
    let count = 0;

    assignments.forEach(a => {
      if (a.courseId === courseId) {
        const sub = a.studentSubmissions.find(
          s => s.studentId === studentId
        );

        if (sub?.marks != null) {
          totalMarks += sub.marks;
          count++;
        }
      }
    });

    const avgMarks = count ? totalMarks / count : 0;

    courseReports.push({
      courseId,
      courseName: course?.courseName || "Unknown",
      teacher: course?.teacher || "Unknown",

      attendance: {
        total,
        present,
        absent: total - present,
        percent
      },

      assignments: {
        total: count,
        avgMarks
      }
    });
  }

  return {
    student,
    enrollmentList,
    courseReports
  };
}

app.get("/admin/downloadReport/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const data = await generateStudentPerformance(studentId);

    if (!data.student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    const fileName = `Transcript_${data.student.name || "student"}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    doc.pipe(res);

    /* ================= HEADER ================= */
    doc
      .fontSize(22)
      .fillColor("#111827")
      .text("STUDENT PERFORMANCE REPORT", { align: "center" });

    doc.moveDown(0.3);

    // underline
    const pageWidth = 520;
    const startX = 40;
    const underlineY = doc.y;

    doc
      .moveTo(startX, underlineY)
      .lineTo(startX + pageWidth, underlineY)
      .strokeColor("#111827")
      .lineWidth(1)
      .stroke();

    doc.moveDown(1);

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });

    doc.moveDown(2);

    /* ================= STUDENT INFO BOX ================= */
    doc.rect(40, doc.y, 520, 70).stroke("#d1d5db");

    doc.fontSize(11).fillColor("black");

    doc.text(`Name: ${data.student.name}`, 50, doc.y + 10);
    doc.text(`Email: ${data.student.email}`);
    doc.text(`Roll: ${data.enrollmentList?.[0]?.roll || "N/A"}`);

    doc.moveDown(3);

    /* ================= TABLE HEADER ================= */
    let y = doc.y;

    doc
      .fillColor("#1f2937")
      .rect(startX, y, 520, 22)
      .fill();

    doc.fillColor("white").fontSize(10);

    doc.text("Course", startX + 5, y + 6);
    doc.text("Teacher", startX + 140, y + 6);
    doc.text("Attendance", startX + 270, y + 6);
    doc.text("Assignment", startX + 400, y + 6);

    y += 22;

    /* ================= TABLE ROWS ================= */
    data.courseReports.forEach((c, index) => {

      const percent = c.attendance.percent;

      // 🎯 attendance color logic
      let attendanceColor = "#ef4444"; // red
      if (percent >= 90) attendanceColor = "#16a34a"; // green
      else if (percent >= 75) attendanceColor = "#eab308"; // yellow

      const attendanceText =
        `${c.attendance.present}/${c.attendance.total} (${percent.toFixed(1)}%)`;

      const assignmentText =
        `${c.assignments.avgMarks.toFixed(1)} avg`;

      // row background
      doc
        .fillColor(index % 2 === 0 ? "#f9fafb" : "#ffffff")
        .rect(startX, y, 520, 25)
        .fill();

      doc.fillColor("#111827").fontSize(9);

      doc.text(c.courseName, startX + 5, y + 8, { width: 130 });
      doc.text(c.teacher || "N/A", startX + 140, y + 8, { width: 120 });

      // ✅ COLORED ATTENDANCE
      doc
        .fillColor(attendanceColor)
        .text(attendanceText, startX + 270, y + 8, { width: 120 });

      // assignment (black)
      doc
        .fillColor("#111827")
        .text(assignmentText, startX + 400, y + 8, { width: 100 });

      y += 25;

      // page break
      if (y > 750) {
        doc.addPage();
        y = 40;
      }
    });

    /* ================= FOOTER ================= */
    doc.moveDown(2);

    doc
      .fontSize(9)
      .fillColor("gray")
      .text(
        "This is a system generated academic transcript. No signature required.",
        { align: "center" }
      );

    doc.end();

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ error: "Failed to generate PDF report" });
  }
});

/*-----All students for Admin dashboard-----*/
app.get("/student/allStudents", async (req, res) => {
  try {
    const enrollments = await Enrollment.find().lean();

    // Remove duplicate studentIds
    const uniqueStudentIds = [
      ...new Set(enrollments.map(e => e.studentId))
    ];

    const users = await User.find({
      _id: { $in: uniqueStudentIds },
      role: "student"
    }).lean();

    const result = uniqueStudentIds.map(studentId => {
      const user = users.find(
        u => u._id.toString() === studentId
      );

      const enrollment = enrollments.find(
        e => e.studentId === studentId
      );

      return {
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        roll: enrollment?.roll || "N/A"
      };
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*-- NLP EVALUATION ---------------- */
app.post("/nlp/evaluate", async (req, res) => {
  try {
    const { assignmentId, studentId, studentText, modelAnswer } = req.body;

    const response = await axios.post("http://localhost:5001/evaluate", {
      student_answer: studentText,
      model_answer: modelAnswer,
    });

    const result = response.data;

    const assignment = await Assignment.findById(assignmentId);

    const submission = assignment.studentSubmissions.find(
      (s) => s.studentId?.toString() === studentId?.toString()
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    submission.nlpEvaluation = {
      final_score: result.final_score,
      similarity_score: result.similarity_score,
      keyword_score: result.keyword_score,
      grammar_errors: result.grammar_errors,
      spelling_errors: result.spelling_errors,
      feedback: result.feedback,
    };

    submission.marks = result.final_score;

    assignment.markModified("studentSubmissions");

    await assignment.save();

    res.json({
      assignmentId,
      studentId,
      nlpEvaluation: submission.nlpEvaluation,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "NLP evaluation failed" });
  }
});
/* ---------------- SERVER ---------------- */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});