import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import LoanPrograms from "./pages/LoanPrograms";
import LoanApplication from "./pages/LoanApplication";
import LoanResult from "./pages/LoanResult";
import WelfareLanding from "./pages/WelfareLanding";
import WelfareApplication from "./pages/WelfareApplication";
import WelfareResult from "./pages/WelfareResult";
import Wallet from "./pages/Wallet";
import Status from "./pages/Status";
import Profile from "./pages/Profile";
import AIChat from "./pages/AIChat";

import Register from "./pages/Register";
import Login from "./pages/Login";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-area">
          <Routes>
            {/* Public Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/loan-programs" element={<ProtectedRoute><LoanPrograms /></ProtectedRoute>} />
            <Route path="/apply" element={<ProtectedRoute><LoanApplication /></ProtectedRoute>} />
            <Route path="/loan-application" element={<ProtectedRoute><LoanApplication /></ProtectedRoute>} />
            <Route path="/loan-result" element={<ProtectedRoute><LoanResult /></ProtectedRoute>} />
            <Route path="/welfare" element={<ProtectedRoute><WelfareLanding /></ProtectedRoute>} />
            <Route path="/welfare-apply" element={<ProtectedRoute><WelfareApplication /></ProtectedRoute>} />
            <Route path="/welfare-result" element={<ProtectedRoute><WelfareResult /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/status" element={<ProtectedRoute><Status /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}