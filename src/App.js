import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteMeta from "./components/RouteMeta";
import NotificationCenter from "./components/NotificationCenter";
import LegacyPageLocalization from "./components/LegacyPageLocalization";
import UserLayout from "./components/UserLayout";
import { getCurrentLanguage, translate } from "./i18n/translations";

const Home = lazy(() => import("./pages/Home"));
const HearingSheet = lazy(() => import("./pages/HearingSheet"));
const Chat = lazy(() => import("./pages/Chat/Chat"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const LostId = lazy(() => import("./pages/lostid"));
const LostPw = lazy(() => import("./pages/lostpw"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ArticlesPreview = lazy(() => import("./pages/ArticlesPreview"));
const Reservations = lazy(() => import("./pages/home/ReservationPage"));
const MyPage = lazy(() => import("./pages/home/mypage/MyPage"));
const MyPageReservations = lazy(
  () => import("./pages/home/mypage/MyReservations"),
);
const MyFiles = lazy(() => import("./pages/home/mypage/MyFiles"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminCalendarPage = lazy(
  () => import("./pages/admin/pages/AdminCalendarPage"),
);
const AdminChatbotPage = lazy(
  () => import("./pages/admin/pages/AdminChatbotPage"),
);
const PdfUploadPage = lazy(() => import("./pages/admin/pages/PdfUploadPage"));
const PdfManagementPage = lazy(
  () => import("./pages/admin/pages/PdfManagementPage"),
);
const UsersPage = lazy(() => import("./pages/admin/pages/UsersPage"));
const UsersDetailPage = lazy(
  () => import("./pages/admin/pages/UsersDetailPage"),
);

function LoadingScreen() {
  const language = getCurrentLanguage();

  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span />
      {translate(language, "common.loadingPage")}
    </div>
  );
}

function UserRoute({ children }) {
  return <ProtectedRoute role="user">{children}</ProtectedRoute>;
}

function AdminRoute({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <RouteMeta />
      <NotificationCenter />
      <LegacyPageLocalization />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/lostid" element={<LostId />} />
          <Route path="/lostpw" element={<LostPw />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<UserLayout />}>
            <Route
              path="/hearing-sheet"
              element={
                <UserRoute>
                  <HearingSheet />
                </UserRoute>
              }
            />
            <Route path="/articles-result" element={<ArticlesPreview />} />

            <Route
              path="/reservation"
              element={
                <UserRoute>
                  <Reservations />
                </UserRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <UserRoute>
                  <Chat />
                </UserRoute>
              }
            />
            <Route
              path="/mypage"
              element={
                <UserRoute>
                  <MyPage />
                </UserRoute>
              }
            />
            <Route
              path="/mypage/reservations"
              element={
                <UserRoute>
                  <MyPageReservations />
                </UserRoute>
              }
            />
            <Route
              path="/mypage/files"
              element={
                <UserRoute>
                  <MyFiles />
                </UserRoute>
              }
            />

            <Route
              path="/myreservations"
              element={<Navigate to="/mypage/reservations" replace />}
            />
            <Route
              path="/mypage/required-documents"
              element={<Navigate to="/mypage/files#required-documents" replace />}
            />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route
            path="/admin/calendar"
            element={
              <AdminRoute>
                <AdminCalendarPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pdf-upload"
            element={
              <AdminRoute>
                <PdfUploadPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pdf-list"
            element={
              <AdminRoute>
                <PdfManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pdf"
            element={
              <AdminRoute>
                <PdfManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/chatbot"
            element={
              <AdminRoute>
                <AdminChatbotPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users/:uuid"
            element={
              <AdminRoute>
                <UsersDetailPage />
              </AdminRoute>
            }
          />

        </Routes>
      </Suspense>
    </>
  );
}

export default App;
