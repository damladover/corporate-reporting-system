import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import MyReports from "./components/MyReports"; // Yeni bileşeni içe aktardık

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Şeflerin ve mühendislerin kendi raporlarını görebileceği yeni rota */}
        <Route path="/my-reports" element={<MyReports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
