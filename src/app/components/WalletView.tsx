import { ArrowLeft, Wallet, TrendingUp, Gift, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function WalletView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="font-bold text-gray-800">My Wallet</h2>
      </div>

      <div className="p-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-purple-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm font-medium">Total Balance</p>
              <h3 className="text-3xl font-bold">Rs. 12,500</h3>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-xs text-purple-100 font-medium mb-1">Savings</p>
              <p className="text-xl font-bold">Rs. 8,000</p>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-xs text-purple-100 font-medium mb-1">Welfare</p>
              <p className="text-xl font-bold">Rs. 4,500</p>
            </div>
          </div>
        </div>

        {/* Active Loans */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Active Loans</h3>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Agricultural Microloan</p>
                <p className="text-xs text-gray-500 mt-1">Approved on Apr 15, 2026</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Loan Amount</span>
                <span className="font-semibold text-gray-800">Rs. 150,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining Balance</span>
                <span className="font-semibold text-orange-600">Rs. 142,500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Installment</span>
                <span className="font-semibold text-gray-800">Rs. 3,750</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span className="font-medium">Repayment Progress</span>
                <span className="font-medium">2/48 months</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-green-600 w-[5%] rounded-full"></div>
              </div>
            </div>

            <div className="flex justify-between text-sm pt-4 border-t border-gray-100">
              <span className="text-gray-600">Next Payment</span>
              <span className="font-semibold text-blue-600">June 1, 2026</span>
            </div>
          </div>
        </div>

        {/* Welfare Support */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Welfare Support</h3>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Monthly Samurdhi Support</p>
                <p className="text-xs text-gray-500 mt-1">Active since Jan 2026</p>
              </div>
            </div>
            <div className="space-y-3 text-sm pt-4 border-t border-green-200">
              <div className="flex justify-between"><span className="text-gray-600">Monthly Amount</span><span className="font-semibold text-green-600">Rs. 4,500</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Last Payment</span><span className="text-gray-800">May 1, 2026</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Next Payment</span><span className="font-semibold text-green-600">June 1, 2026</span></div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><ArrowDownRight className="w-5 h-5 text-green-600" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Welfare Payment</p>
                <p className="text-xs text-gray-500 mt-1">May 1, 2026</p>
              </div>
              <span className="text-sm font-bold text-green-600">+Rs. 4,500</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><ArrowUpRight className="w-5 h-5 text-red-600" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Loan Repayment</p>
                <p className="text-xs text-gray-500 mt-1">May 1, 2026</p>
              </div>
              <span className="text-sm font-bold text-red-600">-Rs. 3,750</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}