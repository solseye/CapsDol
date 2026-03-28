import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HearingSheet from "./HearingSheet";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hearing-sheet" element={<HearingSheet />} />
    </Routes>
  );
}

export default App;
