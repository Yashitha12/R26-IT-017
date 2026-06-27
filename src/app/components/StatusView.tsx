import { ArrowLeft, CheckCircle, Clock, XCircle, TrendingUp, Gift } from 'lucide-react';

export default function StatusView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="font-bold text-gray-800">Application Status</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Approved */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-green-200">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800">Agricultural Microloan</h3>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-500">Applied on Apr 10, 2026</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <p className="font-bold text-green-900 mb-2">Status: Approved</p>
            <div className="space-y-1 text-sm text-gray-700">
              <p>• Approved Amount: Rs. 150,000</p>
              <p>• Monthly EMI: Rs. 3,750</p>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-yellow-200">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800">Samurdhi Welfare Support</h3>
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-500">Applied on May 5, 2026</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4">
            <p className="font-bold text-yellow-900">Status: Under Review</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 opacity-75">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800">Business Expansion Loan</h3>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-sm text-gray-500">Applied on Dec 10, 2025</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4">
            <p className="font-bold text-red-900">Status: Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
}