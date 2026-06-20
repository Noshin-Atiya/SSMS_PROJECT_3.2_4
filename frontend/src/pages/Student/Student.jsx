import { Routes, Route } from "react-router-dom";
import StudentLayout from "../../Components/Student/StudentLayout";
import Dashboard from "./Dashboard";
import CourseDashboard from "./CourseDashboard";
import Assignments from "./Assignments";
import Notifications from "./Notifications";
import Marks from "./Marks";
import TotalStudents from "./TotalStudents";
import Attendance from "./Attendance";

export default function Student() {
  return (
    <Routes>
      <Route element={<StudentLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="course/:courseId" element={<CourseDashboard />} />
        <Route path="course/:courseId/assignments" element={<Assignments />} />
        <Route path="course/:courseId/notifications" element={<Notifications />} />
        <Route path="course/:courseId/marks" element={<Marks />} />
        <Route path="course/:courseId/students" element={<TotalStudents />} />
        <Route path="course/:courseId/attendance" element={<Attendance />} />
      </Route>
    </Routes>
  );
}