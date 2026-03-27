import { Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import HearingSheet from "./HearingSheet";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/hearing-sheet" element={<HearingSheet />} />
    </Routes>
  );
}

export default App;