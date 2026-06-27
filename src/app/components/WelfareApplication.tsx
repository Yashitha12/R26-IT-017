import { useState } from 'react';
import { ArrowLeft, Gift, CheckCircle } from 'lucide-react';
import { recordTransaction } from '../utils/blockchain';

export default function WelfareApplication({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'info' | 'form' | 'result'>('info');
  const [familySize, setFamilySize] = useState('4');

  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
          <h2 className="font-bold text-gray-800">Welfare Information</h2>
        </div>
        <div className="p-4">
          <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-3xl p-8 text-white mb-6 shadow-xl shadow-green-900/20">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Welfare Support Program</h3>
            <p className="text-green-100 text-base">Government assistance for eligible families</p>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-">
            <h4 className="font-bold text-gray-800 mb-4">Program Benefits</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Monthly Support</p>
                  <p className="text-sm text-gray-500">Up to Rs. 5,000 per month</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Quick Verification</p>
                  <p className="text-sm text-gray-500">Fast eligibility check</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Direct Transfer</p>
                  <p className="text-sm text-gray-500">Bank transfer disbursement</p>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => setStep('form')} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-500/30 active:scale-95 transition-all duration-200">
            Apply for Welfare
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
          <h2 className="font-bold text-gray-800">Welfare Application</h2>
        </div>
        <div className="p-4">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Family Size</label>
              <input type="number" value={familySize} onChange={e => setFamilySize(e.target.value)} className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white" placeholder="Number of family members" />
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-md">
              <p className="text-sm font-semibold text-gray-600 mb-1">Eligibility Note</p>
              <p className="text-sm text-gray-500">Families with 4+ members may qualify for additional support</p>
            </div>
          </div>
          <button onClick={() => setStep('result')} className="mt-8 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-500/30 active:scale-95 transition-all duration-200">
            Submit Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
        <h2 className="font-bold text-gray-800">Application Result</h2>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-green-600 mb-2">Eligible!</h3>
          <p className="text-gray-600 text-base mb-6">You qualify for welfare support program.</p>
          
          <div className="bg-green-50 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-1">Monthly Support Amount</p>
            <p className="text-2xl font-bold text-green-700">Rs. 4,500</p>
          </div>

          <button 
            onClick={async () => {
              await recordTransaction('welfare', 'Welfare Payment Disbursed - Rs. 4,500', 'Nimal Perera', 4500);
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