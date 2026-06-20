import { Routes, Route } from "react-router-dom";
import AdminLayout from "../../Components/Admin/AdminLayout";
import Dashboard from "./Dashboard";
import Users from "./Users";
import Courses from "./Courses";
import Students from "./Students";
import "../../assets/CSS/admin/admin.css";

export default function Admin() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="courses" element={<Courses />} />
        <Route path="students" element={<Students />} />
      </Route>
    </Routes>
  );
}