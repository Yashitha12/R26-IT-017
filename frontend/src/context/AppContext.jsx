import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const AppContext = createContext(null);

const DEFAULT_REG_DATA = {
  fullName: '',
  nicNumber: '',
  dob: '',
  mobile: '+94',
  email: '',
  homeAddress: '',
  city: '',
  district: '',
  gnDivision: '',
  familySize: '',
  noOfDependents: '',
  monthlyIncome: '',
  monthlyExpenses: '',
  employmentType: '',
  bankName: '',
  accountNumber: '',
  branch: '',
};

export const AppProvider = ({ children }) => {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  const initialUserId = storedUser?.memberId || storedUser?.userId || 'user-prototype-001';
  const initialVerId = storedUser?.nic
    ? `ver-prototype-${storedUser.nic.replace(/[^0-9]/g, '')}`
    : `ver-prototype-${initialUserId.replace('user-prototype-', '').replace('user-', '')}`;

  const [activeTab, setActiveTab] = useState('registration');
  const [currentRegStep, setCurrentRegStep] = useState(1);
  const [regData, setRegData] = useState({
    ...DEFAULT_REG_DATA,
    fullName: storedUser?.name || '',
    nicNumber: storedUser?.nic || '',
    homeAddress: storedUser?.address || '',
    district: storedUser?.district || '',
    gnDivision: storedUser?.gnDivision || '',
    mobile: storedUser?.phone || '+94',
    email: storedUser?.email || '',
  });
  const [activePreset, setActivePreset] = useState(initialUserId);
  const [activeUserId, setActiveUserId] = useState(initialUserId);
  const [activeVerificationId, setActiveVerificationId] = useState(initialVerId);
  const [activeVerifiedDid, setActiveVerifiedDid] = useState(storedUser?.did || 'did:smartgrama:prototype:001');
  
  // Verification & Status State
  const [verificationStatus, setVerificationStatus] = useState({
    finalStatus: storedUser?.kycStatus || 'PENDING',
    facialVerificationStatus: 'NOT_SUBMITTED',
    documentVerificationStatus: 'NOT_SUBMITTED',
    officerReviewStatus: storedUser?.kycStatus === 'VERIFIED' ? 'APPROVED' : 'PENDING',
    remarks: '',
  });
  const [issuedDidData, setIssuedDidData] = useState(null);
  
  // Evidence Images
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState(null);
  const [nicPreviewUrl, setNicPreviewUrl] = useState(null);

  // Officer Queue & Sessions
  const [pendingQueue, setPendingQueue] = useState([]);
  const [officerToken, setOfficerToken] = useState(null);

  // Backend Health
  const [backendOnline, setBackendOnline] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, isSuccess = true) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, isSuccess }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Check Backend Health
  const checkBackend = useCallback(async () => {
    const res = await api.checkHealth();
    setBackendOnline(res.ok);
  }, []);

  // Fetch Verification Status
  const fetchStatus = useCallback(async (verId = activeVerificationId) => {
    if (!verId) return;
    const res = await api.getVerificationStatus(verId);
    if (res.ok && res.data?.data) {
      const st = res.data.data;
      setVerificationStatus(st);
      if (st.finalStatus === 'VERIFIED') {
        const did = st.did || 'did:smartgrama:prototype:001';
        setActiveVerifiedDid(did);
        const idRes = await api.getIdentity(did);
        if (idRes.ok && idRes.data?.data) {
          setIssuedDidData(idRes.data.data);
        }
        // Sync localStorage user record so other components know it is verified
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          u.kycStatus = 'VERIFIED';
          u.did = did;
          localStorage.setItem('user', JSON.stringify(u));
        } catch (_) {}
      }
    }
  }, [activeVerificationId]);

  // Fetch Officer Pending Queue
  const fetchQueue = useCallback(async () => {
    const res = await api.getOfficerPendingQueue();
    if (res.ok && Array.isArray(res.data?.data)) {
      setPendingQueue(res.data.data);
    }
  }, []);

  // Initial Data Sync & Frequent Polling
  useEffect(() => {
    checkBackend();
    fetchStatus();
    fetchQueue();
    const interval = setInterval(() => {
      checkBackend();
      fetchStatus();
      fetchQueue();
    }, 3000);
    return () => clearInterval(interval);
  }, [checkBackend, fetchStatus, fetchQueue]);

  // Handle Preset Change
  const applyPreset = async (presetId) => {
    setActivePreset(presetId);
    if (presetId === 'custom') {
      const customId = `user-custom-${Date.now().toString().slice(-4)}`;
      setActiveUserId(customId);
      setActiveVerificationId(`ver-custom-${Date.now().toString().slice(-4)}`);
      setRegData({
        fullName: '',
        nicNumber: '',
        dob: '',
        mobile: '',
        email: '',
        homeAddress: '',
        city: '',
        district: '',
        gnDivision: '',
        familySize: 1,
        noOfDependents: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        employmentType: '',
        bankName: '',
        accountNumber: '',
        branch: '',
      });
      setSelfiePreviewUrl(null);
      setNicPreviewUrl(null);
      setIssuedDidData(null);
      setCurrentRegStep(1);
      showToast('Form cleared. Please enter custom citizen details.');
      return;
    }

    setActiveUserId(presetId);
    const suffix = presetId.replace('user-prototype-', '');
    const verId = `ver-prototype-${suffix}`;
    setActiveVerificationId(verId);

    const res = await api.getRegistration(presetId);
    if (res.ok && res.data?.data) {
      const r = res.data.data;
      setRegData({
        fullName: r.name || '',
        nicNumber: r.nic || '',
        dob: r.dateOfBirth || '01/12/2002',
        mobile: r.phone || '',
        email: r.email || '',
        homeAddress: r.address || '',
        city: r.city || 'Gampaha',
        district: r.district || 'Gampaha',
        gnDivision: r.gnDivision || '',
        familySize: r.familySize || 4,
        noOfDependents: r.noOfDependents || 2,
        monthlyIncome: r.monthlyIncome || 35000,
        monthlyExpenses: r.monthlyExpenses || 30000,
        employmentType: r.employmentType || 'Farmer',
        bankName: r.bankName || 'Sampath Bank',
        accountNumber: r.accountNumber || '000123456789',
        branch: r.branch || 'Gampaha',
      });
      showToast(`Loaded preset: ${r.name}`);
      fetchStatus(verId);
      fetchQueue();
    }
  };

  const updateRegField = (field, value) => {
    setRegData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentRegStep,
        setCurrentRegStep,
        regData,
        updateRegField,
        activePreset,
        applyPreset,
        activeUserId,
        setActiveUserId,
        activeVerificationId,
        setActiveVerificationId,
        activeVerifiedDid,
        setActiveVerifiedDid,
        verificationStatus,
        setVerificationStatus,
        fetchStatus,
        issuedDidData,
        selfiePreviewUrl,
        setSelfiePreviewUrl,
        nicPreviewUrl,
        setNicPreviewUrl,
        pendingQueue,
        fetchQueue,
        officerToken,
        setOfficerToken,
        backendOnline,
        toasts,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
