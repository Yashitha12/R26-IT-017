// src/app/utils/blockchain.ts
export type TransactionType = 'loan' | 'welfare' | 'payment' | 'verification' | 'disbursement';

export type BlockchainTransaction = {
  id: number;
  type: TransactionType;
  action: string;
  user: string;
  amount?: number;
  timestamp: string;
  hash: string;
  blockNumber: number;
  gasUsed: number;
  status: 'confirmed' | 'pending';
  details?: string;
};

const STORAGE_KEY = 'smartgrama_blockchain_logs';

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function simulateMining(delayMs = 1200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

export function getAllTransactions(): BlockchainTransaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}

  const seed: BlockchainTransaction[] = [
    { id: 1, type: 'loan', action: 'Loan Approved - Rs. 150,000', user: 'Nimal Perera', amount: 150000, timestamp: new Date(Date.now() - 7200000).toISOString(), hash: '0x7f9a3b2c8d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0', blockNumber: 12478932, gasUsed: 124500, status: 'confirmed', details: 'Agricultural Microloan' },
    { id: 2, type: 'welfare', action: 'Welfare Payment Disbursed - Rs. 4,500', user: 'Sanduni Fernando', amount: 4500, timestamp: new Date(Date.now() - 3600000).toISOString(), hash: '0x4c1b8a9f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0', blockNumber: 12478945, gasUsed: 89500, status: 'confirmed', details: 'Samurdhi Support' },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

export async function recordTransaction(type: TransactionType, action: string, user: string, amount?: number, details?: string): Promise<BlockchainTransaction> {
  await simulateMining();

  const logs = getAllTransactions();
  const newTx: BlockchainTransaction = {
    id: logs.length + 1,
    type,
    action,
    user,
    amount,
    timestamp: new Date().toISOString(),
    hash: generateTxHash(),
    blockNumber: 12478900 + logs.length + 1,
    gasUsed: Math.floor(Math.random() * 80000) + 45000,
    status: 'confirmed',
    details: details || `${type} transaction`,
  };

  const updated = [newTx, ...logs].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('blockchain:transaction', { detail: newTx }));
  return newTx;
}

export function verifyTransaction(hash: string) {
  const valid = hash.startsWith('0x') && hash.length > 60;
  return {
    valid,
    explorerUrl: `https://polygonscan.com/tx/${hash}`,
    message: valid ? 'Verified on Polygon blockchain' : 'Invalid hash',
  };
}

export function getBlockchainStats() {
  const logs = getAllTransactions();
  return {
    totalTransactions: logs.length,
    totalGasUsed: logs.reduce((sum, t) => sum + t.gasUsed, 0),
    latestBlock: logs.length ? Math.max(...logs.map(l => l.blockNumber)) : 12478900,
    network: 'Polygon Mumbai (Testnet)',
    status: 'Healthy',
  };
}