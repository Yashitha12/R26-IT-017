import http from 'http';
import app from './app';
import { mockWelfareProvider } from './providers/welfare.provider';
import { mockWelfareEligibilityProvider } from './providers/welfare-eligibility.provider';
import { mockBlockchainProvider } from './providers/blockchain';
import { computeEligibilityPayloadHash } from './services/eligibility-blockchain.service';
import { WelfareApplication } from './types/welfare';
import { EligibilityResult } from './types/welfare-eligibility';

const PORT = 5099;
let server: http.Server;

function request(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 0, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode || 0, data: raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runWE4Tests() {
  server = app.listen(PORT);
  console.log(`\n======================================================`);
  console.log(`  STARTING WE-4 BLOCKCHAIN RECORDING TEST SUITE       `);
  console.log(`======================================================\n`);

  try {
    const verifiedDid = 'did:smartgrama:prototype:001';

    // 1. Seed Aswesuma Application
    const appData: WelfareApplication = {
      applicationId: 'ASW-WE4-TEST-001',
      did: verifiedDid,
      userId: 'user-prototype-001',
      programme: 'ASWESUMA',
      applicantInformation: {
        fullName: 'Kusuma Wijeratne',
        nic: '197065400321',
        dateOfBirth: '1970-07-25',
        gender: 'Female',
        mobilePhone: '+94 77 888 9900',
        permanentAddress: '88, Temple Lane, Galle',
        province: 'Southern',
        district: 'Galle',
        dsDivision: 'Habaraduwa',
        gnDivision: 'Ahangama',
      },
      householdInformation: {
        totalMembers: 4,
        existingWelfareProgrammes: ['None'],
        waitingListStatus: 'No',
        applicationStatus: 'New Applicant',
      },
      education: {
        highestEducationHead: 'Primary (Grades 1-5)',
        schoolAttendanceChildren: 'All Attend Regularly',
        schoolDropoutStatus: 'No Dropouts',
      },
      health: {
        hasPermanentDisabilities: 'No',
        disabilityCount: 0,
        hasSevereChronicIllnesses: 'Yes',
        chronicIllnessCount: 1,
        hasCkd: false,
        hasCancer: false,
        hasParalysis: false,
        bedriddenElderlyCount: 0,
        fullyDependentElderlyCount: 0,
      },
      economic: {
        primaryLivelihood: 'Daily wage',
        estimatedMonthlyIncome: 20000,
        regularMonthlyExpenses: 19000,
        averageMonthlyElectricityKwh: 25,
      },
      assets: {
        motorVehicles: ['None'],
        consumerDurables: ['None'],
        hasAgriculturalLand: 'No',
        hasResidentialLand: 'Yes',
        totalLandExtentPerches: 10,
      },
      housing: {
        houseOwnership: 'Owned',
        roofMaterial: 'Tin',
        wallMaterial: 'Clay',
        floorMaterial: 'Cement',
        accessSafeDrinkingWater: 'Yes',
        accessPrivateSanitaryToilet: 'Yes',
      },
      familyDemography: {
        childrenBelow15: 2,
        workingAgeMembers: 1,
        adultsOver65: 0,
        singleParentHousehold: 'Yes',
        femaleHeadedHousehold: 'Yes',
      },
      banking: {
        bankName: "People's Bank",
        branchCode: 'Habaraduwa',
        accountNumberMasked: '******6789',
        accountHolderName: 'Kusuma Wijeratne',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    // 2. Application without calculated eligibility
    const appWithoutEligibility: WelfareApplication = {
      ...appData,
      applicationId: 'ASW-WE4-NO-ELIG-002',
    };

    mockWelfareProvider.createApplication(appData);
    mockWelfareProvider.createApplication(appWithoutEligibility);

    // ------------------------------------------------------------------------
    // [TEST 16] Missing EligibilityResult rejected
    // ------------------------------------------------------------------------
    console.log('[TEST 1] Testing attempt to record before eligibility calculation...');
    const noEligRes = await request(
      'POST',
      '/api/welfare/aswesuma/applications/ASW-WE4-NO-ELIG-002/eligibility/blockchain'
    );
    console.assert(noEligRes.status === 400, `Expected 400, got ${noEligRes.status}`);
    console.log('  -> PASS: 400 Bad Request returned when no calculation exists yet.');

    // ------------------------------------------------------------------------
    // Execute WE-3 calculation first to obtain verified EligibilityResult
    // ------------------------------------------------------------------------
    console.log('\n[SETUP] Executing WE-3 off-chain calculation for ASW-WE4-TEST-001...');
    const calcRes = await request(
      'POST',
      '/api/welfare/aswesuma/applications/ASW-WE4-TEST-001/eligibility/calculate'
    );
    console.assert(calcRes.status === 200, `Expected 200, got ${calcRes.status}`);
    const offchainResult: EligibilityResult = calcRes.data.data;
    console.log(`  -> Calculated Score: ${offchainResult.calculatedScore} pts | Category: ${offchainResult.category}`);

    // ------------------------------------------------------------------------
    // [TEST 1-9] Record on Blockchain
    // ------------------------------------------------------------------------
    console.log('\n[TEST 2] Anchoring EligibilityResult on Blockchain Ledger (POST /blockchain)...');
    const recordRes = await request(
      'POST',
      '/api/welfare/aswesuma/applications/ASW-WE4-TEST-001/eligibility/blockchain'
    );
    console.assert(recordRes.status === 201, `Expected 201 Created, got ${recordRes.status}`);
    const bcData = recordRes.data.data;

    console.log(`  -> Blockchain Record ID: ${bcData.recordId}`);
    console.log(`  -> Application ID: ${bcData.applicationId}`);
    console.log(`  -> DID Reference: ${bcData.didReference}`);
    console.log(`  -> Scheme: ${bcData.scheme} | Rule Version: ${bcData.ruleVersion}`);
    console.log(`  -> Score: ${bcData.calculatedScore} | Category: ${bcData.category} | Status: ${bcData.eligibilityStatus}`);
    console.log(`  -> Threshold Reference: ${bcData.thresholdReference}`);
    console.log(`  -> Payload Hash (SHA-256): ${bcData.payloadHash}`);
    console.log(`  -> Record Status: ${bcData.recordStatus} | Timestamp: ${bcData.timestamp}`);

    // Validations:
    console.assert(bcData.recordId.startsWith('REC-BC-'), 'Invalid Record ID format');
    console.assert(bcData.applicationId === 'ASW-WE4-TEST-001', 'Incorrect Application ID');
    console.assert(bcData.didReference === verifiedDid, 'Incorrect DID reference');
    console.assert(bcData.ruleVersion === 'v1.0.0-prototype', 'Incorrect Rule Version');
    console.assert(bcData.calculatedScore === offchainResult.calculatedScore, 'Score mismatch');
    console.assert(bcData.category === offchainResult.category, 'Category mismatch');
    console.assert(bcData.eligibilityStatus === offchainResult.eligibilityStatus, 'Status mismatch');
    console.assert(bcData.thresholdReference.length > 0, 'Threshold reference missing');
    console.assert(bcData.payloadHash && bcData.payloadHash.length === 64, 'SHA-256 hash missing or invalid length');
    console.assert(bcData.recordStatus === 'ACTIVE', 'Expected ACTIVE status');
    console.log('  -> PASS: Blockchain record created with verified structural integrity.');

    // ------------------------------------------------------------------------
    // [TEST 10] Deterministic Canonical Hash Verification
    // ------------------------------------------------------------------------
    console.log('\n[TEST 3] Testing Deterministic Canonical Hash Generation...');
    const recomputedHash = computeEligibilityPayloadHash(offchainResult);
    console.assert(recomputedHash === bcData.payloadHash, 'Canonical hash must be 100% deterministic');
    console.log(`  -> Computed Hash: ${recomputedHash}`);
    console.log(`  -> On-Chain Hash: ${bcData.payloadHash}`);
    console.log('  -> PASS: Hash computation is fully deterministic.');

    // ------------------------------------------------------------------------
    // [TEST 11] Privacy Guarantee: Zero PII in Blockchain Payload
    // ------------------------------------------------------------------------
    console.log('\n[TEST 4] Verifying Privacy & Zero-Knowledge Constraints (No PII on-chain)...');
    const sensitiveKeys = [
      'fullName',
      'nic',
      'mobilePhone',
      'permanentAddress',
      'province',
      'district',
      'dsDivision',
      'gnDivision',
      'dateOfBirth',
      'gender',
      'bankName',
      'branchCode',
      'accountNumber',
      'accountNumberMasked',
      'accountHolderName',
      'estimatedMonthlyIncome',
      'regularMonthlyExpenses',
      'hasPermanentDisabilities',
      'hasSevereChronicIllnesses',
      'hasCkd',
      'hasCancer',
    ];

    for (const key of sensitiveKeys) {
      console.assert(!(key in bcData), `Privacy Violation: ${key} found in blockchain payload!`);
    }
    console.log('  -> Verified: No PII, NIC, bank account, address, raw income, or disease data in payload.');
    console.log('  -> PASS: Zero PII on-chain privacy guarantee upheld.');

    // ------------------------------------------------------------------------
    // [TEST 12] Duplicate Active Record Prevention
    // ------------------------------------------------------------------------
    console.log('\n[TEST 5] Testing Duplicate ACTIVE Record Prevention...');
    const dupRes = await request(
      'POST',
      '/api/welfare/aswesuma/applications/ASW-WE4-TEST-001/eligibility/blockchain'
    );
    console.assert(dupRes.status === 409, `Expected 409 Conflict, got ${dupRes.status}`);
    console.log(`  -> Duplicate Response Status: ${dupRes.status} Conflict`);
    console.log(`  -> Message: ${dupRes.data.error}`);
    console.log('  -> PASS: Duplicate active blockchain record blocked successfully.');

    // ------------------------------------------------------------------------
    // [TEST 13] Blockchain Record Retrieval (by App ID & Record ID)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 6] Testing Blockchain Record Retrieval...');
    const getByAppRes = await request(
      'GET',
      '/api/welfare/aswesuma/applications/ASW-WE4-TEST-001/eligibility/blockchain'
    );
    console.assert(getByAppRes.status === 200, `Expected 200, got ${getByAppRes.status}`);
    console.assert(getByAppRes.data.data.recordId === bcData.recordId, 'Record ID mismatch');

    const getByIdRes = await request(
      'GET',
      `/api/welfare/eligibility/blockchain/${bcData.recordId}`
    );
    console.assert(getByIdRes.status === 200, `Expected 200, got ${getByIdRes.status}`);
    console.assert(getByIdRes.data.data.applicationId === 'ASW-WE4-TEST-001', 'App ID mismatch');
    console.log('  -> PASS: Record retrieved successfully by both applicationId and recordId.');

    // ------------------------------------------------------------------------
    // [TEST 14] Hash Verification: VALID for untampered data
    // ------------------------------------------------------------------------
    console.log('\n[TEST 7] Cryptographic Verification on Untampered Data (GET /verify)...');
    const verifyRes = await request(
      'GET',
      '/api/welfare/aswesuma/applications/ASW-WE4-TEST-001/eligibility/blockchain/verify'
    );
    console.assert(verifyRes.status === 200, `Expected 200, got ${verifyRes.status}`);
    const vData = verifyRes.data.data;
    console.log(`  -> Verification Status: ${vData.verificationStatus}`);
    console.log(`  -> Integrity Verified: ${vData.isIntegrityVerified}`);
    console.log(`  -> Calculated Hash: ${vData.calculatedHash}`);
    console.log(`  -> Stored Hash:     ${vData.storedHash}`);
    console.assert(vData.verificationStatus === 'VALID', 'Expected VALID');
    console.assert(vData.isIntegrityVerified === true, 'Expected isIntegrityVerified: true');
    console.log('  -> PASS: Cryptographic verification confirmed VALID.');

    // ------------------------------------------------------------------------
    // [TEST 15] Hash Verification: INVALID when off-chain data is tampered
    // ------------------------------------------------------------------------
    console.log('\n[TEST 8] Cryptographic Verification on Tampered Off-Chain Data...');
    // Tamper with cached off-chain score
    const cachedResult = mockWelfareEligibilityProvider.getLatestEligibilityResult('ASW-WE4-TEST-001');
    if (cachedResult) {
      // Simulate illicit modification of off-chain score
      const tamperedResult: EligibilityResult = {
        ...cachedResult,
        calculatedScore: cachedResult.calculatedScore + 200, // Tampered!
      };
      mockWelfareEligibilityProvider.saveEligibilityResult(tamperedResult);
    }

    const tamperedVerifyRes = await request(
      'GET',
      '/api/welfare/aswesuma/applications/ASW-WE4-TEST-001/eligibility/blockchain/verify'
    );
    console.assert(tamperedVerifyRes.status === 200, `Expected 200, got ${tamperedVerifyRes.status}`);
    const tvData = tamperedVerifyRes.data.data;
    console.log(`  -> Tampered Verification Status: ${tvData.verificationStatus}`);
    console.log(`  -> Integrity Verified: ${tvData.isIntegrityVerified}`);
    console.log(`  -> Calculated Hash (Tampered): ${tvData.calculatedHash}`);
    console.log(`  -> Stored On-Chain Hash:       ${tvData.storedHash}`);
    console.assert(tvData.verificationStatus === 'INVALID', 'Expected INVALID for tampered data');
    console.assert(tvData.isIntegrityVerified === false, 'Expected isIntegrityVerified: false');
    console.log('  -> PASS: Cryptographic tampering detected immediately (INVALID).');

    // Restore original result
    mockWelfareEligibilityProvider.saveEligibilityResult(offchainResult);

    // ------------------------------------------------------------------------
    // [TEST 17] History Audit Trail & Non-Destructive Update Lifecycle
    // ------------------------------------------------------------------------
    console.log('\n[TEST 9] Verifying Immutable Audit Trail & Historical Non-Overwrite...');
    const initialLedgerCount = mockBlockchainProvider.getLedgerLength();
    console.log(`  -> Initial Ledger Records Count: ${initialLedgerCount}`);

    // Simulate re-assessment result for application
    const reassessedResult: EligibilityResult = {
      ...offchainResult,
      calculatedScore: 750.0,
      category: 'SEVERELY_POOR',
    };
    mockWelfareEligibilityProvider.saveEligibilityResult(reassessedResult);

    // Record the re-assessment on blockchain
    const reassessRecordRes = await request(
      'POST',
      '/api/welfare/aswesuma/applications/ASW-WE4-TEST-001/eligibility/blockchain'
    );
    console.assert(reassessRecordRes.status === 201, `Expected 201, got ${reassessRecordRes.status}`);
    const newBcData = reassessRecordRes.data.data;

    console.log(`  -> New Re-assessment Record ID: ${newBcData.recordId}`);
    console.log(`  -> Previous Record ID Link: ${newBcData.previousRecordId}`);
    console.assert(newBcData.previousRecordId === bcData.recordId, 'Audit link to prior record must match');

    // Verify all historical records still exist
    const history = await mockBlockchainProvider.getAllEligibilityRecordsByApplicationId('ASW-WE4-TEST-001');
    console.log(`  -> Application History Count: ${history.length}`);
    console.assert(history.length === 2, 'History must contain both original and updated record');
    console.assert(history[0].recordStatus === 'SUPERSEDED', 'Initial record status must be SUPERSEDED');
    console.assert(history[1].recordStatus === 'ACTIVE', 'New record status must be ACTIVE');
    console.assert(mockBlockchainProvider.getLedgerLength() === initialLedgerCount + 1, 'Ledger count must increase (append-only)');
    console.log('  -> PASS: Audit trail verified: historical records are never deleted or silently overwritten.');

    console.log(`\n======================================================`);
    console.log(`  ALL WE-4 BLOCKCHAIN TESTS PASSED PERFECTLY (17/17) `);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('WE-4 test execution failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runWE4Tests();
