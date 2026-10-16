import app from './app';
import http from 'http';

async function runLifecycleTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}/api`;

  console.log(`\n======================================================`);
  console.log(`  STARTING DID LIFECYCLE ARCHITECTURE VERIFICATION   `);
  console.log(`======================================================\n`);

  // Helper fetch with typed return
  async function request(path: string, options: any = {}): Promise<{ status: number; ok: boolean; data: any }> {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const json: any = await res.json();
    return { status: res.status, ok: res.ok, data: json };
  }

  try {
    // 1. Initial State Check for user-prototype-004 (Fresh Citizen)
    console.log('[STEP 1] Verifying no DID exists for fresh citizen user-prototype-004...');
    const idCheckBefore = await request('/identity/user/user-prototype-004');
    if (idCheckBefore.status !== 404) {
      throw new Error(`Expected 404 for unapproved user DID, got ${idCheckBefore.status}`);
    }
    console.log('  -> PASS: 404 returned. No DID exists before application/approval.\n');

    // 2. Citizen Submits Identity Application
    console.log('[STEP 2] Submitting Digital Identity Application (POST /identity/apply)...');
    const applyRes = await request('/identity/apply', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user-prototype-004',
        additionalAttributes: { preferredLanguage: 'si', emergencyContact: '0771234567' },
      }),
    });
    if (applyRes.status !== 201 || !applyRes.data.success) {
      throw new Error(`Application creation failed: ${JSON.stringify(applyRes.data)}`);
    }
    console.log('  -> Application Response:', applyRes.data);
    const verId = applyRes.data.data.verificationId;
    if (verId !== 'ver-prototype-004') {
      throw new Error(`Expected ver-prototype-004, got ${verId}`);
    }
    console.log('  -> PASS: Application registered in PENDING status. Verification ID:', verId);

    // Verify still no DID exists
    const idCheckAfterApply = await request('/identity/user/user-prototype-004');
    if (idCheckAfterApply.status !== 404) {
      throw new Error(`DID should NOT exist after application submission! Got: ${idCheckAfterApply.status}`);
    }
    console.log('  -> PASS: Confirmed NO DID is issued at application submission.\n');

    // 3. Citizen Submits Live Selfie Evidence
    console.log('[STEP 3] Citizen submits Live Selfie evidence...');
    const selfieRes = await request(`/verification/${verId}/face`, {
      method: 'POST',
      body: JSON.stringify({
        evidenceReference: 'synthetic-selfie-004',
        matchScore: 0.978,
        algorithm: 'SyntheticFaceMatch-v1.0',
      }),
    });
    if (!selfieRes.ok) throw new Error(`Selfie submission failed: ${JSON.stringify(selfieRes.data)}`);
    if (selfieRes.data.data.did) throw new Error(`DID was erroneously issued on selfie submission!`);
    console.log('  -> PASS: Selfie recorded as SUBMITTED. NO DID issued.\n');

    // 4. Citizen Submits NIC Document Photo
    console.log('[STEP 4] Citizen submits NIC document photo...');
    const nicRes = await request(`/verification/${verId}/document`, {
      method: 'POST',
      body: JSON.stringify({
        evidenceReference: 'synthetic-nic-004',
        documentType: 'SYNTHETIC_NATIONAL_IDENTITY_CARD',
        documentNumberMasked: 'SYN-NIC-*****0987',
      }),
    });
    if (!nicRes.ok) throw new Error(`NIC submission failed: ${JSON.stringify(nicRes.data)}`);
    if (nicRes.data.data.did) throw new Error(`DID was erroneously issued on NIC submission!`);
    console.log('  -> PASS: NIC recorded as SUBMITTED. NO DID issued.\n');

    // 5. Check Officer Pending Queue
    console.log('[STEP 5] Officer queries pending review queue (GET /officer/verification/pending)...');
    const queueRes = await request('/officer/verification/pending');
    if (!queueRes.ok) throw new Error(`Pending queue fetch failed: ${JSON.stringify(queueRes.data)}`);
    const hasCase004 = queueRes.data.data.some((c: any) => c.verificationId === verId);
    if (!hasCase004) throw new Error(`Case ${verId} not found in pending queue!`);
    console.log(`  -> PASS: Case ${verId} is ready in officer queue. Queue count: ${queueRes.data.count}\n`);

    // 6. Officer Side-by-Side Review Screen Query
    console.log(`[STEP 6] Officer opens case ${verId} for side-by-side comparison...`);
    const reviewRes = await request(`/officer/verification/${verId}/review`);
    if (!reviewRes.ok) throw new Error(`Review case retrieval failed: ${JSON.stringify(reviewRes.data)}`);
    console.log('  -> Selfie Status:', reviewRes.data.data.facialVerification.status);
    console.log('  -> NIC Status:', reviewRes.data.data.documentVerification.status);
    console.log('  -> Applicant:', reviewRes.data.data.applicantName, reviewRes.data.data.applicantNicMasked);
    console.log('  -> PASS: Full side-by-side evidence dossier retrieved successfully.\n');

    // 7. Testing REJECTION flow on pre-seeded ver-prototype-003
    console.log('[STEP 7] Testing Rejection Lifecycle on ver-prototype-003...');
    const rejectRes = await request('/officer/verification/ver-prototype-003/decision', {
      method: 'POST',
      body: JSON.stringify({
        decision: 'REJECTED',
        officerId: 'OFFICER-PROTOTYPE-001',
        remarks: 'Facial image lighting was too low to match NIC photo.',
      }),
    });
    if (!rejectRes.ok || rejectRes.data.data.finalStatus !== 'REJECTED') {
      throw new Error(`Rejection failed: ${JSON.stringify(rejectRes.data)}`);
    }
    if (rejectRes.data.data.did) {
      throw new Error(`DID must NOT be issued on rejection!`);
    }
    const didCheckReject = await request('/identity/user/user-prototype-003');
    if (didCheckReject.status !== 404) {
      throw new Error(`DID must NOT exist for rejected citizen! Got: ${didCheckReject.status}`);
    }
    console.log('  -> PASS: Rejection successfully recorded. Status = REJECTED. NO DID issued.\n');

    // 8. Testing APPROVAL and DID ISSUANCE flow on ver-prototype-004
    console.log(`[STEP 8] Testing Officer APPROVAL & DID ISSUANCE on ${verId}...`);
    const approveRes = await request(`/officer/verification/${verId}/decision`, {
      method: 'POST',
      body: JSON.stringify({
        decision: 'APPROVED',
        officerId: 'OFFICER-PROTOTYPE-001',
        remarks: 'Confirmed live selfie matches NIC photo and details perfectly.',
      }),
    });
    if (!approveRes.ok || approveRes.data.data.finalStatus !== 'VERIFIED') {
      throw new Error(`Approval failed: ${JSON.stringify(approveRes.data)}`);
    }
    const issuedDid = approveRes.data.data.did;
    if (!issuedDid || issuedDid !== 'did:smartgrama:prototype:004') {
      throw new Error(`Expected issued DID 'did:smartgrama:prototype:004', got: ${issuedDid}`);
    }
    console.log(`  -> PASS: Officer APPROVED! DID successfully issued: ${issuedDid}`);

    // 9. Query Issued Digital Identity via DID endpoint
    console.log(`[STEP 9] Querying issued DigitalIdentity (GET /identity/${issuedDid})...`);
    const getDidRes = await request(`/identity/${issuedDid}`);
    if (!getDidRes.ok || !getDidRes.data.data) {
      throw new Error(`Failed to resolve issued DID: ${JSON.stringify(getDidRes.data)}`);
    }
    console.log('  -> Issued Identity Record:', {
      did: getDidRes.data.data.did,
      name: getDidRes.data.data.name,
      nic: getDidRes.data.data.nic,
      issuingOfficer: getDidRes.data.data.issuingOfficerId,
      issuedAt: getDidRes.data.data.issuedAt,
      credentialCount: getDidRes.data.data.credentials.length,
    });
    console.log('  -> PASS: DigitalIdentity is active and queryable by DID.\n');

    // 10. Citizen Status check
    console.log(`[STEP 10] Querying Citizen Verification Status (GET /verification/${verId}/status)...`);
    const citizenStatusRes = await request(`/verification/${verId}/status`);
    if (!citizenStatusRes.ok || citizenStatusRes.data.data.finalStatus !== 'VERIFIED' || citizenStatusRes.data.data.did !== issuedDid) {
      throw new Error(`Citizen status mismatch: ${JSON.stringify(citizenStatusRes.data)}`);
    }
    console.log('  -> Citizen Final Status:', citizenStatusRes.data.data);
    console.log('  -> PASS: Citizen status reflects VERIFIED with issued DID.\n');

    console.log(`======================================================`);
    console.log(`  ALL LIFECYCLE TESTS PASSED PERFECTLY (10/10)        `);
    console.log(`======================================================\n`);
  } finally {
    server.close();
  }
}

runLifecycleTests().catch((err) => {
  console.error('\n❌ TEST FAILED WITH ERROR:', err);
  process.exit(1);
});
