import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import HearingSheet from "./pages/HearingSheet";
import Chat from "./pages/Chat/Chat";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminCalendarPage from "./pages/admin/pages/AdminCalendarPage";
import AdminChatbotPage from "./pages/admin/pages/AdminChatbotPage";
import PdfUploadPage from "./pages/admin/pages/PdfUploadPage";
import PdfListPage from "./pages/admin/pages/PdfListPage";
import UsersPage from "./pages/admin/pages/UsersPage";
import UsersDetailPage from "./pages/admin/pages/UsersDetailPage";

import LostId from "./pages/lostid";
import LostPw from "./pages/lostpw";
import ResetPassword from "./pages/ResetPassword";
import ArticlesPreview from "./pages/ArticlesPreview";

import Reservations from "./pages/home/ReservationPage";
import MyReservations from "./pages/home/MyReservationPage";
import MyPage from "./pages/home/mypage/MyPage";
import MyPageReservations from "./pages/home/mypage/MyReservations";
import MyFiles from "./pages/home/mypage/MyFiles";

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
      <Route path="/reservation" element={<Reservations />} />
      <Route path="/myreservations" element={<MyReservations />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/reservations" element={<MyPageReservations />} />
      <Route path="/mypage/files" element={<MyFiles />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/lostid" element={<LostId />} />
      <Route path="/lostpw" element={<LostPw />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/articles-result" element={<ArticlesPreview />} />

      <Route
        path="/admin/calendar"
        element={
          <AdminLayout>
            <AdminCalendarPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/pdf-upload"
        element={
          <AdminLayout>
            <PdfUploadPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/pdf-list"
        element={
          <AdminLayout>
            <PdfListPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/chatbot"
        element={
          <AdminLayout>
            <AdminChatbotPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminLayout>
            <UsersPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users/:uuid"
        element={
          <AdminLayout>
            <UsersDetailPage />
          </AdminLayout>
        }
      />
    </Routes>
  );
}

export default App;
