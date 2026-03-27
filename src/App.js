import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat/Chat";
import HearingSheet from "./HearingSheet";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hearing-sheet" element={<HearingSheet />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}

export default App;
