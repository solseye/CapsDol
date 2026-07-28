import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminCalendarPage from "./pages/AdminCalendarPage";
import AdminChatbotPage from "./pages/AdminChatbotPage";
import PdfManagementPage from "./pages/PdfManagementPage";
import "./admin.css";

// 관리자 하위 라우트를 공통 레이아웃 안에서 전환합니다.
export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Navigate to="calendar" replace />} />
        <Route path="calendar" element={<AdminCalendarPage />} />
        <Route path="pdf" element={<PdfManagementPage />} />
        <Route path="pdf-management" element={<PdfManagementPage />} />
        <Route path="pdf-list" element={<PdfManagementPage />} />
        <Route path="chatbot" element={<AdminChatbotPage />} />
      </Routes>
    </AdminLayout>
  );
}
