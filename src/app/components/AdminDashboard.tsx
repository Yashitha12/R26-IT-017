import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Users, TrendingUp, Gift, FileText, Activity, Clock, ExternalLink, CheckCircle, X } from 'lucide-react';
import { getAllTransactions, recordTransaction, verifyTransaction, getBlockchainStats, BlockchainTransaction } from '../utils/blockchain';

export default function AdminDashboard() {
  const [logs, setLogs] = useState<BlockchainTransaction[]>(getAllTransactions());
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const stats = getBlockchainStats();

  useEffect(() => {
    const handleNew = (e: any) => setLogs(prev => [e.detail, ...prev]);
    window.addEventListener('blockchain:transaction', handleNew);
    const i = setInterval(() => setLogs(getAllTransactions()), 30000);
    return () => { window.removeEventListener('blockchain:transaction', handleNew); clearInterval(i); };
  }, []);

  const verify = async (tx: BlockchainTransaction) => {
    setSelectedTx(tx);
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 700));
    setVerificationResult(verifyTransaction(tx.hash));
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-purple-900/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Admin Control Center</h2>
        </div>
        <p className="text-purple-100">On-chain Audit Dashboard</p>
      </div>

      <div className="px-4">
        {/* Blockchain Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-purple-200">
            <p className="text-3xl font-bold text-purple-600">{stats.totalTransactions}</p>
            <p className="text-sm text-gray-600 mt-1 font-medium">On-Chain Transactions</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-purple-200">
            <p className="text-3xl font-bold text-blue-600">{stats.totalGasUsed.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1 font-medium">Total Gas Used</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-purple-200">
            <p className="text-3xl font-bold text-green-600">#{stats.latestBlock.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1 font-medium">Latest Block</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-purple-200">
            <button onClick={() => recordTransaction('loan', 'Test Transaction', 'Demo User', 100000)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold w-full shadow-lg shadow-blue-500/30 active:scale-95 transition-all">
              Record Test Tx
            </button>
          </div>
        </div>

        {/* Blockchain Log */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Live Blockchain Log</h3>
            <span className="text-xs text-green-600 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="bg-gray-900 rounded-2xl p-5 max-h-[420px] overflow-auto space-y-3 shadow-xl">
            {logs.map(log => (
              <div key={log.id} onClick={() => verify(log)} className="bg-gray-800 p-4 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700">
                <div className="flex justify-between mb-2">
                  <span className="text-white text-sm font-semibold">{log.action}</span>
                  <span className="text-xs text-gray-400">#{log.blockNumber}</span>
                </div>
                <div className="text-xs text-blue-400 font-mono mt-1">{log.hash}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Modal */}
        {selectedTx && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50">
            <div className="bg-white w-full max-w-md p-6 rounded-t-3xl shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Verify Transaction</h3>
                <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-700" /></button>
              </div>
              <p className="font-mono text-sm break-all text-gray-600 bg-gray-50 p-4 rounded-xl mb-4">{selectedTx.hash}</p>
              {verificationResult && (
                <a href={verificationResult.explorerUrl} target="_blank" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 transition-all">
                  View on PolygonScan <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}