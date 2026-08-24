import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { fetchBlockchainLedger } from "../api/loanApi";

export default function Status() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const ledgerData = await fetchBlockchainLedger();
        setApplications(ledgerData.ledger || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <Header title="Application Status" />

      <main className="content-container">
        
        <div className="card" style={{ padding: 40 }}>
          <h2 className="card-title mb-8 text-2xl">Blockchain Application Tracker</h2>
          
          {loading ? (
            <div className="text-center text-gray my-10">Loading status tracking...</div>
          ) : applications.length === 0 ? (
            <div className="bg-gray-50 p-10 rounded-xl text-center text-gray-500">
              No recent applications found.
              <button className="primary-btn mt-6" onClick={() => navigate("/loan-programs")}>Apply for a Loan</button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {applications.map((app, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 flex">
                  
                  {/* Left: Summary */}
                  <div className="bg-gray-50 p-8 border-r border-gray-200" style={{ width: 350 }}>
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-gray-800 text-lg">{app.loan_type || "Loan Application"}</span>
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                        {app.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-500">Requested Amount:</span>
                      <span className="font-bold text-gray-800 text-base">Rs. {app.approved_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Applied On:</span>
                      <span className="font-semibold text-gray-800">{app.timestamp.split(" ")[0]}</span>
                    </div>
                  </div>
                  
                  {/* Right: Timeline */}
                  <div className="p-8 flex-1">
                    <h3 className="font-bold mb-6 text-gray-600">Verification Timeline</h3>
                    <div className="tracking-timeline ml-2">
                      <div className="flex items-start mb-6">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm mr-4 z-10"><i className="fa-solid fa-check"></i></div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold">Submitted & AI Evaluated</h4>
                          <p className="text-sm text-gray-500 mt-1">{app.timestamp}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start mb-6 relative">
                        <div className="absolute top-[-35px] left-[15px] w-[2px] h-[50px] bg-green-500 z-0"></div>
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm mr-4 z-10"><i className="fa-solid fa-link"></i></div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold">Anchored on Blockchain Ledger</h4>
                          <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded mt-2 inline-block">Tx Hash: {app.tx_hash}</p>
                        </div>
                      </div>

                      <div className="flex items-start relative">
                         <div className="absolute top-[-35px] left-[15px] w-[2px] h-[50px] bg-gray-200 z-0"></div>
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm mr-4 z-10"><i className="fa-solid fa-user-tie"></i></div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold">Officer Approved (HITL)</h4>
                          <p className="text-sm text-gray-500 mt-1">Funds disbursed to DID Wallet</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
