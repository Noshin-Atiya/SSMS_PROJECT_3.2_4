import { BrowserRouter, Routes, Route } from "react-router-dom";
import CoverPage from "./pages/CoverPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Teacher from "./pages/Teacher/Teacher";
import Admin from "./pages/Admin/Admin";
import Student from "./pages/Student/Student";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Cover Page */}
        <Route path="/" element={<CoverPage />} />

        {/* Public Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route path="/student/*" element={<Student />} />

        {/* Teacher */}
        <Route path="/teacher/*" element={<Teacher />} />

        {/* Admin */}
         <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;