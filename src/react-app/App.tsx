import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import HospitalDashboard from "./pages/HospitalDashboard";
import DonateBlood from "./pages/DonateBlood";
import AuthCallback from "./pages/AuthCallback";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/donate" element={<DonateBlood />} />
            <Route path="/hospital" element={<HospitalDashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
