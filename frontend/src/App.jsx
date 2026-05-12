import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoanPrograms from "./pages/LoanPrograms";
import LoanApplication from "./pages/LoanApplication";
import LoanResult from "./pages/LoanResult";
import AdminApplicantReview from "./pages/AdminApplicantReview";
import Wallet from "./pages/Wallet";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoanPrograms />} />
        <Route path="/loan-application" element={<LoanApplication />} />
        <Route path="/loan-result" element={<LoanResult />} />
        <Route path="/admin-review" element={<AdminApplicantReview />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </BrowserRouter>
  );
}