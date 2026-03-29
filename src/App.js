import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HearingSheet from "./HearingSheet";
import Chat from "./pages/Chat/Chat";
import ReservationPage from "./pages/ReservationPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hearing-sheet" element={<HearingSheet />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/reservation" element={<ReservationPage />} />
    </Routes>
  );
}

export default App;
