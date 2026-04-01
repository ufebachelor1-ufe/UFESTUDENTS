import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import AdminLayout from "./Admin/AdminLayout";
import AddPost from "./Admin/AddPost";
import AdminLogin from "./Admin/AdminLogin";
import ProtectedAdmin from "./Admin/ProtectedAdmin";
import News from "./Admin/News";
import EditPost from "./Admin/EditPost";
import Calendar from "./Admin/Calendar";
import AddCalendar from "./Admin/AddCalendar";
import EditCalendar from "./Admin/EditCalendar";

// PROGRAM IMPORTS
import Program from "./Admin/Program";
import ProgramAddPost from "./Admin/ProgramAddPost";
import EditProgram from "./Admin/EditProgram";

function App() {
  return (
    <Routes>
      {/* 🔁 Redirect root to admin login */}
      <Route path="/" element={<Navigate to="/admin-login" replace />} />

      <Route path="/admin-login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }
      >
        {/* NEWS */}
        <Route index element={<News />} />
        <Route path="news" element={<News />} />
        <Route path="add-post" element={<AddPost />} />
        <Route path="edit-post/:id" element={<EditPost />} />

        <Route path="calendar" element={<Calendar />} />
        <Route path="calendar/add" element={<AddCalendar />} />
        <Route path="calendar/edit/:id" element={<EditCalendar />} />


        {/* PROGRAM */}
        <Route path="program" element={<Program />} />
        <Route path="program/add" element={<ProgramAddPost />} />
        <Route path="program/edit/:id" element={<EditProgram />} />
      </Route>
    </Routes>
  );
}

export default App;
