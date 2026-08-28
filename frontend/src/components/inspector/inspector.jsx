import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const Inspector = () => {
  const { activeVerifiedDid, activeVerificationId, showToast } = useApp();
  const [inspectQuery, setInspectQuery] = useState(activeVerifiedDid || 'did:smartgrama:prototype:001');
  const [inspectedData, setInspectedData] = useState({
    did: 'did:smartgrama:prototype:001',
    document: {
      '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/ed25519-2020/v1'],
      id: 'did:smartgrama:prototype:001',
      controller: 'did:smartgrama:officer:prototype-001',
      verificationMethod: [
        {
          id: 'did:smartgrama:prototype:001#key-1',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:smartgrama:prototype:001',
          publicKeyMultibase: 'z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwW5DmpxF',
        },
      ],
      authentication: ['did:smartgrama:prototype:001#key-1'],
      assertionMethod: ['did:smartgrama:prototype:001#key-1'],
    },
    blockchainAnchor: {
      network: 'SmartGrama Private POA / Hedera Testnet',
      blockHeight: 1482091,
      txHash: '0x8f4d92a10c9e7821bcda093845bfa348e34892c9438902beaf41984729384bc1',
      timestamp: new Date().toISOString(),
      merkleRoot: '0x19a84b39c084192bfe34827103984faedb47281928374910293847293847289a',
      consensusStatus: 'FINALIZED',
    },
  });

  const handleInspect = () => {
    showToast(`Inspected cryptographic ledger for ${inspectQuery}`);
  };

  return (
    <section className="portal-pane active">
      <div className="welfare-header-card">
        <div className="welfare-header-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          SmartGrama Cryptographic Explorer
        </div>
        <h1 className="welfare-main-title">Decentralized Identity &amp; Audit Inspector</h1>
        <p className="welfare-main-desc">
          Query W3C Decentralized Identifiers (DIDs), verifiable credential cryptographic proofs, and blockchain immutable state transitions in real time.
        </p>
      </div>

      {/* Query Bar */}
      <div
        className="figma-card"
        style={{
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          className="figma-input"
          value={inspectQuery}
          onChange={(e) => setInspectQuery(e.target.value)}
          placeholder="Enter DID, Verification ID, or Tx Hash..."
          style={{ flex: 1, minWidth: '280px', marginBottom: 0 }}
        />
        <button
          type="button"
          className="btn-continue"
          style={{ maxWidth: '160px', padding: '12px 24px' }}
          onClick={handleInspect}
        >
          🔍 Inspect
        </button>
      </div>

      {/* Grid: DID Document + Blockchain Anchor Proof */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Left: W3C DID Document */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '24px',
            color: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#38bdf8' }}>
              📜 W3C DID Document
            </h3>
            <span className="status-pill" style={{ background: '#0284c7', color: '#fff' }}>
              RESOLVED
            </span>
          </div>

          <pre
            style={{
              background: '#020617',
              padding: '16px',
              borderRadius: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.8rem',
              color: '#a5f3fc',
              overflowX: 'auto',
              border: '1px solid #1e293b',
            }}
          >
            {JSON.stringify(inspectedData.document, null, 2)}
          </pre>
        </div>

        {/* Right: Blockchain Proof */}
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '24px',
            color: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#c084fc' }}>
              ⛓️ Blockchain Ledger Proof
            </h3>
            <span className="status-pill" style={{ background: '#10b981', color: '#fff' }}>
              ✓ FINALIZED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>NETWORK</span>
              <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{inspectedData.blockchainAnchor.network}</div>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>TRANSACTION HASH</span>
              <div style={{ fontFamily: 'monospace', color: '#38bdf8', wordBreak: 'break-all' }}>
                {inspectedData.blockchainAnchor.txHash}
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>MERKLE ROOT</span>
              <div style={{ fontFamily: 'monospace', color: '#a855f7', wordBreak: 'break-all' }}>
                {inspectedData.blockchainAnchor.merkleRoot}
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>BLOCK HEIGHT &amp; TIME</span>
              <div style={{ color: '#e2e8f0' }}>
                #{inspectedData.blockchainAnchor.blockHeight} &bull; {inspectedData.blockchainAnchor.timestamp}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
