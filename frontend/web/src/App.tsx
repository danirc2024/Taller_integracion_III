import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Chatbot from "./pages/Chatbot";
import RouteViewer from "./pages/RouteViewer";
import Profile from "./pages/Profile";
import Crowdsourcing from "./pages/Crowdsourcing";
import History from "./pages/History";
import { MainLayout } from "./layouts/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/route" element={<RouteViewer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/colaborador" element={<Crowdsourcing />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
