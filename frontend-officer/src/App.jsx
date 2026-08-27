import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ManagePrograms from "./pages/ManagePrograms";
import WelfareManagement from "./pages/WelfareManagement";
import KYCChecking from "./pages/KYCChecking";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import OfficerManagement from "./pages/OfficerManagement";

const ProtectedLayout = ({ children }) => {
  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/login" replace />;

  const officerData = JSON.parse(localStorage.getItem("officer_data") || "{}");

  return (
    <div style={{ display: 'flex', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Sidebar officerData={officerData} />
      <div style={{ flex: 1, marginLeft: '280px' }}>
        <header style={{ padding: '24px 32px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>System Dashboard</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#4b5563' }}>Hi, {officerData.name || 'Officer'}</span>
            <button 
              onClick={() => {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("officer_data");
                window.location.href = "/login";
              }}
              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Logout
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/register" element={<AdminRegister />} />
      
      <Route path="/*" element={
        <ProtectedLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/manage" element={<ManagePrograms />} />
            <Route path="/welfare" element={<WelfareManagement />} />
            <Route path="/kyc" element={<KYCChecking />} />
            <Route path="/officers" element={<OfficerManagement />} />
          </Routes>
        </ProtectedLayout>
      } />
    </Routes>
  );
}
