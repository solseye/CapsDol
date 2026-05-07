import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import HearingSheet from "./pages/HearingSheet";
import ReservationPage from "./pages/ReservationPage";
import Chat from "./pages/Chat/Chat";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCalendarPage from "./pages/admin/pages/AdminCalendarPage";
import AdminChatbotPage from "./pages/admin/pages/AdminChatbotPage";
import PdfUploadPage from "./pages/admin/pages/PdfUploadPage";
import PdfListPage from "./pages/admin/pages/PdfListPage";
import LostId from "./pages/lostid";
import LostPw from "./pages/lostpw";
import ResetPassword from "./pages/ResetPassword";
import ArticlesPreview from "./pages/ArticlesPreview";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/hearing-sheet" element={<HearingSheet />} />
      <Route path="/reservation" element={<ReservationPage />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/lostid" element={<LostId />} />
      <Route path="/lostpw" element={<LostPw />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/articles-result" element={<ArticlesPreview />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="calendar" element={<AdminCalendarPage />} />
        <Route path="chatbot" element={<AdminChatbotPage />} />
        <Route path="pdf-upload" element={<PdfUploadPage />} />
        <Route path="pdf-list" element={<PdfListPage />} />
      </Route>
    </Routes>
  );
}

export default App;
