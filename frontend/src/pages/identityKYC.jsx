import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';

export const IdentityKYC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    regData,
    activeUserId,
    activeVerificationId,
    setActiveVerificationId,
    verificationStatus,
    fetchStatus,
    issuedDidData,
    selfiePreviewUrl,
    setSelfiePreviewUrl,
    nicPreviewUrl,
    setNicPreviewUrl,
    showToast,
    fetchQueue,
  } = useApp();

  const [preferredLang, setPreferredLang] = useState('en');
  const [emergencyContact, setEmergencyContact] = useState('0714567890');
  const [appRegistered, setAppRegistered] = useState(false);
  const [appId, setAppId] = useState('app-prototype-001');

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const selfieFileRef = useRef(null);
  const nicFileRef = useRef(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleApplyIdentity = async () => {
    const res = await api.applyForIdentity(activeUserId, {
      preferredLanguage: preferredLang,
      emergencyContact,
      gnDivision: regData.gnDivision || 'Minuwangoda North',
    });

    if (res.ok && res.data?.data) {
      const appData = res.data.data;
      setActiveVerificationId(appData.verificationId);
      setAppId(appData.applicationId);
      setAppRegistered(true);
      showToast(`Identity Application Registered (${appData.applicationId}). Submit selfie & NIC.`);
      fetchStatus(appData.verificationId);
      fetchQueue();
    } else if (res.data?.error && res.data.error.includes('already active')) {
      setAppRegistered(true);
      showToast('Digital Identity active! Submit evidence or proceed to dashboard.');
      fetchStatus();
    } else {
      setAppRegistered(true);
      showToast('Identity application registered. Please submit selfie & NIC document.');
    }
  };

  const handleProceedToDashboard = () => {
    const userSession = {
      name: regData.fullName || 'Aravinda Kumara',
      nic: regData.nicNumber || '200223003053',
      memberId: activeUserId,
      district: regData.district || 'Gampaha',
      gnDivision: regData.gnDivision || 'Minuwangoda North',
      address: regData.homeAddress || '45/A, Jayawickrama Road',
      phone: regData.mobile || '+94 78 145 3248',
      email: regData.email || 'citizen@example.com',
      did: issuedDidData?.did || activeVerifiedDid || 'did:smartgrama:prototype:001',
      kycStatus: verificationStatus?.finalStatus || 'VERIFIED',
    };
    localStorage.setItem('user', JSON.stringify(userSession));
    showToast('Entering Resident Dashboard...');
    navigate('/dashboard');
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 400, height: 300 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      showToast('Live Camera Activated! Smile and click Snap.');
    } catch (err) {
      showToast(`Camera permission error: ${err.message}`, false);
    }
  };

  // Snap Photo
  const snapPhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 300;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setSelfiePreviewUrl(dataUrl);

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);

    // Submit Evidence
    const res = await api.submitFaceEvidence(activeVerificationId, dataUrl, 'LiveWebcamCapture-v1.0');
    if (res.ok) {
      showToast('📷 Live selfie evidence recorded! (Pending Review)');
      fetchStatus();
      fetchQueue();
    }
  };

  // File Upload Handlers
  const handleSelfieFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setSelfiePreviewUrl(dataUrl);
      const res = await api.submitFaceEvidence(activeVerificationId, dataUrl, 'CustomImageUpload-v1.0');
      if (res.ok) {
        showToast('📷 Selfie image uploaded successfully!');
        fetchStatus();
        fetchQueue();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNicFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setNicPreviewUrl(dataUrl);
      const masked = `SYN-NIC-*****${(regData.nicNumber || '1234').slice(-4)}`;
      const res = await api.submitNicEvidence(
        activeVerificationId,
        dataUrl,
        'NATIONAL_IDENTITY_CARD_REAL_UPLOAD',
        masked
      );
      if (res.ok) {
        showToast('🪪 NIC document uploaded successfully!');
        fetchStatus();
        fetchQueue();
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick Simulation Handlers
  const handleQuickSampleSelfie = async () => {
    const sample = 'synthetic-selfie-reference-001';
    setSelfiePreviewUrl('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%230d9488"/><text x="50%" y="50%" font-size="60" text-anchor="middle" dominant-baseline="middle">🧑</text></svg>');
    const res = await api.submitFaceEvidence(activeVerificationId, sample, 'SyntheticFaceMatch-v1.0');
    if (res.ok) {
      showToast('⚡ Quick sample selfie submitted.');
      fetchStatus();
      fetchQueue();
    }
  };

  const handleQuickSampleNic = async () => {
    const sample = 'synthetic-nic-reference-001';
    const masked = `SYN-NIC-*****${(regData.nicNumber || '1234').slice(-4)}`;
    setNicPreviewUrl('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180"><rect width="300" height="180" fill="%231e293b" rx="10"/><text x="50%" y="30%" fill="%2394a3b8" font-size="12" text-anchor="middle">SRI LANKA NIC</text><text x="50%" y="60%" fill="%2338bdf8" font-size="18" font-family="monospace" text-anchor="middle">' + masked + '</text></svg>');
    const res = await api.submitNicEvidence(activeVerificationId, sample, 'SYNTHETIC_NATIONAL_IDENTITY_CARD', masked);
    if (res.ok) {
      showToast('⚡ Quick sample NIC submitted.');
      fetchStatus();
      fetchQueue();
    }
  };

  const isApproved = verificationStatus?.finalStatus === 'VERIFIED';
  const isRejected = verificationStatus?.finalStatus === 'REJECTED';
  const maskedNic = `SYN-NIC-*****${(regData.nicNumber || '1234').slice(-4)}`;

  return (
    <section className="portal-pane active" style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 40px' }}>
      {/* Intro Banner */}
      <div className="intro-hero-card">
        <div className="intro-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          {t('identity_layer')}
        </div>

        <h1 className="intro-title">{t('digital_identity_app')}</h1>
        <p className="intro-lead">
          {t('identity_intro')}
        </p>

        {/* Verification Pipeline */}
        <div className="two-steps-callout">
          <div className="callout-label">{t('verification_pipeline')}</div>
          <div className="steps-flow-badge">
            <span className="flow-pill">📝 {t('submit_app')}</span>
            <span className="flow-arrow">&rarr;</span>
            <span className="flow-pill">📷 {t('live_webcam')}</span>
            <span className="flow-arrow">&rarr;</span>
            <span className="flow-pill">🪪 {t('real_nic')}</span>
            <span className="flow-arrow">&rarr;</span>
            <span className="flow-pill highlight">🛡️ {t('officer_review')}</span>
          </div>
        </div>

        <p className="intro-officer-note">
          <strong>{t('business_rule')}</strong> {t('business_rule_desc')}
        </p>
      </div>

      {/* Grid: Inherited Info + Biometric / Document Evidence */}
      <div className="did-workspace-grid">
        {/* Left: Inherited Profile */}
        <div className="did-panel-card">
          <div className="panel-card-header">
            <div>
              <h2>{t('inherited_data')}</h2>
              <p className="card-subtitle">{t('inherited_desc')}</p>
            </div>
            <span className="badge-auto-filled">{t('pre_filled')}</span>
          </div>

          <div className="panel-card-body">
            <div className="inherited-data-box">
              <div className="data-grid-2col">
                <div className="data-item">
                  <span className="d-label">{t('full_name')}</span>
                  <strong className="d-val">{regData.fullName}</strong>
                </div>
                <div className="data-item">
                  <span className="d-label">{t('nic_number')}</span>
                  <strong className="d-val">{regData.nicNumber}</strong>
                </div>
                <div className="data-item">
                  <span className="d-label">{t('mobile_phone')}</span>
                  <span className="d-val">{regData.mobile}</span>
                </div>
                <div className="data-item">
                  <span className="d-label">{t('email_address')}</span>
                  <span className="d-val">{regData.email}</span>
                </div>
                <div className="data-item full">
                  <span className="d-label">{t('address_gn')}</span>
                  <span className="d-val">
                    {regData.homeAddress}, {regData.gnDivision} ({regData.district})
                  </span>
                </div>
              </div>
            </div>

            <div className="form-row-compact">
              <div className="figma-group flex-1">
                <label htmlFor="didPreferredLang">{t('preferred_lang')}</label>
                <select
                  id="didPreferredLang"
                  className="figma-input form-sm"
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value)}
                >
                  <option value="en">English (en)</option>
                  <option value="si">Sinhala (si)</option>
                  <option value="ta">Tamil (ta)</option>
                </select>
              </div>
              <div className="figma-group flex-1">
                <label htmlFor="didEmergencyContact">{t('emergency_contact')}</label>
                <input
                  type="text"
                  id="didEmergencyContact"
                  className="figma-input form-sm"
                  placeholder="071-XXXXXXX"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn-create-did-large"
              onClick={handleApplyIdentity}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              {t('submit_identity_app')}
            </button>

            {appRegistered && (
              <div className="did-success-banner">
                <div className="banner-title-sm">📝 IDENTITY APPLICATION REGISTERED (PENDING KYC)</div>
                <div className="code-line">
                  <span>Application ID:</span>
                  <code>{appId}</code>
                </div>
                <div className="code-line">
                  <span>Verification ID:</span>
                  <code>{activeVerificationId}</code>
                </div>
                <div className="code-line">
                  <span>DID Status:</span>
                  <strong style={{ color: '#d97706', fontSize: '0.82rem' }}>
                    Pending Officer Approval (No DID issued yet)
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Evidence Submission */}
        <div className="did-panel-card">
          <div className="panel-card-header">
            <div>
              <h2>{t('submit_evidence')}</h2>
              <p className="card-subtitle">{t('live_camera_support')}</p>
            </div>
          </div>

          <div className="panel-card-body">
            <div className="evidence-dual-boxes">
              {/* Step A: Selfie Scanner */}
              <div className="ev-item-card">
                <div className="ev-header">
                  <div>
                    <span className="ev-num">{t('step_a')}</span>
                    <h3>{t('live_face_id')}</h3>
                  </div>
                  <span className={`status-pill ${verificationStatus?.facialVerificationStatus?.toLowerCase()}`}>
                    {verificationStatus?.facialVerificationStatus || 'NOT_SUBMITTED'}
                  </span>
                </div>

                <div className="scanner-viewport face-viewport" style={{ position: 'relative', overflow: 'hidden' }}>
                  {isCameraActive && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                    />
                  )}
                  {selfiePreviewUrl && !isCameraActive && (
                    <img
                      src={selfiePreviewUrl}
                      alt="Selfie Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                    />
                  )}
                  {!isCameraActive && !selfiePreviewUrl && (
                    <div>
                      <div className="target-ring"></div>
                      <div className="laser-scanner"></div>
                      <div className="avatar-icon">🧑</div>
                    </div>
                  )}
                  <div className="score-tag">{t('live_biometric_ready')}</div>
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} width="400" height="300" />
                <input
                  type="file"
                  ref={selfieFileRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleSelfieFileUpload}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-submit-ev"
                      style={{ flex: 1 }}
                      onClick={toggleCamera}
                    >
                      {isCameraActive ? t('stop_camera') : t('start_camera')}
                    </button>
                    {isCameraActive && (
                      <button
                        type="button"
                        className="btn-submit-ev"
                        style={{ flex: 1, background: '#06b6d4' }}
                        onClick={snapPhoto}
                      >
                        {t('snap_submit')}
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-submit-ev"
                      style={{ flex: 1, background: '#334155' }}
                      onClick={() => selfieFileRef.current?.click()}
                    >
                      {t('upload_selfie')}
                    </button>
                    <button
                      type="button"
                      className="btn-submit-ev"
                      style={{ flex: 1, background: '#1e293b', border: '1px solid #475569' }}
                      onClick={handleQuickSampleSelfie}
                    >
                      {t('quick_sample')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step B: NIC Scanner */}
              <div className="ev-item-card">
                <div className="ev-header">
                  <div>
                    <span className="ev-num">{t('step_b')}</span>
                    <h3>{t('real_nic_doc')}</h3>
                  </div>
                  <span className={`status-pill ${verificationStatus?.documentVerificationStatus?.toLowerCase()}`}>
                    {verificationStatus?.documentVerificationStatus || 'NOT_SUBMITTED'}
                  </span>
                </div>

                <div className="scanner-viewport doc-viewport" style={{ position: 'relative', overflow: 'hidden' }}>
                  {nicPreviewUrl ? (
                    <img
                      src={nicPreviewUrl}
                      alt="NIC Document Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', background: '#000' }}
                    />
                  ) : (
                    <div className="synthetic-nic-card">
                      <div className="nic-card-top">SRI LANKA NATIONAL IDENTITY CARD</div>
                      <div className="nic-card-details">
                        <div className="nic-photo-slot">📷</div>
                        <div className="nic-text-slot">
                          <div className="nic-line"></div>
                          <div className="nic-line w-75"></div>
                          <div className="nic-num-text">{maskedNic}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={nicFileRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleNicFileUpload}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn-submit-ev btn-doc-theme"
                    onClick={() => nicFileRef.current?.click()}
                  >
                    {t('upload_real_nic')}
                  </button>
                  <button
                    type="button"
                    className="btn-submit-ev"
                    style={{ background: '#1e293b', border: '1px solid #475569' }}
                    onClick={handleQuickSampleNic}
                  >
                    {t('quick_sample_nic')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Status & DID Certificate Display */}
      <div className="status-tracker-card mt-lg">
        <div className="panel-card-header">
          <div>
            <h2>{t('realtime_kyc')}</h2>
            <p className="card-subtitle">{t('realtime_kyc_desc')}</p>
          </div>
          <button
            type="button"
            className="btn-refresh-status"
            onClick={() => fetchStatus()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            {t('refresh_status')}
          </button>
        </div>

        <div className="panel-card-body">
          <div className="status-summary-row">
            <div
              className={`verdict-banner ${
                isApproved
                  ? 'verdict-verified'
                  : isRejected
                  ? 'verdict-rejected'
                  : 'verdict-pending'
              }`}
            >
              <span className="verdict-label">{t('overall_verdict')}</span>
              <div className="verdict-text">{verificationStatus?.finalStatus || 'PENDING'}</div>
              <span className="verdict-detail">
                {isApproved
                  ? 'Approved by Grama Niladhari Officer — Digital Identity Issued'
                  : isRejected
                  ? 'Rejected by Grama Niladhari Officer — No DID Issued'
                  : 'Awaiting officer side-by-side KYC review'}
              </span>
            </div>

            <div className="status-indicators-grid">
              <div className="indicator-box">
                <span className="ind-label">1. Face ID Selfie Evidence</span>
                <strong className="ind-val">{verificationStatus?.facialVerificationStatus || 'NOT_SUBMITTED'}</strong>
              </div>
              <div className="indicator-box">
                <span className="ind-label">2. NIC Document Evidence</span>
                <strong className="ind-val">{verificationStatus?.documentVerificationStatus || 'NOT_SUBMITTED'}</strong>
              </div>
              <div className="indicator-box">
                <span className="ind-label">3. Officer Decision</span>
                <strong className="ind-val">{verificationStatus?.officerReviewStatus || 'PENDING'}</strong>
              </div>
            </div>
          </div>

          {/* Issued DID Card Showcase */}
          {isApproved && issuedDidData && (
            <div className="issued-did-card">
              <div className="did-card-header">
                <div className="did-badge-icon">🛡️</div>
                <div>
                  <div className="did-card-title">{t('officially_issued_did')}</div>
                  <div className="did-card-subtitle">Democratic Socialist Republic of Sri Lanka &bull; SmartGrama Welfare Framework</div>
                </div>
                <span className="pill-active-did">{t('active_verified')}</span>
              </div>

              <div className="verified-did-showcase-grid">
                {/* Face Evidence */}
                <div className="verified-evidence-box">
                  <div className="ve-badge-tag success">{t('verified_face')}</div>
                  <div className="ve-photo-frame">
                    {selfiePreviewUrl ? (
                      <img src={selfiePreviewUrl} alt="Verified Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="ve-fallback-avatar">🧑</div>
                    )}
                  </div>
                  <div className="ve-caption">Biometric Match Confirmed</div>
                </div>

                {/* NIC Evidence */}
                <div className="verified-evidence-box">
                  <div className="ve-badge-tag info">{t('verified_nic')}</div>
                  <div className="ve-photo-frame doc-frame">
                    {nicPreviewUrl ? (
                      <img src={nicPreviewUrl} alt="Verified NIC" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div className="synthetic-nic-card mini">
                        <div className="nic-card-top">SRI LANKA NIC</div>
                        <div className="nic-num-text">{maskedNic}</div>
                      </div>
                    )}
                  </div>
                  <div className="ve-caption">National Identity Authenticated</div>
                </div>

                {/* Details */}
                <div className="verified-details-box">
                  <div className="did-string-box">
                    <span className="did-label">Decentralized Identifier (DID):</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <code className="did-code-val">{issuedDidData.did}</code>
                      <button
                        type="button"
                        className="btn-copy-did"
                        onClick={() => {
                          navigator.clipboard.writeText(issuedDidData.did);
                          showToast('DID copied to clipboard!');
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  <div className="citizen-profile-grid">
                    <div className="cp-row"><span>Full Name:</span> <strong>{issuedDidData.name}</strong></div>
                    <div className="cp-row"><span>NIC Number:</span> <strong>{issuedDidData.nic}</strong></div>
                    <div className="cp-row"><span>Date of Birth:</span> <strong>{issuedDidData.dateOfBirth || '01/12/2002'}</strong></div>
                    <div className="cp-row"><span>Mobile:</span> <strong>{issuedDidData.phone}</strong></div>
                    <div className="cp-row"><span>Email:</span> <strong>{issuedDidData.email}</strong></div>
                    <div className="cp-row full"><span>Address:</span> <strong>{issuedDidData.address}</strong></div>
                    <div className="cp-row"><span>GN Division:</span> <strong>{issuedDidData.gnDivision}</strong></div>
                    <div className="cp-row"><span>District:</span> <strong>{issuedDidData.district || 'Gampaha'}</strong></div>
                  </div>

                  <div className="credentials-pills-row">
                    <span className="cred-pill">📜 VerifiableCitizenshipCredential</span>
                    <span className="cred-pill">🏡 VerifiableResidencyCredential</span>
                    <span className="cred-pill">🧬 VerifiableBiometricCredential</span>
                  </div>

                  <div className="issuance-footer-row">
                    <div><span>Issuing Officer:</span> <strong>{issuedDidData.issuingOfficerId || 'OFFICER-PROTOTYPE-001 (GN Lead)'}</strong></div>
                    <div><span>Issued Timestamp:</span> <strong>{new Date(issuedDidData.issuedAt || Date.now()).toLocaleString()}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="rejection-alert">
              <div className="rejection-title">❌ KYC Verification Rejected &mdash; No DID Issued</div>
              <p>Reason: {verificationStatus?.remarks || 'Selfie or NIC document was unsatisfactory.'}</p>
            </div>
          )}

          {/* Quick jump banner */}
          <div className="proceed-to-officer-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span>Evidence submitted? Go to your Resident Dashboard:</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-continue"
                style={{ background: '#059669', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                onClick={handleProceedToDashboard}
              >
                {t('proceed_dashboard')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
