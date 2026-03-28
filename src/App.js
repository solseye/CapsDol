import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HearingSheet from "./HearingSheet";
import Chat from "./pages/Chat/Chat";

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
