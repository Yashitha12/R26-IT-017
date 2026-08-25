export default function KYCChecking() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '40px', backgroundColor: 'white', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <i className="fa-solid fa-id-card-clip" style={{ fontSize: '48px', color: '#3b82f6', marginBottom: '20px' }}></i>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>KYC & DID Verification</h2>
        <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          This module is under construction. Soon, you will be able to verify user identity documents, review Decentralized Identifiers (DID), and conduct background KYC checks.
        </p>
      </div>
    </div>
  );
}
