import { BrowserRouter, Routes, Route } from "react-router-dom";
import Departments from "./pages/Departments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Departments />} />
        <Route path="/departments" element={<Departments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;