import { useState } from 'react';
import { ArrowLeft, TrendingUp, Calculator, CheckCircle, Info } from 'lucide-react';
import { recordTransaction } from '../utils/blockchain';

export default function LoanApplication({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'info' | 'form' | 'result'>('info');
  const [loanAmount, setLoanAmount] = useState('150000');
  const [duration, setDuration] = useState('48');
  const [purpose, setPurpose] = useState('');

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const months = parseInt(duration);
    const rate = 0.12 / 12;
    const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return Math.round(emi);
  };

  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
          <h2 className="font-bold text-gray-800">Loan Information</h2>
        </div>
        <div className="p-4">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 text-white mb-6 shadow-xl shadow-blue-900/20">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Microloan Program</h3>
            <p className="text-blue-100 text-base">Get quick access to funds for your agricultural needs</p>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-">
            <h4 className="font-bold text-gray-800 mb-4">Why Choose Us?</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Quick Approval</p>
                  <p className="text-sm text-gray-500">Get approved within 24-48 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Low Interest Rates</p>
                  <p className="text-sm text-gray-500">Starting from 12% APR</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Flexible Terms</p>
                  <p className="text-sm text-gray-500">Repayment up to 48 months</p>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => setStep('form')} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/30 active:scale-95 transition-all duration-200">
            Apply Now
          </button>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center gap-3">
          <button onClick={() => setStep('info')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
          <h2 className="font-bold text-gray-800">Loan Application</h2>
        </div>
        <div className="p-4">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Amount (Rs.)</label>
              <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white" placeholder="Enter amount" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Months)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white" placeholder="Enter duration" />
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200 shadow-md">
              <p className="text-sm font-semibold text-gray-600 mb-1">Estimated Monthly EMI</p>
              <p className="text-3xl font-bold text-purple-700">Rs. {calculateEMI().toLocaleString()}</p>
              <div className="mt-2 pt-2 border-t border-purple-200">
                <p className="text-xs text-gray-500">Interest Rate: 12% APR</p>
              </div>
            </div>
          </div>

          <button onClick={() => setStep('result')} className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/30 active:scale-95 transition-all duration-200">
            Submit Application
          </button>
        </div>
      </div>
    );
  }

  // Result Step
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
        <h2 className="font-bold text-gray-800">Evaluation Result</h2>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-green-600 mb-2">Approved!</h3>
          <p className="text-gray-600 text-base mb-6">Your loan has been recorded on blockchain.</p>
          
          <div className="bg-green-50 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
            <p className="text-2xl font-bold text-green-700">Rs. {parseInt(loanAmount).toLocaleString()}</p>
          </div>

          <button 
            onClick={async () => {
              await recordTransaction('loan', `Loan Approved - Rs. ${loanAmount}`, 'Nimal Perera', parseInt(loanAmount));
              onBack();
            }}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-500/30 active:scale-95 transition-all duration-200"
          >
            Accept & Record on Blockchain
          </button>
        </div>
      </div>
    </div>
  );
}