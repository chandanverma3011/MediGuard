import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./Context/ThemeContext";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login"; // Keeping for reference or direct access if needed, but Landing is main
import Dashboard from "./Pages/Dashboard";
import Medicines from "./Pages/Medicines";
import Batches from "./Pages/Batches";
import Sales from "./Pages/Sales";
import Analytics from "./Pages/Analytics";
import Disposals from "./Pages/Disposals";
import PricingAudit from "./Pages/PricingAudit";
import Users from "./Pages/Users";
import LossForecast from "./Pages/LossForecast";
import Features from "./Pages/Features";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import NotFound from "./Pages/NotFound";
import ResetPassword from "./Pages/ResetPassword";
import ForgotPassword from "./Pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/disposals" element={<Disposals />} />
            <Route path="/pricing" element={<PricingAudit />} />
            <Route path="/forecast" element={<LossForecast />} />
            <Route path="/users" element={<Users />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
