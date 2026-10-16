import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { getCurrentUser } from '../utils/user';
import * as api from '../services/api';

export const WelfareServices = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isSi = i18n.language === 'si';

  const {
    verificationStatus,
    activeVerificationId,
    activeVerifiedDid,
    showToast,
    fetchStatus,
  } = useApp();

  const [currentView, setCurrentView] = useState('home'); // 'home' | 'guidance' | 'wizard' | 'result'
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
      programSi: 'අස්වැසුම ගෘහස්ථ ආධාර යෝජනා ක්‍රමය',
      status: 'UNDER_REVIEW',
      statusSi: 'සමාලෝචනය වෙමින් පවතී',
      score: 68.5,
      submittedDate: new Date().toLocaleDateString(),
    },
  ]);

  const currentUser = getCurrentUser();
  const isVerified = verificationStatus?.finalStatus === 'VERIFIED' || currentUser?.kycStatus === 'VERIFIED';

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleQuickApprove = async () => {
    const verId = verificationStatus?.verificationId || activeVerificationId || 'ver-prototype-001';
    try {
      const res = await api.adjudicateCase(
        verId,
        'APPROVE',
        'Direct authorization granted by Grama Niladhari Officer for prototype testing.'
      );
      if (res.ok) {
        showToast(isSi ? '✅ KYC සාර්ථකව අනුමත විය! ඩිජිටල් හැඳුනුම්පත (DID) නිකුත් කරන ලදී.' : '✅ KYC Approved! Digital Identity (DID) issued.');
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          u.kycStatus = 'VERIFIED';
          u.did = res.data?.data?.did || 'did:smartgrama:prototype:001';
          localStorage.setItem('user', JSON.stringify(u));
        } catch (_) {}
        await fetchStatus(verId);
      } else {
        showToast(res.data?.error || 'Adjudication failed', false);
      }
    } catch (err) {
      showToast('Error approving verification', false);
    }
  };

  // TTS Read Aloud Handler
  const handleTts = () => {
    if (isPlayingTts) {
      window.speechSynthesis.cancel();
      setIsPlayingTts(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const text = isSi
        ? 'අස්වැසුම සුබසාධන අයදුම්පත වෙත සාදරයෙන් පිළිගනිමු. අයදුම් කිරීමට පෙර කරුණාකර බහුමාන දිළිඳුතා දර්ශක 22 පිළිබඳව සමාලෝචනය කරන්න. ඔබට ඔබගේ සත්‍යාපිත ඩිජිටල් අනන්‍යතාවය සහ පවුලේ තොරතුරු අවශ්‍ය වේ.'
        : 'Welcome to Aswesuma Welfare Application. Please review the 22 multidimensional poverty indicators before applying. You will need your verified digital identity and household data.';
      const utterance = new SpeechSynthesisUtterance(text);
      if (isSi) {
        utterance.lang = 'si-LK';
      }
      utterance.onend = () => setIsPlayingTts(false);
      utterance.onerror = () => setIsPlayingTts(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingTts(true);
      showToast(isSi ? '🔊 ශ්‍රව්‍ය මාර්ගෝපදේශය වාදනය වේ...' : '🔊 Playing audio guidance...');
    } else {
      showToast(isSi ? 'මෙම බ්‍රවුසරයේ කථන සංස්ලේෂණය සඳහා සහය නොදක්වයි.' : 'Speech synthesis not supported in this browser.', false);
    }
  };

  const handleCalculateScore = () => {
    // 22-indicator computation simulation
    const score = Math.floor(55 + Math.random() * 30);
    let category = 'TRANSITIONAL';
    let categorySi = 'සංක්‍රාන්තික';
    let allowance = 'Rs. 5,000 / month';
    let allowanceSi = 'රු. 5,000 / මසකට';

    if (score >= 75) {
      category = 'EXTREMELY_POOR';
      categorySi = 'අතිශය දුප්පත්';
      allowance = 'Rs. 15,000 / month';
      allowanceSi = 'රු. 15,000 / මසකට';
    } else if (score >= 60) {
      category = 'POOR';
      categorySi = 'දුප්පත්';
      allowance = 'Rs. 8,500 / month';
      allowanceSi = 'රු. 8,500 / මසකට';
    } else if (score >= 45) {
      category = 'VULNERABLE';
      categorySi = 'අවදානමට ලක්වූ';
      allowance = 'Rs. 2,500 / month';
      allowanceSi = 'රු. 2,500 / මසකට';
    }

    const newApp = {
      appId: `ASW-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      program: 'Aswesuma Household Assistance',
      programSi: 'අස්වැසුම ගෘහස්ථ ආධාර යෝජනා ක්‍රමය',
      status: 'APPROVED',
      statusSi: 'අනුමතයි',
      score,
      category: isSi ? categorySi : category,
      allowance: isSi ? allowanceSi : allowance,
      submittedDate: new Date().toLocaleDateString(),
    };

    setCalcResult(newApp);
    setMyApplications((prev) => [newApp, ...prev]);
    setCurrentView('result');
    showToast(isSi ? `සුදුසුකම් ගණනය කරන ලදී! කාණ්ඩය: ${categorySi} (${score} ලකුණු)` : `Eligibility computed! Category: ${category} (${score} pts)`);
  };

  return (
    <>
      {/* 🧭 Standard Top Navbar with Multilingual Language Switcher (EN / සිං) */}
      <Header />

      <section className="portal-pane active" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 36px 60px' }}>
        {/* 🔒 Unverified Gatekeeper Card */}
        {!isVerified && (
          <div className="welfare-locked-card" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center', background: '#ffffff', borderRadius: '24px', padding: '48px 36px', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            <div className="welfare-lock-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h2 className="welfare-lock-title" style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              {isSi ? 'ඩිජිටල් අනන්‍යතා සත්‍යාපනය අවශ්‍යයි' : 'Digital Identity Verification Required'}
            </h2>
            <p className="welfare-lock-desc" style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 20px' }}>
              {isSi
                ? 'රජයේ සුබසාධන වැඩසටහන් (අස්වැසුම, ඉලක්කගත ආධාර සහ සමෘද්ධි) වෙත ප්‍රවේශ වීම සඳහා නිල වශයෙන් අනුමත කරන ලද ඩිජිටල් අනන්‍යතාවයක් (DID) අවශ්‍ය වේ.'
                : 'Access to government welfare programmes (Aswesuma, Targeted Assistance, and Samurdhi) requires an officially approved Digital Identity (DID).'}
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', color: '#92400e', marginBottom: '24px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }}></span>
              <span>{isSi ? 'සත්‍යාපන තත්ත්වය:' : 'Verification Status:'} {verificationStatus?.finalStatus || 'PENDING'}</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', fontSize: '13px', color: '#334155', textAlign: 'left', marginBottom: '24px', lineHeight: 1.5 }}>
              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                {isSi ? '🏛️ නිලධාරී සමාලෝචන තත්ත්වය:' : '🏛️ Officer Review Queue Status:'}
              </strong>
              {isSi
                ? 'ඔබගේ KYC අයදුම්පත ප්‍රාදේශීය ලේකම් කාර්යාල නිලධාරී පුවරුව (Officer Dashboard) වෙත යොමු කර ඇත. නිලධාරියා අනුමත කළ වහාම මෙම පිටුව ස්වයංක්‍රීයව විවෘත වේ.'
                : 'Your KYC submission is listed in the Backend Officer Dashboard (http://localhost:5174). Once the Grama Niladhari officer reviews and approves it, this page unlocks automatically in real time.'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '380px', margin: '0 auto' }}>
              <button
                type="button"
                className="btn-continue"
                style={{ width: '100%', padding: '13px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', background: '#059669', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}
                onClick={() => navigate('/identity')}
              >
                {isSi ? 'අනන්‍යතාවය සහ KYC පියවර සම්පූර්ණ කරන්න →' : 'Complete / View KYC Steps →'}
              </button>

              <button
                type="button"
                onClick={handleQuickApprove}
                style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', background: '#f0fdf4', color: '#166534', border: '1.5px solid #86efac', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>⚡</span>
                <span>{isSi ? 'ක්ෂණිකව අනුමත කර ඇතුළු වන්න (Demo)' : 'Quick Auto-Approve & Unlock Now'}</span>
              </button>
            </div>
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
                    {isSi ? 'සුබසාධන සේවා' : 'Welfare Services'}
                  </div>
                  <h1 className="welfare-main-title">
                    {isSi ? 'සුබසාධන සේවා වෙත පහසුවෙන් ප්‍රවේශ වන්න' : 'Access Welfare Services Easily'}
                  </h1>
                  <p className="welfare-main-desc">
                    {isSi
                      ? 'ඔබගේ සත්‍යාපිත ඩිජිටල් අනන්‍යතාවය මඟින් සුබසාධන වැඩසටහන් සහ ආධාරක සේවා වෙත එකම ස්ථානයකින් ප්‍රවේශ වීමට ඉඩ සලසයි. වැඩිදුර දැනගැනීමට හෝ අයදුම්පතක් ආරම්භ කිරීමට පහතින් සේවාවක් තෝරන්න.'
                      : 'Your verified digital identity allows you to access welfare programmes and support services through one place. Choose a service below to learn more or start an application.'}
                  </p>
                </div>

                {/* Verified Identity Status Card */}
                <div className="welfare-id-card">
                  <div className="welfare-id-left">
                    <div className="welfare-id-badge-row">
                      <span className="welfare-id-label">{isSi ? 'ඩිජිටල් අනන්‍යතාවය' : 'Digital Identity'}</span>
                      <span className="welfare-id-status">{isSi ? '✓ අනන්‍යතාවය සත්‍යාපිතයි' : '✓ Identity Verified'}</span>
                    </div>
                    <p className="welfare-id-desc">
                      {isSi
                        ? 'ඔබගේ ඩිජිටල් අනන්‍යතාවය සාර්ථකව සත්‍යාපනය කර ඇත. ඔබට දැන් පවතින සුබසාධන සේවාවන් වෙත පිවිසිය හැක.'
                        : 'Your digital identity has been successfully verified. You can now access available welfare services.'}
                    </p>
                  </div>
                  <div className="welfare-id-right">
                    <span className="welfare-did-sub-label">{isSi ? 'විමධ්‍යගත හඳුනාගැනීම (DID):' : 'Decentralized Identifier (DID):'}</span>
                    <code className="welfare-did-val">{activeVerifiedDid}</code>
                  </div>
                </div>

                {/* 3 Welfare Services Grid */}
                <div className="welfare-services-grid">
                  {/* Aswesuma */}
                  <div className="welfare-service-card">
                    <div className="welfare-card-top">
                      <div className="welfare-card-icon-wrap icon-aswesuma">🏛️</div>
                      <span className="welfare-card-badge">{isSi ? 'ගෘහස්ථ සුබසාධනය' : 'Household Welfare'}</span>
                    </div>
                    <div className="welfare-card-body">
                      <h2 className="welfare-card-title">{isSi ? 'අස්වැසුම' : 'Aswesuma'}</h2>
                      <div className="welfare-card-subtitle">{isSi ? 'ගෘහස්ථ සුබසාධන ආධාර' : 'Household Welfare Assistance'}</div>
                      <p className="welfare-card-desc">
                        {isSi
                          ? 'ගෘහස්ථ පාදක සුබසාධන ආධාර සඳහා අයදුම් කර සුදුසුකම් ඇගයීම සඳහා අවශ්‍ය තොරතුරු සම්පූර්ණ කරන්න.'
                          : 'Apply for household-based welfare assistance and complete the required information for eligibility assessment.'}
                      </p>
                    </div>
                    <div className="welfare-card-footer">
                      <button
                        type="button"
                        className="btn-welfare-action btn-aswesuma"
                        onClick={() => setCurrentView('guidance')}
                      >
                        {isSi ? 'අස්වැසුම සඳහා අයදුම් කරන්න' : 'Apply for Aswesuma'}
                      </button>
                    </div>
                  </div>

                  {/* Targeted Assistance */}
                  <div className="welfare-service-card">
                    <div className="welfare-card-top">
                      <div className="welfare-card-icon-wrap icon-targeted">🤝</div>
                      <span className="welfare-card-badge">{isSi ? 'ඉලක්කගත සහය' : 'Targeted Support'}</span>
                    </div>
                    <div className="welfare-card-body">
                      <h2 className="welfare-card-title">{isSi ? 'ඉලක්කගත ආධාර' : 'Targeted Assistance'}</h2>
                      <div className="welfare-card-subtitle">{isSi ? 'අමතර සුබසාධන සහය' : 'Additional Welfare Support'}</div>
                      <p className="welfare-card-desc">
                        {isSi
                          ? 'සුදුසුකම් ලත් වැඩිහිටියන්, ආබාධ සහිත පුද්ගලයින් සහ වකුගඩු රෝගී පුද්ගලයින් සඳහා පවතින ආධාර වැඩසටහන් සොයා බලන්න.'
                          : 'Explore assistance programmes available for eligible elderly, persons with disabilities, and CKDu-affected individuals.'}
                      </p>
                    </div>
                    <div className="welfare-card-footer">
                      <button
                        type="button"
                        className="btn-welfare-action btn-secondary-action"
                        onClick={() => showToast(isSi ? 'ඉලක්කගත ආධාර මොඩියුලය පූරණය විය.' : 'Targeted Assistance module loaded.')}
                      >
                        {isSi ? 'ආධාර බලන්න' : 'View Assistance'}
                      </button>
                    </div>
                  </div>

                  {/* Samurdhi */}
                  <div className="welfare-service-card">
                    <div className="welfare-card-top">
                      <div className="welfare-card-icon-wrap icon-samurdhi">🌱</div>
                      <span className="welfare-card-badge">{isSi ? 'ප්‍රජා සහ ජීවනෝපාය' : 'Community & Livelihood'}</span>
                    </div>
                    <div className="welfare-card-body">
                      <h2 className="welfare-card-title">{isSi ? 'සමෘද්ධි' : 'Samurdhi'}</h2>
                      <div className="welfare-card-subtitle">{isSi ? 'ප්‍රජා සහ ජීවනෝපාය සේවා' : 'Community & Livelihood Services'}</div>
                      <p className="welfare-card-desc">
                        {isSi
                          ? 'කුඩා කණ්ඩායම්, ඉතුරුම්, ක්ෂුද්‍ර ණය සහ ජීවනෝපාය සහය වැනි සමෘද්ධි ආශ්‍රිත සේවාවන් වෙත පිවිසෙන්න.'
                          : 'Access Samurdhi-related services such as small groups, savings, microcredit, and livelihood support.'}
                      </p>
                    </div>
                    <div className="welfare-card-footer">
                      <button
                        type="button"
                        className="btn-welfare-action btn-secondary-action"
                        onClick={() => showToast(isSi ? 'සමෘද්ධි සේවා පද්ධතිය පූරණය විය.' : 'Samurdhi Services portal loaded.')}
                      >
                        {isSi ? 'සමෘද්ධි සේවා බලන්න' : 'View Samurdhi Services'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* My Applications Section */}
                <div className="welfare-app-section">
                  <div className="welfare-app-header">
                    <h2 className="welfare-app-title">{isSi ? 'මගේ සුබසාධන අයදුම්පත්' : 'My Welfare Applications'}</h2>
                    <p className="welfare-app-desc">
                      {isSi
                        ? 'ඔබගේ සුබසාධන අයදුම්පත්වල ප්‍රගතිය එකම ස්ථානයකින් බලන්න.'
                        : 'View the progress of your welfare applications in one place.'}
                    </p>
                  </div>

                  {myApplications.length === 0 ? (
                    <div className="welfare-empty-card">
                      <div className="welfare-empty-icon">📋</div>
                      <h3 className="welfare-empty-title">{isSi ? 'තවමත් අයදුම්පත් නොමැත' : 'No applications yet'}</h3>
                      <p className="welfare-empty-desc">
                        {isSi
                          ? 'ඔබ සුබසාධන අයදුම්පතක් ඉදිරිපත් කළ පසු, ඔබට එහි ප්‍රගතිය මෙහිදී නිරීක්ෂණය කළ හැක.'
                          : 'When you submit a welfare application, you can track its progress here.'}
                      </p>
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
                              {isSi ? (app.statusSi || app.status) : app.status}
                            </span>
                          </div>
                          <h4 style={{ margin: '8px 0 4px', fontSize: '1rem' }}>
                            {isSi ? (app.programSi || app.program) : app.program}
                          </h4>
                          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                            {isSi ? 'සුදුසුකම් ලකුණු:' : 'Eligibility Score:'}{' '}
                            <strong style={{ color: '#34d399' }}>{app.score} {isSi ? 'ලකුණු' : 'pts'}</strong>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                            {isSi ? 'ඉදිරිපත් කළේ:' : 'Submitted:'} {app.submittedDate}
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
                {/* Clean Guidance Toolbar (ad-hoc inline language switch removed; Header navbar controls language) */}
                <div
                  className="guidance-toolbar"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: '#fff',
                    padding: '16px 22px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  }}
                >
                  <button
                    type="button"
                    className="btn-wizard-back-home"
                    onClick={() => setCurrentView('home')}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      color: '#334155',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isSi ? '← ආපසු සේවා වෙත' : '← Back to Services'}
                  </button>

                  <div className="guidance-tools-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn-tts-listen"
                      onClick={handleTts}
                      style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#065f46',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{isPlayingTts ? '⏹️' : '🔊'}</span>
                      <span>{isPlayingTts ? (isSi ? 'නවතන්න' : 'Stop') : (isSi ? 'අහන්න' : 'Listen')}</span>
                    </button>
                    <button
                      type="button"
                      className="btn-help-toggle"
                      onClick={() => setHelpOpen(!helpOpen)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '13px',
                      }}
                    >
                      {isSi ? '❓ උදව් අවශ්‍යද?' : '❓ Need Help?'}
                    </button>
                  </div>
                </div>

                {/* Help Drawer */}
                {helpOpen && (
                  <div className="guidance-help-drawer" style={{ background: '#fff', border: '1px solid #fed7aa', borderRadius: '14px', padding: '16px 20px', marginTop: '16px', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)' }}>
                    <div className="help-drawer-content" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div className="help-icon-badge" style={{ fontSize: '24px' }}>📞</div>
                      <div className="help-info-text">
                        <h4 style={{ margin: '0 0 6px', color: '#c2410c', fontSize: '15px', fontWeight: 800 }}>
                          {isSi ? 'අස්වැසුම පුරවැසි උපකාරක සේවය' : 'Aswesuma Citizen Helpline'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#431407', lineHeight: 1.5 }}>
                          <strong>{isSi ? 'නොමිලේ ඇමතුම් අංකය: 1924' : 'Toll-Free Hotline: 1924'}</strong> {isSi ? '(සඳුදා සිට සෙනසුරාදා දක්වා, පෙ.ව. 8:30 – ප.ව. 4:30)' : '(Monday to Saturday, 8:30 AM – 4:30 PM)'}<br />
                          {isSi ? 'ග්‍රාම නිලධාරී කාර්යාල සහාය: ස්ථානීය සහය සඳහා ඔබේ කොට්ඨාශ නිලධාරියා අමතන්න.' : 'Grama Niladhari Office Support: Contact your division officer for on-site assistance.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Guidance Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  <div className="figma-card" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 6px 18px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ color: '#0d9488', fontSize: '1.2rem', marginBottom: '12px', fontWeight: 800 }}>
                      {isSi ? '🏛️ 1. සුදුසුකම් රාමුව' : '🏛️ 1. Eligibility Framework'}
                    </h3>
                    <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                      {isSi
                        ? 'අස්වැසුම විසින් මාන 6ක් යටතේ කාණ්ඩගත කරන ලද බහුමාන දිළිඳුතා දර්ශක 22ක් හරහා පවුල් ඇගයීමට ලක් කරයි: ජනගහනය, අධ්‍යාපනය, සෞඛ්‍යය, නිවාස, වත්කම් සහ ආර්ථික තත්ත්වය.'
                        : 'Aswesuma evaluates households across 22 multi-dimensional poverty indicators grouped into 6 dimensions: Demographics, Education, Health, Housing, Assets, and Economic Status.'}
                    </p>
                  </div>

                  <div className="figma-card" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 6px 18px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ color: '#0284c7', fontSize: '1.2rem', marginBottom: '12px', fontWeight: 800 }}>
                      {isSi ? '📜 2. අවශ්‍ය තොරතුරු' : '📜 2. Required Information'}
                    </h3>
                    <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                      {isSi
                        ? 'ස්වයංක්‍රීය සුබසාධන මුදල් බැර කිරීම් සඳහා නිවසේ බිත්ති/වහල ඉදිකිරීම් විස්තර, විදුලි මීටර් අංකය, මාසික උපයෝගිතා වියදම් සහ බැංකු ගිණුම් විස්තර ඔබ සතුව ඇති බවට තහවුරු කරගන්න.'
                        : 'Ensure you have details of household wall/roof construction, electricity meter number, monthly utility expenses, and bank account for automated welfare transfers.'}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                  <button
                    type="button"
                    className="btn-continue"
                    style={{ maxWidth: '360px', margin: '0 auto', fontSize: '1.05rem', padding: '14px 28px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(13, 148, 136, 0.35)' }}
                    onClick={() => navigate('/welfare-apply')}
                  >
                    {isSi ? 'අස්වැසුම අයදුම්පත වෙත යන්න →' : 'Proceed to Aswesuma Application →'}
                  </button>
                </div>
              </div>
            )}

            {/* ASWESUMA MULTI-STEP WIZARD */}
            {currentView === 'wizard' && (
              <div className="registration-wrapper">
                <div className="figma-card">
                  <div className="figma-header">
                    <h1 className="form-main-title">
                      {isSi ? 'අස්වැසුම දර්ශක 22 ඇගයීම' : 'Aswesuma 22-Indicator Assessment'}
                    </h1>
                    <p className="form-step-subtitle">
                      {isSi ? `පියවර ${aswesumaStep} / 3` : `Step ${aswesumaStep} of 3`}
                    </p>
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
                        <h2 className="section-heading">
                          {isSi ? '1. නිවාස සහ ඉදිකිරීම්' : '1. Housing & Construction'}
                        </h2>
                        <div className="figma-group">
                          <label>{isSi ? 'බිත්ති ද්‍රව්‍ය' : 'Wall Material'}</label>
                          <select
                            className="figma-input"
                            value={aswesumaForm.wallMaterial}
                            onChange={(e) => setAswesumaForm({ ...aswesumaForm, wallMaterial: e.target.value })}
                          >
                            <option value="Brick">{isSi ? 'ගඩොල් / සිමෙන්ති ගල්' : 'Brick / Cement Blocks'}</option>
                            <option value="Mud">{isSi ? 'මැටි / කටුමැටි' : 'Clay / Mud'}</option>
                            <option value="Wood">{isSi ? 'ලෑලි / දැව' : 'Wood / Planks'}</option>
                            <option value="Zinc">{isSi ? 'තහඩු / පොල් අතු' : 'Zinc Sheets / Cadjan'}</option>
                          </select>
                        </div>

                        <div className="figma-group">
                          <label>{isSi ? 'වහල ද්‍රව්‍ය' : 'Roof Material'}</label>
                          <select
                            className="figma-input"
                            value={aswesumaForm.roofMaterial}
                            onChange={(e) => setAswesumaForm({ ...aswesumaForm, roofMaterial: e.target.value })}
                          >
                            <option value="Tile">{isSi ? 'උළු / කොන්ක්‍රීට්' : 'Tiles / Concrete'}</option>
                            <option value="Asbestos">{isSi ? 'ඇස්බැස්ටස් තහඩු' : 'Asbestos Sheets'}</option>
                            <option value="Zinc">{isSi ? 'තහඩු / ලෝහ' : 'Zinc / Metal Sheets'}</option>
                            <option value="Cadjan">{isSi ? 'පොල් අතු / පිදුරු' : 'Cadjan / Thatch'}</option>
                          </select>
                        </div>

                        <div className="btn-actions">
                          <button
                            type="button"
                            className="btn-continue"
                            onClick={() => setAswesumaStep(2)}
                          >
                            {isSi ? 'ඉදිරියට යන්න →' : 'Continue →'}
                          </button>
                        </div>
                      </div>
                    )}

                    {aswesumaStep === 2 && (
                      <div className="step-section active">
                        <h2 className="section-heading">
                          {isSi ? '2. උපයෝගිතා සහ වත්කම්' : '2. Utilities & Assets'}
                        </h2>
                        <div className="figma-group">
                          <label>{isSi ? 'විදුලි සැපයුම' : 'Electricity Access'}</label>
                          <select
                            className="figma-input"
                            value={aswesumaForm.electricityAccess}
                            onChange={(e) => setAswesumaForm({ ...aswesumaForm, electricityAccess: e.target.value })}
                          >
                            <option value="Grid">{isSi ? 'ජාතික විදුලිබල පද්ධතිය' : 'National Grid'}</option>
                            <option value="Solar">{isSi ? 'සූර්ය බල පද්ධතිය' : 'Solar Home System'}</option>
                            <option value="None">{isSi ? 'විදුලිය නොමැත' : 'No Electricity Access'}</option>
                          </select>
                        </div>

                        <div className="figma-group">
                          <label>{isSi ? 'මාසික විදුලි පරිභෝජනය (ඒකක)' : 'Monthly Electricity Consumption (Units)'}</label>
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
                            {isSi ? '← ආපසු' : '← Back'}
                          </button>
                          <button
                            type="button"
                            className="btn-continue"
                            onClick={() => setAswesumaStep(3)}
                          >
                            {isSi ? 'ඉදිරියට යන්න →' : 'Continue →'}
                          </button>
                        </div>
                      </div>
                    )}

                    {aswesumaStep === 3 && (
                      <div className="step-section active">
                        <h2 className="section-heading">
                          {isSi ? '3. සෞඛ්‍ය සහ අවදානම්' : '3. Health & Vulnerabilities'}
                        </h2>
                        <div className="figma-group">
                          <label>{isSi ? 'පාසල් යන දරුවන් සංඛ්‍යාව' : 'School-Going Children'}</label>
                          <input
                            type="number"
                            className="figma-input"
                            value={aswesumaForm.schoolGoingChildren}
                            onChange={(e) => setAswesumaForm({ ...aswesumaForm, schoolGoingChildren: Number(e.target.value) })}
                          />
                        </div>

                        <div className="figma-group">
                          <label>{isSi ? 'නිදන්ගත රෝගීන් සංඛ්‍යාව (උදා: වකුගඩු රෝග)' : 'Members with Chronic Illness (e.g. CKDu)'}</label>
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
                            {isSi ? '← ආපසු' : '← Back'}
                          </button>
                          <button
                            type="button"
                            className="btn-continue"
                            style={{ background: '#0d9488' }}
                            onClick={handleCalculateScore}
                          >
                            {isSi ? 'සුදුසුකම් ගණනය කර ඉදිරිපත් කරන්න →' : 'Compute Eligibility & Submit →'}
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
                    {isSi ? 'අස්වැසුම ඇගයීම සම්පූර්ණයි' : 'Aswesuma Assessment Complete'}
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                    {isSi ? 'අයදුම්පත් අංකය:' : 'Application ID:'}{' '}
                    <strong style={{ color: '#0d9488' }}>{calcResult.appId}</strong>
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
                      {isSi ? 'හිමිවූ සුබසාධන කාණ්ඩය' : 'Assigned Welfare Category'}
                    </span>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', margin: '8px 0' }}>
                      {calcResult.category}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                      {isSi ? 'ලකුණු:' : 'Score:'} {calcResult.score} / 100 {isSi ? 'ලකුණු' : 'pts'}
                    </div>
                    <div style={{ color: '#4b5563', fontSize: '0.9rem', marginTop: '8px' }}>
                      {isSi ? 'හිමිවන ප්‍රතිලාභය:' : 'Eligible Benefit:'}{' '}
                      <strong>{calcResult.allowance}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-continue"
                      style={{ maxWidth: '240px' }}
                      onClick={() => setCurrentView('home')}
                    >
                      {isSi ? 'මගේ අයදුම්පත් බලන්න' : 'View My Applications'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
};
