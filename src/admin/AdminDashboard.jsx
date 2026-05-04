import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminCalendarPage from "./pages/AdminCalendarPage";
import AdminChatbotPage from "./pages/AdminChatbotPage";
import PdfListPage from "./pages/PdfListPage";
import PdfUploadPage from "./pages/PdfUploadPage";
import "./admin.css";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Navigate to="calendar" replace />} />
        <Route path="calendar" element={<AdminCalendarPage />} />
        <Route path="pdf-upload" element={<PdfUploadPage />} />
        <Route path="pdf-list" element={<PdfListPage />} />
        <Route path="chatbot" element={<AdminChatbotPage />} />
      </Routes>
    </AdminLayout>
  );
}
