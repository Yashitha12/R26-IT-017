import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { Toast } from "./components/common/Toast";
import Sidebar from "./components/Sidebar";

import { UserRegistration } from "./pages/UserRegistration";
import { IdentityKYC } from "./pages/identityKYC";
import { WelfareServices } from "./pages/WelfareServices";
import { Inspector } from "./pages/Inspector";

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
import Login from "./pages/Login";

const DashboardLayout = ({ children }) => {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area" style={{ flex: 1, minHeight: '100vh', padding: '0 0 40px' }}>
        {children}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Toast />

      <Routes>
        {/* 4-Step Citizen Registration Flow (Clean Full Page) */}
        <Route path="/" element={<UserRegistration />} />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/login" element={<Login />} />

        {/* Resident Portal Pages with Sidebar Navigation */}
        <Route path="/identity" element={<IdentityKYC />} />
        <Route path="/dashboard" element={<DashboardLayout><Home /></DashboardLayout>} />
        <Route path="/home" element={<DashboardLayout><Home /></DashboardLayout>} />
        <Route path="/loan-programs" element={<DashboardLayout><LoanPrograms /></DashboardLayout>} />
        <Route path="/apply" element={<DashboardLayout><LoanApplication /></DashboardLayout>} />
        <Route path="/loan-application" element={<DashboardLayout><LoanApplication /></DashboardLayout>} />
        <Route path="/loan-result" element={<DashboardLayout><LoanResult /></DashboardLayout>} />
        <Route path="/welfare" element={<DashboardLayout><WelfareServices /></DashboardLayout>} />
        <Route path="/welfare-services" element={<DashboardLayout><WelfareServices /></DashboardLayout>} />
        <Route path="/welfare-apply" element={<DashboardLayout><WelfareApplication /></DashboardLayout>} />
        <Route path="/welfare-landing" element={<DashboardLayout><WelfareLanding /></DashboardLayout>} />
        <Route path="/welfare-result" element={<DashboardLayout><WelfareResult /></DashboardLayout>} />
        <Route path="/wallet" element={<DashboardLayout><Wallet /></DashboardLayout>} />
        <Route path="/status" element={<DashboardLayout><Status /></DashboardLayout>} />
        <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
        <Route path="/ai-chat" element={<DashboardLayout><AIChat /></DashboardLayout>} />
        <Route path="/inspector" element={<DashboardLayout><Inspector /></DashboardLayout>} />


        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}