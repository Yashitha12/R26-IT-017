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
import AdminApplicantReview from "./pages/AdminApplicantReview";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loan-programs" element={<LoanPrograms />} />
            <Route path="/apply" element={<LoanApplication />} />
            <Route path="/loan-application" element={<LoanApplication />} />
            <Route path="/loan-result" element={<LoanResult />} />
            <Route path="/welfare" element={<WelfareLanding />} />
            <Route path="/welfare-apply" element={<WelfareApplication />} />
            <Route path="/welfare-result" element={<WelfareResult />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/status" element={<Status />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/admin" element={<AdminApplicantReview />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}