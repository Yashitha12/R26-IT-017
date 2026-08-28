import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PresetsBar } from '../components/common/PresetsBar';
import * as api from '../services/api';

export const UserRegistration = () => {
  const navigate = useNavigate();
  const {
    currentRegStep,
    setCurrentRegStep,
    regData,
    updateRegField,
    activePreset,
    activeUserId,
    setActiveUserId,
    setActiveVerificationId,
    showToast,
    fetchStatus,
    fetchQueue,
  } = useApp();

  const handleNext = (fromStep) => {
    if (fromStep < 4) setCurrentRegStep(fromStep + 1);
  };

  const handlePrev = (fromStep) => {
    if (fromStep > 1) setCurrentRegStep(fromStep - 1);
  };

  const handleCompleteRegistration = async () => {
    try {
      const res = await api.submitRegistration({
        name: regData.fullName || 'Custom Citizen',
        nic: regData.nicNumber || '200012345678',
        dateOfBirth: regData.dob || '01/01/2000',
        phone: regData.mobile || '+94 77 000 0000',
        email: regData.email || 'citizen@example.test',
        address: regData.homeAddress || 'Main Street',
        city: regData.city || 'Colombo',
        district: regData.district || 'Colombo',
        gnDivision: regData.gnDivision || 'Minuwangoda North',
        familySize: Number(regData.familySize) || 4,
        noOfDependents: Number(regData.noOfDependents) || 2,
        monthlyIncome: Number(regData.monthlyIncome) || 35000,
        monthlyExpenses: Number(regData.monthlyExpenses) || 30000,
        employmentType: regData.employmentType || 'Farmer',
        bankName: regData.bankName || 'Sampath Bank',
        accountNumber: regData.accountNumber || '000123456789',
        branch: regData.branch || 'Colombo',
      });

      let uId = activeUserId;
      if (res.ok && res.data?.data) {
        uId = res.data.data.userId;
        setActiveUserId(uId);
        const suffix = uId.replace('user-prototype-', '').replace('user-', '');
        setActiveVerificationId(`ver-prototype-${suffix}`);
      }

      // Automatically initiate identity application
      const idRes = await api.applyForIdentity(uId, {
        preferredLanguage: 'en',
        emergencyContact: regData.mobile || '0714567890',
        gnDivision: regData.gnDivision || 'Minuwangoda North',
      });

      if (idRes.ok && idRes.data?.data) {
        const appData = idRes.data.data;
        setActiveVerificationId(appData.verificationId);
      }

      // Store user session in localStorage
      const userSession = {
        name: regData.fullName || 'Citizen Resident',
        nic: regData.nicNumber || '200223003053',
        memberId: uId,
        district: regData.district || 'Gampaha',
        gnDivision: regData.gnDivision || 'Minuwangoda North',
        address: regData.homeAddress || '45/A, Jayawickrama Road',
        phone: regData.mobile || '+94 78 145 3248',
        email: regData.email || 'citizen@example.com',
        kycStatus: 'PENDING',
      };
      localStorage.setItem('user', JSON.stringify(userSession));

      showToast(`Registration saved for ${regData.fullName}! Complete Biometric KYC.`);
      fetchStatus();
      fetchQueue();
      navigate('/identity');
    } catch (err) {
      console.error(err);
      navigate('/identity');
    }
  };

  return (
    <section className="portal-pane active" style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Preset Ribbon */}
      <PresetsBar />

      <div className="registration-wrapper" style={{ width: '100%', maxWidth: '640px' }}>
        <div className="figma-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '36px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
          {/* Card Header */}
          <div className="figma-header">
            <h1 className="form-main-title">Create Your SmartGrama Account</h1>
            <p className="form-step-subtitle">Step {currentRegStep} of 4</p>
          </div>

          {/* Stepper Navigation */}
          <div className="figma-stepper">
            {[1, 2, 3, 4].map((step, idx) => (
              <React.Fragment key={step}>
                <div
                  className={`step-item ${
                    step < currentRegStep
                      ? 'completed'
                      : step === currentRegStep
                      ? 'current'
                      : ''
                  }`}
                  onClick={() => setCurrentRegStep(step)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="step-circle">
                    {step < currentRegStep ? '✓' : step}
                  </div>
                </div>
                {idx < 3 && (
                  <div
                    className={`step-connector ${
                      step < currentRegStep ? 'completed' : ''
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Step Body Container */}
          <div className="figma-form-body">
            {/* STEP 1: Personal Details */}
            {currentRegStep === 1 && (
              <div className="step-section active">
                <h2 className="section-heading">Personal Details</h2>

                <div className="figma-group">
                  <label htmlFor="inpFullName">Full Name *</label>
                  <input
                    type="text"
                    id="inpFullName"
                    className="figma-input"
                    placeholder="e.g. Kasun Dananjaya"
                    value={regData.fullName}
                    onChange={(e) => updateRegField('fullName', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpNicNumber">NIC Number (National Identity Card) *</label>
                  <input
                    type="text"
                    id="inpNicNumber"
                    className="figma-input"
                    placeholder="e.g. 199512345678 or 951234567V"
                    value={regData.nicNumber}
                    onChange={(e) => updateRegField('nicNumber', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpDob">Date of Birth</label>
                  <input
                    type="text"
                    id="inpDob"
                    className="figma-input"
                    placeholder="DD/MM/YYYY"
                    value={regData.dob}
                    onChange={(e) => updateRegField('dob', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpMobile">Mobile Phone *</label>
                  <input
                    type="text"
                    id="inpMobile"
                    className="figma-input"
                    placeholder="+94 7X XXX XXXX"
                    value={regData.mobile}
                    onChange={(e) => updateRegField('mobile', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpEmail">Email Address *</label>
                  <input
                    type="email"
                    id="inpEmail"
                    className="figma-input"
                    placeholder="name@example.com"
                    value={regData.email}
                    onChange={(e) => updateRegField('email', e.target.value)}
                  />
                </div>

                <div className="btn-actions">
                  <button
                    type="button"
                    className="btn-continue"
                    onClick={() => handleNext(1)}
                  >
                    Continue &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Address & GN Division */}
            {currentRegStep === 2 && (
              <div className="step-section active">
                <h2 className="section-heading">Address &amp; GN Division</h2>

                <div className="figma-group">
                  <label htmlFor="inpHomeAddress">Home Address *</label>
                  <input
                    type="text"
                    id="inpHomeAddress"
                    className="figma-input"
                    placeholder="House No, Street Name"
                    value={regData.homeAddress}
                    onChange={(e) => updateRegField('homeAddress', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpCity">City</label>
                  <input
                    type="text"
                    id="inpCity"
                    className="figma-input"
                    placeholder="e.g. Gampaha / Colombo / Kandy"
                    value={regData.city}
                    onChange={(e) => updateRegField('city', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpDistrict">District</label>
                  <input
                    type="text"
                    id="inpDistrict"
                    className="figma-input"
                    placeholder="e.g. Gampaha"
                    value={regData.district}
                    onChange={(e) => updateRegField('district', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpGnDivision">Grama Niladhari Division *</label>
                  <input
                    type="text"
                    id="inpGnDivision"
                    className="figma-input"
                    placeholder="e.g. Minuwangoda North"
                    value={regData.gnDivision}
                    onChange={(e) => updateRegField('gnDivision', e.target.value)}
                  />
                </div>

                <div className="btn-actions dual">
                  <button
                    type="button"
                    className="btn-back"
                    onClick={() => handlePrev(2)}
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    className="btn-continue"
                    onClick={() => handleNext(2)}
                  >
                    Continue &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Family & Income */}
            {currentRegStep === 3 && (
              <div className="step-section active">
                <h2 className="section-heading">Family &amp; Income</h2>

                <div className="figma-group">
                  <label htmlFor="inpFamilySize">Family Size</label>
                  <input
                    type="number"
                    id="inpFamilySize"
                    className="figma-input"
                    placeholder="4"
                    value={regData.familySize}
                    onChange={(e) => updateRegField('familySize', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpNoOfDependents">No of Dependents</label>
                  <input
                    type="number"
                    id="inpNoOfDependents"
                    className="figma-input"
                    placeholder="2"
                    value={regData.noOfDependents}
                    onChange={(e) => updateRegField('noOfDependents', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpMonthlyIncome">Monthly Income (Rs.)</label>
                  <input
                    type="number"
                    id="inpMonthlyIncome"
                    className="figma-input"
                    placeholder="35000"
                    value={regData.monthlyIncome}
                    onChange={(e) => updateRegField('monthlyIncome', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpMonthlyExpenses">Monthly Expenses (Rs.)</label>
                  <input
                    type="number"
                    id="inpMonthlyExpenses"
                    className="figma-input"
                    placeholder="30000"
                    value={regData.monthlyExpenses}
                    onChange={(e) => updateRegField('monthlyExpenses', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpEmploymentType">Employment Type</label>
                  <input
                    type="text"
                    id="inpEmploymentType"
                    className="figma-input"
                    placeholder="Farmer / Self-Employed"
                    value={regData.employmentType}
                    onChange={(e) => updateRegField('employmentType', e.target.value)}
                  />
                </div>

                <div className="btn-actions dual">
                  <button
                    type="button"
                    className="btn-back"
                    onClick={() => handlePrev(3)}
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    className="btn-continue"
                    onClick={() => handleNext(3)}
                  >
                    Continue &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Bank & Wallet Details */}
            {currentRegStep === 4 && (
              <div className="step-section active">
                <h2 className="section-heading">Bank &amp; Wallet Details</h2>

                <div className="figma-group">
                  <label htmlFor="inpBankName">Bank Name</label>
                  <input
                    type="text"
                    id="inpBankName"
                    className="figma-input"
                    placeholder="e.g. Sampath Bank, BOC, People's Bank"
                    value={regData.bankName}
                    onChange={(e) => updateRegField('bankName', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpAccountNumber">Account Number</label>
                  <input
                    type="text"
                    id="inpAccountNumber"
                    className="figma-input"
                    placeholder="000123456789"
                    value={regData.accountNumber}
                    onChange={(e) => updateRegField('accountNumber', e.target.value)}
                  />
                </div>

                <div className="figma-group">
                  <label htmlFor="inpBranch">Branch</label>
                  <input
                    type="text"
                    id="inpBranch"
                    className="figma-input"
                    placeholder="Branch Name"
                    value={regData.branch}
                    onChange={(e) => updateRegField('branch', e.target.value)}
                  />
                </div>

                {/* Green Digital Wallet Alert Box */}
                <div className="wallet-info-alert">
                  <div className="info-icon">ⓘ</div>
                  <div className="info-text">
                    A SmartGrama digital wallet will be created automatically and linked to your bank account upon identity verification
                  </div>
                </div>

                <div className="btn-actions dual">
                  <button
                    type="button"
                    className="btn-back"
                    onClick={() => handlePrev(4)}
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    className="btn-continue btn-proceed-did"
                    onClick={handleCompleteRegistration}
                  >
                    Complete Registration &amp; Apply for Identity &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
