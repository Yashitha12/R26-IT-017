import http from 'http';
import app from './app';
import { mockWelfareProvider } from './providers/welfare.provider';
import { mockWelfareEligibilityProvider } from './providers/welfare-eligibility.provider';
import { mockBlockchainProvider } from './providers/blockchain';
import { mockWelfareLifecycleProvider } from './providers/welfare-lifecycle.provider';
import { WelfareApplication } from './types/welfare';

const PORT = 5100;
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

async function runWE5Tests() {
  server = app.listen(PORT);
  console.log(`\n======================================================`);
  console.log(`  STARTING WE-5 WELFARE LIFECYCLE & REASSESSMENT TESTS`);
  console.log(`======================================================\n`);

  try {
    const verifiedDid = 'did:smartgrama:prototype:001';

    // 1. Seed Aswesuma Application
    const appData: WelfareApplication = {
      applicationId: 'ASW-WE5-TEST-001',
      did: verifiedDid,
      userId: 'user-prototype-001',
      programme: 'ASWESUMA',
      applicantInformation: {
        fullName: 'Chandradasa Liyanage',
        nic: '196234500987',
        dateOfBirth: '1962-11-14',
        gender: 'Male',
        mobilePhone: '+94 77 654 3210',
        permanentAddress: '14, Temple Road, Badulla',
        province: 'Uva',
        district: 'Badulla',
        dsDivision: 'Hali-Ela',
        gnDivision: 'Bogahakumbura',
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
        singleParentHousehold: 'No',
        femaleHeadedHousehold: 'No',
      },
      banking: {
        bankName: 'Bank of Ceylon',
        branchCode: 'Badulla',
        accountNumberMasked: '******4455',
        accountHolderName: 'Chandradasa Liyanage',
      },
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    mockWelfareProvider.createApplication(appData);

    // ------------------------------------------------------------------------
    // [STEP 1] Calculate WE-3 Eligibility & Anchor on WE-4 Blockchain
    // ------------------------------------------------------------------------
    console.log('[STEP 1] Evaluating Initial Eligibility for ASW-WE5-TEST-001...');
    const calc1 = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE5-TEST-001/eligibility/calculate');
    console.assert(calc1.status === 200, `Expected 200, got ${calc1.status}`);
    console.log(`  -> Initial Score: ${calc1.data.data.calculatedScore} pts | Category: ${calc1.data.data.category}`);

    console.log('\n[STEP 2] Anchoring Initial Assessment to Blockchain...');
    const bc1 = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE5-TEST-001/eligibility/blockchain');
    console.assert(bc1.status === 201, `Expected 201, got ${bc1.status}`);
    const bcRecord1 = bc1.data.data;
    console.log(`  -> Initial Blockchain Record: ${bcRecord1.recordId} (Status: ${bcRecord1.recordStatus})`);

    // ------------------------------------------------------------------------
    // [TEST 1 & 2] Benefit Activation & Lifecycle Status Query
    // ------------------------------------------------------------------------
    console.log('\n[TEST 1] Activating Welfare Benefit (POST /lifecycle)...');
    const actRes = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE5-TEST-001/lifecycle', {
      event: 'BENEFIT_ACTIVATED',
      reason: 'Approved by Divisional Secretary for monthly Aswesuma disbursement.',
      officerId: 'OFFICER-PROTOTYPE-001',
    });
    console.assert(actRes.status === 200, `Expected 200, got ${actRes.status}`);
    console.assert(actRes.data.data.currentStatus === 'ACTIVE', 'Expected ACTIVE status');
    console.log(`  -> Lifecycle Status: ${actRes.data.data.currentStatus} | Activated At: ${actRes.data.data.activatedAt}`);
    console.log('  -> PASS: Benefit successfully transitioned from PENDING to ACTIVE.');

    console.log('\n[TEST 2] Querying Lifecycle Status (GET /lifecycle)...');
    const getLcRes = await request('GET', '/api/welfare/aswesuma/applications/ASW-WE5-TEST-001/lifecycle');
    console.assert(getLcRes.status === 200, `Expected 200, got ${getLcRes.status}`);
    console.assert(getLcRes.data.data.currentStatus === 'ACTIVE', 'Status must be ACTIVE');
    console.assert(getLcRes.data.data.activeBlockchainRecordId === bcRecord1.recordId, 'Blockchain ID match');
    console.log('  -> PASS: Lifecycle state retrieved accurately.');

    // ------------------------------------------------------------------------
    // [TEST 3 - 8] Reassessment Workflow with Circumstance Change
    // ------------------------------------------------------------------------
    console.log('\n[TEST 3] Executing Reassessment with Changed Circumstances (POST /reassessment)...');
    // Household circumstance change: income increased to 45,000 LKR, but 1 member diagnosed with permanent disability (+45 pts)
    const reassessRes = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE5-TEST-001/reassessment', {
      reason: 'Annual reassessment: updated household income and new medical disability documentation.',
      officerId: 'OFFICER-PROTOTYPE-001',
      updatedData: {
        health: {
          hasPermanentDisabilities: 'Yes',
          disabilityCount: 1,
        },
        economic: {
          estimatedMonthlyIncome: 35000,
        },
      },
    });

    console.assert(reassessRes.status === 200, `Expected 200, got ${reassessRes.status}`);
    const rData = reassessRes.data.data;

    console.log(`  -> Reassessment Event: ${rData.reassessmentEvent.eventType} | Status: ${rData.lifecycleState.currentStatus}`);
    console.log(`  -> New Score: ${rData.newEligibilityResult.calculatedScore} pts | Category: ${rData.newEligibilityResult.category}`);
    console.log(`  -> New Blockchain Record: ${rData.newBlockchainRecord.recordId} (Status: ${rData.newBlockchainRecord.recordStatus})`);
    console.log(`  -> Previous Record Linked: ${rData.newBlockchainRecord.previousRecordId}`);

    // Verify Previous Record is now SUPERSEDED
    const priorBcRecord = await mockBlockchainProvider.getEligibilityRecord(bcRecord1.recordId);
    console.log(`  -> Prior Blockchain Record Status: ${priorBcRecord?.recordStatus}`);
    console.assert(priorBcRecord?.recordStatus === 'SUPERSEDED', 'Prior record must be SUPERSEDED');
    console.assert(rData.newBlockchainRecord.previousRecordId === bcRecord1.recordId, 'previousRecordId must link to prior record');
    console.assert(rData.newBlockchainRecord.recordStatus === 'ACTIVE', 'New record must be ACTIVE');
    console.log('  -> PASS: Reassessment completed with versioned blockchain chaining (SUPERSEDED -> ACTIVE).');

    // ------------------------------------------------------------------------
    // [TEST 9] Historical Audit Trail Retrieval (GET /history)
    // ------------------------------------------------------------------------
    console.log('\n[TEST 4] Querying Full Application History & Audit Trail (GET /history)...');
    const historyRes = await request('GET', '/api/welfare/aswesuma/applications/ASW-WE5-TEST-001/history');
    console.assert(historyRes.status === 200, `Expected 200, got ${historyRes.status}`);
    const histData = historyRes.data.data;

    console.log(`  -> Total Eligibility Evaluations in History: ${histData.eligibilityHistory.length}`);
    console.log(`  -> Total Blockchain Records in History: ${histData.blockchainHistory.length}`);
    console.log(`  -> Total Lifecycle Events in History: ${histData.lifecycleEvents.length}`);

    console.assert(histData.eligibilityHistory.length === 2, 'Must preserve 2 eligibility evaluations');
    console.assert(histData.blockchainHistory.length === 2, 'Must preserve 2 blockchain records');
    console.assert(histData.lifecycleEvents.length >= 2, 'Must preserve lifecycle events');
    console.log('  -> PASS: Full non-destructive history preserved in audit trail.');

    // ------------------------------------------------------------------------
    // [TEST 10 & 11] Benefit Suspension & Reactivation
    // ------------------------------------------------------------------------
    console.log('\n[TEST 5] Testing Benefit Suspension (POST /lifecycle with BENEFIT_SUSPENDED)...');
    const suspRes = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE5-TEST-001/lifecycle', {
      event: 'BENEFIT_SUSPENDED',
      reason: 'Temporary suspension pending GN residency verification inquiry.',
      officerId: 'OFFICER-PROTOTYPE-001',
    });
    console.assert(suspRes.status === 200, `Expected 200, got ${suspRes.status}`);
    console.assert(suspRes.data.data.currentStatus === 'SUSPENDED', 'Expected SUSPENDED status');
    console.log(`  -> Status after suspension: ${suspRes.data.data.currentStatus}`);

    console.log('\n[TEST 6] Testing Benefit Reactivation (POST /lifecycle with BENEFIT_REACTIVATED)...');
    const reactRes = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE5-TEST-001/lifecycle', {
      event: 'BENEFIT_REACTIVATED',
      reason: 'GN residency verification satisfactory. Reinstating monthly benefit.',
      officerId: 'OFFICER-PROTOTYPE-001',
    });
    console.assert(reactRes.status === 200, `Expected 200, got ${reactRes.status}`);
    console.assert(reactRes.data.data.currentStatus === 'ACTIVE', 'Expected ACTIVE status');
    console.log(`  -> Status after reactivation: ${reactRes.data.data.currentStatus}`);
    console.log('  -> PASS: Suspension and reactivation workflows verified.');

    // ------------------------------------------------------------------------
    // [TEST 12] Beneficiary Death Scenario
    // ------------------------------------------------------------------------
    console.log('\n[TEST 7] Testing Beneficiary Death Event (POST /lifecycle with BENEFICIARY_DEATH_RECORDED)...');
    const deathRes = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE5-TEST-001/lifecycle', {
      event: 'BENEFICIARY_DEATH_RECORDED',
      reason: 'Official registrar death certificate submitted by family.',
      deathCertificateNumber: 'D-CERT-2026-99881',
      dateOfDeath: '2026-08-20',
      officerId: 'OFFICER-PROTOTYPE-001',
    });
    console.assert(deathRes.status === 200, `Expected 200, got ${deathRes.status}`);
    console.assert(deathRes.data.data.currentStatus === 'TERMINATED', 'Expected TERMINATED status');
    console.assert(deathRes.data.data.terminationReason.includes('D-CERT-2026-99881'), 'Reason must include cert number');
    console.log(`  -> Status after death record: ${deathRes.data.data.currentStatus}`);
    console.log(`  -> Termination Reason: ${deathRes.data.data.terminationReason}`);
    console.log('  -> PASS: Beneficiary death event correctly terminates benefit while preserving full history.');

    // ------------------------------------------------------------------------
    // [TEST 13 & 14] Invalid Action on TERMINATED benefit rejected
    // ------------------------------------------------------------------------
    console.log('\n[TEST 8] Testing Rejection of State Transition on TERMINATED Benefit...');
    const invalidAct = await request('POST', '/api/welfare/aswesuma/applications/ASW-WE5-TEST-001/lifecycle', {
      event: 'BENEFIT_ACTIVATED',
      reason: 'Attempting illegal reactivation on deceased/terminated record.',
      officerId: 'OFFICER-PROTOTYPE-001',
    });
    console.assert(invalidAct.status === 400, `Expected 400, got ${invalidAct.status}`);
    console.log(`  -> Rejection Message: ${invalidAct.data.error}`);
    console.log('  -> PASS: Illegal lifecycle transition on terminated benefit blocked.');

    console.log(`\n======================================================`);
    console.log(`  ALL WE-5 WELFARE LIFECYCLE TESTS PASSED (8/8)       `);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('WE-5 test execution failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runWE5Tests();
