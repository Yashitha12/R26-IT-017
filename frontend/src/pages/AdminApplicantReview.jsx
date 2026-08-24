import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function AdminApplicantReview() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/applications/all")
      .then(res => res.json())
      .then(data => {
        setApplications(data.loans || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header title="Admin Dashboard" />

      <main className="content-container">
        
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header bg-gray-50 m-0" style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 className="card-title m-0 text-xl text-gray-800">Pending Loan Applications</h2>
            <div className="flex gap-2">
              <span className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-1.5 rounded-full cursor-pointer">Loans</span>
              <span className="bg-white border border-gray-300 text-gray-600 text-sm font-bold px-4 py-1.5 rounded-full cursor-pointer hover:bg-gray-50 transition">Welfare</span>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            {loading ? (
              <p className="text-center text-gray-500 py-10 text-lg">Loading applications...</p>
            ) : applications.length === 0 ? (
              <div className="bg-gray-50 p-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-lg">
                No pending applications for review.
              </div>
            ) : (
              <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                {applications.map((app, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-white">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 mb-1">{app.applicant_name}</h3>
                        <p className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">DID: {app.did}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-200">HITL Review</span>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-6">
                      <div className="flex justify-between mb-3 text-sm">
                        <span className="text-gray-500">Loan Type:</span>
                        <span className="font-bold text-gray-800">{app.loan_type}</span>
                      </div>
                      <div className="flex justify-between mb-3 text-sm">
                        <span className="text-gray-500">AI Risk Evaluation:</span>
                        <span className={`font-bold ${app.risk_level === 'Low Risk' ? 'text-green-600' : 'text-orange-600'}`}>
                          {app.risk_level}
                        </span>
                      </div>
                      <div className="flex justify-between mb-3 text-sm">
                        <span className="text-gray-500">AI Recommendation:</span>
                        <span className="font-bold text-gray-800">{app.decision}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                        <span className="text-gray-500 font-medium">Approved Cap:</span>
                        <span className="font-bold text-blue-600 text-lg">Rs. {app.approved_amount?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Blockchain Consensus Status</h4>
                      <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-3 rounded-lg font-mono flex flex-col gap-2">
                        <span className="font-bold text-green-700 flex items-center gap-2">
                          <i className="fa-solid fa-link"></i> {app.consensus_status}
                        </span>
                        <span className="break-all opacity-80">Tx: {app.tx_hash}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-auto">
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-sm">
                        Final Approve
                      </button>
                      <button className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold py-3 px-4 rounded-xl transition">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </>
  );
}