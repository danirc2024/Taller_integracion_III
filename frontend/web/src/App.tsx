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
import ProductDetail from "./pages/ProductDetail";
import { MainLayout } from "./layouts/MainLayout";
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <CartProvider>
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
          <Route path="/product/:id" element={<ProductDetail />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
    </CartProvider>
  );
}

export default App;
