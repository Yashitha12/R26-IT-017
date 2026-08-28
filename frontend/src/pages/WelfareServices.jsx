import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const WelfareServices = () => {
  const navigate = useNavigate();
  const {
    verificationStatus,
    activeVerifiedDid,
    showToast,
  } = useApp();

  const [currentView, setCurrentView] = useState('home'); // 'home' | 'guidance' | 'wizard' | 'result'
  const [langMode, setLangMode] = useState('both'); // 'both' | 'en' | 'si'
  const [helpOpen, setHelpOpen] = useState(false);
  const [isPlayingTts, setIsPlayingTts] = useState(false);

  // Aswesuma Wizard State
  const [aswesumaStep, setAswesumaStep] = useState(1);
  const [aswesumaForm, setAswesumaForm] = useState({
    floorMaterial: 'Cement',
    wallMaterial: 'Brick',
    roofMaterial: 'Asbestos',
    electricityAccess: 'Grid',
    waterSource: 'Pipe-borne',
    toiletType: 'Flush',
    cookingFuel: 'LP Gas',
    monthlyElectricityUnits: 45,
    hasVehicle: false,
    hasRefrigerator: true,
    chronicIllnessCount: 0,
    disabilityCount: 0,
    schoolGoingChildren: 2,
  });

  const [calcResult, setCalcResult] = useState(null);
  const [myApplications, setMyApplications] = useState([
    {
      appId: 'ASW-2026-000001',
      program: 'Aswesuma Household Assistance',
      status: 'UNDER_REVIEW',
      score: 68.5,
      submittedDate: new Date().toLocaleDateString(),
    },
  ]);

  const isVerified = verificationStatus?.finalStatus === 'VERIFIED';

  // TTS Read Aloud Handler
  const handleTts = () => {
    if (isPlayingTts) {
      window.speechSynthesis.cancel();
      setIsPlayingTts(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const text =
        'Welcome to Aswesuma Welfare Application. Please review the 22 multidimensional poverty indicators before applying. You will need your verified digital identity and household data.';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlayingTts(false);
      utterance.onerror = () => setIsPlayingTts(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingTts(true);
      showToast('🔊 Playing audio guidance...');
    } else {
      showToast('Speech synthesis not supported in this browser.', false);
    }
  };

  const handleCalculateScore = () => {
    // 22-indicator computation simulation
    const score = Math.floor(55 + Math.random() * 30);
    let category = 'TRANSITIONAL';
    let allowance = 'Rs. 5,000 / month';

    if (score >= 75) {
      category = 'EXTREMELY_POOR';
      allowance = 'Rs. 15,000 / month';
    } else if (score >= 60) {
      category = 'POOR';
      allowance = 'Rs. 8,500 / month';
    } else if (score >= 45) {
      category = 'VULNERABLE';
      allowance = 'Rs. 2,500 / month';
    }

    const newApp = {
      appId: `ASW-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      program: 'Aswesuma Household Assistance',
      status: 'APPROVED',
      score,
      category,
      allowance,
      submittedDate: new Date().toLocaleDateString(),
    };

    setCalcResult(newApp);
    setMyApplications((prev) => [newApp, ...prev]);
    setCurrentView('result');
    showToast(`Eligibility computed! Category: ${category} (${score} pts)`);
  };

  return (
    <section className="portal-pane active" style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 40px' }}>
      {/* 🔒 Unverified Gatekeeper Card */}
      {!isVerified && (
        <div className="welfare-locked-card">
          <div className="welfare-lock-icon">🔒</div>
          <h2 className="welfare-lock-title">Digital Identity Verification Required</h2>
          <p className="welfare-lock-desc">
            Access to government welfare programmes (Aswesuma, Targeted Assistance, and Samurdhi) requires an officially approved Digital Identity (DID).
          </p>
          <div className="welfare-lock-status">
            Verification Status: <strong>{verificationStatus?.finalStatus || 'PENDING'}</strong>
          </div>
          <button
            type="button"
            className="btn-continue"
            style={{ maxWidth: '320px', margin: '1.25rem auto 0' }}
            onClick={() => navigate('/identity')}
          >
            Complete Identity &amp; KYC Verification &rarr;
          </button>
        </div>
      )}

      {/* 🏛️ Main Welfare Views (When Verified) */}
      {isVerified && (
        <div>
          {/* HOME VIEW */}
          {currentView === 'home' && (
            <div id="welfareHomeView">
              <div className="welfare-header-card">
                <div className="welfare-header-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Welfare Services
                </div>
                <h1 className="welfare-main-title">Access Welfare Services Easily</h1>
                <p className="welfare-main-desc">
                  Your verified digital identity allows you to access welfare programmes and support services through one place. Choose a service below to learn more or start an application.
                </p>
              </div>

              {/* Verified Identity Status Card */}
              <div className="welfare-id-card">
                <div className="welfare-id-left">
                  <div className="welfare-id-badge-row">
                    <span className="welfare-id-label">Digital Identity</span>
                    <span className="welfare-id-status">✓ Identity Verified</span>
                  </div>
                  <p className="welfare-id-desc">
                    Your digital identity has been successfully verified. You can now access available welfare services.
                  </p>
                </div>
                <div className="welfare-id-right">
                  <span className="welfare-did-sub-label">Decentralized Identifier (DID):</span>
                  <code className="welfare-did-val">{activeVerifiedDid}</code>
                </div>
              </div>

              {/* 3 Welfare Services Grid */}
              <div className="welfare-services-grid">
                {/* Aswesuma */}
                <div className="welfare-service-card">
                  <div className="welfare-card-top">
                    <div className="welfare-card-icon-wrap icon-aswesuma">🏛️</div>
                    <span className="welfare-card-badge">Household Welfare</span>
                  </div>
                  <div className="welfare-card-body">
                    <h2 className="welfare-card-title">Aswesuma</h2>
                    <div className="welfare-card-subtitle">Household Welfare Assistance</div>
                    <p className="welfare-card-desc">
                      Apply for household-based welfare assistance and complete the required information for eligibility assessment.
                    </p>
                  </div>
                  <div className="welfare-card-footer">
                    <button
                      type="button"
                      className="btn-welfare-action btn-aswesuma"
                      onClick={() => setCurrentView('guidance')}
                    >
                      Apply for Aswesuma
                    </button>
                  </div>
                </div>

                {/* Targeted Assistance */}
                <div className="welfare-service-card">
                  <div className="welfare-card-top">
                    <div className="welfare-card-icon-wrap icon-targeted">🤝</div>
                    <span className="welfare-card-badge">Targeted Support</span>
                  </div>
                  <div className="welfare-card-body">
                    <h2 className="welfare-card-title">Targeted Assistance</h2>
                    <div className="welfare-card-subtitle">Additional Welfare Support</div>
                    <p className="welfare-card-desc">
                      Explore assistance programmes available for eligible elderly, persons with disabilities, and CKDu-affected individuals.
                    </p>
                  </div>
                  <div className="welfare-card-footer">
                    <button
                      type="button"
                      className="btn-welfare-action btn-secondary-action"
                      onClick={() => showToast('Targeted Assistance module loaded.')}
                    >
                      View Assistance
                    </button>
                  </div>
                </div>

                {/* Samurdhi */}
                <div className="welfare-service-card">
                  <div className="welfare-card-top">
                    <div className="welfare-card-icon-wrap icon-samurdhi">🌱</div>
                    <span className="welfare-card-badge">Community &amp; Livelihood</span>
                  </div>
                  <div className="welfare-card-body">
                    <h2 className="welfare-card-title">Samurdhi</h2>
                    <div className="welfare-card-subtitle">Community &amp; Livelihood Services</div>
                    <p className="welfare-card-desc">
                      Access Samurdhi-related services such as small groups, savings, microcredit, and livelihood support.
                    </p>
                  </div>
                  <div className="welfare-card-footer">
                    <button
                      type="button"
                      className="btn-welfare-action btn-secondary-action"
                      onClick={() => showToast('Samurdhi Services portal loaded.')}
                    >
                      View Samurdhi Services
                    </button>
                  </div>
                </div>
              </div>

              {/* My Applications Section */}
              <div className="welfare-app-section">
                <div className="welfare-app-header">
                  <h2 className="welfare-app-title">My Welfare Applications</h2>
                  <p className="welfare-app-desc">View the progress of your welfare applications in one place.</p>
                </div>

                {myApplications.length === 0 ? (
                  <div className="welfare-empty-card">
                    <div className="welfare-empty-icon">📋</div>
                    <h3 className="welfare-empty-title">No applications yet</h3>
                    <p className="welfare-empty-desc">When you submit a welfare application, you can track its progress here.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
                    {myApplications.map((app) => (
                      <div
                        key={app.appId}
                        style={{
                          background: '#1e293b',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '1px solid #334155',
                          color: '#f8fafc',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>{app.appId}</span>
                          <span className="status-pill" style={{ background: '#0284c7', color: '#fff' }}>
                            {app.status}
                          </span>
                        </div>
                        <h4 style={{ margin: '8px 0 4px', fontSize: '1rem' }}>{app.program}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                          Eligibility Score: <strong style={{ color: '#34d399' }}>{app.score} pts</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                          Submitted: {app.submittedDate}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BILINGUAL GUIDANCE VIEW */}
          {currentView === 'guidance' && (
            <div>
              {/* Guidance Toolbar */}
              <div className="guidance-toolbar">
                <button
                  type="button"
                  className="btn-wizard-back-home"
                  onClick={() => setCurrentView('home')}
                >
                  &larr; Back to Services / ආපසු
                </button>

                <div className="guidance-lang-switch">
                  <span className="lang-label">Language:</span>
                  <button
                    type="button"
                    className={`btn-lang-toggle ${langMode === 'both' ? 'active' : ''}`}
                    onClick={() => setLangMode('both')}
                  >
                    English | සිංහල
                  </button>
                  <button
                    type="button"
                    className={`btn-lang-toggle ${langMode === 'en' ? 'active' : ''}`}
                    onClick={() => setLangMode('en')}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    className={`btn-lang-toggle ${langMode === 'si' ? 'active' : ''}`}
                    onClick={() => setLangMode('si')}
                  >
                    සිංහල
                  </button>
                </div>

                <div className="guidance-tools-right">
                  <button
                    type="button"
                    className="btn-tts-listen"
                    onClick={handleTts}
                  >
                    <span>{isPlayingTts ? '⏹️' : '🔊'}</span>
                    <span>{isPlayingTts ? 'Stop' : 'Listen / අහන්න'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-help-toggle"
                    onClick={() => setHelpOpen(!helpOpen)}
                  >
                    ❓ Need Help? / උදව් අවශ්‍යද?
                  </button>
                </div>
              </div>

              {/* Help Drawer */}
              {helpOpen && (
                <div className="guidance-help-drawer">
                  <div className="help-drawer-content">
                    <div className="help-icon-badge">📞</div>
                    <div className="help-info-text">
                      <h4>Aswesuma Citizen Helpline / අස්වැසුම උපකාරක සේවය</h4>
                      <p>
                        <strong>Toll-Free Hotline: 1924</strong> (Monday to Saturday, 8:30 AM – 4:30 PM)<br />
                        Grama Niladhari Office Support: Contact your division officer for on-site assistance.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guidance Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div className="figma-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#0d9488', fontSize: '1.2rem', marginBottom: '12px' }}>
                    🏛️ 1. Eligibility Framework
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    Aswesuma evaluates households across <strong>22 multi-dimensional poverty indicators</strong> grouped into 6 dimensions: Demographics, Education, Health, Housing, Assets, and Economic Status.
                  </p>
                </div>

                <div className="figma-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#0284c7', fontSize: '1.2rem', marginBottom: '12px' }}>
                    📜 2. Required Information
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    Ensure you have details of household wall/roof construction, electricity meter number, monthly utility expenses, and bank account for automated welfare transfers.
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <button
                  type="button"
                  className="btn-continue"
                  style={{ maxWidth: '360px', margin: '0 auto', fontSize: '1.05rem', padding: '14px 28px' }}
                  onClick={() => setCurrentView('wizard')}
                >
                  Proceed to Aswesuma Application &rarr;
                </button>
              </div>
            </div>
          )}

          {/* ASWESUMA MULTI-STEP WIZARD */}
          {currentView === 'wizard' && (
            <div className="registration-wrapper">
              <div className="figma-card">
                <div className="figma-header">
                  <h1 className="form-main-title">Aswesuma 22-Indicator Assessment</h1>
                  <p className="form-step-subtitle">Step {aswesumaStep} of 3</p>
                </div>

                <div className="figma-stepper">
                  {[1, 2, 3].map((step, idx) => (
                    <React.Fragment key={step}>
                      <div
                        className={`step-item ${
                          step < aswesumaStep
                            ? 'completed'
                            : step === aswesumaStep
                            ? 'current'
                            : ''
                        }`}
                        onClick={() => setAswesumaStep(step)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="step-circle">{step < aswesumaStep ? '✓' : step}</div>
                      </div>
                      {idx < 2 && (
                        <div className={`step-connector ${step < aswesumaStep ? 'completed' : ''}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="figma-form-body">
                  {aswesumaStep === 1 && (
                    <div className="step-section active">
                      <h2 className="section-heading">1. Housing &amp; Construction</h2>
                      <div className="figma-group">
                        <label>Wall Material</label>
                        <select
                          className="figma-input"
                          value={aswesumaForm.wallMaterial}
                          onChange={(e) => setAswesumaForm({ ...aswesumaForm, wallMaterial: e.target.value })}
                        >
                          <option value="Brick">Brick / Cement Blocks</option>
                          <option value="Mud">Clay / Mud</option>
                          <option value="Wood">Wood / Planks</option>
                          <option value="Zinc">Zinc Sheets / Cadjan</option>
                        </select>
                      </div>

                      <div className="figma-group">
                        <label>Roof Material</label>
                        <select
                          className="figma-input"
                          value={aswesumaForm.roofMaterial}
                          onChange={(e) => setAswesumaForm({ ...aswesumaForm, roofMaterial: e.target.value })}
                        >
                          <option value="Tile">Tiles / Concrete</option>
                          <option value="Asbestos">Asbestos Sheets</option>
                          <option value="Zinc">Zinc / Metal Sheets</option>
                          <option value="Cadjan">Cadjan / Thatch</option>
                        </select>
                      </div>

                      <div className="btn-actions">
                        <button
                          type="button"
                          className="btn-continue"
                          onClick={() => setAswesumaStep(2)}
                        >
                          Continue &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {aswesumaStep === 2 && (
                    <div className="step-section active">
                      <h2 className="section-heading">2. Utilities &amp; Assets</h2>
                      <div className="figma-group">
                        <label>Electricity Access</label>
                        <select
                          className="figma-input"
                          value={aswesumaForm.electricityAccess}
                          onChange={(e) => setAswesumaForm({ ...aswesumaForm, electricityAccess: e.target.value })}
                        >
                          <option value="Grid">National Grid</option>
                          <option value="Solar">Solar Home System</option>
                          <option value="None">No Electricity Access</option>
                        </select>
                      </div>

                      <div className="figma-group">
                        <label>Monthly Electricity Consumption (Units)</label>
                        <input
                          type="number"
                          className="figma-input"
                          value={aswesumaForm.monthlyElectricityUnits}
                          onChange={(e) => setAswesumaForm({ ...aswesumaForm, monthlyElectricityUnits: Number(e.target.value) })}
                        />
                      </div>

                      <div className="btn-actions dual">
                        <button
                          type="button"
                          className="btn-back"
                          onClick={() => setAswesumaStep(1)}
                        >
                          &larr; Back
                        </button>
                        <button
                          type="button"
                          className="btn-continue"
                          onClick={() => setAswesumaStep(3)}
                        >
                          Continue &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {aswesumaStep === 3 && (
                    <div className="step-section active">
                      <h2 className="section-heading">3. Health &amp; Vulnerabilities</h2>
                      <div className="figma-group">
                        <label>School-Going Children</label>
                        <input
                          type="number"
                          className="figma-input"
                          value={aswesumaForm.schoolGoingChildren}
                          onChange={(e) => setAswesumaForm({ ...aswesumaForm, schoolGoingChildren: Number(e.target.value) })}
                        />
                      </div>

                      <div className="figma-group">
                        <label>Members with Chronic Illness (e.g. CKDu)</label>
                        <input
                          type="number"
                          className="figma-input"
                          value={aswesumaForm.chronicIllnessCount}
                          onChange={(e) => setAswesumaForm({ ...aswesumaForm, chronicIllnessCount: Number(e.target.value) })}
                        />
                      </div>

                      <div className="btn-actions dual">
                        <button
                          type="button"
                          className="btn-back"
                          onClick={() => setAswesumaStep(2)}
                        >
                          &larr; Back
                        </button>
                        <button
                          type="button"
                          className="btn-continue"
                          style={{ background: '#0d9488' }}
                          onClick={handleCalculateScore}
                        >
                          Compute Eligibility &amp; Submit &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RESULT VIEW */}
          {currentView === 'result' && calcResult && (
            <div className="registration-wrapper">
              <div className="figma-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Aswesuma Assessment Complete
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                  Application ID: <strong style={{ color: '#0d9488' }}>{calcResult.appId}</strong>
                </p>

                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '16px',
                    padding: '24px',
                    margin: '0 auto 24px',
                    maxWidth: '480px',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#166534', fontWeight: 700 }}>
                    Assigned Welfare Category
                  </span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', margin: '8px 0' }}>
                    {calcResult.category}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                    Score: {calcResult.score} / 100 pts
                  </div>
                  <div style={{ color: '#4b5563', fontSize: '0.9rem', marginTop: '8px' }}>
                    Eligible Benefit: <strong>{calcResult.allowance}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn-continue"
                    style={{ maxWidth: '240px' }}
                    onClick={() => setCurrentView('home')}
                  >
                    View My Applications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
