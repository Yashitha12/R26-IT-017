import { useState } from 'react';
import { TrendingUp, Gift, Wallet, User, MessageCircle, Clock, ArrowRight } from 'lucide-react';
import LoanApplication from './LoanApplication';
import WelfareApplication from './WelfareApplication';

type ViewType = 'dashboard' | 'loan' | 'welfare';

export default function ResidentDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  if (currentView === 'loan') return <LoanApplication onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'welfare') return <WelfareApplication onBack={() => setCurrentView('dashboard')} />;

  return (
    <div className="p-4 pb-20">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-blue-900/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Welcome back,</p>
            <h2 className="text-2xl font-bold mt-1">Nimal Perera</h2>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mt-4">
          <p className="text-blue-100 text-xs font-medium mb-1">Total Balance</p>
          <p className="text-3xl font-bold">Rs. 12,500</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={() => setCurrentView('loan')} className="bg-white p-5 rounded-2xl shadow-lg shadow-gray-200/50 active:scale-95 transition-all duration-200 hover:shadow-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <p className="font-semibold text-gray-800">Apply Loan</p>
          <p className="text-xs text-gray-500 mt-1">Quick funding</p>
        </button>
        <button onClick={() => setCurrentView('welfare')} className="bg-white p-5 rounded-2xl shadow-lg shadow-gray-200/50 active:scale-95 transition-all duration-200 hover:shadow-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/30">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <p className="font-semibold text-gray-800">Apply Welfare</p>
          <p className="text-xs text-gray-500 mt-1">Government aid</p>
        </button>
        <button onClick={() => onNavigate('wallet')} className="bg-white p-5 rounded-2xl shadow-lg shadow-gray-200/50 active:scale-95 transition-all duration-200 hover:shadow-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <p className="font-semibold text-gray-800">My Wallet</p>
          <p className="text-xs text-gray-500 mt-1">View balance</p>
        </button>
        <button onClick={() => onNavigate('profile')} className="bg-white p-5 rounded-2xl shadow-lg shadow-gray-200/50 active:scale-95 transition-all duration-200 hover:shadow-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
            <User className="w-6 h-6 text-white" />
          </div>
          <p className="font-semibold text-gray-800">My Profile</p>
          <p className="text-xs text-gray-500 mt-1">Account info</p>
        </button>
      </div>

      {/* Recent Applications */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Recent Applications</h3>
          <button onClick={() => onNavigate('status')} className="text-blue-600 text-sm font-medium">View All</button>
        </div>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">Agricultural Microloan</p>
                    <p className="text-xs text-gray-500 mt-1">Apr 10, 2026</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">Approved</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600">Rs. 150,000 • EMI: Rs. 3,750/month</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">Samurdhi Welfare</p>
                    <p className="text-xs text-gray-500 mt-1">May 5, 2026</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">Under Review</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600">Monthly support • Rs. 4,500</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Button */}
      <button onClick={() => onNavigate('chat')} className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 rounded-2xl shadow-xl shadow-purple-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all duration-200 hover:shadow-2xl">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <MessageCircle className="w-5 h-5" />
        </div>
        <span className="font-semibold">Ask AI Assistant</span>
        <ArrowRight className="w-5 h-5 ml-auto" />
      </button>
    </div>
  );
}