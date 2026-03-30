import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import HearingSheet from "./pages/HearingSheet";
import ReservationPage from "./pages/ReservationPage";
import Chat from "./pages/Chat/Chat";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hearing-sheet" element={<HearingSheet />} />
      <Route path="/reservation" element={<ReservationPage />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}

export default App;
