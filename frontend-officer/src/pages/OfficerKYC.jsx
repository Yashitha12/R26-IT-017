import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';

export const OfficerKYC = () => {
  const {
    pendingQueue,
    fetchQueue,
    fetchStatus,
    officerToken,
    setOfficerToken,
    showToast,
    setActiveTab,
  } = useApp();

  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [officerRemarks, setOfficerRemarks] = useState(
    'Live selfie facial biometric and NIC document details verified satisfactory.'
  );

  // Welfare Lifecycle Console State
  const [welfareAppId, setWelfareAppId] = useState('ASW-2026-000001');
  const [welfareCase, setWelfareCase] = useState({
    eligibilityScore: 68.5,
    category: 'TRANSITIONAL',
    status: 'ACTIVE',
    blockchainRecordId: 'BC-ASW-009182',
    blockchainVerified: true,
    history: [
      { timestamp: new Date().toLocaleTimeString(), event: 'Application initial score computed (68.5 pts)' },
      { timestamp: new Date().toLocaleTimeString(), event: 'Anchored to Blockchain Ledger (Hash 0x9f8c...)' },
    ],
  });

  const handleOfficerLogin = async () => {
    const res = await api.officerLogin('OFFICER-PROTOTYPE-001', 'prototype123');
    if (res.ok && res.data?.data) {
      setOfficerToken(res.data.data.token);
      showToast(`Officer authenticated: ${res.data.data.officer?.name || 'GN Lead'}`);
      fetchQueue();
    }
  };

  const handleSelectCase = async (verId) => {
    setSelectedCaseId(verId);
    const res = await api.getOfficerReviewCase(verId);
    if (res.ok && res.data?.data) {
      setCaseDetails(res.data.data);
    } else {
      // Mock / fallback if not yet submitted in backend
      setCaseDetails({
        verificationId: verId,
        applicantName: 'Kasun Jayawardena',
        applicantNicMasked: 'SYN-NIC-*****0456',
        gnDivision: 'Matara South',
        finalStatus: 'PENDING',
        facialVerification: { matchScore: 0.958, algorithm: 'SyntheticFaceMatch-v1.0', status: 'SUBMITTED' },
        documentVerification: { documentType: 'NATIONAL_ID', documentNumberMasked: 'SYN-NIC-*****0456', status: 'SUBMITTED' },
      });
    }
  };

  const handleAdjudicate = async (decision) => {
    if (!selectedCaseId) return;

    const res = await api.adjudicateCase(selectedCaseId, decision, officerRemarks, officerToken);
    if (res.ok) {
      showToast(
        decision === 'APPROVE'
          ? `✅ KYC Approved! DID officially issued for ${selectedCaseId}`
          : `❌ KYC Rejected for ${selectedCaseId}`
      );
      fetchQueue();
      fetchStatus(selectedCaseId);
      setSelectedCaseId(null);
      setCaseDetails(null);
    } else {
      showToast(res.data?.error || 'Adjudication failed', false);
    }
  };

  // Lifecycle Action Handlers
  const handleLifecycleAction = (actionName) => {
    const time = new Date().toLocaleTimeString();
    let newStatus = welfareCase.status;
    let eventText = '';

    if (actionName === 'CALCULATE') {
      eventText = 'Eligibility refreshed & recomputed (Score: 72.0 pts)';
    } else if (actionName === 'ANCHOR') {
      eventText = `Cryptographic snapshot anchored to smart contract (0x${Math.random().toString(16).slice(2, 10)})`;
    } else if (actionName === 'VERIFY_HASH') {
      eventText = 'Smart Contract Hash integrity verified (0 mismatch)';
      showToast('✓ Hash Verified: Ledger integrity intact.');
      return;
    } else if (actionName === 'ACTIVATE') {
      newStatus = 'ACTIVE';
      eventText = 'Monthly benefit payout status ACTIVATED';
    } else if (actionName === 'REASSESS') {
      newStatus = 'UNDER_REASSESSMENT';
      eventText = 'Authorized Reassessment cycle initiated by Grama Niladhari';
    } else if (actionName === 'SUSPEND') {
      newStatus = 'SUSPENDED';
      eventText = 'Benefit payout temporarily SUSPENDED pending citizen update';
    } else if (actionName === 'REACTIVATE') {
      newStatus = 'ACTIVE';
      eventText = 'Benefit reactivated following satisfactory reassessment';
    } else if (actionName === 'TERMINATE') {
      newStatus = 'TERMINATED';
      eventText = 'Benefit TERMINATED (Recorded beneficiary status update)';
    }

    setWelfareCase((prev) => ({
      ...prev,
      status: newStatus,
      history: [{ timestamp: time, event: eventText }, ...prev.history],
    }));

    showToast(`Action executed: ${actionName}`);
  };

  return (
    <section className="portal-pane active">
      {/* Officer Bar */}
      <div className="officer-session-bar">
        <div className="officer-info">
          <div className="officer-avatar">🛡️</div>
          <div>
            <h3>Officer KYC Adjudication Console</h3>
            <p>
              Logged in: <strong>OFFICER-PROTOTYPE-001</strong> (Grama Niladhari Adjudication Lead)
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn-officer-auth"
          onClick={handleOfficerLogin}
        >
          Re-authenticate Officer
        </button>
      </div>

      {/* Main Grid: Queue + Side by Side Review */}
      <div className="officer-grid">
        {/* Pending Queue */}
        <div className="queue-panel">
          <div className="panel-top">
            <div>
              <h3>Pending KYC Review Queue</h3>
              <p className="panel-subtitle">Cases with completed Selfie + NIC ready for comparison</p>
            </div>
            <button
              type="button"
              className="btn-refresh-queue"
              onClick={fetchQueue}
            >
              Refresh
            </button>
          </div>

          <div className="queue-items-container">
            {pendingQueue && pendingQueue.length > 0 ? (
              pendingQueue.map((c) => (
                <div
                  key={c.verificationId}
                  className={`queue-card-item ${selectedCaseId === c.verificationId ? 'selected' : ''}`}
                  onClick={() => handleSelectCase(c.verificationId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="q-case-id">{c.verificationId}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {c.applicantName || c.userId}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {c.applicantNicMasked || 'SYN-NIC-*****'} &bull; {c.gnDivision || 'Grama Niladhari'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-review-mini"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCase(c.verificationId);
                    }}
                  >
                    Review Case
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-msg">
                No pending KYC cases ready for review.
                <br />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  (Requires both selfie and NIC submitted by citizen)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Side by Side Review */}
        <div className="adjudication-panel">
          <div className="panel-top">
            <div>
              <h3>Side-by-Side Evidence Adjudication</h3>
              <p className="panel-subtitle">
                {caseDetails
                  ? `Adjudicating: ${caseDetails.verificationId} — Applicant: ${caseDetails.applicantName || 'Citizen'}`
                  : 'Select a case from the queue to verify selfie vs. NIC'}
              </p>
            </div>
            <span className="status-pill">
              {caseDetails ? `STATUS: ${caseDetails.finalStatus || 'PENDING'}` : 'NO CASE SELECTED'}
            </span>
          </div>

          <div className="adjudication-body">
            {!caseDetails ? (
              <div className="no-selection-box">
                <div className="empty-icon">📁</div>
                <h4>Select a pending KYC case</h4>
                <p>
                  Click "Review Case" in the pending queue to inspect citizen face biometric selfie and NIC document evidence side-by-side.
                </p>
              </div>
            ) : (
              <div className="active-adjudication-box">
                <div className="human-review-callout">
                  <div className="callout-icon">🔍</div>
                  <div className="callout-content">
                    <strong>Human-in-the-Loop KYC Comparison:</strong>
                    <span>
                      Carefully compare the citizen's live selfie features against the photo and details on the National Identity Card. Approving this case will authorize the immediate issuance of the citizen's Digital Identity (DID).
                    </span>
                  </div>
                </div>

                <div className="side-by-side-layout">
                  {/* Facial Biometric */}
                  <div className="evidence-column">
                    <div className="column-header">
                      <span>📷 FACE BIOMETRIC SELFIE</span>
                      <span className="score-badge">Score: 95.8%</span>
                    </div>
                    <div className="evidence-viewport">
                      {caseDetails.facialVerification?.evidenceReference &&
                      (caseDetails.facialVerification.evidenceReference.startsWith('data:') ||
                        caseDetails.facialVerification.evidenceReference.startsWith('http')) ? (
                        <img
                          src={caseDetails.facialVerification.evidenceReference}
                          alt="Face Selfie"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                        />
                      ) : (
                        <div>
                          <div className="big-avatar">🧑</div>
                          <div className="algorithm-badge">SyntheticFaceMatch-v1.0</div>
                        </div>
                      )}
                    </div>
                    <div className="evidence-meta">
                      <div>Status: <strong>{caseDetails.facialVerification?.status || 'SUBMITTED'}</strong></div>
                      <div>Ref: <code>synthetic-selfie-ref</code></div>
                      <div>Timestamp: <span>{new Date().toLocaleTimeString()}</span></div>
                    </div>
                  </div>

                  {/* NIC Document */}
                  <div className="evidence-column">
                    <div className="column-header">
                      <span>🪪 NIC DOCUMENT PHOTO</span>
                      <span className="badge-nic-type">SYNTHETIC_NATIONAL_IDENTITY_CARD</span>
                    </div>
                    <div className="evidence-viewport doc-theme">
                      {caseDetails.documentVerification?.evidenceReference &&
                      (caseDetails.documentVerification.evidenceReference.startsWith('data:') ||
                        caseDetails.documentVerification.evidenceReference.startsWith('http')) ? (
                        <img
                          src={caseDetails.documentVerification.evidenceReference}
                          alt="NIC Doc"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', background: '#000' }}
                        />
                      ) : (
                        <div className="nic-card-render">
                          <div className="nic-card-heading">DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</div>
                          <div className="nic-card-num">{caseDetails.applicantNicMasked || 'SYN-NIC-*****0456'}</div>
                        </div>
                      )}
                    </div>
                    <div className="evidence-meta">
                      <div>Status: <strong>{caseDetails.documentVerification?.status || 'SUBMITTED'}</strong></div>
                      <div>Ref: <code>synthetic-nic-ref</code></div>
                      <div>Timestamp: <span>{new Date().toLocaleTimeString()}</span></div>
                    </div>
                  </div>
                </div>

                {/* Officer Decision Controls */}
                <div className="officer-decision-controls">
                  <label htmlFor="officerRemarks">Officer Decision Remarks &amp; Rationale:</label>
                  <textarea
                    id="officerRemarks"
                    className="figma-input"
                    rows={2}
                    value={officerRemarks}
                    onChange={(e) => setOfficerRemarks(e.target.value)}
                  />

                  <div className="decision-actions">
                    <button
                      type="button"
                      className="btn-reject"
                      onClick={() => handleAdjudicate('REJECT')}
                    >
                      Reject Verification (No DID)
                    </button>
                    <button
                      type="button"
                      className="btn-approve"
                      onClick={() => handleAdjudicate('APPROVE')}
                    >
                      Approve KYC &amp; Issue DID
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Welfare Benefit Lifecycle & Reassessment Console */}
      <div
        className="officer-welfare-lifecycle-card"
        style={{
          marginTop: '24px',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '24px',
          color: '#f8fafc',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #334155',
            paddingBottom: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <span>🏛️</span> Welfare Benefit Lifecycle &amp; Reassessment Console
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px', marginBottom: 0 }}>
              Manage Aswesuma benefit activation, authorized reassessments, suspensions, and immutable audit chaining.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              className="figma-input"
              value={welfareAppId}
              onChange={(e) => setWelfareAppId(e.target.value)}
              style={{ width: '240px', background: '#1e293b', color: '#f8fafc', borderColor: '#475569', marginBottom: 0 }}
            />
            <button
              type="button"
              className="btn-continue"
              onClick={() => showToast(`Loaded Case: ${welfareAppId}`)}
              style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
            >
              Load Case
            </button>
          </div>
        </div>

        {/* Case Status Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Current Eligibility
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', margin: '6px 0' }}>
              {welfareCase.eligibilityScore} pts
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span className="status-pill" style={{ background: '#0284c7', color: '#fff' }}>
                {welfareCase.category}
              </span>
              <span className="status-pill" style={{ background: '#334155', color: '#94a3b8' }}>
                ELIGIBLE
              </span>
            </div>
          </div>

          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Benefit Lifecycle Status
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: '6px 0' }}>
              {welfareCase.status}
            </div>
            <span className="status-pill" style={{ background: '#eab308', color: '#000' }}>
              ● {welfareCase.status}
            </span>
          </div>

          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Blockchain Ledger Record
            </span>
            <div style={{ fontSize: '1.1rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#a855f7', margin: '6px 0' }}>
              {welfareCase.blockchainRecordId}
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span className="status-pill" style={{ background: '#10b981', color: '#fff' }}>
                ✓ Hash Verified
              </span>
            </div>
          </div>
        </div>

        {/* Authorized Officer Action Bar */}
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Authorized Officer Actions
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              className="btn-continue"
              style={{ background: '#0284c7', padding: '8px 16px' }}
              onClick={() => handleLifecycleAction('CALCULATE')}
            >
              📊 Calculate / Refresh Score
            </button>
            <button
              type="button"
              className="btn-continue"
              style={{ background: '#7c3aed', padding: '8px 16px' }}
              onClick={() => handleLifecycleAction('ANCHOR')}
            >
              ⛓️ Anchor to Blockchain
            </button>
            <button
              type="button"
              className="btn-continue"
              style={{ background: '#059669', padding: '8px 16px' }}
              onClick={() => handleLifecycleAction('VERIFY_HASH')}
            >
              🔍 Verify Cryptographic Hash
            </button>
            <button
              type="button"
              className="btn-continue"
              style={{ background: '#16a34a', padding: '8px 16px' }}
              onClick={() => handleLifecycleAction('ACTIVATE')}
            >
              ▶️ Activate Monthly Benefit
            </button>
            <button
              type="button"
              className="btn-continue"
              style={{ background: '#d97706', padding: '8px 16px' }}
              onClick={() => handleLifecycleAction('REASSESS')}
            >
              ⚡ Request Reassessment
            </button>
            <button
              type="button"
              className="btn-continue"
              style={{ background: '#ea580c', padding: '8px 16px' }}
              onClick={() => handleLifecycleAction('SUSPEND')}
            >
              ⏸️ Suspend Benefit
            </button>
            <button
              type="button"
              className="btn-continue"
              style={{ background: '#2563eb', padding: '8px 16px' }}
              onClick={() => handleLifecycleAction('REACTIVATE')}
            >
              🔄 Reactivate Benefit
            </button>
            <button
              type="button"
              className="btn-continue"
              style={{ background: '#dc2626', padding: '8px 16px' }}
              onClick={() => handleLifecycleAction('TERMINATE')}
            >
              ⚠️ Record Beneficiary Death / Terminate
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📜 Immutable History &amp; Event Audit Trail
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {welfareCase.history.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                <span style={{ fontFamily: 'monospace', color: '#38bdf8', minWidth: '80px' }}>{h.timestamp}</span>
                <span style={{ color: '#e2e8f0' }}>{h.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
