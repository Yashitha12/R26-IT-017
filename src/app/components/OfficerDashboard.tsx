import { useState } from 'react';
import { FileText, CheckCircle, XCircle, AlertTriangle, Eye, TrendingUp, Gift, User } from 'lucide-react';

type Application = {
  id: number;
  type: 'loan' | 'welfare';
  name: string;
  nic: string;
  amount: number;
  date: string;
  status: 'pending';
  riskLevel?: 'low' | 'medium' | 'high';
};

export default function OfficerDashboard() {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const applications: Application[] = [
    { id: 1, type: 'loan', name: 'Kamal Silva', nic: '199012345678', amount: 200000, date: 'May 8, 2026', status: 'pending', riskLevel: 'low' },
    { id: 2, type: 'welfare', name: 'Sanduni Fernando', nic: '198756789012', amount: 4500, date: 'May 7, 2026', status: 'pending' },
    { id: 3, type: 'loan', name: 'Ranjith Kumar', nic: '198534567890', amount: 150000, date: 'May 6, 2026', status: 'pending', riskLevel: 'medium' },
  ];

  if (selectedApp) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center gap-3">
          <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-700">
            <FileText className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-gray-800">Application Review</h2>
        </div>
        
        <div className="p-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">{selectedApp.name}</h3>
                <p className="text-sm text-gray-500 mt-1">NIC: {selectedApp.nic}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Amount</p>
                <p className="font-bold text-gray-800">Rs. {selectedApp.amount.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="font-bold text-gray-800 capitalize">{selectedApp.type}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all">
              <CheckCircle className="w-6 h-6" /> Approve Application
            </button>
            <button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all">
              <AlertTriangle className="w-6 h-6" /> Request More Info
            </button>
            <button className="w-full bg-white border-2 border-red-300 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all">
              <XCircle className="w-6 h-6" /> Reject Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-indigo-900/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Officer Dashboard</h2>
        </div>
        <p className="text-blue-100">Review and process applications</p>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 text-center shadow-lg border border-yellow-200">
            <p className="text-3xl font-bold text-blue-600">8</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Pending</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center shadow-lg border border-green-200">
            <p className="text-3xl font-bold text-green-600">24</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Approved</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center shadow-lg border border-red-200">
            <p className="text-3xl font-bold text-red-600">3</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Rejected</p>
          </div>
        </div>

        <h3 className="font-bold text-gray-800 mb-4">Pending Applications</h3>
        <div className="space-y-4 pb-20">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-yellow-500">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-800">{app.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{app.date}</p>
                </div>
                {app.riskLevel && <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">{app.riskLevel.toUpperCase()}</span>}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">Amount: <span className="font-bold text-gray-800">Rs. {app.amount.toLocaleString()}</span></p>
                  <p className="text-sm text-gray-600 capitalize">Type: <span className="font-bold text-gray-800">{app.type}</span></p>
                </div>
                <button onClick={() => setSelectedApp(app)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 transition-all">
                  <Eye className="w-4 h-4" /> Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}