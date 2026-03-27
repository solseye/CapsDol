import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import Sheet from "./Hearingsheet";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/hearing-sheet" element={<Sheet />} />
      </Routes>
    </BrowserRouter>
  );
}
