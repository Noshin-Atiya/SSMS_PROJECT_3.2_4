import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TeacherLayout from "../../Components/Teacher/TeacherLayout";
import Dashboard from "./Dashboard";
import Assignments from "./Assignments";
import Notices from "./Notices";
import Attendance from "./Attendance";
import Students from "./Students";
import "../../assets/CSS/teacher/teacher.css";

const Teacher = () => {
  return (
    <Routes>
      <Route element={<TeacherLayout />}>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="notices" element={<Notices />} />
        <Route path="attendance" element={<Attendance />} />
      </Route>
    </Routes>
  );
};

export default Teacher;